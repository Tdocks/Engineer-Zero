import "server-only";

import { validateAioContent } from "./content-validation";
import { codingCatalogPublicationStatus } from "./coding-source-governance";

export type QualityCategory =
  | "instructional-quality"
  | "role-accuracy"
  | "assessment-integrity"
  | "simulation-authenticity"
  | "learner-evidence"
  | "interview-credibility"
  | "ux-accessibility"
  | "source-governance"
  | "privacy-security"
  | "operational-reliability";

export type QualityStatus = "blocked" | "partial" | "strong";
export type QualitySignal = {
  category: QualityCategory;
  status: QualityStatus;
  evidence: string;
  requiredForStrong: string;
};
export type ProductReleaseScorecard = {
  generatedAt: string;
  disposition: "internal-draft" | "internal-release-candidate" | "commercial-release-ready";
  programs: Array<{
    id: "applied-ai-operations" | "it-support-technician" | "coding-developer";
    title: string;
    signals: QualitySignal[];
  }>;
  shared: QualitySignal[];
};

const pendingHumanReview = "Qualified instructional-design, technical, accessibility, fictional-data, and release approvals are recorded for every published item.";
const verifiedEvidence = "Authenticated, server-owned attempts, project evidence, readiness snapshots, and qualified reviewer decisions replace browser-owned completion records.";

function signal(
  category: QualityCategory,
  status: QualityStatus,
  evidence: string,
  requiredForStrong: string,
): QualitySignal {
  return { category, status, evidence, requiredForStrong };
}

/**
 * A deliberately conservative internal report. A passing build, rendered
 * catalog, or local completion state never changes a category to `strong`.
 */
