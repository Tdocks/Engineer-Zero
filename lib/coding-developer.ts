import type { ProgramId } from "./types";
import type { CodingTerminalSession } from "./coding-terminal";

export type CodingCompetencyKey =
  | "terminal"
  | "python"
  | "decomposition"
  | "architecture"
  | "dataInterfaces"
  | "api"
  | "aiApplications"
  | "testingDebugging"
  | "git"
  | "securityReliability"
  | "defense";

export type CodingSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  version: string;
  locator: string;
  lastVerified: string;
  revalidateBy?: string;
  sourceType?: "official_documentation" | "government_guidance" | "peer_reviewed_research";
  deprecationStatus?: "current" | "deprecated";
  /** Author verification is not a substitute for independent technical review. */
  reviewStatus?: "author-verified" | "technical-review-required" | "technical-approved";
  /** Required only when a source or worked pattern is formally deprecated. */
  replacementLessonId?: string;
  supportedClaim: string;
};

/** A source-backed concept is intentionally separate from a lesson: it tells
 * the learner what they should be able to recognize, not what they can claim
 * to implement independently. */
export type CodingConcept = {
  id: string;
  label: string;
  competency: CodingCompetencyKey;
  role: "know" | "practice" | "prove";
  sourceIds: string[];
  escalation: string;
};

export type CodingConceptRecord = {
  conceptId: string;
  title: string;
  definition: string;
  whyItMatters: string;
  officialSources: Array<Pick<CodingSource, "publisher" | "url" | "version" | "lastVerified" | "revalidateBy" | "sourceType" | "deprecationStatus" | "replacementLessonId">>;
  interviewApplication: string;
  prototypeApplication: string;
  knownLimitations: string;
  assessmentIds: string[];
  capability: CodingConcept["role"];
};

export type CodingLesson = {
  id: string;
  day: 1 | 2 | 3 | 4;
  order: number;
  title: string;
  durationMinutes: number;
  competency: CodingCompetencyKey;
  objective: string;
  explanation: string;
  workedExample: string;
  practicePrompt: string;
  defensePrompt: string;
  sourceIds: string[];
  mode: "observe" | "modify" | "complete" | "repair" | "build" | "defend";
};

export type CodingChallenge = {
  id: string;
  day: 1 | 2 | 3 | 4;
  kind: "terminal" | "code" | "api" | "ai" | "debug" | "defense";
  title: string;
  brief: string;
  starter: string;
  requiredSignals: string[];
  antiPatterns?: string[];
  expectedOutcome: string;
  comprehensionPrompt: string;
  comprehensionRequirements: string[];
  competencyWeights: Partial<Record<CodingCompetencyKey, number>>;
  sourceIds: string[];
};

export type CodingDayPlan = {
  day: 1 | 2 | 3 | 4;
  title: string;
  mission: string;
  focusedHours: number;
  cadence: Array<{ label: string; purpose: string }>;
  localProjectPath: string;
};

export type CodingProgramProgress = {
  activeDay: 1 | 2 | 3 | 4;
  completedLessonIds: string[];
  completedContinuationIds: string[];
  bossBattleAttempts: Record<string, {
    score: number;
    response: string;
    hintCount: number;
    status: "needs-retry" | "reviewed";
    updatedAt: string;
  }>;
  reviewBoardAttempts: Record<string, {
    response: string;
    score: number;
    status: "needs-revision" | "reviewed";
    updatedAt: string;
  }>;
  assessmentAttempts: Array<{
    id: string;
    score: number;
    completedAt: string;
    competencyScores: Partial<Record<CodingCompetencyKey, number>>;
    questionIds: string[];
  }>;
  challengeAttempts: Record<string, {
    score: number;
    feedback: string;
    explanation?: string;
    localRunConfirmed?: boolean;
    testConfirmed?: boolean;
    status?: "needs-revision" | "reviewed";
    updatedAt: string;
  }>;
  notes: Record<string, string>;
  xp: Partial<Record<"builder" | "debugger" | "systems" | "aiJudgment" | "reliability" | "communication", number>>;
  spacedReviewDue: string[];
  /** A scheduled retrieval event is evidence support, never completion on its own. */
  reviewSchedule: Array<{
    id: string;
    lessonId: string;
    dueAt: string;
    interval: "20-minutes" | "end-of-day" | "next-morning" | "three-days" | "one-week";
    completedAt?: string;
  }>;
  /** Learner-owned recall responses support spaced practice but are not scored as proof. */
  recallResponses: Record<string, { response: string; completedAt: string }>;
  /** Browser-only drafts and snapshots preserve study work without claiming it ran. */
  workbenchDrafts: Record<string, CodingWorkbenchFile[]>;
  workbenchSnapshots: Record<string, CodingWorkbenchSnapshot[]>;
  terminalSession?: CodingTerminalSession;
};

export type CodingWorkbenchFile = {
  path: string;
  content: string;
  editable: boolean;
  role: "source" | "test" | "note";
};

export type CodingWorkbenchSnapshot = {
  id: string;
  label: string;
  createdAt: string;
  files: CodingWorkbenchFile[];
};

export type SharedProgramDefinition = {
  id: ProgramId;
  title: string;
  subtitle: string;
  promise: string;
  status: "active" | "draft";
  duration: string;
  prerequisiteFor: Array<{ trackId: "applied-ai-operations" | "it-support-technician"; lessonIds: string[]; label: string }>;
};

const verified = "2026-07-18";
const revalidate = "2027-01-18";

