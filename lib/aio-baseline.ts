import "server-only";

import type { CompetencyKey } from "./types";

export type BaselineChoice = { id: string; text: string };
export type BaselineQuestion = {
  id: string;
  prompt: string;
  competency: CompetencyKey;
  choices: BaselineChoice[];
  correctChoiceId: string;
  rationale: string;
};

const question = (
  id: string,
  competency: CompetencyKey,
  prompt: string,
  correctChoiceId: string,
  choices: [string, string, string, string],
  rationale: string,
): BaselineQuestion => ({
  id,
  competency,
  prompt,
  correctChoiceId,
  choices: choices.map((text, index) => ({
    id: `${id}-${String.fromCharCode(97 + index)}`,
    text,
  })),
  rationale,
});

// This file is server-only by design. The browser receives a shuffled public
// projection from the route handler and never receives correctChoiceId.
export const aioBaseline: BaselineQuestion[] = [
  question("aio-baseline-01", "leadership", "A team asks for an AI agent. What is the strongest first move?", "aio-baseline-01-d", [
    "Prototype an assistant to discover what information users may need.",
    "Identify the data boundary before confirming the operational outcome.",
    "Define a narrow demo after the requesting team names a model preference.",
    "Map the workflow, decision owner, constraints, and success measure.",
  ], "Discovery comes before model selection or prototype scope."),
  question("aio-baseline-02", "security", "What is the safest first release for sensitive internal procedures?", "aio-baseline-02-a", [
    "Permission-aware, cited, read-only retrieval with human escalation.",
    "Cited retrieval that applies document permissions only after generation.",
    "A human-approved workflow that can directly edit procedure records.",
    "Broad retrieval followed by prompt-based redaction of sensitive passages.",
  ], "Authorization, evidence, and agency must be bounded in the first pilot."),
  question("aio-baseline-03", "roleJudgment", "When is conventional automation usually better than an LLM?", "aio-baseline-03-d", [
    "When the next step depends on ambiguous evidence and a human review loop.",
    "When an operator needs an explanation tailored to a changing situation.",
    "When document language must be interpreted across inconsistent source formats.",
    "When rules are clear and deterministic output is required.",
  ], "Deterministic rules should remain deterministic software."),
  question("aio-baseline-04", "architecture", "What makes retrieval-augmented generation useful?", "aio-baseline-04-c", [
    "It guarantees a response is correct whenever a citation is present.",
    "It turns retrieved documents into permanent model knowledge after one use.",
    "It brings relevant authorized source context into the response flow.",
    "It replaces source authorization because retrieval occurs inside the system.",
  ], "Retrieval improves grounding but cannot replace authorization or evaluation."),
  question("aio-baseline-05", "production", "How should an AI workflow be evaluated before a pilot expands?", "aio-baseline-05-d", [
    "Compare polished demonstrations and collect stakeholder preference notes.",
    "Track model confidence and response length across a sample of prompts.",
    "Use a model grader alone to decide whether outputs are safe to deploy.",
    "Use representative cases, task metrics, human review, latency, and failure trends.",
  ], "A credible evaluation measures task success and failure behavior."),
  question("aio-baseline-06", "aiCollaboration", "What is honest AI-native engineering?", "aio-baseline-06-b", [
    "Use generated output for low-risk changes and treat compilation as sufficient review.",
    "Use AI to accelerate, then review, test, explain, and own what ships.",
    "Use AI for ideation only, even when it could improve a careful workflow.",
    "Present AI-assisted output as independent work so the project appears complete.",
  ], "The engineer retains responsibility for behavior, safety, and maintenance."),
  question("aio-baseline-07", "architecture", "Why are embeddings used in retrieval?", "aio-baseline-07-a", [
    "They help compare semantic similarity between a query and authorized content.",
    "They assign a user authorization level before a document can be retrieved.",
    "They make retrieved text immutable after it enters the knowledge index.",
    "They replace citations by proving that a response came from internal data.",
  ], "Embedding similarity is not an access-control mechanism."),
  question("aio-baseline-08", "production", "A RAG assistant returns irrelevant passages. What is the sound next investigation?", "aio-baseline-08-c", [
    "Increase response creativity so the model can infer the missing connection.",
    "Expand retrieval access first, then assess whether relevance improves for the user.",
    "Inspect query intent, chunking, metadata filters, retrieval results, and reranking.",
    "Add another tool before inspecting documents and ranking behavior already in use.",
  ], "Inspect the retrieval system before changing generation behavior."),
  question("aio-baseline-09", "security", "What is an indirect prompt-injection risk?", "aio-baseline-09-b", [
    "A user asks a model to summarize a source with conflicting information.",
    "Retrieved content tries to override instructions or trigger unsafe tool use.",
    "A model receives too little context to answer confidently.",
    "A source returns a stale passage that is otherwise trustworthy.",
  ], "Retrieved material is data, not an authority to direct the system."),
  question("aio-baseline-10", "foundations", "How should a production AI service handle structured output?", "aio-baseline-10-d", [
    "Prompt for valid JSON and send the response through when it appears parseable.",
    "Use a second model to rewrite malformed fields without retaining evidence.",
    "Accept optional model fields and let downstream services reject unsafe cases.",
    "Validate against a schema and fail safely when the response is invalid.",
  ], "A server-side schema is the authoritative boundary."),
  question("aio-baseline-11", "security", "What is the default for a new tool-connected assistant?", "aio-baseline-11-a", [
    "Least privilege and human approval before consequential actions.",
    "Temporary broad write access to evaluate the end-to-end workflow quickly.",
    "Model-selected permissions whenever a user requests a blocked action.",
    "System access with audit logs used to detect inappropriate behavior later.",
  ], "Authority is earned through controls and evidence, not assumed."),
  question("aio-baseline-12", "production", "What does a golden evaluation set provide?", "aio-baseline-12-c", [
    "A curated set of difficult prompts used only before a product demonstration.",
    "A source library the assistant can retrieve whenever a question is unclear.",
    "Representative expected cases that make quality changes measurable over time.",
    "A model-specific benchmark that removes task-level human evaluation.",
  ], "Owned examples make regressions measurable."),
  question("aio-baseline-13", "production", "A system passes a demo but fails a critical edge case. What should happen?", "aio-baseline-13-b", [
    "Document the exception and monitor the next release without changing the benchmark.",
    "Add the case to evaluation, classify the failure, fix safely, and run regression tests.",
    "Increase the context budget, then repeat the original demo without other changes.",
    "Use a human reviewer for this one case while retaining existing release criteria.",
  ], "A discovered critical failure belongs in enduring regression coverage."),
  question("aio-baseline-14", "architecture", "Which concern belongs in model selection?", "aio-baseline-14-d", [
    "Benchmark quality, total parameters, and whether the chat interface is familiar.",
    "Token price, model popularity, and the amount of prompting already invested.",
    "Context window, public leaderboard rank, and whether a team has an account.",
    "Quality, latency, cost, context needs, approved deployment boundary, and reliability.",
  ], "Model selection is a deployment and operating decision, not a ranking exercise."),
  question("aio-baseline-15", "security", "Why should authorization occur before retrieval?", "aio-baseline-15-a", [
    "The system should never fetch context the user is not allowed to see.",
    "The model needs a complete candidate set before it can filter sensitive material.",
    "Authorization can occur after generation if the final response redacts restricted terms.",
    "Retrieval may be broad if approved users are the only people asking questions.",
  ], "Prompting cannot repair an authorization boundary that has already been crossed."),
  question("aio-baseline-16", "foundations", "What does idempotency protect in a tool workflow?", "aio-baseline-16-c", [
    "A model retry returns the same explanation so users receive consistent language.",
    "A delayed interface request redraws the original form without duplicate fields.",
    "A retry cannot accidentally repeat a consequential action.",
    "A document-ingestion job indexes the same number of chunks after a change.",
  ], "Retries require a durable operation identity and recovery state."),
  question("aio-baseline-17", "production", "A model provider is unavailable. What is a production-ready response?", "aio-baseline-17-b", [
    "Retry in the browser until a response returns, then show the original timestamp.",
    "Fail visibly, preserve the request safely, use an approved fallback if available, and communicate status.",
    "Return a best-effort answer from cached context when no approved model call succeeds.",
    "Expose an alternate provider endpoint so users can choose their own fallback.",
  ], "A degraded path should remain safe and understandable."),
  question("aio-baseline-18", "leadership", "A stakeholder says, ‘We need AI.’ What is the strongest response?", "aio-baseline-18-d", [
    "Identify the best available model, then ask the team to propose automatable tasks.",
    "Build an agent prototype and use reactions to determine the underlying problem.",
    "Start collecting training examples so options exist when the use case is clearer.",
    "Clarify workflow and success criteria, then compare AI with automation, search, or process change.",
  ], "The request is not the problem statement."),
  question("aio-baseline-19", "communication", "What makes an architecture explanation credible in an interview?", "aio-baseline-19-a", [
    "State the outcome, components, boundaries, tradeoffs, evaluation, and failure handling.",
    "Name the model, database, and framework, then explain why each is current.",
    "Begin with the front end and reserve infrastructure, risk, and approvals for follow-up.",
    "Focus on the ideal flow and leave monitoring and failure handling to implementation.",
  ], "Credibility comes from tradeoffs and failure behavior, not tool-name recall."),
  question("aio-baseline-20", "aiCollaboration", "When reviewing AI-generated code, what is your responsibility?", "aio-baseline-20-d", [
    "Run the generated test suite and merge if no compilation error appears.",
    "Ask the model to explain its implementation, then rely on that explanation for approval.",
    "Rewrite every implementation by hand even when the generated design is sound.",
    "Verify behavior, security, tests, error handling, and your ability to maintain it.",
  ], "AI assistance does not transfer code ownership."),
  question("aio-baseline-21", "security", "What should an audit event make possible?", "aio-baseline-21-b", [
    "Capture every prompt and source corpus so reviewers can reconstruct every token.",
    "Trace requester or approver, data path, action, and outcome without logging secrets.",
    "Record successful actions while excluding failed attempts from the evidence trail.",
    "Store final action payloads centrally so access controls can be inferred after an incident.",
  ], "Auditability requires attributable decisions and outcomes, not unnecessary sensitive logs."),
  question("aio-baseline-22", "roleJudgment", "A team wants an autonomous system to modify operational records. What is a prudent first step?", "aio-baseline-22-c", [
    "Scope autonomous writes to a small user group and rely on prompts to prevent surprises.",
    "Use a second model to review proposed changes, then allow the first to execute patterns.",
    "Pilot a read-only or human-approved workflow with explicit rollback and evaluation.",
    "Automate a reversible record update first, then add approval after activity data accumulates.",
  ], "Agency should expand only after controlled evidence supports it."),
  question("aio-baseline-23", "aiCollaboration", "What does healthy AI collaboration look like during a production incident?", "aio-baseline-23-a", [
    "Use bounded AI analysis if permitted while independently validating evidence and owning recovery.",
    "Use the generated remediation plan after confirming the model is current and the prompt is complete.",
    "Wait for the preferred AI tool rather than switching to an unfamiliar diagnostic path.",
    "Let the model execute a temporary recovery action when user impact is high enough.",
  ], "The engineer remains responsible for diagnosis, approval, and recovery."),
  question("aio-baseline-24", "architecture", "Why monitor cost and latency alongside answer quality?", "aio-baseline-24-d", [
    "They indicate whether a model can replace human review in high-risk workflows.",
    "They determine how much source context should be retrieved regardless of task needs.",
    "They matter only after launch because early pilots should optimize quality above all else.",
    "A useful system must remain reliable and viable under real demand, not only correct in isolation.",
  ], "Operational quality includes feasibility, availability, and cost behavior."),
];

