import "server-only";

import { codingContinuation, type CodingContinuationSubmission } from "./coding-continuation";

type Requirement = { label: string; anchors: string[]; minAnchors?: number };

const requirements: Record<string, Record<keyof CodingContinuationSubmission, Requirement>> = {
  "continuation-week-1-stabilize": {
    artifact: { label: "a concrete rebuilt function or artifact", anchors: ["function", "triage", "cli", "api", "input", "output"], minAnchors: 2 },
    verification: { label: "a specific repair or boundary test", anchors: ["test", "assert", "boundary", "repair", "90"], minAnchors: 2 },
    limitation: { label: "an honest remaining limitation", anchors: ["limitation", "not", "still", "cannot", "production"] },
    nextDecision: { label: "a focused next practice or decision", anchors: ["next", "practice", "change", "owner", "rebuild"] },
  },
  "continuation-week-2-data": {
    artifact: { label: "a relational/CRUD and repository boundary", anchors: ["table", "row", "crud", "repository", "sqlite", "service"], minAnchors: 2 },
    verification: { label: "a create/read/update/delete integration check", anchors: ["test", "create", "read", "update", "delete", "response"], minAnchors: 2 },
    limitation: { label: "a real SQLite production limitation", anchors: ["sqlite", "concurrency", "backup", "authorization", "production"] },
    nextDecision: { label: "a managed-database trigger and owner", anchors: ["managed", "database", "trigger", "owner", "concurrency"] },
  },
  "continuation-week-3-retrieval": {
    artifact: { label: "a permission-aware retrieval or citation boundary", anchors: ["authorization", "metadata", "citation", "source", "retrieve", "abstain"], minAnchors: 2 },
    verification: { label: "safe evaluation cases", anchors: ["injection", "stale", "unsupported", "evaluate", "case", "reject"], minAnchors: 2 },
    limitation: { label: "a missing source, authorization, or quality limitation", anchors: ["freshness", "authorization", "quality", "missing", "limitation"] },
    nextDecision: { label: "a controlled pilot and accountable reviewer", anchors: ["pilot", "security", "owner", "approve", "reviewer"] },
  },
  "continuation-week-4-team": {
    artifact: { label: "a reviewable change and handoff artifact", anchors: ["branch", "pull request", "readme", "architecture", "review", "run"], minAnchors: 2 },
    verification: { label: "test/review/conflict evidence", anchors: ["test", "review", "conflict", "merge", "evidence", "verify"], minAnchors: 2 },
    limitation: { label: "a concrete production limitation", anchors: ["monitoring", "identity", "security", "deployment", "limitation"] },
    nextDecision: { label: "an accountable next decision and recovery condition", anchors: ["owner", "next", "rollback", "escalate", "pilot", "decision"], minAnchors: 2 },
  },
};

function words(value: string) {
  return value.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
}

function meets(value: string, requirement: Requirement) {
  const normalized = value.toLowerCase();
  return words(value).length >= 18 && requirement.anchors.filter((anchor) => normalized.includes(anchor)).length >= (requirement.minAnchors ?? 1);
}

export function reviewCodingContinuation(moduleId: string, submission: CodingContinuationSubmission) {
  const module = codingContinuation.find((item) => item.id === moduleId);
  const rubric = requirements[moduleId];
  if (!module || !rubric) return null;
  const missing = (Object.keys(rubric) as Array<keyof CodingContinuationSubmission>)
    .filter((field) => !meets(submission[field], rubric[field]))
    .map((field) => rubric[field].label);
  const allWords = Object.values(submission).flatMap(words);
  const uniqueRatio = allWords.length ? new Set(allWords).size / allWords.length : 0;
  const score = Math.round(((4 - missing.length) / 4) * 85 + (allWords.length >= 105 && uniqueRatio >= .42 ? 15 : 0));
  const status = missing.length === 0 && allWords.length >= 105 && uniqueRatio >= .42 ? "reviewed" : "needs-revision";
  return {
    score,
    status,
    missing,
    feedback: status === "reviewed"
      ? "This continuation record contains distinct artifact, verification, limitation, and next-decision evidence. It remains local study evidence until a qualified reviewer verifies the underlying work."
      : `Revise with distinct evidence for: ${missing.join("; ") || "a deeper, less repetitive explanation"}. A heading or generic project claim is not sufficient.`,
  };
}