export const codingSources: Record<string, CodingSource> = {
  pythonTutorial: {
    id: "python-tutorial",
    title: "The Python Tutorial",
    publisher: "Python Software Foundation",
    url: "https://docs.python.org/3/tutorial/",
    version: "Python 3.14 documentation",
    locator: "Tutorial chapters: introduction, control flow, data structures, modules, errors",
    lastVerified: verified,
    supportedClaim: "Python language foundations, functions, modules, collections, and exception handling.",
  },
  pythonVenv: {
    id: "python-venv",
    title: "venv — Creation of virtual environments",
    publisher: "Python Software Foundation",
    url: "https://docs.python.org/3/library/venv.html",
    version: "Python 3.14 documentation",
    locator: "venv library reference",
    lastVerified: verified,
    supportedClaim: "Project-local Python environments isolate installed packages.",
  },
  bashManual: {
    id: "bash-reference-manual",
    title: "Bash Reference Manual",
    publisher: "GNU Project",
    url: "https://www.gnu.org/software/bash/manual/bash.html",
    version: "Current online manual",
    locator: "Shell operation, commands, and file-name expansion",
    lastVerified: verified,
    supportedClaim: "A shell interprets commands and passes requested program execution to the operating system.",
  },
  sqliteLanguage: {
    id: "sqlite-language",
    title: "The SQLite Language",
    publisher: "SQLite",
    url: "https://www.sqlite.org/lang.html",
    version: "Current documentation",
    locator: "SQL language overview and statements",
    lastVerified: verified,
    supportedClaim: "SQLite is a relational database engine with tables, rows, queries, and transaction-oriented SQL operations.",
  },
  fastapiBody: {
    id: "fastapi-body",
    title: "Request Body",
    publisher: "FastAPI",
    url: "https://fastapi.tiangolo.com/tutorial/body/",
    version: "Current tutorial",
    locator: "Pydantic models, JSON request validation, generated OpenAPI schema",
    lastVerified: verified,
    supportedClaim: "Typed request models validate JSON request bodies and contribute to generated API documentation.",
  },
  fastapiResponse: {
    id: "fastapi-response-model",
    title: "Response Model — Return Type",
    publisher: "FastAPI",
    url: "https://fastapi.tiangolo.com/tutorial/response-model/",
    version: "Current tutorial",
    locator: "Response model validation, filtering, and OpenAPI documentation",
    lastVerified: verified,
    supportedClaim: "Response models can validate and filter output data in addition to documenting the API contract.",
  },
  pytest: {
    id: "pytest",
    title: "pytest documentation",
    publisher: "pytest",
    url: "https://docs.pytest.org/en/stable/",
    version: "Stable documentation",
    locator: "Assertions, auto-discovery, fixtures, parametrization",
    lastVerified: verified,
    supportedClaim: "pytest uses plain assertions and supports test discovery, fixtures, and parametrization.",
  },
  githubPr: {
    id: "github-pull-requests",
    title: "About pull requests",
    publisher: "GitHub Docs",
    url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests",
    version: "Current documentation",
    locator: "Reviewing and merging proposed changes",
    lastVerified: verified,
    supportedClaim: "Pull requests are proposals to review and merge changes, including visible diffs.",
  },
  nistSsdf: {
    id: "nist-ssdf",
    title: "Secure Software Development Framework",
    publisher: "NIST",
    url: "https://csrc.nist.gov/projects/ssdf",
    version: "Current NIST SSDF program guidance",
    locator: "Practices for reducing vulnerabilities across the software lifecycle",
    lastVerified: verified,
    supportedClaim: "Secure development includes practices that reduce vulnerabilities and mitigate their effects through the lifecycle.",
  },
  nasaSoftwareHandbook: {
    id: "nasa-software-engineering-handbook",
    title: "NASA Software Engineering and Software Assurance Handbook",
    publisher: "NASA",
    url: "https://swehb.nasa.gov/",
    version: "Current electronic handbook / NPR 7150.2D guidance",
    locator: "Requirements, testing, assurance, and objective-evidence guidance",
    lastVerified: verified,
    supportedClaim: "Disciplined software work includes requirements, implementation, testing, assurance, and objective evidence appropriate to the system context.",
  },
  nistAiRmf: {
    id: "nist-ai-rmf",
    title: "AI Risk Management Framework",
    publisher: "NIST",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    version: "AI RMF 1.0 / current program page",
    locator: "Risk management and generative-AI program resources",
    lastVerified: verified,
    supportedClaim: "AI systems need defined risk management, governance, evaluation, and deployment controls.",
  },
  openaiStructured: {
    id: "openai-structured-outputs",
    title: "Structured Outputs Guide",
    publisher: "OpenAI",
    url: "https://platform.openai.com/docs/guides/structured-outputs",
    version: "Current guide",
    locator: "Structured response schemas and validation",
    lastVerified: verified,
    supportedClaim: "Structured outputs make model responses easier for applications to validate and consume than unconstrained prose.",
  },
  owaspGenAi: {
    id: "owasp-gen-ai-security",
    title: "OWASP Gen AI Security Project",
    publisher: "OWASP Foundation",
    url: "https://genai.owasp.org/",
    version: "Current project guidance",
    locator: "Generative AI and LLM application security resources",
    lastVerified: verified,
    supportedClaim: "GenAI application design needs explicit defenses against risks such as prompt injection and insecure tool use.",
  },
  dunloskyPractice: {
    id: "dunlosky-effective-learning",
    title: "Improving Students’ Learning With Effective Learning Techniques",
    publisher: "Psychological Science in the Public Interest",
    url: "https://doi.org/10.1177/1529100612453266",
    version: "2013 review",
    locator: "Practice testing and distributed-practice sections",
    lastVerified: verified,
    supportedClaim: "Practice testing and distributed practice are high-utility learning techniques across many conditions.",
  },
  freemanActiveLearning: {
    id: "freeman-active-learning",
    title: "Active learning increases student performance in science, engineering, and mathematics",
    publisher: "Proceedings of the National Academy of Sciences",
    url: "https://doi.org/10.1073/pnas.1319030111",
    version: "2014 meta-analysis",
    locator: "Meta-analysis of 225 STEM studies",
    lastVerified: verified,
    supportedClaim: "Active learning improved assessment performance and reduced failure rates relative to traditional lecturing in the analyzed STEM studies.",
  },
};

for (const [key, source] of Object.entries(codingSources)) {
  source.revalidateBy ??= revalidate;
  source.deprecationStatus ??= "current";
  source.sourceType ??= key === "nistSsdf" || key === "nistAiRmf" || key === "nasaSoftwareHandbook"
    ? "government_guidance"
    : key === "dunloskyPractice" || key === "freemanActiveLearning"
      ? "peer_reviewed_research"
      : "official_documentation";
  source.reviewStatus ??= "author-verified";
}

/**
 * Role literacy is kept honest: a learner can be asked to recognize a concept
 * and name its owner before they are asked to configure or operate it.
 */
export const codingConcepts: CodingConcept[] = [
  { id: "concept-terminal", label: "Terminal and shell", competency: "terminal", role: "practice", sourceIds: ["bashManual", "pythonTutorial"], escalation: "Escalate destructive filesystem, permissions, or production-host work to the accountable operator." },
  { id: "concept-python", label: "Functions and explicit errors", competency: "python", role: "prove", sourceIds: ["pythonTutorial"], escalation: "Escalate unfamiliar runtime, packaging, or performance failures with the traceback and reproduction steps." },
  { id: "concept-http", label: "HTTP and JSON contracts", competency: "dataInterfaces", role: "practice", sourceIds: ["fastapiBody"], escalation: "Escalate public interface changes to the owning API team." },
  { id: "concept-api", label: "Request validation and service boundaries", competency: "api", role: "prove", sourceIds: ["fastapiBody", "fastapiResponse"], escalation: "Escalate authentication, authorization, and production gateway decisions to platform/security owners." },
  { id: "concept-tests", label: "Tests as executable requirements", competency: "testingDebugging", role: "prove", sourceIds: ["pytest"], escalation: "Escalate flaky, integration, or unexplained production failures with the smallest reproducible case." },
  { id: "concept-git", label: "Git review and reproducibility", competency: "git", role: "practice", sourceIds: ["githubPr"], escalation: "Escalate protected-branch policy and merge conflicts that affect others to the code owner." },
  { id: "concept-sqlite", label: "Relational persistence and SQLite", competency: "dataInterfaces", role: "know", sourceIds: ["sqliteLanguage"], escalation: "Escalate production data retention, backups, access control, and migration design to data/platform owners." },
  { id: "concept-model-boundary", label: "Model boundary and structured output", competency: "aiApplications", role: "practice", sourceIds: ["openaiStructured", "nistAiRmf"], escalation: "Escalate model hosting, provider approval, and material risk decisions to the accountable AI/platform owners." },
  { id: "concept-prompt-injection", label: "Prompt injection is untrusted input", competency: "securityReliability", role: "know", sourceIds: ["owaspGenAi"], escalation: "Escalate suspected data exposure, unsafe tool use, or injection vulnerabilities to security immediately." },
  { id: "concept-evaluation", label: "Evaluation cases and safe fallback", competency: "testingDebugging", role: "practice", sourceIds: ["nistAiRmf", "pytest"], escalation: "Escalate go/no-go quality thresholds and monitoring policy to the product and risk owners." },
  { id: "concept-secrets", label: "Secrets and environment configuration", competency: "securityReliability", role: "know", sourceIds: ["nistSsdf"], escalation: "Escalate key issuance, storage, rotation, and incident handling to the security/platform team." },
  { id: "concept-architecture", label: "Prototype architecture and vertical slices", competency: "architecture", role: "practice", sourceIds: ["nasaSoftwareHandbook", "nistSsdf"], escalation: "Escalate scale, reliability, network, and formal assurance decisions to architecture and operations owners." },
  { id: "concept-discovery", label: "Problem framing and acceptance criteria", competency: "decomposition", role: "prove", sourceIds: ["nasaSoftwareHandbook"], escalation: "Escalate unresolved scope, user safety, and business-priority conflicts to the responsible product lead." },
  { id: "concept-defense", label: "Evidence-based technical defense", competency: "defense", role: "prove", sourceIds: ["githubPr", "nistSsdf"], escalation: "State uncertainty rather than inventing ownership or evidence; bring in the specialist who owns the decision." },
];

