import type { CapabilityLevel, CompetencyKey } from "./types";
import {
  type ArtifactSchema,
  type CourseModule,
  draftReview,
  type SourceReference,
} from "./course-types";

const accessed = "2026-07-17";
const sources = {
  python: {
    title: "The Python Tutorial",
    url: "https://docs.python.org/3/tutorial/",
    publisher: "Python Software Foundation",
    accessed,
    version: "Python 3.14 documentation",
    locator: "Tutorial and library reference",
    supportedClaim: "Python syntax, functions, exceptions, modules, JSON-adjacent data handling, and environments.",
    revalidateBy: "2027-01-17",
  },
  fastapi: {
    title: "FastAPI documentation",
    url: "https://fastapi.tiangolo.com/",
    publisher: "FastAPI",
    accessed,
    version: "Current official documentation",
    locator: "Tutorial: request bodies, validation, and error handling",
    supportedClaim: "Validated request handling and predictable API error behavior.",
    revalidateBy: "2027-01-17",
  },
  postgres: {
    title: "PostgreSQL documentation",
    url: "https://www.postgresql.org/docs/current/",
    publisher: "PostgreSQL Global Development Group",
    accessed,
    version: "Current official documentation",
    locator: "Tutorial and SQL language reference",
    supportedClaim: "Relational data modeling, queries, transactions, and audit-oriented data relationships.",
    revalidateBy: "2027-01-17",
  },
  nist: {
    title: "AI Risk Management Framework",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    publisher: "National Institute of Standards and Technology",
    accessed,
    version: "AI RMF 1.0 and current program guidance",
    locator: "Govern, Map, Measure, and Manage functions",
    supportedClaim: "Risk-based AI adoption, roles, measurement, and accountable operating boundaries.",
    revalidateBy: "2027-01-17",
  },
  owasp: {
    title: "OWASP GenAI Security Project",
    url: "https://genai.owasp.org/",
    publisher: "OWASP Foundation",
    accessed,
    version: "LLM Top 10 for 2025",
    locator: "Prompt injection, excessive agency, and sensitive-information disclosure",
    supportedClaim: "Enterprise AI threats, authorization boundaries, and safe fallback expectations.",
    revalidateBy: "2027-01-17",
  },
  opentelemetry: {
    title: "OpenTelemetry documentation",
    url: "https://opentelemetry.io/docs/",
    publisher: "Cloud Native Computing Foundation",
    accessed,
    version: "Current official documentation",
    locator: "Signals: traces, metrics, and logs",
    supportedClaim: "Observable services, request tracing, and operational evidence.",
    revalidateBy: "2027-01-17",
  },
  learningPractice: {
    title: "Improving Students' Learning With Effective Learning Techniques",
    url: "https://doi.org/10.1177/1529100612453266",
    publisher: "Psychological Science in the Public Interest",
    accessed,
    version: "Dunlosky et al., 2013",
    locator: "Practice testing and distributed practice review",
    supportedClaim: "Retrieval practice and distributed practice are high-utility learning techniques across many conditions.",
    revalidateBy: "2030-01-17",
  },
  activeLearning: {
    title: "Active learning increases student performance in science, engineering, and mathematics",
    url: "https://doi.org/10.1073/pnas.1319030111",
    publisher: "Proceedings of the National Academy of Sciences",
    accessed,
    version: "Freeman et al., 2014",
    locator: "Meta-analysis of 225 STEM studies",
    supportedClaim: "Active learning improved assessment performance and reduced failure rates relative to traditional lecturing in the analyzed STEM courses.",
    revalidateBy: "2030-01-17",
  },
} satisfies Record<string, SourceReference>;

export const aioInstructionalDesign = {
  approach: "Worked examples, retrieval checks, deliberate practice, feedback, and revision",
  rationale: "Learners receive a bounded explanation and worked example, retrieve the concept, apply it to a fictional scenario, receive deterministic feedback, and revise. These sources support the instructional format; they do not certify job competence.",
  sources: [sources.learningPractice, sources.activeLearning],
};

const allEvidence: ArtifactSchema = {
  type: "explanation",
  required: ["scenario fact", "decision", "boundary", "verification", "owner", "escalation"],
  requiredFields: ["scenarioFact", "decision", "boundary", "verification", "owner", "escalation"],
};

const knowEvidence: ArtifactSchema = {
  type: "explanation",
  required: ["scenario fact", "explanation", "escalation"],
  requiredFields: ["scenarioFact", "decision", "escalation"],
};

type CheckSeed = {
  prompt: string;
  correct: string;
  distractors: [string, string, string];
  misconception: string;
};

type FoundationSeed = {
  id: string;
  title: string;
  week: number;
  pillar: string;
  competency: CompetencyKey;
  outcome: string;
  expectation: string;
  boundary: string;
  escalation: string;
  overview: string;
  sections: Array<{ heading: string; body: string }>;
  example: string;
  misconceptions: string[];
  source: SourceReference;
  checks: [CheckSeed, CheckSeed, CheckSeed];
  prerequisites?: string[];
};

function check(id: string, competency: CompetencyKey, seed: CheckSeed) {
  return {
    id,
    prompt: seed.prompt,
    choices: [seed.correct, ...seed.distractors].map((text, index) => ({
      id: `${id}-${String.fromCharCode(97 + index)}`,
      text,
    })),
    correctChoiceId: `${id}-a`,
    explanation: seed.correct,
    misconception: seed.misconception,
    competency,
    difficulty: "foundation" as const,
  };
}

function foundationModule(seed: FoundationSeed): CourseModule {
  return {
    id: seed.id,
    title: seed.title,
    phaseId: "foundation-bridge",
    week: seed.week,
    durationMinutes: 95,
    pillar: seed.pillar,
    competencies: { [seed.competency]: 1, communication: 0.3, aiCollaboration: 0.15 },
    prerequisites: seed.prerequisites ?? [],
    capabilityLevel: "prove",
    performanceExpectation: seed.expectation,
    roleBoundary: seed.boundary,
    specialistEscalationGuidance: seed.escalation,
    pathAvailability: ["foundation-bridge", "full-program"],
    instructionalDesign: aioInstructionalDesign,
    outcome: seed.outcome,
    overview: seed.overview,
    sections: seed.sections,
    workedExample: seed.example,
    misconceptions: seed.misconceptions,
    knowledgeChecks: seed.checks.map((item, index) => check(`${seed.id}-q${index + 1}`, seed.competency, item)),
    artifact: allEvidence,
    rules: [
      { id: "specific-boundary", label: "Specific operating boundary", requiredTerms: ["boundary"], minimumMatches: 1 },
      { id: "verification-plan", label: "Observable verification", requiredTerms: ["verify"], minimumMatches: 1 },
    ],
    sources: [seed.source],
    review: draftReview,
    mdxPath: "content/applied-ai-operations/v2/zero-to-role-foundation-bridge.mdx",
  };
}