export function productReleaseScorecard(
  now = new Date(),
  env: NodeJS.ProcessEnv = process.env,
): ProductReleaseScorecard {
  const aioValidation = validateAioContent();
  const codingSources = codingCatalogPublicationStatus(undefined, now);
  const authenticatedStore = Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const commerceConfigured = Boolean(
    authenticatedStore && env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && env.STRIPE_PRICE_APPLIED_AI_OPERATIONS && env.STRIPE_PRICE_IT_SUPPORT,
  );
  const runnerConfigured = Boolean(
    env.CODING_SANDBOX_APPROVED === "true" && env.CODING_SANDBOX_ENDPOINT && env.CODING_SANDBOX_TOKEN,
  );

  const programs = [
    {
      id: "applied-ai-operations" as const,
      title: "Applied AI Operations Engineer",
      signals: [
        signal("instructional-quality", aioValidation.length === 0 ? "partial" : "blocked", aioValidation.length === 0 ? "Typed curriculum has structural validation, source metadata, artifacts, and deterministic rubrics." : `${aioValidation.length} catalog validation findings remain.`, pendingHumanReview),
        signal("role-accuracy", "partial", "The role model, restricted-enterprise boundaries, prototypes, and source references are present.", "Applied-AI SME signs off on every role claim and scenario outcome."),
        signal("assessment-integrity", "strong", "The 24-question baseline is server-graded, answer-key isolated, and choice order is shuffled per attempt.", "Maintain randomized retake forms and add learner-pilot discrimination analysis."),
        signal("simulation-authenticity", "partial", "The track has typed labs and stateful mission definitions using fictional artifacts.", "Each published lab and mission passes scenario QA, branch coverage, and learner-pilot review."),
        signal("learner-evidence", "partial", "Structured drafts and deterministic grading exist for the course workspace and prototype repositories.", verifiedEvidence),
        signal("interview-credibility", "partial", "Interview Studio, project-defense flow, and revision history exist.", "Independent author review confirms prompt uniqueness, follow-up quality, and timed-practice calibration."),
        signal("ux-accessibility", "partial", "The academic reader, keyboard-aware course flow, and theme preferences are implemented.", "Component and end-to-end accessibility checks pass across desktop and mobile."),
        signal("source-governance", "partial", "Course sources include publisher, locator, supported claim, access date, version, and revalidation date.", "Source-health automation and independent technical approval cover all AIO records."),
        signal("privacy-security", "partial", "Fictional-data boundaries and server-side course grading are in place.", "Authenticated records, RLS tests, rate limits, and private artifact controls are active."),
        signal("operational-reliability", "partial", "Build and deterministic tests run locally; safe fallbacks exist for unavailable services.", "Error monitoring, retry/recovery tests, deployed configuration, and release runbooks are validated."),
      ],
    },
    {
      id: "it-support-technician" as const,
      title: "IT Support Technician",
      signals: [
        signal("instructional-quality", "blocked", "The protected 24-question Reality Check is authored, but most Fast and Master content remains generated catalog scaffolding.", "Replace every generated lesson, lab, mission, and interview variation with a reviewed typed content package."),
        signal("role-accuracy", "partial", "The baseline uses current Microsoft, Cisco, and NIST primary-source records and fictional mission-critical support scenarios.", "Technical SME reviews the full authored track and its escalation boundaries."),
        signal("assessment-integrity", "strong", "The 24-question Reality Check is server-only, answer-key isolated, and randomized for every attempt.", "Maintain alternate forms and learner-pilot item analysis."),
        signal("simulation-authenticity", "blocked", "Current endpoint labs and missions still use generic activity cards rather than distinct evidence-led simulations.", "Ship authored logs, configurations, device evidence, debriefs, stateful consequences, and revision paths."),
        signal("learner-evidence", "blocked", "Local progress exists, but most IT work is not yet captured as structured role evidence.", verifiedEvidence),
        signal("interview-credibility", "blocked", "The current interview list repeats a small seed bank through generated variations.", "Author 150 unique role questions with artifacts, pressure follow-ups, rubrics, and revision history."),
        signal("ux-accessibility", "partial", "The shared workspace is available, but IT still uses the legacy catalog interaction model.", "Migrate IT to the dedicated academic reader, lab workbench, mission timeline, and mobile accessibility checks."),
        signal("source-governance", "partial", "Reality Check sources are versioned and revalidation-dated.", "Source records and technical review must cover every IT lesson, lab, mission, and interview claim."),
        signal("privacy-security", "partial", "All current IT assessment scenarios are fictional and the answer key is protected.", "Apply protected attempts, RLS, and fictional-data reviews across the entire IT track."),
        signal("operational-reliability", "partial", "The shared platform builds and returns safe assessment errors.", "Complete release runbooks, integration testing, error monitoring, and recovery testing."),
      ],
    },
    {
      id: "coding-developer" as const,
      title: "Coding Developer",
      signals: [
        signal("instructional-quality", "partial", "The four-day sequence, continuation modules, source records, local prototypes, repair exercises, and deterministic reviews are implemented.", pendingHumanReview),
        signal("role-accuracy", "partial", "The program explicitly limits outcomes to bounded prototypes and avoids production or safety-critical competence claims.", "Technical and instructional reviewers validate the complete curriculum and evidence thresholds."),
        signal("assessment-integrity", "partial", "Server-owned answer keys, mixed forms, anti-padding checks, and deterministic exercise rubrics are implemented.", "Managed runtime results and reviewer calibration confirm independent implementation and repair claims."),
        signal("simulation-authenticity", "partial", "Terminal, API, test, evaluation, review, and incident simulations are distinct and fictional.", "Configured isolated sandbox evidence and learner-pilot observation confirm transfer to local work."),
        signal("learner-evidence", "partial", "Local revision history and schemas for verified attempts, execution events, GitHub evidence, and reviewer packets exist.", verifiedEvidence),
        signal("interview-credibility", "partial", "Timed prototypes, requirement-change drills, Review Board, and evidence-based response review are implemented.", "Optional voice defense, human review, and calibrated scoring are operational."),
        signal("ux-accessibility", "partial", "The coding workspace has focused local-study affordances and safe fallback messaging.", "Full component, mobile, keyboard-only, and screen-reader QA passes."),
        signal("source-governance", codingSources.publishable ? "strong" : "partial", codingSources.publishable ? "All coding sources are current and technically approved." : `${codingSources.awaitingTechnicalReview.length} source record(s) still require independent technical approval or revalidation.`, "Scheduled source health checks and qualified technical review remain current for every published claim."),
        signal("privacy-security", "partial", "The main web process never executes learner code, and the sandbox boundary refuses activation without security approval.", "Sandbox isolation, GitHub App permissions, RLS, and data-retention controls pass independent review."),
        signal("operational-reliability", runnerConfigured ? "partial" : "blocked", runnerConfigured ? "An approved sandbox configuration is present, but still requires independent isolation validation." : "Sandbox execution is intentionally inactive until a separately operated runner is approved.", "Sandbox, GitHub, source-health, reviewer, and service failure paths are deployed, observed, and rehearsed."),
      ],
    },
  ];

  const shared = [
    signal("privacy-security", authenticatedStore ? "partial" : "blocked", authenticatedStore ? "Supabase credentials are present; RLS and cross-user isolation still require deployed integration tests." : "No hosted learner-data configuration is present; browser storage remains a local draft cache only.", "Magic-link auth, migration execution, RLS tests, export/delete controls, and protected server-owned evidence are verified."),
    signal("operational-reliability", commerceConfigured ? "partial" : "blocked", commerceConfigured ? "Stripe environment values are present; verified webhook and refund/revocation flows still require integration testing." : "Checkout and webhook are intentionally inactive without server credentials.", "Verified enrollment, refund/revocation, email, monitoring, support operations, and disaster/recovery checks pass."),
    signal("ux-accessibility", "partial", "The quiet academic AIO workspace exists and the shared shell supports themes and local resume state.", "All learner routes pass keyboard, contrast, mobile, focus, error, reset, resume, and reduced-motion QA."),
  ];
  const allSignals = [...programs.flatMap((program) => program.signals), ...shared];
  const disposition = allSignals.some((item) => item.status === "blocked")
    ? "internal-draft"
    : allSignals.some((item) => item.status === "partial")
      ? "internal-release-candidate"
      : "commercial-release-ready";
  return { generatedAt: now.toISOString(), disposition, programs, shared };
}
