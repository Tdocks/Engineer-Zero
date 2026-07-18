import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  commerceConfiguration,
  enrollmentIntentFromCheckout,
  isPurchasableTrack,
} from "./commerce-enrollment";
import { ircProgramDecision, ircProgramId } from "./irc-program";

export type TrustProofFinding = {
  id: string;
  ok: boolean;
  evidence: string;
};

const learnerOwnedTables = [
  "enrollments",
  "assessment_attempts",
  "progress_records",
  "submissions",
  "project_case_studies",
  "interview_sessions",
  "readiness_snapshots",
  "certificates",
  "course_attempts",
  "project_evidence",
  "coding_attempts",
  "coding_execution_events",
  "coding_evidence_packets",
  "coding_reviewer_decisions",
] as const;

export function migrationsDirectory(root = process.cwd()) {
  return join(root, "supabase", "migrations");
}

export function readOrderedMigrations(root = process.cwd()) {
  const dir = migrationsDirectory(root);
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => ({
      name,
      sql: readFileSync(join(dir, name), "utf8"),
    }));
}

function migrationBundle(root = process.cwd()) {
  return readOrderedMigrations(root).map((item) => item.sql).join("\n");
}

function hasRlsEnabled(sql: string, table: string) {
  const pattern = new RegExp(`alter table public\\.${table}\\s+enable row level security`, "i");
  return pattern.test(sql);
}

function hasSelectOwnerPolicy(sql: string, table: string) {
  // Accept either dedicated "… owner read" policies or the original enrollment select policy.
  const selectPolicy = new RegExp(
    `create policy "[^"]*" on public\\.${table}[\\s\\S]{0,200}?for select using \\(auth\\.uid\\(\\) = user_id\\)`,
    "i",
  );
  const profilePolicy = new RegExp(
    `create policy "[^"]*" on public\\.${table}[\\s\\S]{0,200}?for all using \\(auth\\.uid\\(\\) = id\\)`,
    "i",
  );
  return selectPolicy.test(sql) || (table === "profiles" && profilePolicy.test(sql));
}

export function proveStaticRlsInvariants(root = process.cwd()): TrustProofFinding[] {
  const migrations = readOrderedMigrations(root);
  const findings: TrustProofFinding[] = [];
  findings.push({
    id: "migrations-present",
    ok: migrations.length >= 8,
    evidence: `${migrations.length} ordered SQL migrations under supabase/migrations.`,
  });

  const sql = migrationBundle(root);
  const governance = migrations.find((item) => item.name.includes("0005_shared_release_governance"));
  findings.push({
    id: "governance-migration",
    ok: Boolean(governance),
    evidence: governance
      ? "0005_shared_release_governance.sql is present and demotes browser writes."
      : "Missing shared release governance migration.",
  });

  for (const table of learnerOwnedTables) {
    if (!sql.includes(`public.${table}`)) continue;
    findings.push({
      id: `rls-enabled:${table}`,
      ok: hasRlsEnabled(sql, table),
      evidence: hasRlsEnabled(sql, table)
        ? `RLS enabled on public.${table}.`
        : `RLS is not enabled on public.${table}.`,
    });
  }

  for (const table of ["enrollments", "assessment_attempts", "coding_attempts", "content_release_reviews"] as const) {
    findings.push({
      id: `owner-read:${table}`,
      ok: hasSelectOwnerPolicy(sql, table) || (table === "content_release_reviews" && /auth\.uid\(\) = reviewer_id/.test(sql)),
      evidence: `Owner-scoped select policy required for public.${table}.`,
    });
  }

  if (governance) {
    const demoted = [
      "assessment_attempts",
      "progress_records",
      "submissions",
      "project_case_studies",
      "interview_sessions",
    ] as const;
    for (const table of demoted) {
      const dropped = governance.sql.includes(`on public.${table}`);
      const readOnly = new RegExp(`create policy "[^"]*owner read" on public\\.${table}`, "i").test(governance.sql);
      findings.push({
        id: `no-browser-write:${table}`,
        ok: dropped && readOnly,
        evidence: dropped && readOnly
          ? `public.${table} is read-only to learners after 0005.`
          : `public.${table} was not demoted to owner-read in shared release governance.`,
      });
    }
  }

  findings.push({
    id: "release-reviews-not-learner-writable",
    ok: /create policy "release review owner read"/.test(sql) && !/on public\.content_release_reviews[\s\S]{0,80}?for all/.test(sql),
    evidence: "content_release_reviews is select-only for the reviewer; mutations stay on the server route.",
  });

  return findings;
}