const foundationSeeds: FoundationSeed[] = [
  {
    id: "aio-foundation-01-system-map",
    title: "How a software system moves work",
    week: 1,
    pillar: "Zero-to-Role Foundation",
    competency: "foundations",
    outcome: "Draw and explain how a fictional request moves through a client, service, data store, identity boundary, and logs.",
    expectation: "Prove that you can map a small application and locate validation, authorization, and operational evidence.",
    boundary: "You are learning system reasoning, not claiming authority to deploy or administer enterprise infrastructure.",
    escalation: "Escalate production identity, network, and platform configuration to the accountable security or platform owner.",
    overview: "Before you build AI features, you need a dependable mental model of ordinary software. A request crosses several boundaries; each boundary needs an owner, validation, and evidence when something fails.",
    sections: [
      { heading: "The request path", body: "A user interface collects intent. A service validates it, checks identity and permission, reads or writes data, and returns a predictable result. Logs and metrics make that path observable." },
      { heading: "Why boundaries matter", body: "A client may improve usability, but the service must enforce permission. A database stores evidence, but it does not decide whether a caller is allowed to see it." },
      { heading: "A useful system map", body: "Name the user, trigger, inputs, service decision, data record, authorization point, failure signal, and accountable owner. This becomes the starting point for discovery and architecture conversations." },
      { heading: "What not to claim", body: "Knowing the map does not make you the network, database, or security administrator. Your role is to surface the dependency, define the need, and involve the right owner." },
    ],
    example: "A maintenance requester submits an equipment note. The browser sends JSON to a read-only service. The service validates the request, checks the role, retrieves permitted records, writes an audit event, and either returns citations or abstains.",
    misconceptions: ["A frontend can enforce authorization by itself.", "A database is just a file and therefore needs no ownership boundary."],
    source: sources.python,
    checks: [
      { prompt: "Where should a requester's permission be enforced in a basic application?", correct: "At a trusted service boundary before protected data or tools are used, with the decision recorded for review.", distractors: ["In the browser interface, because it controls which buttons and menu options the requester can see.", "Inside the database only after the service has already retrieved all potentially useful records.", "In the model prompt, because instructions can tell the assistant not to reveal sensitive information."], misconception: "UI controls and prompts are not authorization controls." },
      { prompt: "What makes a system map useful during discovery?", correct: "It names the user outcome, boundaries, owners, evidence, and failure path before a team chooses technology.", distractors: ["It lists every framework the team might use so implementation choices can be made before workflow discovery.", "It replaces a data model because arrows between components capture all persistence and audit decisions.", "It proves that a prototype is production-ready once every box has a modern technology label."], misconception: "A diagram without ownership or failure paths is not an operating design." },
      { prompt: "A learner sees a network dependency in their map. What is the responsible next step?", correct: "Describe the dependency and required behavior, then engage the accountable network or platform owner for configuration.", distractors: ["Change the network configuration directly because understanding the request path implies operational authority.", "Hide the dependency from the architecture so the prototype can proceed without cross-functional review.", "Ask the language model to decide the correct production VLAN and apply its recommendation without validation."], misconception: "Recognition of a dependency is different from authority to configure it." },
    ],
  },
  {
    id: "aio-foundation-02-python-reasoning",
    title: "Python reasoning: data, decisions, and errors",
    week: 2,
    pillar: "Zero-to-Role Foundation",
    competency: "foundations",
    outcome: "Independently write and explain small Python functions that transform data and reject invalid inputs explicitly.",
    expectation: "Prove that you can read, change, test, and explain a small function without an AI assistant writing the answer for you.",
    boundary: "Small exercises are not permission to merge unreviewed code into a production service.",
    escalation: "Escalate unfamiliar production failures, dependencies, or security-sensitive changes through normal review rather than guessing.",
    overview: "Python is the primary implementation language because it lets you express service behavior clearly. The goal is not syntax recall; it is predictable inputs, visible decisions, and recoverable error paths.",
    sections: [
      { heading: "Data has shape", body: "Strings, numbers, lists, dictionaries, and booleans represent different kinds of information. A function should state what shape it expects and what shape it returns." },
      { heading: "Decisions stay explicit", body: "Conditions and loops let a function choose a path. Keep each branch small enough that you can explain why it exists and what happens when it fails." },
      { heading: "Errors are part of the contract", body: "Missing identifiers, unexpected fields, and failed conversions should create clear errors. Silently accepting bad data produces hard-to-diagnose operational failures later." },
      { heading: "Read before you edit", body: "When AI suggests code, trace the inputs, outputs, branches, exceptions, and tests first. You own the result even when a tool accelerated the first draft." },
    ],
    example: "A function accepts a fictional incident dictionary, requires an incident_id, normalizes a priority value, and returns an explicit error when the ID is missing rather than creating an anonymous record.",
    misconceptions: ["Exceptions should always be ignored so a script keeps running.", "Type hints replace tests and validation."],
    source: sources.python,
    checks: [
      { prompt: "What is the safer response when an incident record has no identifier?", correct: "Reject the record with a clear error or structured failure result rather than silently creating an untraceable entry.", distractors: ["Assign a random identifier inside the function so downstream code can continue with no visible interruption.", "Return an empty dictionary because callers can infer that a record was probably incomplete.", "Ask a model to infer the missing identifier from free text and save the inferred value as factual."], misconception: "Silent recovery can destroy traceability." },
      { prompt: "Why should a small Python function have narrow inputs and outputs?", correct: "A narrow contract makes behavior easier to test, explain, reuse, and repair when a real request fails.", distractors: ["It allows the function to avoid documenting errors because callers will supply whatever data is available.", "It guarantees performance improvements even when the function makes no external calls or database queries.", "It removes the need for integration tests because every small function must be correct in isolation."], misconception: "Small functions improve reasoning but do not eliminate system testing." },
      { prompt: "What is your responsibility after an AI tool proposes a Python change?", correct: "Trace the inputs, branches, errors, tests, and side effects, then make a reviewable change you can maintain.", distractors: ["Accept the change when it runs locally because a successful execution proves the generated logic is safe.", "Rewrite every line manually even when the proposal is well-scoped and can be reviewed with tests.", "Ask the tool to promise that it used current documentation, then treat its answer as the required review."], misconception: "AI assistance does not transfer code ownership." },
    ],
    prerequisites: ["aio-foundation-01-system-map"],
  },
  {
    id: "aio-foundation-03-developer-workflow",
    title: "Working like a developer: files, tracebacks, and evidence",
    week: 3,
    pillar: "Zero-to-Role Foundation",
    competency: "production",
    outcome: "Read a traceback, organize Python modules and files, work with JSON, and use logs to form a testable debugging hypothesis.",
    expectation: "Prove that you can diagnose a small fictional failure by following evidence before proposing a repair.",
    boundary: "A traceback is evidence, not a license to change production configuration or discard logs.",
    escalation: "Escalate repeated, security-sensitive, or customer-impacting incidents with the observed evidence and an explicit impact statement.",
    overview: "Production work is mostly disciplined observation. Files organize code; environments isolate dependencies; logs and tracebacks show what failed. Good engineers narrow scope before they change anything.",
    sections: [
      { heading: "Files and modules", body: "A module is a Python file that groups related behavior. Imports make dependencies visible. Keep configuration, application logic, tests, and secrets in intentionally separate places." },
      { heading: "JSON and environment values", body: "JSON carries structured requests and responses. Environment variables supply deployment-specific configuration; they are not a place to paste secrets into source code or client bundles." },
      { heading: "Traceback-first debugging", body: "Read the final exception, then the call path, then the relevant input and recent change. Reproduce safely before deciding whether the fault is data, code, dependency, or environment." },
      { heading: "Logs support a hypothesis", body: "A useful log records what happened at a boundary without exposing secrets. Use timestamps, request identifiers, outcome, and error category to isolate a failure." },
    ],
    example: "A fictional API returns a 500 because a required JSON field is absent. The traceback identifies a KeyError; the correct repair is validation at the boundary plus a test, not a blanket exception handler.",
    misconceptions: ["A stack trace is noise that should be hidden before investigation.", "Logging every input is safe and always more useful."],
    source: sources.python,
    checks: [
      { prompt: "A traceback shows KeyError for a required request field. What is the strongest first repair?", correct: "Validate the request at the boundary, return a clear client error, and add a test for the missing field.", distractors: ["Wrap the entire endpoint in a broad exception handler that returns success with an empty response body.", "Log the full request and retry the same payload until the missing field is eventually supplied by a client.", "Move the lookup into a background task so the error occurs after the user has received a successful response."], misconception: "Broad exception handling hides a contract failure instead of fixing it." },
      { prompt: "What belongs in a useful operational log event?", correct: "A time, request or correlation identifier, safe outcome details, and an error category without sensitive payloads.", distractors: ["The entire prompt, authorization token, source documents, and raw personal information for maximum future debugging detail.", "Only a success message because failure messages might worry a user and create noise in the log stream.", "A stack trace without a timestamp or request identifier because developers can reconstruct the sequence manually."], misconception: "More data is not safer or more useful when it leaks protected information." },
      { prompt: "What is the proper use of an environment variable in this course?", correct: "Provide environment-specific configuration while keeping secrets out of source control and browser-delivered code.", distractors: ["Store the production model API key in a frontend environment variable so the browser can select the provider directly.", "Use it as a replacement for input validation because deployment configuration is trusted by default.", "Commit a local .env file so every learner receives identical credentials and can reproduce the live environment."], misconception: "Client-visible configuration is not a secure secret store." },
    ],
    prerequisites: ["aio-foundation-02-python-reasoning"],
  },
  {
    id: "aio-foundation-04-validated-api",
    title: "APIs and validated services",
    week: 4,
    pillar: "Zero-to-Role Foundation",
    competency: "architecture",
    outcome: "Build a small read-only FastAPI endpoint with a request contract, validation, predictable errors, and a safe response shape.",
    expectation: "Prove that you can implement and explain a small API boundary, including its failure behavior and tests.",
    boundary: "The exercise is read-only and fictional; it does not authorize live provider calls, internal data access, or deployment.",
    escalation: "Escalate production API ownership, authentication integration, and deployment approval to the responsible service and security owners.",
    overview: "An API is an agreement between clients and services. It states what a caller may send, what the service returns, and how errors are communicated. This contract is the foundation for safe AI integration later.",
    sections: [
      { heading: "Requests are contracts", body: "A request schema says what fields exist, their types, and which are required. Validate before business logic so invalid requests do not become confusing downstream failures." },
      { heading: "Responses need meaning", body: "Use a stable response shape and meaningful status codes. A caller should distinguish a malformed request, denied access, missing record, and service failure." },
      { heading: "Read-only is a deliberate boundary", body: "Start with a retrieval or validation path before any action path. This limits impact while you learn the workflow, inputs, and failure cases." },
      { heading: "Tests describe the contract", body: "Write tests for accepted input, rejected input, missing records, and denied or unsupported paths. These tests are evidence that a later change did not silently weaken the boundary." },
    ],
    example: "A fictional procedure lookup endpoint accepts a procedure key and role, rejects unscoped requests, returns a small cited response for allowed records, and returns a predictable denial for restricted records.",
    misconceptions: ["If JSON parses, the request is valid enough for service logic.", "A successful happy-path demo makes error behavior unimportant."],
    source: sources.fastapi,
    checks: [
      { prompt: "Why validate an API request before service logic runs?", correct: "It keeps malformed or incomplete data from reaching business logic and gives callers a predictable, testable failure.", distractors: ["It removes the need for authorization because validated fields identify the requester and intended action.", "It guarantees that any model-generated field is factually correct once its JSON shape is accepted.", "It lets the service return one generic success response for all request types and failure conditions."], misconception: "Schema validity is not identity, authorization, or factual correctness." },
      { prompt: "What is the safest first capability for a learner-built operations API?", correct: "A read-only, fictional retrieval or validation path with explicit errors and no consequential external tool access.", distractors: ["A write-enabled endpoint that can update records because rollback is easier once a database transaction exists.", "A browser endpoint that calls a model provider directly so the learner can rapidly test many prompts.", "An autonomous workflow that chooses its own approved data source and action when a request is ambiguous."], misconception: "Starting small and read-only is an operating boundary, not a lack of ambition." },
      { prompt: "Which test set best demonstrates an API contract?", correct: "Tests for valid input, malformed input, missing records, denied access, and the expected response shape for each case.", distractors: ["A single successful browser request because the endpoint's main purpose is to return a useful result quickly.", "A load test that skips invalid requests because validation logic is too simple to affect production behavior.", "A snapshot of the source code because reviewer approval proves the contract will behave correctly at runtime."], misconception: "A contract includes failures, not only the happy path." },
    ],
    prerequisites: ["aio-foundation-02-python-reasoning", "aio-foundation-03-developer-workflow"],
  },
  {
    id: "aio-foundation-05-data-tests-identity",
    title: "Data, tests, identity, and reviewable change",
    week: 5,
    pillar: "Zero-to-Role Foundation",
    competency: "security",
    outcome: "Model simple relational evidence, write pytest checks, explain a Git review, and distinguish authentication from authorization.",
    expectation: "Prove that you can explain why a request is allowed, denied, tested, and reversible—not merely make it work locally.",
    boundary: "The learner models and tests synthetic records only; real identity, secrets, and production databases remain out of scope.",
    escalation: "Engage the data, identity, or security owner whenever a change affects real permissions, retention, or protected records.",
    overview: "Reliable systems remember facts and decisions. Relational data links people, roles, records, and audit events. Tests protect behavior, and Git makes a change reviewable and reversible.",
    sections: [
      { heading: "Model relationships", body: "A role, user, document, request, approval, and audit event are related facts. Modeling those relationships makes ownership and history inspectable instead of hiding them in prose." },
      { heading: "Authentication versus authorization", body: "Authentication establishes who is requesting. Authorization decides what that known identity may do. A system needs both, and neither should be replaced by a prompt." },
      { heading: "Tests preserve intent", body: "A test should prove a behavior that matters: accepted requests work, denied requests stay denied, and a later change cannot silently remove a safety boundary." },
      { heading: "Git makes change visible", body: "A small diff, meaningful commit, review notes, and passing tests make it possible for another engineer to understand, verify, or roll back a change." },
    ],
    example: "A fictional service stores procedure revisions and access roles. A pytest suite proves that a technician can see an approved document while an unauthorized requester receives no content or citation.",
    misconceptions: ["Authentication and authorization are two names for the same password check.", "A passing local run makes a code review unnecessary."],
    source: sources.postgres,
    checks: [
      { prompt: "What is the difference between authentication and authorization?", correct: "Authentication establishes identity; authorization evaluates whether that identity may perform a specific action on a specific resource.", distractors: ["Authentication creates an audit record while authorization decides how long the database should retain that record.", "Authentication validates JSON fields while authorization converts a request into the response format expected by a browser.", "Authentication is a user-interface concern while authorization is only necessary when a service performs database writes."], misconception: "Both controls are required and apply beyond password handling." },
      { prompt: "What should an access-control test prove for a restricted procedure?", correct: "An unauthorized identity receives neither protected content nor a citation that reveals the restricted record exists.", distractors: ["The model receives all procedure text but follows a prompt that asks it to redact the restricted portions in its final response.", "The UI hides the document link while the API returns the full record so a trusted frontend can decide what to show.", "A denied request receives the newest unrestricted document even if it does not answer the requester's stated question."], misconception: "Authorization must precede retrieval and response composition." },
      { prompt: "Why is a small reviewed Git change safer than a large unstructured update?", correct: "A reviewer can connect the intent, diff, tests, risks, and rollback path before the change affects broader work.", distractors: ["A small change guarantees that the underlying service has no external dependencies or operational failure modes.", "Review is optional for a small change because its limited line count proves that it cannot affect security or reliability.", "A large change is always preferable because it reduces the number of releases and therefore the number of audit events."], misconception: "Change size affects reviewability but never replaces risk analysis." },
    ],
    prerequisites: ["aio-foundation-04-validated-api"],
  },
  {
    id: "aio-foundation-06-ai-native-engineering",
    title: "AI-native engineering: use assistance, retain ownership",
    week: 6,
    pillar: "Zero-to-Role Foundation",
    competency: "aiCollaboration",
    outcome: "Review an AI-generated Python change, repair a fictional defect, document assumptions, and defend a small operations-service implementation.",
    expectation: "Prove that you can work effectively with AI assistance while independently reviewing, testing, diagnosing, and explaining the result.",
    boundary: "AI output is untrusted input until you have verified behavior, safety, dependencies, and maintainability.",
    escalation: "Escalate ambiguous security, data, production-impact, or policy questions rather than treating a confident model response as approval.",
    overview: "Modern engineering includes AI-assisted development. The professional standard is not writing every line manually; it is understanding, testing, and owning every meaningful decision that ships.",
    sections: [
      { heading: "Ask for bounded work", body: "Give an assistant a narrow task, constraints, interfaces, and test expectations. Request an explanation of tradeoffs and a diff you can inspect rather than a vague entire-system rewrite." },
      { heading: "Review generated changes", body: "Trace inputs, outputs, permissions, error handling, external calls, retries, logs, and tests. Compare the proposal with the actual system boundary rather than trusting plausible prose." },
      { heading: "Repair before you expand", body: "When a generated change fails, reproduce the issue, narrow the cause, create a regression test, and repair the smallest responsible boundary. Do not use repeated prompting as a substitute for diagnosis." },
      { heading: "Disclose honest ownership", body: "A credible case study distinguishes what you designed, what you coded, what AI suggested, what you reviewed, and what you personally repaired. That is stronger than pretending assistance did not exist." },
    ],
    example: "An AI-generated retry wrapper repeats a fictional incident-creation request. The learner adds an idempotency key, a safe timeout, a regression test, and a README note explaining the failure and repair.",
    misconceptions: ["Generated code is safe if it compiles and passes one happy-path test.", "Using AI assistance means you cannot honestly claim ownership of the resulting system."],
    source: sources.nist,
    checks: [
      { prompt: "An AI-generated retry loop can repeat a consequential action. What is the strongest response?", correct: "Contain the action path, add an idempotency boundary, test duplicate attempts, and document the failure before expansion.", distractors: ["Increase the retry count so the operation has more chances to complete successfully during intermittent provider failures.", "Ask the AI tool to rewrite the loop until the code looks shorter, then remove logs that make duplicate attempts visible.", "Keep the direct action path because the system can correct duplicate records later through a separate manual cleanup process."], misconception: "Retries need explicit idempotency and recovery design." },
      { prompt: "What does honest ownership of AI-assisted code look like?", correct: "State what you designed, generated, reviewed, tested, changed, and repaired, while being able to explain the final behavior.", distractors: ["Claim every generated implementation detail as independent work because the learner selected the original task and tool.", "Avoid using AI assistance entirely because any use of it makes a project unsuitable for technical interview discussion.", "Present only the final feature outcome and omit limitations, failed attempts, tests, and the boundaries the implementation enforces."], misconception: "Ownership is accountability and understanding, not authorship theater." },
      { prompt: "When should an AI-assisted engineer escalate rather than proceed?", correct: "When a change touches real permissions, sensitive data, production impact, policy ambiguity, or an unverified safety assumption.", distractors: ["Only when the generated code has a syntax error that cannot be resolved after several additional prompting attempts.", "Whenever a reviewer asks a question, because independent investigation is incompatible with AI-native engineering work.", "Never during a prototype, because fictional scope makes it safe to assume that production controls can be added later."], misconception: "A prototype still needs recognized boundaries and accountable owners." },
    ],
    prerequisites: ["aio-foundation-04-validated-api", "aio-foundation-05-data-tests-identity"],
  },
];

