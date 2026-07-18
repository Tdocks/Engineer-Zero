import type { CodingChallenge } from "./coding-developer";

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

function words(value: string) {
  return value.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
}

/**
 * The browser can only perform a structural learning review. It never claims
 * code ran or is safe. A challenge needs distinct explanatory claims, rather
 * than headings, repeated keywords, or a long unstructured response.
 */
export function reviewCodingChallenge(challenge: CodingChallenge, code: string, explanation: string): ChallengeEvidenceResult {
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
  const found = challenge.evidenceRequirements.filter((requirement) => segments.some((segment) => {
    const anchored = requirement.anchors.filter((anchor) => segment.includes(anchor)).length;
    return anchored >= (requirement.minAnchors ?? 2) && words(segment).length >= (requirement.minSegmentWords ?? 8);
  }));
  const hasDepth = explanationWords.length >= Math.max(90, challenge.evidenceRequirements.length * 20);
  const hasStructure = segments.length >= challenge.evidenceRequirements.length && uniqueRatio >= .42;
  const structuralScore = visibleSignals.length / challenge.requiredSignals.length;
  const explanationScore = found.length / challenge.evidenceRequirements.length;
  const score = Math.max(0, Math.min(100, Math.round(structuralScore * 35 + explanationScore * 55 + (hasDepth && hasStructure ? 10 : 0) - unsafeSignals.length * 25)));
  const missing = challenge.evidenceRequirements.filter((requirement) => !found.includes(requirement)).map((requirement) => requirement.label);
  const complete = !unsafeSignals.length && visibleSignals.length === challenge.requiredSignals.length && found.length === challenge.evidenceRequirements.length && hasDepth && hasStructure;

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
