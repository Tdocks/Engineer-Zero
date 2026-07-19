import type { CapabilityLevel, CompetencyKey } from "./types";
import {
  type ArtifactSchema,
  type CourseModule,
  draftReview,
  type SourceReference,
} from "./course-types";
import { aioConceptRetrievalChecks } from "./aio-concept-checks";

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
    outcome: "Read, explain, and sketch small Python functions that transform data and reject invalid inputs explicitly—using the worked example as the practice artifact.",
    expectation: "Prove that you can explain and modify a small function’s inputs, branches, and error path without treating AI output as an unreviewed answer.",
    boundary: "Small exercises are not permission to merge unreviewed code into a production service.",
    escalation: "Escalate unfamiliar production failures, dependencies, or security-sensitive changes through normal review rather than guessing.",
    overview: "Python is the primary implementation language because it lets you express service behavior clearly. The goal is not syntax recall; it is predictable inputs, visible decisions, and recoverable error paths.",
    sections: [
      { heading: "Data has shape", body: "Strings, numbers, lists, dictionaries, and booleans represent different kinds of information. A function should state what shape it expects and what shape it returns." },
      { heading: "Decisions stay explicit", body: "Conditions and loops let a function choose a path. Keep each branch small enough that you can explain why it exists and what happens when it fails." },
      { heading: "Errors are part of the contract", body: "Missing identifiers, unexpected fields, and failed conversions should create clear errors. Silently accepting bad data produces hard-to-diagnose operational failures later." },
      { heading: "Practice sketch (do this)", body: "Write on paper or in a scratch file: def normalize_incident(record: dict) -> dict that requires incident_id, maps priority strings to a small enum, and raises ValueError when the id is missing. Trace one valid and one invalid call before you ask any assistant to expand it." },
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
    outcome: "Specify and explain a small read-only FastAPI endpoint contract: request schema, validation, predictable errors, safe response shape, and the tests that prove each path.",
    expectation: "Prove that you can design and defend an API boundary—including failure behavior—using the fictional procedure-lookup example.",
    boundary: "The exercise is read-only and fictional; it does not authorize live provider calls, internal data access, or deployment.",
    escalation: "Escalate production API ownership, authentication integration, and deployment approval to the responsible service and security owners.",
    overview: "An API is an agreement between clients and services. It states what a caller may send, what the service returns, and how errors are communicated. This contract is the foundation for safe AI integration later.",
    sections: [
      { heading: "Requests are contracts", body: "A request schema says what fields exist, their types, and which are required. Validate before business logic so invalid requests do not become confusing downstream failures." },
      { heading: "Responses need meaning", body: "Use a stable response shape and meaningful status codes. A caller should distinguish a malformed request, denied access, missing record, and service failure." },
      { heading: "Read-only is a deliberate boundary", body: "Start with a retrieval or validation path before any action path. This limits impact while you learn the workflow, inputs, and failure cases." },
      { heading: "Contract sketch (do this)", body: "Write the request fields (procedure_key, role), the 200 response fields, and three failure statuses (422 malformed, 404 missing, 403 denied). List one pytest name for each path. Implementation can follow in Coding Developer labs; this foundation lesson owns the contract." },
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
    outcome: "Explain how relational evidence, pytest checks, Git review, and authn vs authz fit together—using one fictional access-control story rather than claiming four unrelated specialties.",
    expectation: "Prove that you can explain why a request is allowed, denied, tested, and reversible in a single coherent scenario.",
    boundary: "The learner models and tests synthetic records only; real identity, secrets, and production databases remain out of scope. Depth on each subtopic continues in later Coding and AIO modules.",
    escalation: "Engage the data, identity, or security owner whenever a change affects real permissions, retention, or protected records.",
    overview: "Reliable systems remember facts and decisions. This lesson follows one fictional access story: who may see a procedure revision, how that permission is stored, how tests prove denial, and how a Git change keeps the boundary reviewable.",
    sections: [
      { heading: "One story, four controls", body: "Technician Maya asks for procedure P-17. The service must know who Maya is (authentication), whether her role may read P-17 (authorization), store that fact as relational evidence, prove the deny path with tests, and land any permission change as a small reviewed Git diff. Treat these as one chain—not four unrelated specialties." },
      { heading: "Relational evidence for access", body: "Model users, roles, document revisions, and audit events as linked records. A role_permission row or equivalent is the system of record for ‘Maya may read P-17.’ Prose in a ticket is not. When you later add AI retrieval, the same rows decide what may enter model context." },
      { heading: "Authn vs authz in the request path", body: "Authentication establishes identity (session/token verified). Authorization evaluates that identity against the relational permission for the specific resource. Neither belongs in a prompt or UI hide/show alone. Denied callers should receive neither content nor a citation that reveals the restricted revision exists." },
      { heading: "Pytest + Git close the loop", body: "Write tests named for the story: test_technician_may_read_approved_revision and test_unauthorized_gets_empty_denial. When someone proposes broadening access, the change is a small Git diff of the permission model plus those tests—so a reviewer can connect intent, risk, and rollback before merge." },
    ],
    example: "Maya (technician) may read approved P-17; contractor Sam cannot. Relational roles encode that. Pytest asserts Maya gets content+citation and Sam gets a denial with no leakage. A PR that adds Sam’s role must update both the data model and the deny test, or review rejects it.",
    misconceptions: ["Authentication and authorization are two names for the same password check.", "A passing local run makes a code review unnecessary.", "Four topics in one lesson means four independent certifications."],
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

const practiceEvidence: ArtifactSchema = {
  type: "explanation",
  required: ["scenario fact", "decision", "boundary", "escalation"],
  requiredFields: ["scenarioFact", "decision", "boundary", "escalation"],
};

type ExtensionSeed = {
  id: string;
  title: string;
  competency: CompetencyKey;
  outcome: string;
  overview: string;
  expectation: string;
  boundary: string;
  escalation: string;
  durationMinutes: number;
  sections: Array<{ heading: string; body: string }>;
  example: string;
  misconceptions: string[];
  source: SourceReference;
  checks: [CheckSeed, CheckSeed, CheckSeed];
  competencies?: CourseModule["competencies"];
};

function extensionModule(seed: ExtensionSeed): CourseModule {
  return {
    id: seed.id,
    title: seed.title,
    phaseId: "crash-course",
    week: 0,
    durationMinutes: seed.durationMinutes,
    pillar: "7-Day Sprint Extension",
    competencies: seed.competencies ?? { [seed.competency]: 1, communication: 0.35, aiCollaboration: 0.2 },
    prerequisites: [],
    capabilityLevel: "practice",
    performanceExpectation: seed.expectation,
    roleBoundary: seed.boundary,
    specialistEscalationGuidance: seed.escalation,
    pathAvailability: ["sprint-7-day"],
    instructionalDesign: aioInstructionalDesign,
    outcome: seed.outcome,
    overview: seed.overview,
    sections: seed.sections,
    workedExample: seed.example,
    misconceptions: seed.misconceptions,
    knowledgeChecks: seed.checks.map((item, index) => check(`${seed.id}-q${index + 1}`, seed.competency, item)),
    artifact: practiceEvidence,
    rules: [
      { id: "bounded-explanation", label: "Bounded explanation", requiredTerms: ["boundary"], minimumMatches: 1 },
      { id: "named-escalation", label: "Named escalation", requiredTerms: ["escalat"], minimumMatches: 1 },
    ],
    sources: [seed.source],
    review: draftReview,
    mdxPath: "content/applied-ai-operations/v2/interview-literacy-speedrun.mdx",
  };
}

const extensionSeeds: ExtensionSeed[] = [
  {
    id: "aio-sprint-extension-01-prototype-tour",
    title: "Prototype tour: permission-aware knowledge",
    competency: "security",
    outcome: "Walk a fictional FastAPI knowledge assistant end to end, name the authorization-before-retrieval boundary, and state exactly what three pytest cases prove.",
    overview: "This practice tour uses a fictional read-only knowledge assistant: a FastAPI service that answers procedure questions only from collections the caller may see. You are reading and explaining an existing sample, not building production infrastructure.",
    expectation: "Practice tracing a permission-aware retrieval path and explaining what the accompanying tests prove—and what a walkthrough does not certify.",
    boundary: "A repository walkthrough is evidence of code-reading practice, not proof that you could design, secure, or operate the service from zero.",
    escalation: "Escalate real data access, identity integration, and provider configuration to the accountable service and security owners.",
    durationMinutes: 50,
    competencies: { security: 1, foundations: 0.45, communication: 0.4 },
    sections: [
      {
        heading: "The fictional service you are touring",
        body: "ProcedureDesk is a small FastAPI app with three layers: an auth dependency that resolves a caller identity and role, a permission filter that returns only allowed collection IDs, and a retrieval+answer path that builds a response with citations or an explicit abstention. There is no write tool and no direct database credential in the model path.",
      },
      {
        heading: "Authorization before retrieval",
        body: "When a technician asks about procedure P-17, the service does not search the full corpus and then hide restricted hits. It first resolves the caller’s allowed collections, then retrieves only inside that set. Denied callers receive neither content nor a citation that reveals a restricted revision exists. The model never sees unauthorized text.",
      },
      {
        heading: "What the tests prove",
        body: "Three pytest names tell the story: test_allowed_role_gets_cited_answer asserts a permitted caller receives content plus source IDs; test_unauthorized_gets_empty_denial asserts a contractor receives a denial with an empty citation list; test_restricted_text_never_enters_prompt asserts a spy on the prompt-builder never receives chunks outside the allowed set. Passing these tests proves the boundary under those cases—not production readiness.",
      },
      {
        heading: "Tour practice (do this)",
        body: "On paper, draw: caller → auth dependency → allowed collections → retrieve → prompt → cited answer or denial. Under each arrow, write one failure you would look for (missing role, empty allowed set, stale chunk, prompt leakage). Then write one sentence: ‘These tests prove X; they do not prove Y.’",
      },
    ],
    example: "Caller Maya (technician) may read collection ops-procedures. She asks for P-17 calibration steps. Auth resolves her role; the filter returns ops-procedures; retrieval returns two current chunks; the answer cites them. Caller Sam (contractor) asks the same question. Auth resolves contractor; the filter returns []; the response is a structured denial with citations=[]. A unit test fails the PR if Sam’s path ever receives a P-17 chunk in the prompt assembly spy.",
    misconceptions: [
      "Hiding a document link in the UI is the same as authorization-before-retrieval.",
      "A guided tour of a sample FastAPI app means you independently built and secured the service.",
      "One happy-path demo proves restricted content cannot leak into model context.",
    ],
    source: sources.owasp,
    checks: [
      {
        prompt: "In the fictional ProcedureDesk tour, when must the caller’s allowed collections be determined?",
        correct: "Before retrieval and prompt assembly, so unauthorized procedure text never enters model context.",
        distractors: [
          "After the model drafts an answer, so the frontend can redact any restricted citations before display.",
          "Only when the caller asks for an export, because ordinary chat answers are assumed to be low risk.",
          "Inside the embedding index itself, because similarity search automatically excludes roles the model considers inappropriate.",
        ],
        misconception: "UI redaction and post-hoc filtering are not authorization-before-retrieval.",
      },
      {
        prompt: "What does test_unauthorized_gets_empty_denial need to assert beyond an error status?",
        correct: "The denied response includes neither protected content nor citations that reveal the restricted record exists.",
        distractors: [
          "The model receives the full procedure and is instructed in the system prompt never to quote restricted sections aloud.",
          "The UI hides the document title while the API still returns the newest revision for trusted frontend caching.",
          "The denied caller receives a related unrestricted procedure so the product still feels helpful under every role.",
        ],
        misconception: "Denial must avoid content leakage, including citation side channels.",
      },
      {
        prompt: "You finished the guided tour and all three sample tests pass locally. What claim is still dishonest?",
        correct: "Claiming you independently designed, secured, and are ready to operate the production knowledge assistant.",
        distractors: [
          "Explaining that authorization runs before retrieval and naming what each pytest case checks.",
          "Listing the remaining gaps: real identity integration, content ownership, and broader evaluation evidence.",
          "Saying the walkthrough built vocabulary for permission-aware retrieval without certifying build skill.",
        ],
        misconception: "Reading a sample is practice, not production ownership.",
      },
    ],
  },
  {
    id: "aio-sprint-extension-02-api-reading",
    title: "Read an API without pretending to be senior",
    competency: "foundations",
    outcome: "Trace one fictional FastAPI request through schema validation, handler logic, a log event, and the pytest assertion that locks the contract.",
    overview: "Senior-sounding API talk often skips the evidence trail. This practice forces a concrete path: request body → schema → validation failure or success → handler → structured log → test. You inspect a safe sample; you do not claim production API ownership.",
    expectation: "Practice reading a small endpoint contract and explaining how validation, logging, and tests work together on one request path.",
    boundary: "You may inspect and reason about a safe sample; do not claim production API ownership or on-call authority from a guided walkthrough.",
    escalation: "Escalate production failures with the request path, observed error, scope, and user impact—not with a vague ‘API is broken’ note.",
    durationMinutes: 50,
    competencies: { foundations: 1, architecture: 0.35, communication: 0.4 },
    sections: [
      {
        heading: "Start from the contract, not the framework name",
        body: "The sample endpoint POST /v1/procedure-lookup accepts { procedure_key: string, role: string }. The response shape is { status: 'ok'|'denied'|'invalid', citations: string[], summary: string | null }. Status codes: 200 for ok/denied business outcomes with a body, 422 for schema validation failures. Knowing FastAPI exists is not the same as tracing this contract.",
      },
      {
        heading: "Validation before business logic",
        body: "Pydantic (or equivalent) rejects empty procedure_key and unknown role enums before the handler queries anything. A 422 body names the field and reason. That failure should never become a 500 from a KeyError deeper in the stack. The log for 422 records request_id, path, and error_category=validation—not the full payload if it might contain sensitive free text.",
      },
      {
        heading: "Happy path, denial path, and the log line",
        body: "On valid input, the handler checks authorization, retrieves or denies, and emits one structured log: request_id, procedure_key, role, outcome, latency_ms. Denied access is a first-class outcome with citations=[]. Missing procedure returns status invalid or a documented not-found shape—pick one and keep tests consistent. The log is how an operator reconstructs what happened without reading the model prompt.",
      },
      {
        heading: "Pytest locks the trail (do this)",
        body: "Write five assertion names before you look at any generated code: test_valid_lookup_returns_citations; test_empty_key_returns_422; test_unknown_role_returns_422; test_denied_role_empty_citations; test_log_includes_request_id_and_outcome. For each, note which layer failed if the assertion breaks (schema, auth, retrieval, logging).",
      },
    ],
    example: "Request { procedure_key: 'P-17', role: 'technician' } validates, auth allows ops-procedures, handler returns 200 with status=ok and two citation IDs, and the log shows outcome=ok. Request { procedure_key: '', role: 'technician' } never reaches retrieval: schema returns 422 and the log shows error_category=validation. Pytest asserts both the 422 detail path and that no retrieval mock was called.",
    misconceptions: [
      "If JSON parses, the request is valid enough for business logic.",
      "A single browser happy-path click proves the API contract, including denial and validation.",
      "Reading an OpenAPI snippet means you own production incident response for that service.",
    ],
    source: sources.fastapi,
    checks: [
      {
        prompt: "A fictional client sends procedure_key as an empty string. Where should the failure surface first?",
        correct: "At schema validation with a 422 and a field-level reason, before any retrieval or model call runs.",
        distractors: [
          "Inside the embedding search, which can treat an empty key as a broad query across all collections.",
          "In the model prompt, which should invent a procedure key when the client forgets to supply one.",
          "Only in an operator dashboard after a 500 traceback shows a KeyError deep in the handler.",
        ],
        misconception: "Validation belongs at the boundary, not after side effects begin.",
      },
      {
        prompt: "Which evidence trail best shows you actually read the endpoint rather than memorized framework names?",
        correct: "Request fields, validation failure shape, denial outcome, log fields, and the pytest names that lock each path.",
        distractors: [
          "A list of popular API frameworks and a claim that any of them could host the same assistant equally well.",
          "A screenshot of a 200 response with no mention of 422, denial, or what the structured log records.",
          "A generated OpenAPI file that was never compared to a failing test or an observed error body.",
        ],
        misconception: "Contract literacy is the path through failures, not tool-name fluency.",
      },
      {
        prompt: "You are escalating a production lookup failure. What package is most useful to the next owner?",
        correct: "Request path, observed status and body, scope of affected roles, user impact, and whether validation, auth, or retrieval is implicated.",
        distractors: [
          "Only the message ‘the API is broken,’ because specialists prefer to rediscover the failing path themselves.",
          "The full authorization token and raw document text pasted into the ticket for maximum debugging detail.",
          "A proposal to rewrite the service in a different framework before any failing request evidence is captured.",
        ],
        misconception: "Escalation needs a scoped evidence trail, not panic or secret dumping.",
      },
    ],
  },
  {
    id: "aio-sprint-extension-03-retrieval-evaluation",
    title: "Retrieval and evaluation deepening",
    competency: "architecture",
    outcome: "Compare two fictional retrieval results for the same question, name the failure mode, and add one edge case to a tiny evaluation set with an expected outcome.",
    overview: "Retrieval quality is not ‘the answer sounded good.’ This practice compares two candidate result packs, classifies what went wrong, and extends a miniature evaluation set so the next change has a regression target.",
    expectation: "Practice comparing retrieval packs, labeling a failure mode, and writing one evaluable edge case—not releasing a production RAG system.",
    boundary: "A short evaluation exercise teaches reasoning; production release criteria require broader representative evidence, owners, and thresholds.",
    escalation: "Escalate retrieval access, data freshness, and source-conflict decisions to the documented content owner.",
    durationMinutes: 55,
    competencies: { architecture: 1, production: 0.35, communication: 0.35 },
    sections: [
      {
        heading: "Same question, two result packs",
        body: "Question: ‘What is the torque sequence for fixture F-12?’ Pack A returns chunk F12-2024-revC (current, authorized) and a short related safety note. Pack B returns F12-2019-revA (superseded) plus a semantically similar chunk from fixture F-11. Both packs can look ‘relevant’ to an embedding score; only Pack A is operationally usable.",
      },
      {
        heading: "Name the failure mode before you tweak prompts",
        body: "Useful labels: stale_source (old revision ranked above current), wrong_entity (F-11 confused with F-12), permission_leak (restricted chunk present), unsupported (no adequate chunk; model should abstain), conflict (two current sources disagree). Pack B fails as stale_source + wrong_entity. Fixing the label points to metadata filters and freshness—not a longer system prompt alone.",
      },
      {
        heading: "Tiny eval set shape",
        body: "Each case needs: id, question, allowed_role, expected_source_ids or expected_abstention, and failure_tag if the case targets a known risk. Start with five to eight cases that cover supported answer, denial, stale revision, wrong entity, and unsupported question. A demo transcript is not an eval set.",
      },
      {
        heading: "Add one edge case (do this)",
        body: "Write a new case where two current authorized procedures disagree on a step. Expected outcome: abstain or escalate_conflict—not a silently chosen side. Include the two source IDs the retriever should surface and the assertion that the answer must not present a single sequence as settled fact.",
      },
    ],
    example: "Case eval-07: role=technician, question asks for F-12 torque after a known revision cutover. Pack A (pass): sources [F12-2024-revC]. Pack B (fail): sources [F12-2019-revA, F11-torque]. You label Pack B stale_source+wrong_entity, then add eval-08: two current F-12 notes conflict → expected=escalate_conflict. The next retrieval change must keep eval-07 green and satisfy eval-08’s abstention rule.",
    misconceptions: [
      "Higher embedding similarity proves the retrieved revision is current and correct.",
      "A polished cited answer is evaluation evidence even without expected source IDs or failure tags.",
      "Prompt wording alone fixes stale or wrong-entity retrieval without metadata and tests.",
    ],
    source: sources.nist,
    checks: [
      {
        prompt: "Pack B returns a superseded F-12 revision and an F-11 chunk for an F-12 torque question. What is the best failure labeling?",
        correct: "stale_source and wrong_entity, pointing next work at freshness metadata and entity filters rather than only the prompt.",
        distractors: [
          "model_too_small, because a larger model would have ignored the wrong fixture identifiers automatically.",
          "authorization_failure, because any imperfect citation means the caller lacked permission for every procedure.",
          "success_with_style_issues, because both packs contained mechanically related maintenance language.",
        ],
        misconception: "Similarity is not freshness, entity identity, or authorization.",
      },
      {
        prompt: "What must a new evaluation edge case include to be useful?",
        correct: "A question, role or permission context, expected sources or abstention, and a named failure tag the case is meant to catch.",
        distractors: [
          "Only a sample model answer that sounded helpful during a live demo with the project sponsor.",
          "A list of embedding model names without any expected citation IDs or denial conditions.",
          "A screenshot of the chat UI proving that at least one citation string appeared in the response.",
        ],
        misconception: "Evaluation needs expected outcomes, not vibes.",
      },
      {
        prompt: "Two current authorized procedures disagree on a step. What expected outcome belongs in the eval set?",
        correct: "Abstain or escalate the conflict rather than silently choosing one sequence as settled fact.",
        distractors: [
          "Pick the longer procedure because more text usually means the author was more careful and complete.",
          "Average the two sequences into a blended checklist so the assistant still returns a confident answer.",
          "Return both full documents without a conflict signal and let the requester reconcile them unaided later.",
        ],
        misconception: "Conflict is a first-class failure mode, not a creativity prompt.",
      },
    ],
  },
  {
    id: "aio-sprint-extension-04-safe-boundaries",
    title: "Boundary drill: no AI is a valid answer",
    competency: "roleJudgment",
    outcome: "Classify fictional workflows into conventional automation, read-only AI, human-approved AI action, or no AI—and defend each choice with the risk that would make a higher autonomy level unsafe.",
    overview: "Model capability is not permission. This drill trains a four-way classification so ‘use an agent’ is not the default. Sometimes the correct applied-AI recommendation is a checklist, a SQL report, or no AI at all.",
    expectation: "Practice selecting a proportionate automation level and explaining the boundary that blocks a more autonomous option.",
    boundary: "Do not treat a model capability as approval to use protected data or write to an operational system.",
    escalation: "Escalate legal, export-control, privacy, and security interpretations to qualified reviewers.",
    durationMinutes: 45,
    competencies: { roleJudgment: 1, security: 0.45, communication: 0.4 },
    sections: [
      {
        heading: "Four levels, not a binary",
        body: "Conventional automation: deterministic rules, forms, search, scripts—no model. Read-only AI: summarize or answer from authorized context; no side effects. Human-approved AI action: model drafts; a qualified human approves the exact write or external call. No AI: data, policy, or error tolerance make model involvement inappropriate even as a draft.",
      },
      {
        heading: "Classify with the risk that blocks the next level up",
        body: "Ask: Is the outcome deterministic from structured data? Prefer conventional. Is the value summarization or search over authorized prose with abstention? Read-only AI may fit. Does any step create, change, or send a consequential record? Require human approval or stay conventional. Is the source export-controlled, legally privileged, or lacking an approved environment? Choose no AI until reviewers decide otherwise.",
      },
      {
        heading: "Drill scenarios",
        body: "(1) Nightly count of open tickets by queue → conventional. (2) Draft a plain-language summary of an authorized incident timeline for a responder → read-only AI. (3) Propose a CMDB field update from a chat request → human-approved AI action or conventional form—not autonomous write. (4) Paste customer export-controlled drawings into a public model to ‘explain the assembly’ → no AI.",
      },
      {
        heading: "Practice card (do this)",
        body: "For each of the four scenarios, write: level chosen; one sentence why; the next more autonomous level you rejected; the risk that blocks it; the owner you would ask before changing the level. Keep answers short enough to say aloud in under thirty seconds each.",
      },
    ],
    example: "Scenario: a lead asks for an agent that closes low-priority tickets when the model is confident. Classification: not autonomous. Safer path: conventional automation for clearly encoded close rules, or human-approved AI that drafts a close note the assignee must accept. Rejected level: write-enabled agent. Blocking risk: incorrect closure, missing audit intent, and silent policy drift. Owner: service desk workflow owner plus security review before any write tool exists.",
    misconceptions: [
      "If a model can draft the action, the organization should let it execute the action.",
      "Air-gapped or ‘private’ hosting automatically makes every source eligible for AI ingestion.",
      "Choosing no AI means you failed the applied-AI interview rather than applied judgment.",
    ],
    source: sources.owasp,
    checks: [
      {
        prompt: "A manager wants a public chatbot to explain export-controlled assembly drawings pasted by engineers. Best classification?",
        correct: "No AI until qualified reviewers define an approved environment, source boundary, and handling rules.",
        distractors: [
          "Read-only AI, because answering questions is harmless as long as the model is told not to store chats.",
          "Human-approved AI action, because a supervisor can click approve after the public model already processed the drawing.",
          "Conventional automation, because a nightly script can upload the drawings to any available model API automatically.",
        ],
        misconception: "Capability and convenience do not override data-handling constraints.",
      },
      {
        prompt: "Which workflow is the best fit for conventional automation rather than a model?",
        correct: "A nightly count of open tickets by queue from structured fields with a fixed report format.",
        distractors: [
          "Summarizing a messy multi-day incident narrative that needs citation-backed prose for responders.",
          "Drafting a nuanced customer apology that must reflect tone, facts, and legal review before sending.",
          "Explaining conflicting procedure revisions where abstention and source comparison are the main value.",
        ],
        misconception: "Deterministic structured reporting rarely needs a generative model.",
      },
      {
        prompt: "An assistant may draft a CMDB update but must not apply it. Which level and control pair is correct?",
        correct: "Human-approved AI action: the model prepares a diff; a qualified human approves the exact write before execution.",
        distractors: [
          "Read-only AI with a hidden write credential so the tool can ‘save time’ when confidence is high.",
          "No AI forever, because any draft that mentions a configuration item is automatically a policy violation.",
          "Conventional automation that grants the model a broad admin token to skip the approval queue entirely.",
        ],
        misconception: "Drafting and executing are different autonomy levels.",
      },
    ],
  },
  {
    id: "aio-sprint-extension-05-defense-loop",
    title: "System design and project-defense loop",
    competency: "communication",
    outcome: "Run a timed fictional defense: state scope, boundary, ownership, and revision against a four-part rubric, then improve one weak answer after skeptical follow-up.",
    overview: "Interview and design reviews reward structured ownership under time pressure. This practice uses a short clock and an explicit rubric—scope, boundary, ownership, revision—so you practice defense, not improvisational bragging.",
    expectation: "Practice a timed architecture explanation and honest ownership disclosure; this does not certify independent production implementation skill.",
    boundary: "Interview practice is not a certification of independent implementation skill or production authority.",
    escalation: "Escalate gaps honestly: name the next learning goal or specialist partnership rather than inventing experience.",
    durationMinutes: 60,
    competencies: { communication: 1, architecture: 0.4, aiCollaboration: 0.35, roleJudgment: 0.3 },
    sections: [
      {
        heading: "The four-part rubric",
        body: "Scope: what outcome and users the design serves in one sentence. Boundary: what the system must not do (data, write, autonomy). Ownership: what you personally designed, reviewed, tested, or only observed in a sample. Revision: after a skeptical question, what you would change and what evidence would convince you. Score yourself 0–2 on each; a credible practice pass needs at least 6/8 without inventing production experience.",
      },
      {
        heading: "Timed loop (≈25 minutes on the clock)",
        body: "Minute 0–2: read the prompt and jot scope/boundary. Minute 2–8: explain the design aloud (or in writing) covering request path, authz-before-retrieval, evaluation, and fallback. Minute 8–14: answer two skeptical follow-ups (failure mode + ownership). Minute 14–20: revise the weakest rubric cell using a different structure, not more adjectives. Minute 20–25: restate the final scope and the specialist you would involve next.",
      },
      {
        heading: "Skeptical follow-ups to expect",
        body: "‘What happens when retrieval returns two conflicting current sources?’ ‘Which tests prove unauthorized text never enters the prompt?’ ‘What did you build versus what did you tour?’ ‘Why not an agent that closes tickets?’ Weak answers add tools; strong answers return to boundary, evidence, and owner.",
      },
      {
        heading: "Honest ownership language (do this)",
        body: "Write four lines you could say under pressure: (1) I designed/decided… (2) I implemented or modified… (3) AI suggested… and I changed… (4) I have not yet… and would partner with… Keep each line factual. Then run the timed loop on the fictional ProcedureDesk read-only pilot.",
      },
    ],
    example: "Prompt: defend a read-only procedure assistant for technicians. Scope: cited answers from authorized procedures; abstain when unsupported. Boundary: no writes, no export-controlled sources, authz before retrieval. Ownership: ‘I specified the contract and denial tests; I toured a sample FastAPI app; I have not operated production identity.’ Skeptical ask: conflict between two current procedures. Revision: ‘I would return escalate_conflict with both source IDs and add that case to the eval set before any write tool discussion.’",
    misconceptions: [
      "A strong defense requires claiming you personally built every layer of the stack.",
      "Revision after feedback means your first answer failed; better to defend a weak claim stubbornly.",
      "Listing many frameworks scores higher on the rubric than a clear boundary and ownership split.",
    ],
    source: sources.nist,
    checks: [
      {
        prompt: "Which response best satisfies the ownership cell of the defense rubric?",
        correct: "Separate what you specified, what you toured or generated, what you tested, and what you have not operated yet.",
        distractors: [
          "Claim every sample file in the repository as independent production implementation because you completed the lesson.",
          "Avoid mentioning AI assistance or walkthroughs so the interviewer assumes full authorship by default.",
          "List every framework you recognize and imply hands-on ownership of each without naming a boundary.",
        ],
        misconception: "Ownership is accountable honesty, not maximal credit.",
      },
      {
        prompt: "A skeptical interviewer asks what happens when two current procedures conflict. Which revision improves the answer?",
        correct: "Abstain or escalate with both source IDs, add a conflict case to evaluation, and postpone write-tools until that evidence exists.",
        distractors: [
          "Have the model pick the longer document and present it confidently so the user is not delayed by uncertainty.",
          "Ignore the conflict in the interview because the original happy-path diagram did not show disagreement cases.",
          "Add an autonomous agent loop that edits the procedures until they agree, then close the related tickets.",
        ],
        misconception: "Revision should strengthen boundary and evidence, not add unsafe autonomy.",
      },
      {
        prompt: "What does a timed defense practice certify in this course?",
        correct: "Practice structuring scope, boundary, ownership, and revision under time—not independent production skill certification.",
        distractors: [
          "Authority to deploy the defended design into a live environment without further review or owners.",
          "Proof that every architectural box you named was implemented solely by you in production.",
          "A guarantee that interviewers will not ask about failures, tests, or specialist partnerships.",
        ],
        misconception: "Practice builds performance under pressure; it does not mint production authority.",
      },
    ],
  },
];

export const aioSprintExtensions: CourseModule[] = extensionSeeds.map(extensionModule);

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
  { group: "Computing and systems", title: "Queues and safe caching", competency: "architecture", explanation: "A queue holds work to run later or in parallel so a request path stays responsive. A cache stores a temporary, reusable result under an explicit key and lifetime. Both change failure modes: queues introduce delay, duplication, and poison messages; caches introduce staleness and unauthorized reuse if you cache protected answers.", why: "You can ask the right questions when a prototype needs background jobs or faster repeated lookups—without treating either as a default add-on.", example: "A fictional evaluation job is enqueued with a job id and retry budget. A separate cache stores only non-sensitive, short-lived metadata lookups with a TTL—not full procedure text.", redFlag: "Adding a queue or cache before defining delay, duplicate delivery, staleness, invalidation, and what users see when work is unavailable.", owner: "Service and platform owners", source: sources.opentelemetry },
  { group: "Application engineering", title: "API contracts", competency: "foundations", explanation: "An API contract describes allowed inputs, outputs, errors, and versioned expectations between a caller and a service.", why: "It makes an AI feature an accountable component instead of a prompt that happens to return text.", example: "A fictional triage API accepts a validated incident summary and returns a structured recommendation or a clear abstention.", redFlag: "Letting consumers depend on unvalidated prose or undocumented fields.", owner: "Service owner", source: sources.fastapi },
  { group: "Application engineering", title: "Schemas and validation", competency: "foundations", explanation: "A schema specifies the shape and constraints of structured data. Validation rejects malformed, missing, or unsafe data at a boundary.", why: "Structured outputs, APIs, tools, and evaluation records all rely on clear schemas rather than best-effort parsing.", example: "A fictional model output must include an action type, confidence state, and cited source IDs before a human can review it.", redFlag: "Passing model-generated JSON downstream because it parses without checking required fields or values.", owner: "Service owner", source: sources.fastapi },
  { group: "Application engineering", title: "Relational data", competency: "foundations", explanation: "Relational databases store connected facts such as users, roles, documents, approvals, and audit events with explicit relationships.", why: "You can decide when ordinary data modeling is more appropriate than asking an LLM to infer a deterministic answer.", example: "A fictional approval record links a requester, permitted action, reviewer, timestamp, and outcome.", redFlag: "Using an LLM to answer a query that needs exact, authoritative database state.", owner: "Data or service owner", source: sources.postgres },
  { group: "Application engineering", title: "Authentication and authorization", competency: "security", explanation: "Authentication establishes identity; authorization decides what a known identity may access or do. They are enforced by trusted systems, not user-interface controls or prompts.", why: "Permission-aware retrieval and human-approved actions depend on this boundary.", example: "A fictional engineer authenticates to the service; the service then authorizes only their permitted procedure collection before retrieval.", redFlag: "Retrieving all content and asking the model or frontend to hide restricted passages.", owner: "Identity and security owner", source: sources.owasp },
  { group: "Application engineering", title: "Secrets and least privilege", competency: "security", explanation: "Secrets authenticate systems; least privilege limits each identity or tool to only the access it needs for a defined task.", why: "This prevents a prototype from becoming a broad, unaccountable channel into protected systems.", example: "A fictional read-only assistant has no write credential and cannot choose new tool permissions during a conversation.", redFlag: "Placing credentials in browser code, prompts, repositories, or broadly shared configuration.", owner: "Security and platform owner", source: sources.owasp },
  { group: "Application engineering", title: "Observability and rollback", competency: "production", explanation: "Observability means you can answer what happened using logs, metrics, and traces tied to request or change identifiers. Rollback is the paired control: when signals show harm, you return to a known-good version instead of improvising under pressure.", why: "You need detectable failure and a reversible path before proposing a broader AI rollout.", example: "A fictional model change raises unsupported-answer rate. Metrics and traces show the spike; the team pauses rollout, rolls back to the prior version, and adds the failing cases to evaluation.", redFlag: "Declaring a pilot successful without signals that would detect drift or a path to reverse a harmful change.", owner: "Service owner and incident lead", source: sources.opentelemetry },
  { group: "Applied AI", title: "Tokens and context windows", competency: "foundations", explanation: "Models process input as tokens and have finite context windows. More context can increase cost, latency, distraction, and risk; it does not guarantee better answers.", why: "It lets you discuss prompt and retrieval tradeoffs without treating context size as a quality guarantee.", example: "A fictional assistant receives only the authorized, current passages needed for a question instead of an entire procedure library.", redFlag: "Adding every available document to a prompt because more context must be safer.", owner: "Applied AI or service owner", source: sources.nist },
  { group: "Applied AI", title: "Embeddings and vector search", competency: "architecture", explanation: "Embeddings represent text in a form that supports semantic similarity search. Vector search helps find candidate content; it is not an authorization system or truth guarantee.", why: "You can explain why retrieval has multiple stages and why metadata and permission filters still matter.", example: "A fictional query finds semantically similar procedure chunks only after the requester’s allowed collections are filtered.", redFlag: "Using embedding similarity as a substitute for access control or source freshness.", owner: "Applied AI and data owner", source: sources.nist },
  { group: "Applied AI", title: "Retrieval, reranking, and citations", competency: "architecture", explanation: "RAG retrieves relevant authorized source material, may rerank it, and asks the model to answer from that evidence with citations or abstention.", why: "This is a central architecture pattern for internal knowledge assistants, but it must be evaluated rather than assumed reliable.", example: "A fictional assistant surfaces two current cited procedures and escalates when they conflict instead of silently choosing one.", redFlag: "Treating a citation as proof that the answer is supported, current, or correctly applied.", owner: "Applied AI, content, and policy owners", source: sources.nist },
  { group: "Applied AI", title: "Structured outputs", competency: "foundations", explanation: "Structured output asks a model for data that conforms to a schema. The application must still validate that schema and decide how to handle failure or uncertainty.", why: "It turns an LLM from a prose generator into a bounded participant in a workflow.", example: "A fictional triage result contains a recommended category, cited evidence IDs, uncertainty, and a no-action default when validation fails.", redFlag: "Parsing prose with brittle string logic because the model usually follows the requested format.", owner: "Service owner", source: sources.fastapi },
  { group: "Applied AI", title: "Tools versus agents", competency: "roleJudgment", explanation: "A tool is a bounded capability a model may request (search, validate, draft). An agent loop lets the model choose a sequence of tool calls. Prefer an explicit deterministic workflow when the path is known; reserve open-ended agent loops for genuine uncertainty. Protocols such as MCP describe how tools and context are offered—they do not decide how much autonomy is safe.", why: "You need to choose the smallest autonomy the evidence supports.", example: "A fictional assistant may call retrieve_procedures and format_draft; a human must approve any write. There is no free-form agent loop selecting new tools mid-conversation.", redFlag: "Using an agent loop where a predictable form, search path, or workflow would be safer and easier to test.", owner: "Service, security, and workflow owners", source: sources.owasp },
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
  { group: "Architecture vocabulary", title: "Recognize advanced platforms without defaulting to them", competency: "architecture", explanation: "Kubernetes orchestrates containerized workloads across clusters. Rust is a systems language with strong ownership and memory-safety guarantees. Both solve specific scale and safety problems. Neither is the default answer when a small, reviewed Python service already meets the pilot’s latency, boundary, and ownership needs.", why: "You should recognize when specialists raise these options—and push for evidence before adding platform or language complexity.", example: "A fictional pilot ships a FastAPI service with clear authz and eval gates. A later proposal for Kubernetes or a Rust rewrite requires measured throughput, ops ownership, and a failure mode the current stack cannot handle.", redFlag: "Adding Kubernetes or Rust only to sound advanced before workflow, service boundary, and evidence justify them.", owner: "Platform or systems specialist", source: sources.python },
];

function conceptModule(seed: ConceptSeed, index: number): CourseModule {
  const id = `aio-concept-${String(index + 1).padStart(2, "0")}`;
  const firstSentence = seed.explanation.split(/(?<=\.)\s+/)[0] ?? seed.explanation;
  const retrievalCheck = aioConceptRetrievalChecks[index];
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
    overview: `Recognize ${seed.title}: ${firstSentence}`,
    sections: [
      { heading: "Plain-language meaning", body: seed.explanation },
      { heading: "Why it matters here", body: seed.why },
      { heading: "Fictional operating example", body: seed.example },
      { heading: "Red flag and handoff", body: `${seed.redFlag} In a real organization, involve the ${seed.owner}.` },
    ],
    workedExample: seed.example,
    misconceptions: [seed.redFlag, "Recognizing a concept is the same as being authorized or prepared to operate it independently."],
    knowledgeChecks: [check(`${id}-q1`, seed.competency, retrievalCheck)],
    artifact: knowEvidence,
    rules: [{ id: "concept-boundary", label: "Recognize and escalate", requiredTerms: ["specialist"], minimumMatches: 1 }],
    sources: [seed.source],
    review: draftReview,
    mdxPath: "content/applied-ai-operations/v2/role-concepts-library.mdx",
  };
}

export const aioRoleConcepts = conceptSeeds.map(conceptModule);
export const aioFoundationSources = Object.values(sources);