const codingConceptDetails: Record<string, Pick<CodingConceptRecord, "definition" | "whyItMatters" | "interviewApplication" | "prototypeApplication">> = {
  "concept-terminal": {
    definition: "A terminal is the text window; a shell is the command interpreter inside it. A command names a program or shell operation, and the operating system starts the requested program in a working directory.",
    whyItMatters: "Prototype work starts with repeatable setup and recovery. Knowing where a command runs prevents accidental edits in the wrong project and makes error reports reproducible.",
    interviewApplication: "Describe the current directory, command, output, and exit status you would capture before asking for help with a setup failure.",
    prototypeApplication: "Create a fictional project folder, activate its virtual environment, run one program, and record the command sequence in the README.",
  },
  "concept-python": {
    definition: "A function names a reusable behavior: it accepts explicit inputs, performs a bounded operation, and returns a result or raises a meaningful error when its contract cannot be met.",
    whyItMatters: "Named functions let a learner isolate deterministic rules from presentation or API transport, which makes both tests and explanation more precise.",
    interviewApplication: "Explain why a threshold rule belongs in a small function and name the input, return value, and invalid-input behavior.",
    prototypeApplication: "Put triage thresholds in a function, write a normal and boundary test, then show the traceback or test output from one repaired failure.",
  },
  "concept-http": {
    definition: "HTTP is a request-response protocol. A client selects a method and route, sends headers and an optional body, and receives a status code and response body; JSON is one common structured body format.",
    whyItMatters: "A small prototype becomes usable by another team only when its input and output contract is explicit enough to validate and integrate.",
    interviewApplication: "State what a client sends to a POST endpoint, which invalid request belongs in a 4xx response, and what response shape a caller can rely on.",
    prototypeApplication: "Document one request and response example for a fictional triage route, including the invalid-input response.",
  },
  "concept-api": {
    definition: "An API boundary validates an external request and returns a documented response. Business rules should remain in a separate service so they can be tested without the web server.",
    whyItMatters: "The separation prevents transport details from hiding core logic and makes it easier to reason about validation, testing, and later reuse.",
    interviewApplication: "Defend a typed request model over a raw dictionary and explain what belongs in the route versus the service function.",
    prototypeApplication: "Build a read-only FastAPI route with a typed request model and a service-level test for the key rule.",
  },
  "concept-tests": {
    definition: "A test is executable evidence for one expected behavior. It arranges a known condition, acts on the unit under test, and asserts an observable result, including a boundary or failure when relevant.",
    whyItMatters: "A demo can hide regressions. Focused tests turn an important requirement into a repeatable check while leaving the learner honest about what is not covered.",
    interviewApplication: "Name the highest-risk behavior, the input at its boundary, and the specific assertion that would show it still works after a change.",
    prototypeApplication: "Add direct tests for normal, boundary, and invalid triage behavior, then preserve the failing test that led to a repair.",
  },
  "concept-git": {
    definition: "Git records snapshots of a project history. A commit groups a coherent change, while a diff and pull request make the change, its tests, and its risks reviewable by another person.",
    whyItMatters: "A prototype becomes collaborative when another engineer can see what changed, why it changed, and how to verify it without guessing.",
    interviewApplication: "Explain a commit message, the files included, the test evidence, and the question you would put in a pull-request description.",
    prototypeApplication: "Make a small validation change with its test and write a commit message that names the behavior rather than the tool used.",
  },
  "concept-sqlite": {
    definition: "SQLite is an embedded relational database. It stores structured records in tables and uses SQL to create, query, update, and relate those records without operating a separate database server for a small prototype.",
    whyItMatters: "It supplies real persistence and query design for a bounded prototype while avoiding infrastructure that would obscure the product question.",
    interviewApplication: "Explain why SQLite is reasonable for a prototype and name the concurrency, backup, access-control, or scale conditions that would trigger a different data platform.",
    prototypeApplication: "Model a fictional issue table, store an issue through a repository function, and retrieve it with a tested query.",
  },
  "concept-model-boundary": {
    definition: "A model boundary limits an LLM to an untrusted, bounded task such as extraction or drafting. A schema validates its output before trusted code uses it, and consequential actions stay outside the model.",
    whyItMatters: "Fluent text is not a trustworthy interface. A visible boundary keeps uncertainty, authorization, and final policy decisions accountable to the application and people who own them.",
    interviewApplication: "Identify the model task, the output schema, the deterministic rule after validation, and the human approval point.",
    prototypeApplication: "Extract fictional incident facts into a typed schema, reject malformed output, and send only a proposed action to a human reviewer.",
  },
  "concept-prompt-injection": {
    definition: "Prompt injection is untrusted content that attempts to change an AI system’s instructions or obtain unauthorized information or actions. Treat reports, documents, and tool results as data—not authority.",
    whyItMatters: "An AI application can appear helpful while letting embedded content influence tools or disclose data outside the intended workflow.",
    interviewApplication: "Explain how you keep document text separate from system instructions, restrict tool permissions, and escalate suspected exposure.",
    prototypeApplication: "Include an injected fictional report in an evaluation set and show that the service preserves the report as evidence while rejecting its instruction.",
  },
  "concept-evaluation": {
    definition: "Evaluation uses a representative set of inputs and explicit expected behavior to measure groundedness, schema validity, uncertainty, latency, cost, and safe fallback—not just a persuasive demo.",
    whyItMatters: "A prototype earns a controlled pilot through evidence about success and failure modes, not because one prompt produced an attractive answer.",
    interviewApplication: "Name the cases, measures, threshold, owner, and rollback or escalation condition that would inform a go/no-go decision.",
    prototypeApplication: "Create a small fictional evaluation set with ambiguous, contradictory, unsupported, and injection cases; record the expected safe response for each.",
  },
  "concept-secrets": {
    definition: "A secret is an authentication value such as an API key that must be supplied through approved configuration, not embedded in source, committed to Git, printed in logs, or pasted into an assistant prompt.",
    whyItMatters: "Leaked credentials can grant access outside the learner’s prototype and make a simple demo a security incident.",
    interviewApplication: "Describe the missing-key behavior, safe operational logging, and the security or platform owner responsible for key issuance and rotation.",
    prototypeApplication: "Load an optional provider key from an environment variable, omit the value from logs, and use a deterministic fallback when it is absent.",
  },
  "concept-architecture": {
    definition: "Prototype architecture assigns clear responsibilities to a small number of components—request boundary, business rule, storage, model adapter, and audit or log path—so one end-to-end slice can be tested and explained.",
    whyItMatters: "A simple visible design is safer to change under interview time pressure than a premature collection of services with unclear ownership.",
    interviewApplication: "Draw the request-to-response path, identify the trust boundary, then explain the first scale or reliability change you would defer until evidence justifies it.",
    prototypeApplication: "Create a request → service → response → test slice and write a short architecture note naming its failure and rollback behavior.",
  },
  "concept-discovery": {
    definition: "Problem framing converts a vague request into a named user, current workflow, inputs, outputs, rules, constraints, failure cases, acceptance criteria, and a smallest useful first slice.",
    whyItMatters: "Good prototypes prove a specific operating assumption. Without a bounded outcome, teams often add AI before they understand what problem requires it.",
    interviewApplication: "Ask the stakeholder questions that distinguish a deterministic automation opportunity from a language-understanding problem and state what evidence would change the recommendation.",
    prototypeApplication: "Write a SCOPE brief for a fictional handoff workflow, including one explicit non-goal and a measurable success signal.",
  },
  "concept-defense": {
    definition: "Technical defense is an evidence-based explanation of what the learner designed, built, tested, reviewed, and could not verify, plus the limitation, owner, and next decision needed to proceed safely.",
    whyItMatters: "AI-assisted work is credible only when the learner can separate personal ownership from generated output and reason about the system under follow-up questions.",
    interviewApplication: "Answer why this technology, what the important test proves, what fails safely, and what you would change before production without overstating experience.",
    prototypeApplication: "Record an AI-assistance disclosure, one repaired bug, test evidence, architecture tradeoff, and a five-minute walkthrough of the fictional prototype.",
  },
};