export const aioFoundationModules = foundationSeeds.map(foundationModule);

const extensionSeeds = [
  ["aio-sprint-extension-01-prototype-tour", "Prototype tour: permission-aware knowledge", "Walk through the fictional FastAPI knowledge assistant, identify its authorization-before-retrieval boundary, and explain what the tests prove.", "Practice", "A repository walkthrough is evidence of code-reading practice, not proof that you could build the service from zero.", "Escalate real data access and provider configuration to the accountable service and security owners.", sources.python],
  ["aio-sprint-extension-02-api-reading", "Read an API without pretending to be senior", "Trace a request, response schema, validation error, log event, and pytest assertion through a small fictional endpoint.", "Practice", "You may inspect and reason about a safe sample; do not claim production API ownership from a guided walkthrough.", "Escalate production failures with the request path, observed error, scope, and user impact.", sources.fastapi],
  ["aio-sprint-extension-03-retrieval-evaluation", "Retrieval and evaluation deepening", "Compare two fictional retrieval results, identify a failure mode, and add an edge case to a tiny evaluation set.", "Practice", "A short evaluation exercise teaches reasoning; production release criteria require broader representative evidence.", "Escalate retrieval access, data freshness, and source-conflict decisions to the documented content owner.", sources.nist],
  ["aio-sprint-extension-04-safe-boundaries", "Boundary drill: no AI is a valid answer", "Choose among conventional automation, read-only AI, human approval, or no AI for fictional constrained workflows.", "Practice", "Do not treat a model capability as approval to use protected data or write to an operational system.", "Escalate legal, export-control, privacy, and security interpretations to qualified reviewers.", sources.owasp],
  ["aio-sprint-extension-05-defense-loop", "System design and project-defense loop", "Practice a timed architecture explanation, skeptical follow-up, project ownership disclosure, and revision against a clear rubric.", "Practice", "Interview practice is not a certification of independent implementation skill.", "Escalate gaps honestly: name the next learning or specialist partnership rather than inventing experience.", sources.nist],
] as const;

