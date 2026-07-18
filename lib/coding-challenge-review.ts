import "server-only";

import { codingChallenges } from "./coding-developer";

type ChallengeEvidenceResult = {
  score: number;
  status: "needs-revision" | "reviewed";
  feedback: string;
  found: string[];
  missing: string[];
  visibleSignals: string[];
  unsafeSignals: string[];
  hasDepth: boolean;
  hasStructure: boolean;
};

type EvidenceRequirement = {
  id: string;
  label: string;
  anchors: string[];
  minAnchors?: number;
  minSegmentWords?: number;
};

const rubric = (id: string, label: string, anchors: string[], minAnchors = 2): EvidenceRequirement => ({ id, label, anchors, minAnchors, minSegmentWords: 8 });

/** Server-only review criteria. The client sees the learner prompt and visible
 * structural checks, never these matching terms or completion thresholds. */
const challengeEvidenceRequirements: Record<string, EvidenceRequirement[]> = {
  "coding-terminal-escape": [
    rubric("location", "a specific working-directory observation", ["pwd", "working directory", "location", "path"]),
    rubric("recovery", "the exact recovery command and destination", ["mv", "cd", "main.py", "ai_prototype", "move"]),
    rubric("verification", "a verification after recovery", ["verify", "ls", "pwd", "confirm", "check"]),
    rubric("safety", "why the path check prevents a mistake", ["wrong", "safe", "remove", "path", "folder"]),
  ],
  "coding-triage-cli": [
    rubric("contract", "the temperature input and named risk-level output", ["temperature", "input", "return", "normal", "review", "urgent"], 3),
    rubric("boundary", "an exact threshold or boundary case", ["90", "80", "threshold", "boundary", "exact"]),
    rubric("determinism", "why this remains trusted deterministic logic", ["deterministic", "rule", "repeatable", "model", "ai"]),
    rubric("verification", "a specific test or invalid-input check", ["test", "assert", "invalid", "valueerror", "verify"]),
  ],
  "coding-triage-api": [
    rubric("validation", "a typed request-validation boundary", ["request", "model", "validation", "schema", "input"], 3),
    rubric("service", "a separation between route and deterministic service logic", ["route", "service", "function", "threshold", "business"], 3),
    rubric("failure", "a client-visible invalid-input response", ["invalid", "422", "error", "client", "response"]),
    rubric("test", "a direct service or HTTP contract test", ["test", "assert", "http", "boundary", "verify"]),
  ],
  "coding-test-repair": [
    rubric("requirement", "the exact 90-degree requirement", ["90", "threshold", "urgent", "exact", "boundary"]),
    rubric("gap", "why a 91-degree-only test is insufficient", ["91", "miss", "not", "boundary", "insufficient"]),
    rubric("assertion", "a concrete revised assertion", ["assert", "evaluate_reading", "urgent", "90", "test"], 3),
    rubric("regression", "the regression that the test prevents", ["regression", "change", "rule", "protect", "prevent"]),
  ],
  "coding-ai-extraction": [
    rubric("model", "the model's bounded extraction task", ["model", "extract", "draft", "unstructured", "notes"]),
    rubric("validation", "schema validation before trusted policy", ["schema", "validation", "trusted", "structured", "reject"], 3),
    rubric("uncertainty", "a concrete uncertainty or missing-fact path", ["uncertainty", "missing", "unit", "ambiguous", "escalate"]),
    rubric("approval", "human approval outside the model boundary", ["human", "approve", "action", "risk", "decision"]),
  ],
  "coding-handoff-capstone": [
    rubric("outcome", "the user outcome and bounded scope", ["handoff", "user", "manual", "outcome", "scope"]),
    rubric("approval", "an explicit write or human-approval boundary", ["human", "approve", "review", "write", "action"]),
    rubric("test", "an end-to-end contract test", ["test", "post", "handoffs", "assert", "response"], 3),
    rubric("fallback", "a degraded model-unavailable path", ["model", "unavailable", "fallback", "degraded", "failure"]),
    rubric("escalation", "a specific next production concern or owner", ["production", "security", "identity", "escalate", "next"]),
  ],
};