/** Versioned source-of-truth records used by the learner-facing concept library. */
export const codingConceptRecords: CodingConceptRecord[] = codingConcepts.map((concept) => {
  const details = codingConceptDetails[concept.id];
  return {
    conceptId: concept.id,
    title: concept.label,
    definition: details.definition,
    whyItMatters: details.whyItMatters,
    officialSources: concept.sourceIds.map((id) => {
      const source = codingSources[id];
      return {
        publisher: source.publisher,
        url: source.url,
        version: source.version,
        lastVerified: source.lastVerified,
        revalidateBy: source.revalidateBy,
        sourceType: source.sourceType,
        deprecationStatus: source.deprecationStatus,
        replacementLessonId: source.replacementLessonId,
      };
    }),
    interviewApplication: details.interviewApplication,
    prototypeApplication: details.prototypeApplication,
    knownLimitations: concept.escalation,
    assessmentIds: [],
    capability: concept.role,
  };
});

const codingConceptAssessmentIds: Record<string, string[]> = {
  "concept-terminal": ["coding-baseline-01", "coding-baseline-09"],
  "concept-python": ["coding-baseline-02", "coding-baseline-10"],
  "concept-http": ["coding-baseline-15"],
  "concept-api": ["coding-baseline-04", "coding-baseline-17"],
  "concept-tests": ["coding-baseline-05", "coding-baseline-11"],
  "concept-git": ["coding-baseline-08", "coding-baseline-24"],
  "concept-sqlite": ["coding-baseline-21"],
  "concept-model-boundary": ["coding-baseline-07", "coding-baseline-16"],
  "concept-prompt-injection": ["coding-baseline-14"],
  "concept-evaluation": ["coding-baseline-23"],
  "concept-secrets": ["coding-baseline-06", "coding-baseline-19"],
  "concept-architecture": ["coding-baseline-13"],
  "concept-discovery": ["coding-baseline-12", "coding-baseline-20"],
  "concept-defense": ["coding-baseline-18"],
};

for (const record of codingConceptRecords) record.assessmentIds = codingConceptAssessmentIds[record.conceptId] ?? [];

function codingCompetenciesForRecord(key: CodingCompetencyKey) {
  const definitions: Record<CodingCompetencyKey, { description: string }> = {
    terminal: { description: "It makes repeatable local project work and error recovery visible." },
    python: { description: "It turns rules into named, testable behavior." },
    decomposition: { description: "It turns an ambiguous request into a bounded build." },
    architecture: { description: "It makes responsibilities, constraints, and failure behavior explainable." },
    dataInterfaces: { description: "It makes inputs, outputs, and persistence contracts inspectable." },
    api: { description: "It keeps transport validation separate from business behavior." },
    aiApplications: { description: "It limits a model to a useful but non-authoritative task." },
    testingDebugging: { description: "It replaces hopeful demos with repeatable behavioral evidence." },
    git: { description: "It makes a change reviewable and reproducible." },
    securityReliability: { description: "It preserves authorization, safe degradation, and accountable escalation." },
    defense: { description: "It shows what the learner can explain, verify, and honestly limit." },
  };
  return definitions[key];
}

/** These sources justify the course method, not a learner's job competency. */
export const codingInstructionalSourceIds = ["dunloskyPractice", "freemanActiveLearning"] as const;

export const codingCompetencies: Array<{ key: CodingCompetencyKey; title: string; target: number; description: string }> = [
  { key: "terminal", title: "Terminal literacy", target: 3, description: "Navigate, create files, run programs, and interpret errors safely." },
  { key: "python", title: "Programming foundations", target: 3, description: "Write and explain functions, collections, conditions, loops, and exceptions." },
  { key: "decomposition", title: "Problem decomposition", target: 4, description: "Turn a vague request into inputs, outputs, rules, constraints, and acceptance criteria." },
  { key: "architecture", title: "Prototype architecture", target: 3, description: "Choose small, legible service boundaries that can be tested and explained." },
  { key: "dataInterfaces", title: "Data and interfaces", target: 3, description: "Use JSON-shaped data, schemas, HTTP, and basic persistence concepts." },
  { key: "api", title: "API engineering", target: 3, description: "Build a typed FastAPI service with validation and separated business logic." },
  { key: "aiApplications", title: "AI application engineering", target: 3, description: "Use a model for bounded language work while preserving trusted application logic." },
  { key: "testingDebugging", title: "Testing and debugging", target: 3, description: "Read failures, form a hypothesis, repair code, and write useful tests." },
  { key: "git", title: "Git and collaboration", target: 2, description: "Record a change, inspect a diff, and explain a reviewable commit." },
  { key: "securityReliability", title: "Security and reliability", target: 2, description: "Protect secrets, validate inputs, set trust boundaries, and fail safely." },
  { key: "defense", title: "Engineering defense", target: 4, description: "Explain decisions, limitations, tests, and next steps under follow-up questions." },
];

const lesson = (
  day: CodingLesson["day"], order: number, competency: CodingCompetencyKey, title: string,
  objective: string, explanation: string, workedExample: string, practicePrompt: string,
  defensePrompt: string, sourceIds: string[], mode: CodingLesson["mode"],
): CodingLesson => ({ id: `coding-day-${day}-${String(order).padStart(2, "0")}`, day, order, title, durationMinutes: 50, competency, objective, explanation, workedExample, practicePrompt, defensePrompt, sourceIds, mode });