export const aioSprintExtensions: CourseModule[] = extensionSeeds.map(([id, title, overview, _level, boundary, escalation, source], index) => ({
  id,
  title,
  phaseId: "crash-course",
  week: 0,
  durationMinutes: 75,
  pillar: "7-Day Sprint Extension",
  competencies: { foundations: 0.45, communication: 0.55, aiCollaboration: 0.25 },
  prerequisites: [],
  capabilityLevel: "practice",
  performanceExpectation: "Practice a bounded role-relevant activity with support, then explain the decision and limits clearly.",
  roleBoundary: boundary,
  specialistEscalationGuidance: escalation,
  pathAvailability: ["sprint-7-day"],
  instructionalDesign: aioInstructionalDesign,
  outcome: overview,
  overview,
  sections: [
    { heading: "What you need to recognize", body: overview },
    { heading: "How to reason safely", body: "Name the operational outcome, identify the boundary, choose a proportionate next step, and define the evidence that would verify or change your recommendation." },
    { heading: "What this exercise does not claim", body: boundary },
    { heading: "When to involve a specialist", body: escalation },
  ],
  workedExample: "Use fictional evidence, state the constraint, make a bounded recommendation, and identify the accountable owner before claiming a result.",
  misconceptions: ["Interview confidence requires pretending to have already performed every technical task.", "A guided walkthrough proves independent production readiness."],
  knowledgeChecks: [check(`${id}-q1`, "communication", {
    prompt: `What is the credible goal of ${title.toLowerCase()}?`,
    correct: "Use the fictional exercise to build precise vocabulary, safe reasoning, and an honest explanation of the boundary.",
    distractors: ["Claim independent production authority because the exercise uses a realistic technical artifact and concise rubric.", "Memorize a tool list without connecting any concept to an operational constraint, owner, or evidence signal.", "Avoid discussing limits in an interview because a confident answer should never mention learning or specialist partnership."],
    misconception: "Credibility comes from clear scope and reasoning, not inflated claims.",
  })],
  artifact: knowEvidence,
  rules: [{ id: "bounded-explanation", label: "Bounded explanation", requiredTerms: ["boundary"], minimumMatches: 1 }],
  sources: [source],
  review: draftReview,
  mdxPath: "content/applied-ai-operations/v2/interview-literacy-speedrun.mdx",
}));

