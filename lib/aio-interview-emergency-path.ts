/**
 * Few-Day Interview Path (interview-emergency): ordered checklist + completion gates.
 * Outcome: interview-ready partner/judgment screen + guided LLM PoC defense for a
 * technically inclined true-zero in under 5 days — not independent implementer job-readiness.
 * Pass criteria: docs/AIO_INTERVIEW_READINESS_BAR.md
 */

import {
  allCodingChallenges,
  codingDeveloperProgram,
  type CodingProgramProgress,
} from "./coding-developer";

export type EmergencyPathItemKind = "coding" | "module" | "lab" | "interview" | "artifact" | "media";

export type EmergencyPathItem = {
  id: string;
  day: 1 | 2 | 3 | 4 | 5;
  block: string;
  title: string;
  kind: EmergencyPathItemKind;
  /** Course / coding / interview activity id when applicable */
  activityId?: string;
  estimatedHours: number;
  purpose: string;
  gate?: "coding-bridge" | "packet-artifacts" | "timed-mock";
};

const aioCodingImport = codingDeveloperProgram.prerequisiteFor.find(
  (entry) => entry.trackId === "applied-ai-operations",
);
const aioCodingBridge = aioCodingImport?.lessonIds ?? [];
const aioCodingChallenges = aioCodingImport?.challengeIds ?? [];