export function shuffledAioBaseline(seed: string) {
  let state = Array.from(seed).reduce((value, char) => value + char.charCodeAt(0), 19);
  const shuffle = <T,>(items: T[]) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      const pick = state % (index + 1);
      [result[index], result[pick]] = [result[pick], result[index]];
    }
    return result;
  };
  return shuffle(aioBaseline).map(({ correctChoiceId: _key, rationale: _rationale, ...question }) => ({
    ...question,
    choices: shuffle(question.choices),
  }));
}

export function gradeAioBaseline(answers: Record<string, string>) {
  const answered = aioBaseline.filter((question) => answers[question.id]);
  const correct = answered.filter((question) => answers[question.id] === question.correctChoiceId);
  const byCompetency = Object.fromEntries(
    Array.from(new Set(aioBaseline.map((question) => question.competency))).map((competency) => {
      const questions = aioBaseline.filter((question) => question.competency === competency);
      const score = Math.round(
        (questions.filter((question) => answers[question.id] === question.correctChoiceId).length /
          questions.length) *
          100,
      );
      return [competency, score];
    }),
  );
  return {
    complete: answered.length === aioBaseline.length,
    score: Math.round((correct.length / aioBaseline.length) * 100),
    competencyScores: byCompetency,
    answered: answered.length,
    total: aioBaseline.length,
  };
}