export const codingLessons: CodingLesson[] = [
  lesson(1, 1, "terminal", "Inside the machine", "Trace a command from keyboard to program output.", "A terminal is a text interface to a shell. The shell asks the operating system to locate and start a program; Python interprets a source file and returns output or an error.", "keyboard → shell → operating system → Python interpreter → main.py → output", "Put those six parts in order without looking.", "What is the difference between the terminal, shell, and Python interpreter?", ["bashManual", "pythonTutorial"], "observe"),
  lesson(1, 2, "terminal", "Safe terminal navigation", "Create and recover a small project folder without affecting a real system.", "Paths describe locations. Relative paths begin from the current folder; absolute paths begin from a known root. Use `pwd`, `ls`, `cd`, `mkdir`, and `touch` deliberately.", "mkdir ai_prototype → cd ai_prototype → touch main.py", "Recover after creating main.py in the wrong folder.", "Why check your location before removing or moving a file?", ["pythonTutorial"], "modify"),
  lesson(1, 3, "python", "Values, variables, and first execution", "Run a Python file and name the values it transforms.", "A value has a type. A variable gives a value a useful name. `print()` makes output visible; a traceback explains the path to an error.", "remaining_minutes = launch_time - current_time\nprint(remaining_minutes)", "Change a countdown calculation to include a hold duration.", "What does the variable name add that a raw number does not?", ["pythonTutorial"], "modify"),
  lesson(1, 4, "python", "Decisions and functions", "Put repeatable triage logic in a small function with a clear return value.", "A function gives behavior a name, keeps inputs narrow, and makes the result easier to test. Conditions select a branch based on explicit rules.", "def risk_level(temp: float) -> str:\n    return \"URGENT\" if temp >= 90 else \"NORMAL\"", "Add a REVIEW branch for temperatures from 80 through 89.", "Why is a function safer than duplicating the same condition in three places?", ["pythonTutorial"], "build"),
  lesson(1, 5, "dataInterfaces", "Lists, dictionaries, and JSON-shaped data", "Complete a partially written data transformation with the structure that matches the question.", "Use a list when order or repeated items matter. Use a dictionary when named fields need lookup. JSON objects map naturally to dictionaries in Python. Before a blank-slate build, complete a known pattern and explain why each structure fits.", "readings = [{\"equipment\": \"pump-7\", \"temperature\": 94}]\nurgent = [reading for reading in readings if reading[\"temperature\"] >= 90]", "Complete the missing filter that selects urgent readings from three sensor dictionaries.", "Why is one equipment reading a dictionary while the collection of readings is a list?", ["pythonTutorial"], "complete"),
  lesson(1, 6, "testingDebugging", "Errors and defensive input", "Classify a failure and make invalid input visible rather than silently ignoring it.", "Syntax, runtime, and logic errors need different responses. Validate before processing; catch only exceptions you understand well enough to handle.", "try:\n    temperature = float(raw_temperature)\nexcept ValueError:\n    raise ValueError(\"Temperature must be a number\")", "Repair a handler that turns every error into NORMAL.", "Why is broad exception swallowing dangerous in an operations prototype?", ["pythonTutorial"], "repair"),
  lesson(2, 1, "terminal", "Cold rebuild and environments", "Recreate the Day 1 startup path from memory using an isolated environment.", "A virtual environment holds a project’s dependencies separately from global Python. It makes a setup more reproducible and prevents unrelated package conflicts.", "python -m venv .venv\nsource .venv/bin/activate\npython main.py", "Write the environment setup commands without notes, then identify the activation command for your operating system.", "Why not install every project package globally?", ["pythonVenv"], "repair"),
  lesson(2, 2, "dataInterfaces", "Requests, responses, and JSON", "Describe the contract between a client and a service.", "A client sends a request to a route. The service validates the method, path, headers, and body, then sends a status code and response body. JSON carries structured data; it is not a substitute for validation.", "POST /triage with {\"temperature\": 94} returns a typed JSON result.", "Build a request for a missing equipment name and predict the response category.", "Why is an invalid request a client error rather than a normal triage result?", ["fastapiBody"], "observe"),
  lesson(2, 3, "api", "FastAPI routes and request models", "Create a typed route that accepts a validated triage request.", "FastAPI maps typed models to request bodies, validates input, and generates a schema used by interactive documentation. A request model makes the expected shape explicit.", "@app.post(\"/triage\")\ndef triage(reading: ReadingIn) -> TriageOut:\n    return evaluate(reading)", "Add a field that rejects an empty equipment name.", "Why prefer a typed request model to a raw dictionary at the API boundary?", ["fastapiBody", "fastapiResponse"], "build"),
  lesson(2, 4, "api", "Separate route from business logic", "Keep deterministic triage rules testable without a web server.", "The route handles transport concerns. A service function owns business rules. This separation makes the same logic reusable from a CLI, API, or batch job and keeps tests focused.", "main.py calls services.evaluate_reading(reading); tests import evaluate_reading directly.", "Move threshold logic out of a route into a service function.", "Why would testing the service function first be faster than testing every rule through HTTP?", ["fastapiBody"], "modify"),
  lesson(2, 5, "testingDebugging", "Tests as evidence", "Write tests for normal, boundary, and invalid behavior.", "A useful test makes one behavioral claim. pytest uses readable assertions and discovers appropriately named tests. A suite is evidence against known requirements, not proof of perfection.", "def test_high_temperature_is_urgent():\n    assert evaluate_reading(94) == \"URGENT\"", "Add a boundary test for exactly 90 and an invalid-input test.", "Which test would catch the most likely regression after changing a threshold?", ["pytest"], "build"),
  lesson(2, 6, "git", "Record a reviewable change", "Create a small change history and explain what it contains.", "A commit records a coherent change. A diff shows additions and removals. Pull requests give another person a place to review intent, behavior, and risks before merge.", "git status → git add app/services.py tests/test_services.py → git commit -m \"Add triage boundary tests\"", "Write a commit message for an API validation fix.", "What would a reviewer need besides the changed code?", ["githubPr"], "defend"),
  lesson(3, 1, "aiApplications", "Deterministic versus probabilistic work", "Choose AI only where language interpretation adds value.", "Keep explicit thresholds, access decisions, and safety rules in trusted code. Use a model for bounded extraction, classification, or drafting when language is varied and a human remains accountable.", "A model extracts observations from a report; Python evaluates a temperature threshold.", "Classify four tasks as deterministic, AI-assisted, or inappropriate for AI.", "Why would an LLM make a fixed threshold rule harder to test?", ["nistAiRmf"], "observe"),
  lesson(3, 2, "securityReliability", "Credentials and safe failure", "Keep a model credential out of code and define behavior when it is unavailable.", "Secrets belong in environment configuration, never source files or learner prompts. A missing key, timeout, or provider failure should be visible and recoverable; it must not silently create a made-up result.", "if not api_key: raise RuntimeError(\"Model integration is not configured\")", "Identify the unsafe logging statement in a sample integration.", "What should the user see when an approved model provider is unavailable?", ["nistSsdf", "openaiStructured"], "repair"),
  lesson(3, 3, "aiApplications", "Structured extraction", "Convert free text into a schema with uncertainty rather than persuasive prose.", "Define required fields, optional fields, and uncertainties before calling a model. Validate returned data and reject or escalate a response that does not match the contract.", "{\"equipment\": \"pump-7\", \"observations\": [\"grinding\"], \"uncertainties\": [\"temperature unit missing\"]}", "Add an uncertainty field to an incident-extraction schema.", "Why is a fluent paragraph a weak interface between a model and your application?", ["openaiStructured"], "build"),
  lesson(3, 4, "securityReliability", "Tool boundaries and human approval", "Design a workflow where a model cannot silently perform a consequential action.", "The model may propose or extract. Trusted code validates. A qualified human approves. A separate authorized function performs the action and records an audit event.", "report → extraction → schema validation → deterministic rule → proposed action → human approval", "Identify the first point at which a malicious report should lose influence.", "Why is a second model not an approval gate?", ["nistAiRmf", "nistSsdf", "owaspGenAi"], "modify"),
  lesson(3, 5, "testingDebugging", "Evaluate model behavior", "Build a representative test set that includes failure and abstention cases.", "Test supported, ambiguous, contradictory, missing, irrelevant, injected, and unsupported inputs. Track valid schema, field accuracy, invented facts, uncertainty, latency, and cost.", "Case: missing unit. Expected: uncertainty is present and escalation is recommended.", "Write one evaluation case that a polished demo would likely miss.", "Why is one successful prompt not a benchmark?", ["nistAiRmf", "owaspGenAi"], "build"),
  lesson(3, 6, "defense", "Explain the trust boundary", "Defend why an AI-assisted prototype keeps final risk classification outside the model.", "A good answer identifies the model’s limited task, the trusted Python rules, validation, approval, fallback behavior, and the data that should not leave the organization.", "AI extracts a possible issue; deterministic code classifies risk; a human approves any action.", "Give a 90-second explanation of the system’s trusted and untrusted portions.", "What would change before connecting this prototype to a real operational system?", ["nistAiRmf", "openaiStructured"], "defend"),
  lesson(4, 1, "decomposition", "SCOPE: specify the problem", "Turn an ambiguous request into a bounded prototype brief.", "Ask who uses the system, what they do now, which input exists, what output helps, what is out of scope, and how success will be observed.", "“Summarize shift notes” becomes “extract blockers, owners, and deadlines from fictional notes for human review.”", "Write inputs, outputs, constraints, and acceptance criteria for a handoff assistant.", "What question prevents you from building an unnecessary feature?", ["nistSsdf", "nasaSoftwareHandbook"], "build"),
  lesson(4, 2, "architecture", "SCOPE: choose the simplest architecture", "Select the smallest stack that proves the product assumption.", "For an interview prototype, one Python service, FastAPI, SQLite or memory, one external model dependency, and clear modules are usually more defensible than premature microservices.", "request → service → repository → response, with model extraction as one bounded dependency", "Choose between in-memory data and SQLite for a 90-minute handoff prototype.", "Why is a microservice architecture usually a poor first answer here?", ["fastapiBody", "nistSsdf"], "build"),
  lesson(4, 3, "dataInterfaces", "SCOPE: outline data and behavior", "Write input and output schemas, main workflow, and failure cases before coding.", "A thin architecture starts with a clear contract. A good schema makes missing data, ownership, review status, and uncertainty visible.", "HandoffIn(notes: str); HandoffOut(issues, owners, urgency, review_status, uncertainties)", "Sketch a response schema that cannot confuse a draft with an approved action.", "Which field proves that a human has reviewed the output?", ["fastapiBody", "fastapiResponse"], "modify"),
  lesson(4, 4, "testingDebugging", "SCOPE: produce vertically", "Build one end-to-end path before expanding features.", "Implement request → logic → response → test, then add the next feature. This exposes contract mistakes early and gives you a working demonstration path.", "POST /handoffs → parse one note → return one structured issue → test the result", "Put three implementation tasks in vertical-slice order.", "What does a passing vertical slice prove—and what does it not prove?", ["pytest", "fastapiBody"], "build"),
  lesson(4, 5, "securityReliability", "SCOPE: evaluate and explain", "Run tests and explain prototype limits before calling it complete.", "A prototype needs explicit assumptions, risk, security limits, observability gaps, scaling questions, and a next production step. “It works locally” is a starting observation, not a release criterion.", "Run unit tests, exercise invalid input, document that external data and real credentials are out of scope.", "Write one rollback or degraded-mode behavior for the handoff assistant.", "What would you change before one hundred teams used this service?", ["nistSsdf", "pytest"], "defend"),
  lesson(4, 6, "defense", "Prototype defense under pressure", "Explain a bounded prototype to a skeptical interviewer without overstating it.", "Lead with the user outcome, show the request and response contract, state the trusted rule boundary, name tests and failure behavior, disclose AI assistance, and identify the next decision.", "“The model extracts draft facts. The service validates them. A human review status prevents the output from becoming an instruction.”", "Record a two-minute walkthrough using the final capstone outline.", "What did AI generate, and how did you verify it?", ["githubPr", "nistAiRmf"], "defend"),
];