function words(value: string) {
  return value.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
}

/**
 * The browser can only perform a structural learning review. It never claims
 * code ran or is safe. A challenge needs distinct explanatory claims, rather
 * than headings, repeated keywords, or a long unstructured response.
 */
export function reviewCodingChallenge(challengeId: string, code: string, explanation: string): ChallengeEvidenceResult | null {
  const challenge = codingChallenges.find((item) => item.id === challengeId);
  const requirements = challengeEvidenceRequirements[challengeId];
  if (!challenge || !requirements) return null;
  const codeWithoutCommentOnlyLines = code
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n")
    .toLowerCase();
  const visibleSignals = challenge.requiredSignals.filter((signal) => codeWithoutCommentOnlyLines.includes(signal.toLowerCase()));
  const unsafeSignals = (challenge.antiPatterns ?? []).filter((signal) => codeWithoutCommentOnlyLines.includes(signal.toLowerCase()));
  const segments = explanation.toLowerCase().split(/[\n.!?]+/).map((segment) => segment.trim()).filter(Boolean);
  const explanationWords = words(explanation);
  const uniqueRatio = explanationWords.length ? new Set(explanationWords).size / explanationWords.length : 0;
  const found = requirements.filter((requirement) => segments.some((segment) => {
    const anchored = requirement.anchors.filter((anchor) => segment.includes(anchor)).length;
    return anchored >= (requirement.minAnchors ?? 2) && words(segment).length >= (requirement.minSegmentWords ?? 8);
  }));
  const hasDepth = explanationWords.length >= Math.max(90, requirements.length * 20);
  const hasStructure = segments.length >= requirements.length && uniqueRatio >= .42;
  const structuralScore = visibleSignals.length / challenge.requiredSignals.length;
  const explanationScore = found.length / requirements.length;
  const score = Math.max(0, Math.min(100, Math.round(structuralScore * 35 + explanationScore * 55 + (hasDepth && hasStructure ? 10 : 0) - unsafeSignals.length * 25)));
  const missing = requirements.filter((requirement) => !found.includes(requirement)).map((requirement) => requirement.label);
  const complete = !unsafeSignals.length && visibleSignals.length === challenge.requiredSignals.length && found.length === requirements.length && hasDepth && hasStructure;

  const feedback = unsafeSignals.length
    ? `Pause before continuing: remove or explain ${unsafeSignals.join(", ")}. It is not appropriate for this exercise.`
    : visibleSignals.length !== challenge.requiredSignals.length
      ? `Visible design review found ${visibleSignals.length}/${challenge.requiredSignals.length} required structures. Add the missing elements before recording an explanation.`
      : missing.length
        ? `Your explanation needs distinct evidence for: ${missing.join("; ")}. Explain each claim in a concrete sentence, not as a heading or keyword list.`
        : !hasDepth || !hasStructure
          ? "The required claims appear, but the explanation is still too thin or repetitive. Connect each decision to a specific behavior, boundary, or verification step."
          : "The local study review records visible design signals and a structured explanation. It is not execution proof: run the supplied project in an isolated environment, inspect its tests, and defend the outcome before claiming independent capability.";

  return { score, status: complete ? "reviewed" : "needs-revision", feedback, found: found.map((item) => item.id), missing, visibleSignals, unsafeSignals, hasDepth, hasStructure };
}

export function validateCodingChallengeRubrics() {
  const issues: string[] = [];
  for (const challenge of codingChallenges) {
    const requirements = challengeEvidenceRequirements[challenge.id];
    if (!requirements || requirements.length < 4) issues.push(`Challenge review rubric is incomplete: ${challenge.id}`);
    if (requirements?.some((requirement) => !requirement.id || !requirement.label || requirement.anchors.length < 2)) {
      issues.push(`Challenge review rubric lacks evidence detail: ${challenge.id}`);
    }
  }
  for (const challengeId of Object.keys(challengeEvidenceRequirements)) {
    if (!codingChallenges.some((challenge) => challenge.id === challengeId)) issues.push(`Challenge review rubric points to an unknown challenge: ${challengeId}`);
  }
  return issues;
}