type ConceptSeed = {
  group: string;
  title: string;
  competency: CompetencyKey;
  explanation: string;
  why: string;
  example: string;
  redFlag: string;
  owner: string;
  source: SourceReference;
};

const conceptSeeds: ConceptSeed[] = [
  { group: "Computing and systems", title: "Processes and memory", competency: "foundations", explanation: "An operating system runs programs as processes and allocates memory for their work. A process can fail, stall, consume too much memory, or be restarted without explaining why it failed.", why: "It helps you interpret a service crash, a slow worker, or a resource-limit conversation without claiming to be an operating-systems specialist.", example: "A fictional ingestion worker repeatedly restarts after a large document batch; the first question is whether it hit a bounded resource or a code error.", redFlag: "Treating restart as a root-cause fix without inspecting evidence.", owner: "Platform or infrastructure owner", source: sources.python },
  { group: "Computing and systems", title: "Networking and DNS", competency: "foundations", explanation: "Networking moves traffic between systems; DNS maps a service name to an address. An application can be healthy while a caller cannot resolve or reach it.", why: "You can distinguish an application error from a connectivity or name-resolution dependency during discovery and incidents.", example: "A fictional service works by direct address but fails through its normal hostname, pointing to a name-resolution path to investigate.", redFlag: "Changing application code before confirming the request can reach the intended service.", owner: "Network or platform owner", source: sources.python },
  { group: "Computing and systems", title: "Local, cloud, and restricted environments", competency: "architecture", explanation: "Local development, hosted cloud services, and restricted or air-gapped environments have different access, deployment, update, and data-boundary constraints.", why: "Model choice and integration design must fit the approved environment rather than assuming public internet access.", example: "A fictional team can test sanitized data locally but needs a separate approval path before using an isolated internal model endpoint.", redFlag: "Assuming a hosted API key can be moved into a restricted environment without review.", owner: "Platform, security, and environment owner", source: sources.nist },
  { group: "Computing and systems", title: "Containers", competency: "architecture", explanation: "A container packages an application and its dependencies into a repeatable runtime unit. It helps consistency, but it does not automatically make an application secure or observable.", why: "You should recognize a containerized deployment conversation and ask about configuration, secrets, logs, network access, and update ownership.", example: "A fictional FastAPI service runs the same image in test and staging but receives different approved configuration at deployment time.", redFlag: "Treating a container image as proof that deployment controls and secrets management are solved.", owner: "Platform or DevOps owner", source: sources.opentelemetry },
  { group: "Computing and systems", title: "Asynchronous work", competency: "production", explanation: "Asynchronous work lets a service wait for slow tasks or run background work without blocking every request. It introduces timeouts, cancellation, ordering, and error-propagation concerns.", why: "It helps you ask why a request is slow or why a background task silently failed without claiming to tune production concurrency.", example: "A fictional retrieval request fans out to search and policy checks; each call needs a timeout and a defined fallback.", redFlag: "Assuming async code removes failures or makes every operation faster.", owner: "Service owner", source: sources.python },
  { group: "Computing and systems", title: "Queues, caching, and CI/CD", competency: "architecture", explanation: "Queues defer or smooth work, caches reuse safe temporary results, and CI/CD automates tested delivery. Each changes failure modes and needs ownership, invalidation, and rollback decisions.", why: "You can recognize the right questions when a prototype needs scale, reliable background processing, or a safer release path.", example: "A fictional evaluation job enters a queue while a cache only stores non-sensitive, short-lived metadata lookups.", redFlag: "Adding a queue or cache before defining what happens when work is delayed, duplicated, stale, or unavailable.", owner: "Service and platform owners", source: sources.opentelemetry },
  { group: "Application engineering", title: "API contracts", competency: "foundations", explanation: "An API contract describes allowed inputs, outputs, errors, and versioned expectations between a caller and a service.", why: "It makes an AI feature an accountable component instead of a prompt that happens to return text.", example: "A fictional triage API accepts a validated incident summary and returns a structured recommendation or a clear abstention.", redFlag: "Letting consumers depend on unvalidated prose or undocumented fields.", owner: "Service owner", source: sources.fastapi },
  { group: "Application engineering", title: "Schemas and validation", competency: "foundations", explanation: "A schema specifies the shape and constraints of structured data. Validation rejects malformed, missing, or unsafe data at a boundary.", why: "Structured outputs, APIs, tools, and evaluation records all rely on clear schemas rather than best-effort parsing.", example: "A fictional model output must include an action type, confidence state, and cited source IDs before a human can review it.", redFlag: "Passing model-generated JSON downstream because it parses without checking required fields or values.", owner: "Service owner", source: sources.fastapi },
  { group: "Application engineering", title: "Relational data", competency: "foundations", explanation: "Relational databases store connected facts such as users, roles, documents, approvals, and audit events with explicit relationships.", why: "You can decide when ordinary data modeling is more appropriate than asking an LLM to infer a deterministic answer.", example: "A fictional approval record links a requester, permitted action, reviewer, timestamp, and outcome.", redFlag: "Using an LLM to answer a query that needs exact, authoritative database state.", owner: "Data or service owner", source: sources.postgres },
  { group: "Application engineering", title: "Authentication and authorization", competency: "security", explanation: "Authentication establishes identity; authorization decides what a known identity may access or do. They are enforced by trusted systems, not user-interface controls or prompts.", why: "Permission-aware retrieval and human-approved actions depend on this boundary.", example: "A fictional engineer authenticates to the service; the service then authorizes only their permitted procedure collection before retrieval.", redFlag: "Retrieving all content and asking the model or frontend to hide restricted passages.", owner: "Identity and security owner", source: sources.owasp },
  { group: "Application engineering", title: "Secrets and least privilege", competency: "security", explanation: "Secrets authenticate systems; least privilege limits each identity or tool to only the access it needs for a defined task.", why: "This prevents a prototype from becoming a broad, unaccountable channel into protected systems.", example: "A fictional read-only assistant has no write credential and cannot choose new tool permissions during a conversation.", redFlag: "Placing credentials in browser code, prompts, repositories, or broadly shared configuration.", owner: "Security and platform owner", source: sources.owasp },
  { group: "Application engineering", title: "Observability, incidents, and rollback", competency: "production", explanation: "Logs, metrics, and traces show what happened. Incident response contains impact, restores safe service, communicates status, and records prevention; rollback returns a change to a known-good state.", why: "You need to define operational evidence before proposing a broader AI rollout.", example: "A fictional model change raises unsupported-answer failures; the team pauses rollout, returns to the prior version, and adds the case to evaluation.", redFlag: "Declaring a pilot successful without a way to detect drift or reverse a harmful change.", owner: "Service owner and incident lead", source: sources.opentelemetry },
  { group: "Applied AI", title: "Tokens and context windows", competency: "foundations", explanation: "Models process input as tokens and have finite context windows. More context can increase cost, latency, distraction, and risk; it does not guarantee better answers.", why: "It lets you discuss prompt and retrieval tradeoffs without treating context size as a quality guarantee.", example: "A fictional assistant receives only the authorized, current passages needed for a question instead of an entire procedure library.", redFlag: "Adding every available document to a prompt because more context must be safer.", owner: "Applied AI or service owner", source: sources.nist },
  { group: "Applied AI", title: "Embeddings and vector search", competency: "architecture", explanation: "Embeddings represent text in a form that supports semantic similarity search. Vector search helps find candidate content; it is not an authorization system or truth guarantee.", why: "You can explain why retrieval has multiple stages and why metadata and permission filters still matter.", example: "A fictional query finds semantically similar procedure chunks only after the requester’s allowed collections are filtered.", redFlag: "Using embedding similarity as a substitute for access control or source freshness.", owner: "Applied AI and data owner", source: sources.nist },
  { group: "Applied AI", title: "Retrieval, reranking, and citations", competency: "architecture", explanation: "RAG retrieves relevant authorized source material, may rerank it, and asks the model to answer from that evidence with citations or abstention.", why: "This is a central architecture pattern for internal knowledge assistants, but it must be evaluated rather than assumed reliable.", example: "A fictional assistant surfaces two current cited procedures and escalates when they conflict instead of silently choosing one.", redFlag: "Treating a citation as proof that the answer is supported, current, or correctly applied.", owner: "Applied AI, content, and policy owners", source: sources.nist },
  { group: "Applied AI", title: "Structured outputs", competency: "foundations", explanation: "Structured output asks a model for data that conforms to a schema. The application must still validate that schema and decide how to handle failure or uncertainty.", why: "It turns an LLM from a prose generator into a bounded participant in a workflow.", example: "A fictional triage result contains a recommended category, cited evidence IDs, uncertainty, and a no-action default when validation fails.", redFlag: "Parsing prose with brittle string logic because the model usually follows the requested format.", owner: "Service owner", source: sources.fastapi },
  { group: "Applied AI", title: "Tools, agents, and MCP", competency: "roleJudgment", explanation: "Tools let a model request bounded capabilities. Agents select steps across tools; MCP is a protocol for providing context and tools. Deterministic workflows are often safer when the path is known.", why: "You need to choose the smallest amount of model autonomy that the evidence supports.", example: "A fictional assistant retrieves documents and prepares a recommendation, while a human approves any consequential action.", redFlag: "Using an agent loop where a predictable form, search path, or workflow would be safer and easier to test.", owner: "Service, security, and workflow owners", source: sources.owasp },
  { group: "Applied AI", title: "Model gateways and hosting", competency: "architecture", explanation: "A model gateway centralizes provider access, policy, logging, quotas, and fallback behavior. Model hosting choices affect data boundaries, latency, cost, reliability, and approvals.", why: "It helps you ask the right architecture questions without claiming to operate a model platform.", example: "A fictional service calls an approved internal gateway rather than exposing a provider credential in the browser.", redFlag: "Letting each prototype call arbitrary public model endpoints with its own unmanaged key.", owner: "AI platform and security owner", source: sources.nist },
  { group: "Safe enterprise AI", title: "Data classification", competency: "security", explanation: "Data classification defines how information may be handled, stored, transmitted, and accessed. A useful AI design begins by identifying what data may enter the approved environment.", why: "A technically appealing use case can still be inappropriate if data handling, privacy, export-control, or retention requirements are unresolved.", example: "A fictional pilot uses synthetic procedures until the data owner approves a narrow, documented source boundary.", redFlag: "Assuming an air-gapped model makes every source automatically permitted for ingestion.", owner: "Data owner, privacy, legal, export-control, and security reviewers", source: sources.nist },
  { group: "Safe enterprise AI", title: "Prompt injection", competency: "security", explanation: "Prompt injection occurs when user or retrieved content tries to override instructions or manipulate tool use. It is an application security problem, not only a prompting problem.", why: "You must design isolation, tool permissions, validation, and human approval around untrusted content.", example: "A fictional document includes instructions to export records; the system treats it only as content and never grants it control over tools.", redFlag: "Relying on a stronger system prompt as the only protection against untrusted retrieved text.", owner: "Security and service owner", source: sources.owasp },
  { group: "Safe enterprise AI", title: "Approval and audit boundaries", competency: "security", explanation: "Consequential actions need clear approval points and audit events that show who requested, reviewed, approved, executed, and observed the outcome.", why: "This separates useful decision support from unsafe autonomy.", example: "A fictional assistant drafts a ticket update, but a qualified human reviews and approves the exact change before the service applies it.", redFlag: "Recording only successful actions and losing evidence of denied, failed, or interrupted attempts.", owner: "Workflow owner, service owner, and compliance reviewer", source: sources.nist },
  { group: "Safe enterprise AI", title: "Evaluation and release gates", competency: "production", explanation: "Evaluation uses representative cases, explicit metrics, human review, and regression checks to decide whether a change is safe and useful enough to release.", why: "A demo is not an evaluation. This role needs to build practical testing approaches before advocating implementation.", example: "A fictional retrieval assistant is tested on supported, denied, stale, conflicting, injected, and unsupported questions before a controlled pilot expands.", redFlag: "Using polished examples or model self-confidence as the sole release criterion.", owner: "Product, applied AI, and domain owner", source: sources.nist },
  { group: "Safe enterprise AI", title: "Fallback and incident behavior", competency: "production", explanation: "A safe system has a defined response when a provider, retrieval source, tool, or validation step fails: abstain, preserve state safely, use an approved fallback, communicate, and recover.", why: "Reliability includes predictable degradation, not only successful model responses.", example: "A fictional model gateway outage returns an explicit unavailable state and directs the user to ordinary search rather than inventing an answer.", redFlag: "Retrying a consequential action blindly or returning unsupported cached content as if it were current.", owner: "Service owner and incident lead", source: sources.owasp },
  { group: "Safe enterprise AI", title: "Model and provider risk", competency: "roleJudgment", explanation: "Model selection includes quality, latency, cost, reliability, data boundary, deployment approval, context needs, and operational support—not popularity alone.", why: "You can make a transparent recommendation that fits the organization’s constraints and change it when evidence changes.", example: "A fictional pilot chooses a lower-latency approved model for classification and retains human review because evaluation shows edge-case uncertainty.", redFlag: "Selecting a model from a benchmark or chat experience without evaluating the actual task and boundary.", owner: "AI platform, product, security, and procurement owners", source: sources.nist },
  { group: "Delivery and operations", title: "Discovery", competency: "leadership", explanation: "Discovery uncovers the actual workflow, users, decision points, exceptions, systems, constraints, owners, and success measures before solution selection.", why: "The role is a technical partner role; a vague request for AI is not yet a usable requirement.", example: "A fictional manager asks for an agent, but interviews reveal that deterministic search and a checklist solve most of the delay.", redFlag: "Selecting a model or agent architecture before understanding the operational outcome.", owner: "Operations, product, and requesting-team owner", source: sources.nist },
  { group: "Delivery and operations", title: "Workflow mapping", competency: "leadership", explanation: "A workflow map traces triggers, people, decisions, systems, handoffs, exceptions, evidence, and time or quality measures.", why: "It reveals where AI could assist, where ordinary automation is better, and where humans must retain authority.", example: "A fictional incident workflow shows that summarization is useful but ticket closure must remain human-approved.", redFlag: "Automating a visible step while ignoring the upstream decision, exception, or approval that controls actual work.", owner: "Process and domain owner", source: sources.nist },
  { group: "Delivery and operations", title: "Stakeholder interviews", competency: "communication", explanation: "Good technical discovery questions surface pain, workarounds, data sources, error tolerance, constraints, incentives, and ownership without assuming the requested solution is correct.", why: "You will work with engineering, product, and operations teams that have different vocabulary and legitimate concerns.", example: "A fictional engineer says ‘we need Grok’; the next questions clarify source freshness, authorization, review, integration, and success criteria.", redFlag: "Treating a stakeholder’s preferred tool as the requirement instead of asking what outcome they need.", owner: "Technical partner or product owner", source: sources.nist },
  { group: "Delivery and operations", title: "Technical decision records", competency: "communication", explanation: "A decision record captures context, options, choice, tradeoffs, owner, evidence, and revisit conditions so a team can understand why a boundary exists.", why: "It makes fast-moving cross-functional work reviewable and prevents hidden assumptions from becoming permanent architecture.", example: "A fictional team documents why its first pilot is read-only retrieval instead of a write-enabled agent, including the criteria for reconsidering that choice.", redFlag: "Writing a tool list or architecture diagram without the decision, alternatives, owner, and evidence that support it.", owner: "Technical decision owner", source: sources.nist },
  { group: "Delivery and operations", title: "Pilots and success metrics", competency: "roleJudgment", explanation: "A pilot is a narrow, reversible experiment with known users, a controlled boundary, success measures, failure thresholds, and a decision after evidence is collected.", why: "It turns AI adoption into measured learning rather than broad rollout based on enthusiasm.", example: "A fictional cited-assistant pilot measures supported-answer rate, abstention quality, retrieval relevance, time saved, and safety failures for one team.", redFlag: "Calling a prototype a pilot without defining users, duration, baseline, metric, stop condition, or owner.", owner: "Product, operations, and technical owners", source: sources.nist },
  { group: "Delivery and operations", title: "Escalation and ownership", competency: "communication", explanation: "Escalation is a deliberate transfer to the accountable person when impact, uncertainty, permission, policy, or dependency exceeds your authority. Ownership includes clear updates and follow-through.", why: "It is how a technical partner moves quickly without unsafe improvisation.", example: "A fictional data-boundary question is documented, sent to the designated reviewer, and tracked with a next update time rather than silently bypassed.", redFlag: "Either acting beyond authority or escalating without a clear question, impact statement, evidence, and proposed next step.", owner: "Named domain, security, or platform owner", source: sources.nist },
  { group: "Architecture vocabulary", title: "Service boundaries", competency: "architecture", explanation: "A service boundary defines which component owns an operation, data, policy, and failure behavior. Clear boundaries reduce accidental coupling and make review more precise.", why: "You can explain an architecture as responsibilities and tradeoffs instead of a list of frameworks.", example: "A fictional retrieval service owns authorization-aware search; a separate policy service owns action eligibility; neither delegates that decision to a model.", redFlag: "Giving one agent or service broad access because it is convenient for a demo.", owner: "System architect and service owners", source: sources.nist },
  { group: "Architecture vocabulary", title: "Retries and idempotency", competency: "production", explanation: "Retries handle temporary failures. Idempotency ensures that repeating a request does not repeat a consequential effect such as creating duplicate records or actions.", why: "Tool workflows need both before they can safely recover from timeouts or provider failures.", example: "A fictional approval action includes a unique request key so a timeout cannot create two ticket changes when the client retries.", redFlag: "Adding automatic retry to a write path without deciding how duplicate execution is detected and prevented.", owner: "Service owner", source: sources.python },
  { group: "Architecture vocabulary", title: "Rate limits", competency: "production", explanation: "Rate limits bound how often a caller, user, or system can consume a capability. They protect reliability, cost, and downstream systems, but need clear responses and fair operational policy.", why: "An LLM integration can fail operationally through cost or overload even when each individual response is correct.", example: "A fictional gateway limits expensive evaluation calls and returns a clear retry window rather than silently dropping requests.", redFlag: "Allowing unlimited retries or high-volume tool calls because a pilot has few initial users.", owner: "Platform and service owner", source: sources.nist },
  { group: "Architecture vocabulary", title: "Deployment and Docker", competency: "architecture", explanation: "Deployment promotes a tested artifact and approved configuration into an environment. Docker is one way to package an artifact consistently; it does not replace environment review, secrets, monitoring, or rollback.", why: "You can take part in a prototype-to-production conversation without overstating operations expertise.", example: "A fictional FastAPI image is tested in staging, receives environment-specific non-secret configuration, and has a documented rollback target.", redFlag: "Treating ‘it runs in a container’ as proof that it is safe to deploy.", owner: "Platform, release, and service owners", source: sources.opentelemetry },
  { group: "Architecture vocabulary", title: "Distributed-system failures", competency: "production", explanation: "When components communicate over networks, delays, partial failure, stale state, duplicate delivery, and inconsistent results are normal possibilities. Good designs make these cases visible and recoverable.", why: "It keeps an architecture discussion grounded in real operational behavior instead of a perfect happy-path diagram.", example: "A fictional retrieval call times out after the policy check succeeded; the service returns a safe unavailable response and preserves the audit record.", redFlag: "Assuming a remote call either succeeds immediately or fails in a way that leaves all systems unchanged.", owner: "Service and platform owners", source: sources.opentelemetry },
  { group: "Architecture vocabulary", title: "Kubernetes and Rust: recognize the role", competency: "architecture", explanation: "Kubernetes orchestrates containerized workloads; Rust is a systems language with strong ownership and error-handling guarantees. Both can be valuable, but neither is the default answer to an application-design problem.", why: "You should recognize when these topics affect a proposal and partner with specialists rather than treating vocabulary as implementation competence.", example: "A fictional high-throughput parser may justify a Rust investigation, while a small Python service remains the simpler proven path for the pilot.", redFlag: "Adding Kubernetes or Rust to a design only to sound advanced before the workflow, service boundary, and evidence justify them.", owner: "Platform or systems specialist", source: sources.python },
];