/** Ordered playlist (~25–38h over 3–5 calendar days). */
export const aioInterviewEmergencyPath: EmergencyPathItem[] = [
  {
    id: "ep-d1-coding-bridge",
    day: 1,
    block: "Coding bridge (mandatory for true zero)",
    title: "Coding foundations I: terminal, Python, JSON",
    kind: "coding",
    estimatedHours: 7,
    purpose: "Complete selected Day 1 lessons plus terminal + deterministic CLI evidence.",
    gate: "coding-bridge",
  },
  {
    id: "ep-d1-media-python",
    day: 1,
    block: "Watch → Do",
    title: "Python functions + JSON fluency videos",
    kind: "media",
    activityId: "coding-day-1-04",
    estimatedHours: 0.25,
    purpose: "Watch assigned Python/JSON excerpts, then complete the matching Coding try-this.",
  },
  {
    id: "ep-d2-coding-bridge",
    day: 2,
    block: "Coding bridge (continued)",
    title: "Coding foundations II: API, tests, bounded AI",
    kind: "coding",
    activityId: "coding-day-2-01",
    estimatedHours: 6,
    purpose: "Complete selected Day 2–3 lessons and reviewed API, test-repair, extraction, and procedure-assistant challenges.",
  },
  {
    id: "ep-d2-sprint-01",
    day: 2,
    block: "AIO Sprint",
    title: "Discovery + role narrative",
    kind: "module",
    activityId: "aio-sprint-01-role-narrative",
    estimatedHours: 1,
    purpose: "Seven discovery questions before solutioning, then a 90-second technical-partner talk-track.",
  },
  {
    id: "ep-d2-lab-01",
    day: 2,
    block: "Lab",
    title: "Fit narrative evidence map",
    kind: "lab",
    activityId: "aio-lab-01",
    estimatedHours: 1,
    purpose: "Packet artifact: 90-second narrative evidence.",
  },
  {
    id: "ep-d2-sprint-02",
    day: 2,
    block: "AIO Sprint",
    title: "LLM fundamentals without hype",
    kind: "module",
    activityId: "aio-sprint-02-llm-fundamentals",
    estimatedHours: 1,
    purpose: "Tokens, context budget, sampling vs authority; model selection under constraints.",
  },
  {
    id: "ep-d2-sprint-10",
    day: 2,
    block: "AIO Sprint",
    title: "Grok model ops: call, tools, differentiation",
    kind: "module",
    activityId: "aio-sprint-10-grok-model-ops",
    estimatedHours: 1,
    purpose:
      "Call approved Grok via OpenAI-compatible API; tool allowlists; reasoning_effort vs latency; what still needs local evals.",
  },
  {
    id: "ep-d2-lab-grok",
    day: 2,
    block: "Lab (mandatory)",
    title: "Grok routing under partner pressure",
    kind: "lab",
    activityId: "aio-lab-grok-routing",
    estimatedHours: 0.75,
    purpose:
      "MAP + tool allowlist + reasoning choice + oral defense when Sales wants unrestricted Grok tools.",
    gate: "packet-artifacts",
  },
  {
    id: "ep-d3-sprint-03",
    day: 3,
    block: "AIO Sprint",
    title: "RAG: authorize before retrieve",
    kind: "module",
    activityId: "aio-sprint-03-rag",
    estimatedHours: 1,
    purpose: "Permission-aware retrieval path with cite/abstain.",
  },
  {
    id: "ep-d3-sprint-04",
    day: 3,
    block: "AIO Sprint",
    title: "Secure enterprise AI boundaries",
    kind: "module",
    activityId: "aio-sprint-04-secure-boundary",
    estimatedHours: 1,
    purpose: "Narrow pilot: data in, agency out, audit, reviewers.",
  },
  {
    id: "ep-d3-sprint-05",
    day: 3,
    block: "AIO Sprint",
    title: "Evaluation: make quality measurable",
    kind: "module",
    activityId: "aio-sprint-05-evaluation",
    estimatedHours: 1,
    purpose: "Representative cases, failure taxonomy, expansion gates.",
  },
  {
    id: "ep-d3-lab-05",
    day: 3,
    block: "Lab (mandatory)",
    title: "Evaluation matrix",
    kind: "lab",
    activityId: "aio-lab-05",
    estimatedHours: 1.5,
    purpose: "Packet artifact: 12-case mini evaluation pack.",
    gate: "packet-artifacts",
  },
  {
    id: "ep-d4-sprint-06",
    day: 4,
    block: "AIO Sprint",
    title: "System design: controlled rollout",
    kind: "module",
    activityId: "aio-sprint-06-system-design",
    estimatedHours: 1,
    purpose: "1-page architecture with failure behavior.",
  },
  {
    id: "ep-d4-lab-06",
    day: 4,
    block: "Lab (mandatory)",
    title: "Architecture whiteboard defense",
    kind: "lab",
    activityId: "aio-lab-06",
    estimatedHours: 1.5,
    purpose: "Packet artifact: one-page architecture + skeptical failure probes.",
    gate: "packet-artifacts",
  },
  {
    id: "ep-d3-lab-12",
    day: 3,
    block: "Lab (mandatory)",
    title: "Idempotent retry review (probe 9)",
    kind: "lab",
    activityId: "aio-lab-12",
    estimatedHours: 0.75,
    purpose: "Spot blind write retries in AI-generated code; require Idempotency-Key + NeedsReview.",
    gate: "packet-artifacts",
  },
  {
    id: "ep-d3-sprint-09",
    day: 3,
    block: "AIO Sprint",
    title: "Prompt contracts + when not to agent",
    kind: "module",
    activityId: "aio-sprint-09-prompt-and-agency",
    estimatedHours: 0.75,
    purpose: "Instruction/data split and smallest safe agency for the first pilot.",
  },
  {
    id: "ep-d3-sprint-11",
    day: 3,
    block: "AIO Sprint",
    title: "Prompt engineering: schema + measured iteration",
    kind: "module",
    activityId: "aio-sprint-11-prompt-engineering",
    estimatedHours: 1,
    purpose:
      "Write PROMPT-V1/V2 with schema-first outputs, abstain language, and one evidence-driven DELTA against a failing case.",
  },
  {
    id: "ep-d3-lab-partner",
    day: 3,
    block: "Lab (mandatory)",
    title: "Cross-team partner pressure",
    kind: "lab",
    activityId: "aio-lab-partner-pressure",
    estimatedHours: 0.5,
    purpose: "Reconcile eng/security/ops asks without granting unsafe write tools.",
    gate: "packet-artifacts",
  },
  {
    id: "ep-d4-coding-prototype",
    day: 4,
    block: "Coding mini-capstone (mandatory)",
    title: "Run and repair the permission-aware procedure assistant",
    kind: "coding",
    activityId: "coding-aio-procedure-assistant",
    estimatedHours: 1.25,
    purpose:
      "Run deny/cite/conflict/unsupported tests, break authorization order deliberately, repair it, and save the reviewed explanation.",
    gate: "coding-bridge",
  },
  {
    id: "ep-d4-coding-broken-pr",
    day: 4,
    block: "Coding (mandatory)",
    title: "Broken AI PR review under pressure",
    kind: "coding",
    activityId: "coding-aio-broken-pr-review",
    estimatedHours: 0.75,
    purpose: "Narrate authz-order, blind-retry, and unvalidated-JSON bugs before repairing.",
    gate: "coding-bridge",
  },
  {
    id: "ep-d4-coding-grok-draft",
    day: 4,
    block: "Coding (mandatory)",
    title: "Grok agent draft review",
    kind: "coding",
    activityId: "coding-aio-grok-draft-review",
    estimatedHours: 0.75,
    purpose:
      "Narrate allowlist, search-authority, reasoning_effort, and write-retry bugs in a Grok-shaped draft before repairing.",
    gate: "coding-bridge",
  },
  {
    id: "ep-d4-lab-grok-live",
    day: 4,
    block: "Lab (mandatory)",
    title: "Live Grok prompt fixtures",
    kind: "lab",
    activityId: "aio-lab-grok-live",
    estimatedHours: 0.75,
    purpose:
      "Run classify-cite / abstain-conflict / schema-repair via API or local script; fallback fixtures OK without XAI_API_KEY.",
    gate: "packet-artifacts",
  },
  {
    id: "ep-d4-sprint-07",
    day: 4,
    block: "AIO Sprint",
    title: "Project defense + mini-capstone story",
    kind: "module",
    activityId: "aio-sprint-07-project-defense",
    estimatedHours: 1,
    purpose: "Defend the permission-aware read-only procedure assistant (Coding scaffold + AIO ownership).",
  },
  {
    id: "ep-d5-sprint-08",
    day: 5,
    block: "AIO Sprint",
    title: "Full mock loop structure",
    kind: "module",
    activityId: "aio-sprint-08-mock-loop",
    estimatedHours: 0.75,
    purpose: "Timing skeleton; reading ≠ mock.",
  },
  {
    id: "ep-d5-interview-studio",
    day: 5,
    block: "Interview Studio (mandatory)",
    title: "Timed four-round mock attempt",
    kind: "interview",
    estimatedHours: 1.5,
    purpose: "Pressure reps with preserved first answers before revision.",
    gate: "timed-mock",
  },
  {
    id: "ep-d5-revise",
    day: 5,
    block: "Packet polish (mandatory)",
    title: "Oral probe dry-run without notes",
    kind: "artifact",
    estimatedHours: 1.5,
    purpose:
      "Answer all ten readiness-bar oral probes in your own words (≥40 words each) and attest you did not use lesson notes.",
    gate: "packet-artifacts",
  },
];