export const codingChallenges: CodingChallenge[] = [
  { id: "coding-terminal-escape", day: 1, kind: "terminal", title: "Terminal escape room", brief: "Create ai_prototype, enter it, create main.py, and recover from one wrong-folder attempt.", starter: "pwd\nls", requiredSignals: ["mkdir ai_prototype", "cd ai_prototype", "touch main.py"], expectedOutcome: "You can explain where your project lives and safely recover from a path mistake.", comprehensionPrompt: "Explain how you knew you were in the wrong folder and name the command that verified the recovery.", comprehensionRequirements: ["working directory", "recovery command", "why the path matters", "expected file location"], competencyWeights: { terminal: 1, testingDebugging: .3 }, sourceIds: ["pythonTutorial"] },
  { id: "coding-triage-cli", day: 1, kind: "code", title: "Equipment status triage CLI", brief: "Write deterministic triage logic that validates input and returns NORMAL, REVIEW, or URGENT.", starter: "def evaluate_reading(temperature: float) -> str:\n    # return a risk level\n    pass\n", requiredSignals: ["def evaluate_reading", "return", "if", "elif"], antiPatterns: ["except Exception", "openai"], expectedOutcome: "A deterministic JSON-ready result with no model dependency.", comprehensionPrompt: "Name the input, the exact threshold boundary, the return value, and why this rule should remain deterministic.", comprehensionRequirements: ["input and output", "threshold boundary", "deterministic rule", "test to run"], competencyWeights: { python: 1, dataInterfaces: .6, decomposition: .6, testingDebugging: .4 }, sourceIds: ["pythonTutorial"] },
  { id: "coding-triage-api", day: 2, kind: "api", title: "Equipment Triage API", brief: "Define a typed POST /triage endpoint and keep threshold logic in a service function.", starter: "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass ReadingIn(BaseModel):\n    equipment: str\n    temperature: float\n", requiredSignals: ["FastAPI", "BaseModel", "@app.post", "/triage"], antiPatterns: ["dict:"], expectedOutcome: "A request contract, response contract, and testable business-rule boundary.", comprehensionPrompt: "Explain which layer validates the request, which layer owns the threshold rule, and one failure response the client should receive.", comprehensionRequirements: ["request validation", "service boundary", "failure response", "test to run"], competencyWeights: { api: 1, dataInterfaces: .7, python: .5, testingDebugging: .5 }, sourceIds: ["fastapiBody", "fastapiResponse"] },
  { id: "coding-test-repair", day: 2, kind: "debug", title: "Test before fix", brief: "Repair a threshold test that misses the exact 90-degree boundary.", starter: "def test_hot_reading_is_urgent():\n    assert evaluate_reading(91) == \"URGENT\"\n", requiredSignals: ["90", "assert"], expectedOutcome: "A boundary test that makes the requirement visible.", comprehensionPrompt: "State the requirement the old test missed, why 91 is insufficient evidence, and what regression your revised test prevents.", comprehensionRequirements: ["boundary requirement", "why 91 is insufficient", "regression", "test assertion"], competencyWeights: { testingDebugging: 1, python: .5, defense: .4 }, sourceIds: ["pytest"] },
  { id: "coding-ai-extraction", day: 3, kind: "ai", title: "AI-assisted maintenance extraction", brief: "Design a structured extraction boundary; deterministic code must retain the final risk decision.", starter: "class Extraction(BaseModel):\n    equipment: str | None = None\n    observations: list[str]\n    uncertainties: list[str]\n", requiredSignals: ["uncertainties", "observations", "BaseModel"], antiPatterns: ["execute_action", "api_key = \""], expectedOutcome: "A schema-first draft that can be validated, escalated, or rejected.", comprehensionPrompt: "Identify the model’s narrow task, the trusted validation step, one uncertainty case, and the human decision that remains outside the model.", comprehensionRequirements: ["model boundary", "trusted validation", "uncertainty", "human approval"], competencyWeights: { aiApplications: 1, securityReliability: .8, api: .4, defense: .5 }, sourceIds: ["openaiStructured", "nistAiRmf", "owaspGenAi"] },
  { id: "coding-handoff-capstone", day: 4, kind: "defense", title: "Mission Operations Handoff Assistant", brief: "Scope, design, test, and defend a small handoff API with human review and degraded mode.", starter: "POST /handoffs\nInput: free-text notes\nOutput: issues, owners, urgency, review_status, uncertainties\n", requiredSignals: ["review", "test", "fallback", "validation"], expectedOutcome: "A bounded prototype design that another engineer can run, test, and challenge.", comprehensionPrompt: "Give the user outcome, the write/approval boundary, one end-to-end test, degraded behavior when AI is unavailable, and the first production concern you would escalate.", comprehensionRequirements: ["user outcome", "approval boundary", "end-to-end test", "degraded mode", "production escalation"], competencyWeights: { decomposition: 1, api: .8, aiApplications: .8, testingDebugging: .7, defense: 1, securityReliability: .7 }, sourceIds: ["fastapiBody", "pytest", "nistSsdf", "nistAiRmf"] },
];

