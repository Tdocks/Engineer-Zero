/**
 * Must-pass oral probes for the Few-Day Interview Path.
 * Source of truth aligned with docs/AIO_INTERVIEW_READINESS_BAR.md
 */

export type OralProbeRating = "strong" | "partial" | "fail";

export type OralProbeDefinition = {
  id: number;
  prompt: string;
  /** Paraphrased cold wording for Day-5 second pass. */
  coldPrompt: string;
  strongAnswerSignals: string;
  requiredTerms: string[];
  minimumTermMatches: number;
  forbiddenPatterns?: RegExp[];
  /** Order pairs: earlier term should appear before later term when both present. */
  preferredOrder?: Array<[string, string]>;
  mustPassForHigh?: boolean;
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export const aioOralProbes: OralProbeDefinition[] = [
  {
    id: 1,
    prompt: 'Why this role, not "prompt engineer"?',
    coldPrompt:
      "A hiring manager asks why you are not just applying as a prompt engineer. What do you say?",
    strongAnswerSignals:
      "Technical partner: discover → controlled design → evaluate → defend; ownership honesty",
    requiredTerms: ["partner", "discover", "design", "evaluat", "defend", "ownership"],
    minimumTermMatches: 3,
  },
  {
    id: 2,
    prompt: "When is conventional automation better than an LLM?",
    coldPrompt:
      "When would you refuse an LLM and choose ordinary automation or search instead?",
    strongAnswerSignals:
      "Clear rules / deterministic outputs; AI for ambiguous language only when evidence supports it",
    requiredTerms: ["automat", "determin", "rule", "ambiguous", "llm", "evidence"],
    minimumTermMatches: 3,
  },
  {
    id: 3,
    prompt: "What are tokens and a context window, practically?",
    coldPrompt:
      "Explain tokens and context windows as cost, latency, and distraction budgets — not jargon.",
    strongAnswerSignals:
      "Budget: cost/latency/distraction/injection; minimal authorized evidence beats stuffing",
    requiredTerms: ["token", "context", "budget", "cost", "latency", "authoriz"],
    minimumTermMatches: 3,
  },
  {
    id: 4,
    prompt: "Where does authorization run in a RAG flow?",
    coldPrompt:
      "In a retrieval assistant, when do permissions get enforced relative to fetching documents?",
    strongAnswerSignals: "Before retrieval / model context; no retrieve-all-then-hide",
    requiredTerms: ["authoriz", "before", "retriev", "policy", "permission"],
    minimumTermMatches: 3,
    forbiddenPatterns: [
      /retriev(?:e|al|ed).{0,80}(?:then|after).{0,40}(?:hide|filter|redact)/i,
      /fetch.{0,40}all.{0,40}(?:then|after).{0,40}(?:filter|hide)/i,
    ],
    preferredOrder: [
      ["authoriz", "retriev"],
      ["policy", "retriev"],
    ],
    mustPassForHigh: true,
  },
  {
    id: 5,
    prompt: "What do you do when two authorized sources conflict?",
    coldPrompt:
      "Two approved documents disagree on a step. What does a safe assistant do?",
    strongAnswerSignals: "Surface conflict + escalate; do not silently pick",
    requiredTerms: ["conflict", "surface", "escalat", "abstain"],
    minimumTermMatches: 2,
    forbiddenPatterns: [/silently\s+pick|just\s+choose|pick\s+the\s+newer|average\s+them/i],
    mustPassForHigh: true,
  },
  {
    id: 6,
    prompt: "When must the system abstain?",
    coldPrompt: "Name situations where the assistant must refuse to answer instead of guessing.",
    strongAnswerSignals: "Missing, unauthorized, conflicting, or schema-invalid evidence",
    requiredTerms: ["abstain", "missing", "unauthor", "conflict", "schema"],
    minimumTermMatches: 3,
    mustPassForHigh: true,
  },
  {
    id: 7,
    prompt: "Name a useful evaluation set for a procedure assistant",
    coldPrompt: "What kinds of test cases belong in a release pack for a procedure-search assistant?",
    strongAnswerSignals:
      "Supported, denied, stale, conflict, injection, unsupported, latency/schema",
    requiredTerms: ["supported", "denied", "stale", "conflict", "injection", "unsupported"],
    minimumTermMatches: 4,
  },
  {
    id: 8,
    prompt: "Why classify failures instead of only rewriting prompts?",
    coldPrompt:
      "A case invents an unsupported cool-down time. Why is ‘rewrite the prompt until it sounds better’ weaker than naming a failure category and re-running that exact case after one change?",
    strongAnswerSignals:
      "Category → component (retrieval, authz, schema, prompt, tool) + regression; prompt iteration needs a failing case, not vibes",
    requiredTerms: ["categor", "component", "regression", "retriev", "authoriz"],
    minimumTermMatches: 3,
  },
  {
    id: 9,
    prompt: "What is unsafe about automatic retries on a write tool?",
    coldPrompt: "Why can blind retries on a write/action tool create real damage?",
    strongAnswerSignals: "Duplicate consequential actions; need idempotency + bounded retries",
    requiredTerms: ["retry", "duplicate", "idempoten", "write", "bound"],
    minimumTermMatches: 3,
  },
  {
    id: 10,
    prompt: "How do you defend AI-assisted work honestly?",
    coldPrompt:
      "How do you explain AI-assisted coding without claiming you hand-wrote everything?",
    strongAnswerSignals:
      "What you designed / generated / reviewed / tested / repaired; limits named",
    requiredTerms: ["designed", "reviewed", "tested", "repaired", "limit", "ai"],
    minimumTermMatches: 3,
    mustPassForHigh: true,
  },
  {
    id: 11,
    prompt: "Does approving Grok as the model remove the need for local security controls?",
    coldPrompt:
      "A stakeholder says Grok is approved and truth-seeking, so citations and allowlists are optional. How do you respond?",
    strongAnswerSignals:
      "Grok ≠ security boundary; authz, schema, tool allowlists, and local evals still required",
    requiredTerms: ["grok", "authoriz", "allowlist", "eval", "schema", "security"],
    minimumTermMatches: 3,
    forbiddenPatterns: [
      /truth[- ]seeking.{0,40}(?:enough|replaces|means)/i,
      /grok.{0,40}(?:replaces|removes).{0,40}(?:authoriz|eval|citation)/i,
    ],
    mustPassForHigh: true,
  },
  {
    id: 12,
    prompt: "Name a Grok differentiator that still needs local evaluation",
    coldPrompt:
      "What is one real Grok strength (tools, search, or reasoning_effort) that you would still measure before expanding a pilot?",
    strongAnswerSignals:
      "Tools/search/reasoning_effort are useful only after owned cases prove search cites, latency, and allowlist behavior",
    requiredTerms: ["search", "tool", "reasoning", "eval", "latency", "allowlist"],
    minimumTermMatches: 3,
  },
];

export const ORAL_PROBE_MIN_WORDS = 40;
export const ORAL_PROBE_PASS_MINIMUM = 10;

export type OralProbeAnswer = {
  probeId: number;
  response: string;
  rating?: OralProbeRating;
};

export type OralProbeDryRun = {
  id: string;
  trackId: "applied-ai-operations";
  completedAt: string;
  answeredWithoutNotes: boolean;
  answers: OralProbeAnswer[];
  strongOrPartialCount?: number;
  mustPassCleared?: boolean;
};

export function scoreOralProbeResponse(
  probe: OralProbeDefinition,
  response: string,
): OralProbeRating {
  const text = response.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < ORAL_PROBE_MIN_WORDS) return "fail";
  const normalized = normalize(text);
  if (probe.forbiddenPatterns?.some((pattern) => pattern.test(text))) return "fail";
  const matched = probe.requiredTerms.filter((term) => normalized.includes(normalize(term)));
  if (matched.length < probe.minimumTermMatches) return "fail";
  let orderBonus = true;
  for (const [earlier, later] of probe.preferredOrder ?? []) {
    const earlyIndex = normalized.indexOf(normalize(earlier));
    const laterIndex = normalized.indexOf(normalize(later));
    if (earlyIndex >= 0 && laterIndex >= 0 && earlyIndex > laterIndex) {
      orderBonus = false;
      break;
    }
  }
  if (!orderBonus) return "partial";
  if (matched.length >= Math.min(probe.requiredTerms.length, probe.minimumTermMatches + 2)) {
    return "strong";
  }
  return matched.length >= probe.minimumTermMatches ? "partial" : "fail";
}

