import "server-only";
import type { CodingCompetencyKey } from "./coding-developer";

type EvidenceRequirement = {
  id: string;
  label: string;
  anchors: string[];
  minAnchors?: number;
  minSegmentWords?: number;
};

export type CodingInterviewPrompt = {
  id: string;
  title: string;
  durationMinutes: number;
  prompt: string;
  mode: "architecture" | "debug" | "ai-boundary" | "project-defense" | "requirements-change";
  guidedHint: string;
  evidenceRequirements: EvidenceRequirement[];
  followUp: string;
  competencyWeights: Partial<Record<CodingCompetencyKey, number>>;
};

const evidence = (id: string, label: string, anchors: string[], minAnchors = 2): EvidenceRequirement => ({ id, label, anchors, minAnchors, minSegmentWords: 8 });

export const codingInterviewPrompts: CodingInterviewPrompt[] = [
  {
    id: "interview-triage-api", title: "Build the narrow triage API", durationMinutes: 12, mode: "architecture",
    prompt: "A fictional team manually reviews equipment readings. Describe a Python prototype that accepts a reading, returns NORMAL, REVIEW, or URGENT, and can be demonstrated in an interview.",
    guidedHint: "Begin with user outcome, then name input, request validation, pure rule, response, test, and what is intentionally out of scope.",
    evidenceRequirements: [
      evidence("outcome", "the user outcome and bounded scope", ["team", "user", "outcome", "manual", "scope"]),
      evidence("contract", "a request/response validation contract", ["request", "input", "validation", "response", "schema"]),
      evidence("boundary", "a service or business-rule boundary", ["service", "function", "rule", "boundary", "route"]),
      evidence("verification", "a specific normal or boundary test", ["test", "boundary", "assert", "90", "verify"]),
      evidence("limitation", "a prototype limitation or next decision", ["limitation", "production", "next", "out of scope", "scale"]),
    ],
    followUp: "The interviewer now says the rule may change weekly. What would you make configurable, and what would you keep tested?", competencyWeights: { decomposition: 1, api: .8, testingDebugging: .7, defense: 1 },
  },
  {
    id: "interview-broken-api", title: "Recover a broken API", durationMinutes: 10, mode: "debug",
    prompt: "A clean test run reports ModuleNotFoundError for your app package. Walk the interviewer through your diagnostic path before proposing a repair.",
    guidedHint: "Use observation → hypothesis → smallest diagnostic → repair → regression evidence. Do not begin by reinstalling unrelated packages.",
    evidenceRequirements: [
      evidence("observation", "the exact traceback observation", ["traceback", "module", "error", "import"]),
      evidence("environment", "an environment or working-directory hypothesis", ["environment", "venv", "working directory", "path", "pythonpath"]),
      evidence("diagnostic", "the smallest falsifiable diagnostic", ["diagnostic", "check", "confirm", "inspect", "run"]),
      evidence("repair", "a repair at the import/package boundary", ["repair", "package", "test runner", "import", "configuration"]),
      evidence("regression", "a regression check after repair", ["regression", "test", "rerun", "ci", "verify"]),
    ],
    followUp: "The import now works locally but fails in CI. Which assumption would you inspect next?", competencyWeights: { testingDebugging: 1, terminal: .6, defense: .8 },
  },
  {
    id: "interview-ai-boundary", title: "Add AI without granting authority", durationMinutes: 12, mode: "ai-boundary",
    prompt: "A stakeholder asks for AI to read fictional maintenance notes and open operational tickets. Propose a safe first prototype and explain what the model may and may not do.",
    guidedHint: "Separate variable language extraction from trusted policy, tool permission, approval, audit evidence, and degraded mode.",
    evidenceRequirements: [
      evidence("model", "a narrow model task and explicit limit", ["model", "extract", "draft", "not", "boundary"]),
      evidence("validation", "schema or trusted validation", ["schema", "validate", "structured", "trusted", "output"]),
      evidence("approval", "a qualified human approval boundary", ["human", "approve", "review", "ticket", "action"]),
      evidence("audit", "audit or traceable evidence", ["audit", "log", "record", "trace", "evidence"]),
      evidence("fallback", "a safe degraded or escalation path", ["fallback", "unavailable", "degraded", "escalate", "failure"]),
    ],
    followUp: "A retrieved note attempts to override your system instructions. What changes in the design?", competencyWeights: { aiApplications: 1, securityReliability: 1, defense: 1 },
  },
  {
    id: "interview-handoff-defense", title: "Defend the handoff assistant", durationMinutes: 15, mode: "project-defense",
    prompt: "Walk through the Mission Operations Handoff Assistant as if a skeptical engineer is reviewing your work. State what you designed, what AI assisted, tests you ran, failure behavior, and what you would change before a broader pilot.",
    guidedHint: "Own the decisions honestly. A prototype is valuable only when its boundary and evidence are clear.",
    evidenceRequirements: [
      evidence("ownership", "honest ownership of design and implementation", ["i", "designed", "built", "reviewed", "ownership"]),
      evidence("test", "a specific test or observed result", ["test", "pytest", "assert", "verified", "boundary"]),
      evidence("failure", "a provider or invalid-input failure behavior", ["failure", "unavailable", "invalid", "degraded", "error"]),
      evidence("ai", "a truthful AI-assistance disclosure", ["ai", "assistant", "generated", "reviewed", "changed"]),
      evidence("next", "a concrete next production decision", ["next", "production", "pilot", "security", "scale"]),
    ],
    followUp: "Show one specific thing you would rebuild without AI assistance to prove you maintain it.", competencyWeights: { defense: 1, git: .5, testingDebugging: .6, securityReliability: .7 },
  },
  {
    id: "interview-requirement-change", title: "Respond to the changing requirement", durationMinutes: 12, mode: "requirements-change",
    prompt: "Halfway through a prototype, a reviewer says each team must only see its own fictional handoff notes and asks for automatic write-back. Re-scope the design under time pressure.",
    guidedHint: "Clarify identity and data boundaries first. A smaller read-only or human-approved path may be the strongest response.",
    evidenceRequirements: [
      evidence("authorization", "an identity and authorization boundary", ["authorization", "identity", "team", "permission", "access"]),
      evidence("scope", "a bounded rescope", ["scope", "smaller", "prototype", "out of scope", "clarify"]),
      evidence("approval", "a read-only or human-approved first path", ["read-only", "human", "approve", "review", "write"]),
      evidence("rollback", "a rollback, reversibility, or escalation condition", ["rollback", "reversible", "escalate", "stop", "failure"]),
      evidence("evaluation", "a measure that would validate the change", ["evaluate", "metric", "test", "evidence", "measure"]),
    ],
    followUp: "What would make you decide no AI should be used in this workflow?", competencyWeights: { decomposition: .8, securityReliability: 1, architecture: .7, defense: 1 },
  },
];