function conceptModule(seed: ConceptSeed, index: number): CourseModule {
  const id = `aio-concept-${String(index + 1).padStart(2, "0")}`;
  return {
    id,
    title: seed.title,
    phaseId: "foundation-bridge",
    week: 0,
    durationMinutes: 18,
    pillar: "Role Concepts Library",
    conceptGroup: seed.group,
    competencies: { [seed.competency]: 0.45, communication: 0.25 },
    prerequisites: [],
    capabilityLevel: "know",
    performanceExpectation: "Explain the concept in plain language, recognize its operating impact, and identify when specialist involvement is required. This does not claim configuration or production-operation ability.",
    roleBoundary: `Recognition only: ${seed.redFlag}`,
    specialistEscalationGuidance: `In a real organization, involve the ${seed.owner}.`,
    pathAvailability: ["concept-library", "full-program"],
    instructionalDesign: aioInstructionalDesign,
    outcome: `Explain ${seed.title.toLowerCase()} clearly and recognize the safe handoff boundary.`,
    overview: seed.explanation,
    sections: [
      { heading: "Plain-language meaning", body: seed.explanation },
      { heading: "Why it matters here", body: seed.why },
      { heading: "Fictional operating example", body: seed.example },
      { heading: "Red flag and handoff", body: `${seed.redFlag} In a real organization, involve the ${seed.owner}.` },
    ],
    workedExample: seed.example,
    misconceptions: [seed.redFlag, "Recognizing a concept is the same as being authorized or prepared to operate it independently."],
    knowledgeChecks: [check(`${id}-q1`, seed.competency, {
      prompt: `A teammate mentions ${seed.title.toLowerCase()} during a fictional design review. What is the most credible learner response?`,
      correct: `Explain its role in the stated workflow, name the relevant boundary, and involve the ${seed.owner} before implementation decisions are made.`,
      distractors: [
        `Claim that knowing the definition means you can configure ${seed.title.toLowerCase()} directly in the production environment without review.`,
        "Ignore the dependency because terminology is less important than moving quickly to a feature demonstration and collecting user reactions.",
        "Ask a model for a configuration snippet, apply it broadly, and treat the absence of an immediate error as sufficient verification.",
      ],
      misconception: "Concept recognition and accountable implementation are different levels of readiness.",
    })],
    artifact: knowEvidence,
    rules: [{ id: "concept-boundary", label: "Recognize and escalate", requiredTerms: ["specialist"], minimumMatches: 1 }],
    sources: [seed.source],
    review: draftReview,
    mdxPath: "content/applied-ai-operations/v2/role-concepts-library.mdx",
  };
}

export const aioRoleConcepts = conceptSeeds.map(conceptModule);
export const aioFoundationSources = Object.values(sources);
