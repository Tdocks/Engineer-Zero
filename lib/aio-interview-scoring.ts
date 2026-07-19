/**
 * Deterministic Interview Studio scoring for Applied AI Operations.
 * Rewards ordered control reasoning and penalizes known unsafe patterns.
 */

export type InterviewScoreResult = {
  score: number;
  complete: boolean;
  feedback: string;
  missing: string[];
  antiPatterns: string[];
};

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

const aioDimensions = [
  ["recommendation", /\b(recommend|propose|would use|should|choose)\b/i],
  ["boundary", /\b(boundary|scope|permission|approval|read-only|least privilege|authoriz)\b/i],
  ["evidence", /\b(evidence|metric|test|evaluate|citation|baseline|case)\b/i],
  ["verification", /\b(verify|monitor|review|regression|check|schema)\b/i],
  ["ownership", /\b(owner|stakeholder|escalat|human|team|reviewer)\b/i],
  ["tradeoff", /\b(tradeoff|risk|cost|latency|constraint|failure|limit)\b/i],
] as const;

const antiPatterns: Array<[string, RegExp]> = [
  ["retrieve-then-filter", /retriev(?:e|al|ed).{0,100}(?:then|after).{0,60}(?:hide|filter|redact|omit)/i],
  ["fetch-all-then-hide", /fetch.{0,40}all.{0,60}(?:then|after).{0,40}(?:filter|hide)/i],
  ["silent-conflict-pick", /silently\s+pick|just\s+choose\s+one|pick\s+the\s+newer|ignore\s+the\s+conflict/i],
  ["blind-retries", /just\s+add\s+retries|retry\s+until\s+it\s+works|retry\s+five\s+times/i],
  ["no-ownership", /\b(?:someone|they)\s+will\s+(?:handle|fix)|not\s+my\s+(?:job|problem)\b/i],
  [
    "grok-truth-skips-citations",
    /grok.{0,60}truth[- ]seeking.{0,80}(?:citation|cite|authoriz|allowlist).{0,40}(?:not needed|optional|unnecessary)/i,
  ],
  [
    "x-search-replaces-authz",
    /(?:x search|web search).{0,60}(?:replaces|instead of|removes).{0,40}(?:authoriz|permission|policy)/i,
  ],
];

const orderedControlSteps: Array<[string, RegExp]> = [
  ["identity", /\b(identity|principal|authenticat|who\s+the\s+user)\b/i],
  ["policy", /\b(policy|authoriz|permission|least privilege|scope)\b/i],
  ["retrieval", /\b(retriev|index|corpus|passage)\b/i],
  ["validate", /\b(validat|schema|cite|abstain|conflict)\b/i],
];

function orderBonus(response: string) {
  const positions = orderedControlSteps
    .map(([label, pattern]) => {
      const match = pattern.exec(response);
      return match ? { label, index: match.index } : null;
    })
    .filter(Boolean) as Array<{ label: string; index: number }>;
  if (positions.length < 3) return 0;
  const sorted = [...positions].sort((a, b) => a.index - b.index);
  const sameOrder = sorted.every((item, index) => item.label === positions[index]?.label);
  return sameOrder ? 12 : 0;
}

export function scoreAioInterviewResponse(response: string): InterviewScoreResult {
  const answerWords = words(response);
  const missing = aioDimensions
    .filter(([, matcher]) => !matcher.test(response))
    .map(([label]) => label);
  const hitAnti = antiPatterns
    .filter(([, matcher]) => matcher.test(response))
    .map(([label]) => label);
  const dimensionScore =
    (aioDimensions.length - missing.length) * (66 / Math.max(aioDimensions.length, 1));
  let score = Math.min(
    100,
    Math.round(18 + Math.min(answerWords.length, 220) * 0.1 + dimensionScore + orderBonus(response)),
  );
  if (hitAnti.length) {
    score = Math.min(score, 55 - hitAnti.length * 5);
  }
  score = Math.max(0, Math.min(100, score));
  const complete = answerWords.length >= 80 && missing.length === 0 && hitAnti.length === 0;
  return {
    score,
    complete,
    missing,
    antiPatterns: hitAnti,
    feedback: complete
      ? "Clear operating sequence with safe control ordering. Compare to examiner guidance, then revise for specificity."
      : hitAnti.length
        ? `Unsafe pattern(s) detected (${hitAnti.join(", ")}). Fix the control order or ownership before expanding vocabulary.`
        : `Add specific reasoning for: ${missing.join(", ") || "depth and concrete evidence"}.`,
  };
}