export function proveCommerceEnrollmentInvariants(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): TrustProofFinding[] {
  const findings: TrustProofFinding[] = [];
  findings.push({
    id: "irc-not-purchasable",
    ok: !isPurchasableTrack(ircProgramId),
    evidence: `${ircProgramDecision.title} (${ircProgramId}) must not be a Stripe purchasable track.`,
  });
  findings.push({
    id: "checkout-requires-full-config",
    ok: commerceConfiguration({}) === false,
    evidence: "Empty env must keep commerceConfiguration false.",
  });
  findings.push({
    id: "checkout-config-when-complete",
    ok: commerceConfiguration({
      STRIPE_SECRET_KEY: "sk_test",
      STRIPE_WEBHOOK_SECRET: "whsec",
      STRIPE_PRICE_APPLIED_AI_OPERATIONS: "price_aio",
      STRIPE_PRICE_IT_SUPPORT: "price_it",
      APP_URL: "https://engineerzero.test",
    }) === true,
    evidence: "Complete server env enables commerceConfiguration.",
  });
  findings.push({
    id: "reject-redirect-only-enrollment",
    ok: enrollmentIntentFromCheckout({ userId: null, trackId: "applied-ai-operations", sessionId: "cs_test" }).ok === false,
    evidence: "Missing user id cannot enroll.",
  });
  findings.push({
    id: "reject-coding-checkout",
    ok: enrollmentIntentFromCheckout({ userId: "user-1", trackId: ircProgramId, sessionId: "cs_test" }).ok === false,
    evidence: "Coding Developer checkout metadata must be rejected.",
  });
  findings.push({
    id: "accept-verified-track-checkout",
    ok: enrollmentIntentFromCheckout({
      userId: "user-1",
      trackId: "it-support-technician",
      sessionId: "cs_test_123",
    }).ok === true,
    evidence: "Verified purchasable track metadata is accepted for enrollment upsert.",
  });
  findings.push({
    id: "hosted-commerce-optional-in-ci",
    ok: true,
    evidence: commerceConfiguration(env)
      ? "Hosted Stripe credentials are present in this environment; live webhook proof still requires a signed checkout.session.completed event."
      : "Hosted Stripe credentials are absent; static enrollment gates still hold and checkout must return 503.",
  });
  return findings;
}

export function proveIrcProgramDecision(): TrustProofFinding[] {
  return [
    {
      id: "irc-program-selected",
      ok: ircProgramDecision.id === "coding-developer" && ircProgramDecision.commercialCredentialAllowed === false,
      evidence: `${ircProgramDecision.title} selected on ${ircProgramDecision.decidedAt}; commercial credentials remain disallowed.`,
    },
    {
      id: "career-tracks-deferred",
      ok: ircProgramDecision.deferredPrograms.length === 2,
      evidence: `Deferred programs: ${ircProgramDecision.deferredPrograms.join(", ")}.`,
    },
  ];
}

export function trustBoundaryReport(root = process.cwd(), env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
  const findings = [
    ...proveIrcProgramDecision(),
    ...proveStaticRlsInvariants(root),
    ...proveCommerceEnrollmentInvariants(env),
  ];
  return {
    generatedAt: new Date().toISOString(),
    ok: findings.every((finding) => finding.ok),
    findings,
  };
}