function words(value: string) {
  return value.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
}

/** Deterministic self-review, deliberately stricter than keyword/word-count grading. */
export function reviewCodingInterview(promptId: string, response: string) {
  const prompt = codingInterviewPrompts.find((item) => item.id === promptId);
  if (!prompt) return null;
  const segments = response.toLowerCase().split(/[\n.!?]+/).map((segment) => segment.trim()).filter(Boolean);
  const allWords = words(response);
  const uniqueRatio = allWords.length ? new Set(allWords).size / allWords.length : 0;
  const found = prompt.evidenceRequirements.filter((requirement) => segments.some((segment) => {
    const anchored = requirement.anchors.filter((anchor) => segment.includes(anchor)).length;
    return anchored >= (requirement.minAnchors ?? 2) && words(segment).length >= (requirement.minSegmentWords ?? 8);
  }));
  const hasDepth = allWords.length >= 110;
  const hasStructure = segments.length >= 4 && uniqueRatio >= .42;
  const score = Math.round((found.length / prompt.evidenceRequirements.length) * 70 + (hasDepth ? 20 : 0) + (hasStructure ? 10 : 0));
  return {
    score,
    found: found.map((item) => item.id),
    missing: prompt.evidenceRequirements.filter((item) => !found.includes(item)).map((item) => item.label),
    hasDepth,
    hasStructure,
    complete: found.length === prompt.evidenceRequirements.length && hasDepth && hasStructure,
  };
}