export const codingDayPlans: CodingDayPlan[] = [
  { day: 1, title: "Terminal to useful Python", mission: "Build a fictional equipment-status CLI and defend every deterministic rule.", focusedHours: 10, localProjectPath: "prototypes/coding-developer/equipment-triage-cli", cadence: [{ label: "Cold recall", purpose: "Reconstruct yesterday’s ideas before looking at notes." }, { label: "Instruction + worked examples", purpose: "Learn only the concepts needed for today’s narrow build." }, { label: "Guided modification", purpose: "Change a working example before writing from a blank screen." }, { label: "Repair", purpose: "Read a failure, form a hypothesis, and make one safe correction." }, { label: "Independent micro-build", purpose: "Create the CLI with validation and JSON output locally." }, { label: "Defense + spaced review", purpose: "Explain the design, then return to key questions after a break." }] },
  { day: 2, title: "Script to tested API", mission: "Turn the CLI rule into a typed FastAPI endpoint with boundary tests.", focusedHours: 10, localProjectPath: "prototypes/coding-developer/equipment-triage-api", cadence: [{ label: "Cold rebuild", purpose: "Set up the Day 1 project without copying commands." }, { label: "Contract first", purpose: "Define request, response, invalid input, and service responsibilities." }, { label: "Vertical slice", purpose: "Build one request → service → response → test path." }, { label: "Test repair", purpose: "Repair a boundary defect before adding features." }, { label: "Local API run", purpose: "Run pytest and inspect the generated FastAPI documentation." }, { label: "Reviewable change", purpose: "Record the work and explain the diff to a reviewer." }] },
  { day: 3, title: "AI as an engineering component", mission: "Use an LLM only for a bounded language task, with structured output and safe fallback.", focusedHours: 10, localProjectPath: "prototypes/human-approved-operations-triage", cadence: [{ label: "Triage the task", purpose: "Separate deterministic policy from genuinely variable language work." }, { label: "Schema first", purpose: "Specify fields, uncertainty, and rejection behavior before a model call." }, { label: "Green / yellow / red review", purpose: "Use AI to explain or collaborate without blind delegation." }, { label: "Evaluation cases", purpose: "Test ambiguity, missing evidence, injection, and unsupported inputs." }, { label: "Human approval boundary", purpose: "Keep consequential action outside untrusted model output." }, { label: "Oral defense", purpose: "Explain the trusted path, fallback, and limits under follow-up." }] },
  { day: 4, title: "Prototype under pressure", mission: "Scope and defend a Mission Operations Handoff Assistant as a limited interview prototype.", focusedHours: 10, localProjectPath: "prototypes/coding-developer/mission-operations-handoff-assistant", cadence: [{ label: "Rapid retrieval", purpose: "Recall core patterns before the timed scenario." }, { label: "SCOPE brief", purpose: "Specify, choose, outline, produce, and evaluate before implementation." }, { label: "Timed vertical slice", purpose: "Deliver the smallest runnable path rather than a broad mockup." }, { label: "Failure rehearsal", purpose: "Practice model outage, invalid input, and unsafe-action cases." }, { label: "Project defense", purpose: "State ownership, tests, tradeoffs, and next production decision." }, { label: "Evidence packet", purpose: "Save README, test output, architecture, disclosure, and follow-up plan." }] },
];

export const codingDeveloperProgram: SharedProgramDefinition = {
  id: "coding-developer",
  title: "LaunchCode AI: Four-Day Prototype Readiness",
  subtitle: "From first terminal command to a defensible AI prototype",
  promise: "In four structured days, build and defend a small Python prototype without pretending that a rapid sprint creates production-level software engineering mastery.",
  status: "active",
  duration: "4 intensive days + 4-week continuation",
  prerequisiteFor: [
    { trackId: "applied-ai-operations", label: "AIO Foundation Bridge imports", lessonIds: ["coding-day-1-04", "coding-day-2-03", "coding-day-2-05", "coding-day-3-03", "coding-day-3-04"] },
    { trackId: "it-support-technician", label: "IT automation foundation imports", lessonIds: ["coding-day-1-01", "coding-day-1-02", "coding-day-1-04", "coding-day-2-06"] },
  ],
};

export function emptyCodingProgress(): CodingProgramProgress {
  return { activeDay: 1, completedLessonIds: [], completedContinuationIds: [], assessmentAttempts: [], bossBattleAttempts: {}, reviewBoardAttempts: {}, challengeAttempts: {}, notes: {}, xp: {}, spacedReviewDue: [], reviewSchedule: [], recallResponses: {}, workbenchDrafts: {}, workbenchSnapshots: {} };
}

export function reviewScheduleForLesson(lessonId: string, from = new Date()) {
  const intervals: Array<CodingProgramProgress["reviewSchedule"][number]["interval"]> = ["20-minutes", "end-of-day", "next-morning", "three-days", "one-week"];
  const dueDates = intervals.map((interval) => {
    const due = new Date(from);
    if (interval === "20-minutes") due.setMinutes(due.getMinutes() + 20);
    if (interval === "end-of-day") {
      due.setHours(19, 0, 0, 0);
      if (due <= from) due.setDate(due.getDate() + 1);
    }
    if (interval === "next-morning") { due.setDate(due.getDate() + 1); due.setHours(9, 0, 0, 0); }
    if (interval === "three-days") due.setDate(due.getDate() + 3);
    if (interval === "one-week") due.setDate(due.getDate() + 7);
    return { id: `${lessonId}-${interval}`, lessonId, dueAt: due.toISOString(), interval };
  });
  return dueDates;
}

export function codingMastery(progress: CodingProgramProgress) {
  return codingCompetencies.map((competency) => {
    const lessons = codingLessons.filter((lesson) => lesson.competency === competency.key);
    const complete = lessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
    const challenges = codingChallenges.filter((challenge) => challenge.competencyWeights[competency.key]);
    const challengeScore = challenges.length
      ? challenges.reduce((sum, challenge) => sum + (progress.challengeAttempts[challenge.id]?.score ?? 0), 0) / challenges.length
      : 0;
    const lessonScore = lessons.length ? complete / lessons.length : 0;
    const level = Math.min(5, Math.round(lessonScore * 3 + challengeScore / 45));
    return { ...competency, level, lessonScore, challengeScore: Math.round(challengeScore) };
  });
}

export type CodingReadinessDimension = {
  key: "functional" | "decomposition" | "defense" | "testing" | "data" | "security";
  label: string;
  weight: number;
  score: number;
};

function codingCompetencyEvidence(progress: CodingProgramProgress, key: CodingCompetencyKey) {
  const lessons = codingLessons.filter((lesson) => lesson.competency === key);
  const lessonEvidence = lessons.length ? lessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length / lessons.length : 0;
  const challenges = codingChallenges.filter((challenge) => challenge.competencyWeights[key]);
  const reviewed = challenges.map((challenge) => progress.challengeAttempts[challenge.id]).filter((attempt) => attempt?.status === "reviewed");
  const challengeEvidence = reviewed.length ? reviewed.reduce((sum, attempt) => sum + attempt!.score, 0) / (reviewed.length * 100) : 0;
  const assessments = (progress.assessmentAttempts ?? []).map((attempt) => attempt.competencyScores[key]).filter((score): score is number => typeof score === "number");
  const assessmentEvidence = assessments.length ? Math.max(...assessments) / 100 : 0;
  return Math.round((lessonEvidence * .3 + challengeEvidence * .5 + assessmentEvidence * .2) * 100);
}

/** Mirrors the course score weights. It is a local study signal until evidence
 * is server-owned and a qualified reviewer applies the graduation standard. */
export function codingReadiness(progress: CodingProgramProgress) {
  const evidence = Object.fromEntries(codingCompetencies.map((competency) => [competency.key, codingCompetencyEvidence(progress, competency.key)])) as Record<CodingCompetencyKey, number>;
  const dimensions: CodingReadinessDimension[] = [
    { key: "functional", label: "Functional correctness", weight: 25, score: Math.round((evidence.python + evidence.api) / 2) },
    { key: "decomposition", label: "Problem decomposition", weight: 20, score: evidence.decomposition },
    { key: "defense", label: "Explanation and defense", weight: 20, score: evidence.defense },
    { key: "testing", label: "Testing and debugging", weight: 15, score: evidence.testingDebugging },
    { key: "data", label: "Data and interfaces", weight: 10, score: evidence.dataInterfaces },
    { key: "security", label: "Security and failure handling", weight: 10, score: evidence.securityReliability },
  ];
  return { dimensions, overall: Math.round(dimensions.reduce((sum, item) => sum + item.score * (item.weight / 100), 0)), evidence };
}