export const aioInterviewEmergencyCodingLessonIds: string[] = [
  ...new Set(aioCodingBridge),
];

export const aioInterviewEmergencyCodingChallengeIds: string[] = [
  ...new Set(aioCodingChallenges),
];

export function reviewedAioInterviewCodingChallengeIds(
  progress?: CodingProgramProgress,
): string[] {
  if (!progress) return [];
  return aioInterviewEmergencyCodingChallengeIds.filter((id) => {
    const challenge = allCodingChallenges.find((item) => item.id === id);
    const attempt = progress.challengeAttempts[id];
    return Boolean(
      challenge &&
        attempt?.status === "reviewed" &&
        attempt.localRunConfirmed &&
        (challenge.day === 1 || attempt.testConfirmed),
    );
  });
}

export const aioInterviewEmergencyRequiredLabs = [
  "aio-lab-01",
  "aio-lab-05",
  "aio-lab-06",
  "aio-lab-12",
  "aio-lab-partner-pressure",
  "aio-lab-grok-routing",
  "aio-lab-grok-live",
] as const;

export const aioInterviewEmergencyRequiredModules = [
  "aio-sprint-01-role-narrative",
  "aio-sprint-02-llm-fundamentals",
  "aio-sprint-03-rag",
  "aio-sprint-04-secure-boundary",
  "aio-sprint-05-evaluation",
  "aio-sprint-06-system-design",
  "aio-sprint-07-project-defense",
  "aio-sprint-08-mock-loop",
  "aio-sprint-09-prompt-and-agency",
  "aio-sprint-10-grok-model-ops",
  "aio-sprint-11-prompt-engineering",
] as const;

