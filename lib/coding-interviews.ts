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
    id: "interview-overdue-tasks", title: "30-minute overdue-task utility", durationMinutes: 30, mode: "architecture",
    prompt: "Build a small Python program that reads fictional team tasks and identifies overdue items. Explain the data shape, deterministic rule, tests, and why AI is not part of this first version.",
    guidedHint: "Start with a list of task dictionaries, a clear due-date comparison, and a small test set. State why a probabilistic model would add no value to an explicit date rule.",
    evidenceRequirements: [
      evidence("contract", "a concrete task data shape and output", ["task", "list", "dictionary", "due", "overdue", "output"], 3),
      evidence("rule", "a deterministic overdue rule", ["date", "compare", "deterministic", "rule", "today"], 2),
      evidence("verification", "a focused normal or boundary test", ["test", "assert", "boundary", "overdue", "verify"], 2),
      evidence("no-ai", "why AI is not justified for the explicit rule", ["ai", "model", "deterministic", "rule", "probabilistic"], 2),
    ],
    followUp: "A user wants the output sorted by accountable owner. What small change would you make, and what would you test?", competencyWeights: { python: .8, decomposition: 1, dataInterfaces: .8, testingDebugging: .7, defense: .8 },
  },
  {
    id: "interview-sensor-limits", title: "45-minute sensor-limits API", durationMinutes: 45, mode: "architecture",
    prompt: "Build a typed API that accepts fictional sensor readings and returns the readings outside configured limits. Explain the contract, configuration boundary, response, error behavior, and focused tests.",
    guidedHint: "Describe the request model, a pure comparison function, a configured limit source, invalid-input behavior, and an exact-boundary test before discussing extra features.",
    evidenceRequirements: [
      evidence("contract", "a typed request and response contract", ["request", "response", "schema", "model", "reading", "validation"], 3),
      evidence("configuration", "a configured and testable limit boundary", ["configuration", "limit", "threshold", "rule", "configurable"], 2),
      evidence("service", "a pure service or comparison boundary", ["service", "function", "route", "compare", "logic"], 2),
      evidence("failure", "invalid-input handling", ["invalid", "422", "error", "validation", "reject"], 2),
      evidence("verification", "an exact-boundary regression test", ["test", "assert", "boundary", "exact", "regression"], 2),
    ],
    followUp: "The limit changes weekly for one approved sensor type. What do you configure, validate, and regression-test?", competencyWeights: { api: 1, dataInterfaces: .8, testingDebugging: .9, architecture: .6, defense: .8 },
  },
  {
    id: "interview-incident-draft", title: "60-minute incident-summary draft", durationMinutes: 60, mode: "ai-boundary",
    prompt: "Build an API that accepts an unstructured fictional incident description, extracts key facts, and returns a draft summary for human review. Defend why AI is justified here and where trusted code must retain control.",
    guidedHint: "Use schema-first extraction, explicit uncertainty, validation, a human-review status, safe failure, and no autonomous ticketing or action.",
    evidenceRequirements: [
      evidence("model", "a bounded model extraction task", ["model", "extract", "draft", "unstructured", "summary"], 2),
      evidence("schema", "a structured schema and validation boundary", ["schema", "structured", "validate", "output", "uncertainty"], 2),
      evidence("approval", "a human-review or no-action boundary", ["human", "review", "approve", "not", "action"], 2),
      evidence("failure", "a safe failure or invented-fact response", ["failure", "unavailable", "invent", "degraded", "escalate"], 2),
      evidence("verification", "evaluation or test evidence", ["evaluate", "test", "case", "assert", "verify"], 2),
    ],
    followUp: "The model invents an owner not present in the source text. What does the response contain and what must not happen?", competencyWeights: { aiApplications: 1, api: .8, securityReliability: 1, testingDebugging: .7, defense: 1 },
  },
  {
    id: "interview-handoff-search", title: "90-minute handoff-search prototype", durationMinutes: 90, mode: "project-defense",
    prompt: "Another fictional department manually reviews shift handoff notes. Design a prototype that extracts blockers, owners, deadlines, and unresolved questions, then provides a searchable result. Choose in-memory storage or SQLite and defend the decision.",
    guidedHint: "Scope one vertical slice: typed input, bounded extraction, persistent or in-memory data choice, a search/filter contract, human review, and a small evaluation/test plan.",
    evidenceRequirements: [
      evidence("outcome", "a user outcome and bounded scope", ["team", "user", "manual", "handoff", "scope"], 2),
      evidence("storage", "a storage decision and tradeoff", ["sqlite", "memory", "storage", "persistence", "concurrency"], 2),
      evidence("contract", "a typed input/output or search contract", ["request", "response", "schema", "filter", "search"], 2),
      evidence("boundary", "a model and human-review boundary", ["model", "extract", "human", "review", "approval"], 2),
      evidence("verification", "an evaluation or test plan", ["test", "evaluate", "case", "assert", "verify"], 2),
    ],
    followUp: "The team asks for write-back to their workflow. What is the smallest safe next step, and who must be involved?", competencyWeights: { decomposition: 1, architecture: 1, dataInterfaces: .8, aiApplications: .8, securityReliability: .9, defense: 1 },
  },
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

function distinctReasoning(value: string) {
  const segments = value.toLowerCase().split(/[\n.!?]+/).map((segment) => segment.trim()).filter(Boolean);
  const allWords = words(value);
  return {
    segments,
    allWords,
    hasDepth: allWords.length >= 70,
    hasStructure: segments.length >= 3 && (allWords.length ? new Set(allWords).size / allWords.length : 0) >= .42,
  };
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

/**
 * A requirement change is a two-stage assessment: the learner first scopes a
 * thin prototype, then revises it after a new identity/write-access constraint.
 * It is intentionally not reducible to a polished final answer alone.
 */
export function reviewRequirementChangeInterview(initialResponse: string, revisedResponse: string) {
  const initial = distinctReasoning(initialResponse);
  const initialRequirements = [
    { label: "an initial bounded user outcome", anchors: ["team", "user", "manual", "outcome", "scope"] },
    { label: "a request or data contract", anchors: ["input", "request", "schema", "note", "handoff"] },
    { label: "an initial read-only or prototype boundary", anchors: ["read-only", "prototype", "not write", "boundary", "out of scope"] },
  ];
  const initialFound = initialRequirements.filter((requirement) => initial.segments.some((segment) => {
    const anchored = requirement.anchors.filter((anchor) => segment.includes(anchor)).length;
    return anchored >= 2 && words(segment).length >= 8;
  }));
  const initialComplete = initial.hasDepth && initial.hasStructure && initialFound.length === initialRequirements.length;
  const revised = reviewCodingInterview("interview-requirement-change", revisedResponse);
  if (!revised) return null;
  const score = Math.round((revised.score * .7) + ((initialFound.length / initialRequirements.length) * 20) + (initial.hasDepth && initial.hasStructure ? 10 : 0));
  return {
    ...revised,
    score,
    initialComplete,
    initialMissing: initialRequirements.filter((item) => !initialFound.includes(item)).map((item) => item.label),
    complete: initialComplete && revised.complete,
  };
}