export function codingGraduationStatus(progress: CodingProgramProgress) {
  const readiness = codingReadiness(progress);
  const checks = [
    { id: "instruction", label: "24 learning sessions completed", passed: progress.completedLessonIds.length >= codingLessons.length },
    { id: "labs", label: "Six reviewed practice artifacts", passed: codingChallenges.every((challenge) => progress.challengeAttempts[challenge.id]?.status === "reviewed") },
    { id: "assessment", label: "One 75%+ mixed retrieval check", passed: (progress.assessmentAttempts ?? []).some((attempt) => attempt.score >= 75) },
    { id: "battles", label: "Five reviewable boss-battle attempts", passed: Object.values(progress.bossBattleAttempts ?? {}).filter((attempt) => attempt.status === "reviewed").length >= 5 },
    { id: "review", label: "Five evidence-based Review Board responses", passed: Object.values(progress.reviewBoardAttempts ?? {}).filter((attempt) => attempt.status === "reviewed").length >= 5 },
    { id: "readiness", label: "75% local weighted evidence signal", passed: readiness.overall >= 75 },
  ];
  const readyForReviewer = checks.every((check) => check.passed);
  return { checks, readyForReviewer, certified: false, readiness: readiness.overall };
}

export type CodingBadge = { id: string; title: string; description: string; earned: boolean };

export function codingBadges(progress: CodingProgramProgress): CodingBadge[] {
  const reviewed = Object.values(progress.challengeAttempts).filter((attempt) => attempt.status === "reviewed");
  const bestAssessment = Math.max(0, ...(progress.assessmentAttempts ?? []).map((attempt) => attempt.score));
  return [
    { id: "first-repair", title: "Repair before expand", description: "Reviewed a debugging or boundary-test exercise.", earned: Boolean(progress.challengeAttempts["coding-test-repair"]?.status === "reviewed") },
    { id: "safe-boundary", title: "Safe boundary", description: "Reviewed the structured AI extraction exercise without unsafe tool or secret patterns.", earned: Boolean(progress.challengeAttempts["coding-ai-extraction"]?.status === "reviewed") },
    { id: "reviewer-ready", title: "Reviewer ready", description: "Recorded three coherent, reviewable learning artifacts.", earned: reviewed.length >= 3 },
    { id: "retrieval-return", title: "Retrieval return", description: "Completed a mixed retrieval check at 75% or higher.", earned: bestAssessment >= 75 },
    { id: "continuation", title: "Keep building", description: "Recorded evidence for all four continuation weeks.", earned: (progress.completedContinuationIds ?? []).length >= 4 },
  ];
}

export function codingRecoveryPlan(progress: CodingProgramProgress) {
  const latest = progress.assessmentAttempts?.at(-1);
  const weak = Object.entries(latest?.competencyScores ?? {}).filter(([, score]) => (score ?? 0) < 70).map(([key]) => key as CodingCompetencyKey);
  const weakest = weak[0] ?? codingMastery(progress).sort((a, b) => a.level - b.level)[0]?.key;
  const lesson = codingLessons.find((item) => item.competency === weakest && !progress.completedLessonIds.includes(item.id))
    ?? codingLessons.find((item) => item.competency === weakest);
  const challenge = codingChallenges.find((item) => item.competencyWeights[weakest!]);
  return {
    competency: weakest,
    lessonId: lesson?.id,
    challengeId: challenge?.id,
    message: weak.length
      ? "Use the latest retrieval evidence to repair one weak concept before adding new scope."
      : "Choose the next incomplete lesson, then use a lab to turn recognition into a visible artifact.",
  };
}

export function nextCodingLesson(progress: CodingProgramProgress) {
  return codingLessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? codingLessons.at(-1)!;
}

export function codingSourceList(ids: string[]) {
  return ids.map((id) => codingSources[id]).filter(Boolean);
}

/** Content-release validation for the shared four-day program. */
export function validateCodingProgram() {
  const issues: string[] = [];
  const seenLessons = new Set<string>();
  for (const item of codingLessons) {
    if (seenLessons.has(item.id)) issues.push(`Duplicate lesson ID: ${item.id}`);
    seenLessons.add(item.id);
    if (!item.objective || !item.explanation || !item.workedExample || !item.practicePrompt || !item.defensePrompt) {
      issues.push(`Lesson lacks authored instruction or evidence prompt: ${item.id}`);
    }
    if (!item.sourceIds.length || item.sourceIds.some((id) => !codingSources[id])) {
      issues.push(`Lesson lacks valid source mapping: ${item.id}`);
    }
  }
  for (const requiredMode of ["observe", "modify", "complete", "repair", "build", "defend"] as const) {
    if (!codingLessons.some((item) => item.mode === requiredMode)) issues.push(`Instructional sequence is missing ${requiredMode}.`);
  }
  const seenChallenges = new Set<string>();
  for (const item of codingChallenges) {
    if (seenChallenges.has(item.id)) issues.push(`Duplicate challenge ID: ${item.id}`);
    seenChallenges.add(item.id);
    if (!item.brief || !item.starter || !item.requiredSignals.length || !item.expectedOutcome || !item.comprehensionPrompt || !item.comprehensionRequirements.length) {
      issues.push(`Challenge lacks a practice contract: ${item.id}`);
    }
    if (!item.sourceIds.length || item.sourceIds.some((id) => !codingSources[id])) {
      issues.push(`Challenge lacks valid source mapping: ${item.id}`);
    }
  }
  for (const day of codingDayPlans) {
    if (!day.mission || day.focusedHours !== 10 || !day.cadence.length || !day.localProjectPath) {
      issues.push(`Day plan lacks a complete learning cadence: day ${day.day}`);
    }
  }
  for (const sourceId of codingInstructionalSourceIds) {
    if (!codingSources[sourceId]) issues.push(`Instructional design source is missing: ${sourceId}`);
  }
  for (const source of Object.values(codingSources)) {
    if (!source.revalidateBy) issues.push(`Source lacks a revalidation date: ${source.id}`);
    if (!source.sourceType) issues.push(`Source lacks a hierarchy type: ${source.id}`);
    if (!source.deprecationStatus) issues.push(`Source lacks a deprecation status: ${source.id}`);
    if (!source.reviewStatus) issues.push(`Source lacks an independent-review status: ${source.id}`);
    if (source.deprecationStatus === "deprecated" && !source.replacementLessonId) issues.push(`Deprecated source lacks a replacement lesson: ${source.id}`);
  }
  for (const concept of codingConcepts) {
    if (!concept.label || !concept.sourceIds.length || !concept.escalation) issues.push(`Concept lacks role-literacy guidance: ${concept.id}`);
    if (concept.sourceIds.some((id) => !codingSources[id])) issues.push(`Concept lacks valid source mapping: ${concept.id}`);
  }
  for (const record of codingConceptRecords) {
    if (!record.definition || !record.whyItMatters || !record.officialSources.length || !record.interviewApplication || !record.prototypeApplication || !record.knownLimitations || !record.assessmentIds.length) {
      issues.push(`Concept record lacks source-of-truth fields: ${record.conceptId}`);
    }
  }
  for (const imported of codingDeveloperProgram.prerequisiteFor) {
    if (imported.lessonIds.some((id) => !seenLessons.has(id))) {
      issues.push(`Track import references an unknown lesson: ${imported.trackId}`);
    }
  }
  return issues;
}