export function scoreOralProbeDryRun(answers: OralProbeAnswer[]): {
  ratedAnswers: OralProbeAnswer[];
  strongOrPartialCount: number;
  mustPassCleared: boolean;
} {
  const ratedAnswers = aioOralProbes.map((probe) => {
    const answer = answers.find((item) => item.probeId === probe.id);
    const response = answer?.response ?? "";
    return {
      probeId: probe.id,
      response,
      rating: scoreOralProbeResponse(probe, response),
    };
  });
  const strongOrPartialCount = ratedAnswers.filter(
    (answer) => answer.rating === "strong" || answer.rating === "partial",
  ).length;
  const mustPassCleared = aioOralProbes
    .filter((probe) => probe.mustPassForHigh)
    .every((probe) => {
      const rating = ratedAnswers.find((answer) => answer.probeId === probe.id)?.rating;
      return rating === "strong" || rating === "partial";
    });
  return { ratedAnswers, strongOrPartialCount, mustPassCleared };
}

export function isCompleteOralProbeDryRun(
  dryRun:
    | Pick<
        OralProbeDryRun,
        "answeredWithoutNotes" | "answers" | "strongOrPartialCount" | "mustPassCleared"
      >
    | undefined
    | null,
): boolean {
  if (!dryRun?.answeredWithoutNotes) return false;
  if (dryRun.answers.length !== aioOralProbes.length) return false;
  const scored =
    typeof dryRun.strongOrPartialCount === "number" && typeof dryRun.mustPassCleared === "boolean"
      ? {
          strongOrPartialCount: dryRun.strongOrPartialCount,
          mustPassCleared: dryRun.mustPassCleared,
        }
      : scoreOralProbeDryRun(dryRun.answers);
  if (scored.strongOrPartialCount < ORAL_PROBE_PASS_MINIMUM) return false;
  if (!scored.mustPassCleared) return false;
  return aioOralProbes.every((probe) => {
    const answer = dryRun.answers.find((item) => item.probeId === probe.id);
    const wordCount = answer?.response.trim().split(/\s+/).filter(Boolean).length ?? 0;
    return wordCount >= ORAL_PROBE_MIN_WORDS;
  });
}

export function isColdArchitectureRedrawComplete(response: string | undefined | null): boolean {
  if (!response) return false;
  const lines = response
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const components = lines.filter((line) => /^COMPONENT-\d+/i.test(line));
  const challenges = lines.filter((line) => /^CHALLENGE-[ABC]/i.test(line));
  const normalized = normalize(response);
  const terms = ["identity", "policy", "retrieval", "gateway", "audit", "conflict", "abstain", "fail closed"];
  const matched = terms.filter((term) => normalized.includes(term)).length;
  return components.length >= 8 && challenges.length >= 3 && matched >= 6 && response.trim().split(/\s+/).filter(Boolean).length >= 120;
}
