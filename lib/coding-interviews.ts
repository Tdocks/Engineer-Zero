import type { CodingCompetencyKey } from "./coding-developer";

export type CodingInterviewPrompt = {
  id: string;
  title: string;
  durationMinutes: number;
  prompt: string;
  mode: "architecture" | "debug" | "ai-boundary" | "project-defense" | "requirements-change";
  guidedHint: string;
  requiredClaims: string[];
  followUp: string;
  competencyWeights: Partial<Record<CodingCompetencyKey, number>>;
};

export const codingInterviewPrompts: CodingInterviewPrompt[] = [
  { id: "interview-triage-api", title: "Build the narrow triage API", durationMinutes: 12, mode: "architecture", prompt: "A fictional team manually reviews equipment readings. Describe a Python prototype that accepts a reading, returns NORMAL, REVIEW, or URGENT, and can be demonstrated in an interview.", guidedHint: "Begin with user outcome, then name input, request validation, pure rule, response, test, and what is intentionally out of scope.", requiredClaims: ["user outcome", "validation", "service boundary", "test", "limitation"], followUp: "The interviewer now says the rule may change weekly. What would you make configurable, and what would you keep tested?", competencyWeights: { decomposition: 1, api: .8, testingDebugging: .7, defense: 1 } },
  { id: "interview-broken-api", title: "Recover a broken API", durationMinutes: 10, mode: "debug", prompt: "A clean test run reports ModuleNotFoundError for your app package. Walk the interviewer through your diagnostic path before proposing a repair.", guidedHint: "Use observation → hypothesis → smallest diagnostic → repair → regression evidence. Do not begin by reinstalling unrelated packages.", requiredClaims: ["traceback", "environment", "path", "diagnostic", "regression"], followUp: "The import now works locally but fails in CI. Which assumption would you inspect next?", competencyWeights: { testingDebugging: 1, terminal: .6, defense: .8 } },
  { id: "interview-ai-boundary", title: "Add AI without granting authority", durationMinutes: 12, mode: "ai-boundary", prompt: "A stakeholder asks for AI to read fictional maintenance notes and open operational tickets. Propose a safe first prototype and explain what the model may and may not do.", guidedHint: "Separate variable language extraction from trusted policy, tool permission, approval, audit evidence, and degraded mode.", requiredClaims: ["model boundary", "validation", "human approval", "audit", "fallback"], followUp: "A retrieved note attempts to override your system instructions. What changes in the design?", competencyWeights: { aiApplications: 1, securityReliability: 1, defense: 1 } },
  { id: "interview-handoff-defense", title: "Defend the handoff assistant", durationMinutes: 15, mode: "project-defense", prompt: "Walk through the Mission Operations Handoff Assistant as if a skeptical engineer is reviewing your work. State what you designed, what AI assisted, tests you ran, failure behavior, and what you would change before a broader pilot.", guidedHint: "Own the decisions honestly. A prototype is valuable only when its boundary and evidence are clear.", requiredClaims: ["ownership", "test", "failure", "ai assistance", "next decision"], followUp: "Show one specific thing you would rebuild without AI assistance to prove you maintain it.", competencyWeights: { defense: 1, git: .5, testingDebugging: .6, securityReliability: .7 } },
  { id: "interview-requirement-change", title: "Respond to the changing requirement", durationMinutes: 12, mode: "requirements-change", prompt: "Halfway through a prototype, a reviewer says each team must only see its own fictional handoff notes and asks for automatic write-back. Re-scope the design under time pressure.", guidedHint: "Clarify identity and data boundaries first. A smaller read-only or human-approved path may be the strongest response.", requiredClaims: ["authorization", "scope", "read-only or approval", "rollback", "evaluation"], followUp: "What would make you decide no AI should be used in this workflow?", competencyWeights: { decomposition: .8, securityReliability: 1, architecture: .7, defense: 1 } },
];

export function reviewCodingInterview(prompt: CodingInterviewPrompt, response: string) {
  const normalized = response.toLowerCase();
  const found = prompt.requiredClaims.filter((claim) => claim.split(" ").some((term) => normalized.includes(term)));
  const hasDepth = response.trim().split(/\s+/).length >= 90;
  const score = Math.round((found.length / prompt.requiredClaims.length) * 75 + (hasDepth ? 25 : 0));
  return { score, found, missing: prompt.requiredClaims.filter((claim) => !found.includes(claim)), hasDepth, complete: found.length === prompt.requiredClaims.length && hasDepth };
}