export const aioInterviewEmergencyMiniCapstone = {
  projectId: "ai-procedure",
  title: "Permission-Aware Procedure Assistant",
  story:
    "Guided mini-capstone: complete Coding-side scaffold for a permission-aware read-only procedure assistant, then defend schema, authz-before-retrieve, and deny/cite tests in AIO — not a greenfield production system.",
  codingLessonIds: aioInterviewEmergencyCodingLessonIds,
  codingChallengeId: "coding-aio-procedure-assistant",
  defenseModuleId: "aio-sprint-07-project-defense",
} as const;

export type EmergencyPathProgressInput = {
  completedCourseItemIds: string[];
  completedCodingLessonIds: string[];
  reviewedCodingChallengeIds: string[];
  completedTimedMockCount: number;
  /** Day-5 oral probe dry-run scored ≥10/12 with must-pass probes cleared. */
  oralProbeDryRunComplete: boolean;
  spokenNarrativeAttested: boolean;
  coldArchitectureRedrawComplete: boolean;
};

export type EmergencyPathGateStatus = {
  codingBridge: boolean;
  sprintModules: boolean;
  requiredLabs: boolean;
  timedMock: boolean;
  oralProbeDryRun: boolean;
  spokenNarrative: boolean;
  coldArchitecture: boolean;
  /** Packet complete for few-day path — does NOT equal Foundation Prove graduation. */
  packetComplete: boolean;
  missing: string[];
};

export function evaluateInterviewEmergencyProgress(input: EmergencyPathProgressInput): EmergencyPathGateStatus {
  const course = new Set(input.completedCourseItemIds);
  const coding = new Set(input.completedCodingLessonIds);
  const codingChallenges = new Set(input.reviewedCodingChallengeIds);
  const missing: string[] = [];

  const codingLessonsComplete = aioInterviewEmergencyCodingLessonIds.every((id) => coding.has(id));
  const codingChallengesComplete = aioInterviewEmergencyCodingChallengeIds.every((id) =>
    codingChallenges.has(id),
  );
  const codingBridge = codingLessonsComplete && codingChallengesComplete;
  if (!codingBridge) {
    missing.push(
      ...aioInterviewEmergencyCodingLessonIds.filter((id) => !coding.has(id)).map((id) => `Coding: ${id}`),
      ...aioInterviewEmergencyCodingChallengeIds
        .filter((id) => !codingChallenges.has(id))
        .map((id) => `Coding challenge: ${id}`),
    );
  }

  const sprintModules = aioInterviewEmergencyRequiredModules.every((id) => course.has(id));
  if (!sprintModules) {
    missing.push(
      ...aioInterviewEmergencyRequiredModules.filter((id) => !course.has(id)).map((id) => `Module: ${id}`),
    );
  }

  const requiredLabs = aioInterviewEmergencyRequiredLabs.every((id) => course.has(id));
  if (!requiredLabs) {
    missing.push(...aioInterviewEmergencyRequiredLabs.filter((id) => !course.has(id)).map((id) => `Lab: ${id}`));
  }

  const timedMock = input.completedTimedMockCount >= 1;
  if (!timedMock) missing.push("Interview Studio: ≥1 timed mock attempt");

  const oralProbeDryRun = input.oralProbeDryRunComplete;
  if (!oralProbeDryRun) {
    missing.push("Day-5 scored oral probes: ≥10/12 Strong-or-Partial with must-pass 4/5/6/10/11");
  }

  const spokenNarrative = input.spokenNarrativeAttested;
  if (!spokenNarrative) {
    missing.push("Lab 01 spoken narrative attest (90s without reading the script)");
  }

  const coldArchitecture = input.coldArchitectureRedrawComplete;
  if (!coldArchitecture) {
    missing.push("Lab 06 cold architecture redraw without the failure-matrix asset");
  }

  return {
    codingBridge,
    sprintModules,
    requiredLabs,
    timedMock,
    oralProbeDryRun,
    spokenNarrative,
    coldArchitecture,
    packetComplete:
      codingBridge &&
      sprintModules &&
      requiredLabs &&
      timedMock &&
      oralProbeDryRun &&
      spokenNarrative &&
      coldArchitecture,
    missing,
  };
}

export const interviewEmergencyPathSummary =
  "Interview-ready partner/judgment screen: explain concepts, defend design choices, and walk a guided LLM PoC — not independent production implementation.";

export const aioInterviewEmergencyEstimatedHours = aioInterviewEmergencyPath.reduce(
  (total, item) => total + item.estimatedHours,
  0,
);
