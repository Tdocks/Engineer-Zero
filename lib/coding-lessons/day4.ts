import { buildCodingLesson, type CodingLessonPackage } from "../coding-lesson-package";

export const codingLessonsDay4: CodingLessonPackage[] = [
  buildCodingLesson({
    day: 4,
    order: 1,
    competency: "decomposition",
    title: "SCOPE: specify the problem",
    mode: "build",
    sourceIds: ["nistSsdf", "nasaSoftwareHandbook"],
    objective: "Turn an ambiguous request into a bounded prototype brief with inputs, outputs, constraints, and acceptance checks.",
    whyItMatters:
      "Unscoped prototypes grow fake features. A written brief is how you refuse work that does not prove the product assumption.",
    teach: `SCOPE starts with Specify. Ask:
- Who is the user?
- What do they do today?
- What input exists?
- What output would help?
- What is explicitly out of scope?
- How will we know the prototype succeeded?

Convert slogans into contracts. “Summarize shift notes” becomes “extract blockers, owners, and deadlines from fictional notes for human review.”

Misconception: “specification slows builders down.” Unscoped building is faster until review, when you discover you built the wrong thing.

Misconception: “acceptance criteria are for PMs.” If you cannot state a check, you cannot demo honestly.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `Ambiguous ask:
"Make an AI that helps mission handoff."

Specified brief (fictional):
User: outgoing operator → incoming operator
Input: free-text shift notes (fictional)
Output: issues[], owners[], deadlines[], uncertainties[], review_status
Out of scope: real spacecraft data, autonomous commanding, multi-tenant auth
Acceptance:
- schema validates
- at least one end-to-end example note
- human review_status required before any action language
- degraded mode when model unavailable`,
    tryThis:
      "Write inputs, outputs, constraints, and acceptance criteria for a handoff assistant. Keep it to one page. Highlight one feature you are refusing for the prototype.",
    tryThisSteps: [
      "Write inputs, outputs, constraints, and acceptance criteria for a handoff assistant (one page).",
      "Highlight one feature you refuse for the prototype.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `SCOPE one-pager with: inputs / outputs / constraints / acceptance
Refused example: auto-paging on model confidence alone`,
    hint: "If everything is in scope, nothing is a prototype.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-handoff-capstone",
      label: "Open Mission Operations Handoff Assistant",
      why: "The capstone brief expects a bounded scope you can defend under questioning.",
    },
    commonFailures: [
      {
        failure: "Listing features instead of acceptance checks.",
        recovery: "Rewrite each feature as an observable check (“returns review_status field”).",
      },
      {
        failure: "Leaving 'AI' as the product.",
        recovery: "Name the user outcome first; AI is at most one dependency.",
      },
    ],
    checkYourself: [
      {
        question: "What question prevents you from building an unnecessary feature?",
        answer: "What acceptance check proves this feature is needed for the bounded user outcome—and what happens if we omit it?",
      },
      {
        question: "Why include out-of-scope items in the brief?",
        answer: "To prevent silent scope creep and to set honest expectations for reviewers/interviewers.",
      },
    ],
    defensePrompt: "What question prevents you from building an unnecessary feature?",
  }),

  buildCodingLesson({
    day: 4,
    order: 2,
    competency: "architecture",
    title: "SCOPE: choose the simplest architecture",
    mode: "build",
    sourceIds: ["fastapiBody", "nistSsdf"],
    objective: "Select the smallest stack that proves the handoff assumption and explain what you are not building.",
    whyItMatters:
      "Microservices theater is a common interview failure. A small modular monolith with clear boundaries is usually more defensible in a timed prototype.",
    teach: `Prefer:
- one Python service
- FastAPI for HTTP
- in-memory or SQLite for persistence
- one external model dependency behind an interface
- modules: routes / services / schemas (and repository if needed)

Avoid for a 90-minute prototype: Kubernetes, message buses, multi-service meshes, custom UI frameworks that do not prove the contract.

Misconception: “more boxes look more senior.” Senior judgment removes unnecessary boxes.

Choose storage deliberately: in-memory is fine for demo volatility; SQLite if you need a file-backed restart story.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `Candidate architecture:

Client → FastAPI routes → service layer → (optional) repository
                     ↘ model client (extraction only)

Tradeoff note:
- In-memory: fastest, dies on process restart
- SQLite: tiny persistence, still one process

Rejected for interview spike:
- separate extraction microservice
- queue + workers
Reason: they add failure modes without proving the handoff contract first.`,
    tryThis:
      "Choose between in-memory data and SQLite for a 90-minute handoff prototype. Write three bullets: choice, why, and what would make you switch.",
    tryThisSteps: [
      "Choose in-memory vs SQLite for a 90-minute handoff prototype.",
      "Write three bullets: choice, why, what would make you switch.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `Choice: in-memory (or SQLite)
Why: ...
Switch if: multi-process / restart durability needed`,
    hint: "Pick the simplest store that still exercises your real risk (usually approval state).",
    commonFailures: [
      {
        failure: "Designing five services before one request works.",
        recovery: "Implement one vertical slice in one process first.",
      },
      {
        failure: "Hiding the model call inside three abstractions with no interface benefit.",
        recovery: "One model client module with a clear unavailable error path is enough.",
      },
    ],
    checkYourself: [
      {
        question: "Why is a microservice architecture usually a poor first answer here?",
        answer: "It adds distribution overhead before proving the core contract; a timed prototype should minimize unearned complexity.",
      },
      {
        question: "What must the architecture still make obvious?",
        answer: "Where validation, trusted policy, model use, and human approval boundaries live.",
      },
    ],
    defensePrompt: "Why is a microservice architecture usually a poor first answer here?",
  }),

  buildCodingLesson({
    day: 4,
    order: 3,
    competency: "dataInterfaces",
    title: "SCOPE: outline data and behavior",
    mode: "modify",
    sourceIds: ["fastapiBody", "fastapiResponse"],
    objective: "Write input/output schemas, main workflow, and failure cases before coding the handoff assistant.",
    whyItMatters:
      "Schemas prevent ‘draft’ from being confused with ‘approved.’ If review_status is missing, every consumer will invent their own unsafe default.",
    teach: `Outline before typing implementation:
- HandoffIn: notes (string), maybe source metadata
- HandoffOut: issues, owners, urgency, uncertainties, review_status
- Failure cases: empty notes, model unavailable, schema invalid, action requested without approval

Make review_status impossible to skip conceptually: values like \`draft\` vs \`approved\` (exact strings are your choice, but the distinction is not).

Misconception: “I’ll add review_status later.” Later means demos already taught the wrong trust model.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `HandoffIn
- notes: str (min length 1)

HandoffOut
- issues: list[str]
- owners: list[str]
- urgency: "LOW" | "MEDIUM" | "HIGH"
- uncertainties: list[str]
- review_status: "draft" | "approved"

Main workflow:
1) validate input
2) extract draft fields (model or heuristic stub)
3) validate extraction
4) return draft with review_status="draft"
5) approval endpoint/path flips review_status only after human action

Failure: model unavailable → uncertainties include model_unavailable, still draft`,
    tryThis:
      "Sketch a response schema that cannot confuse a draft with an approved action. Include field names and allowed review_status values. Add one failure case row to your sketch.",
    tryThisSteps: [
      "Sketch a response schema that cannot confuse draft with approved action.",
      "List field names and allowed review_status values.",
      "Add one failure-case row to the sketch.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `review_status: draft | approved | rejected
action fields null or blocked unless approved
failure: model proposes write while status=draft → rejected`,
    hint: "Status must be an explicit enum, not implied by prose.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-handoff-capstone",
      label: "Carry the schema into the capstone",
      why: "The capstone comprehension expects an approval boundary you can name precisely.",
    },
    commonFailures: [
      {
        failure: "Using a boolean done=true that mixes 'processed' with 'approved'.",
        recovery: "Separate processing state from human approval state.",
      },
      {
        failure: "Omitting uncertainties because the demo notes are clean.",
        recovery: "Keep the field; empty list is allowed, missing field is not.",
      },
    ],
    checkYourself: [
      {
        question: "Which field proves that a human has reviewed the output?",
        answer: "review_status (or equivalent) transitioning to an approved value via a human-gated action—not model confidence.",
      },
      {
        question: "What should model-unavailable do to review_status?",
        answer: "Leave/keep draft (or equivalent) and record uncertainty; never auto-approve.",
      },
    ],
    defensePrompt: "Which field proves that a human has reviewed the output?",
  }),

  buildCodingLesson({
    day: 4,
    order: 4,
    competency: "testingDebugging",
    title: "SCOPE: produce vertically",
    mode: "build",
    sourceIds: ["pytest", "fastapiBody"],
    objective: "Build one end-to-end path before expanding features, and state what a vertical slice proves—and does not.",
    whyItMatters:
      "Horizontal layering (all routes, then all services, then all tests) delays learning. A vertical slice exposes contract mistakes early and gives you something to demo.",
    teach: `Vertical slice order:
1) request schema
2) one service path
3) response schema
4) one automated test
5) then the next feature

For handoff: POST /handoffs with one fictional note → structured draft → assert review_status is draft.

Misconception: “vertical slice means UI polish.” It means a thin path through real boundaries.

Misconception: “tests come after features.” The first slice includes the first test or it is not done.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `Slice v1 tasks in order:
1. Define HandoffIn/HandoffOut
2. Implement POST /handoffs returning a hard-coded-but-valid draft for one note
3. Test: empty notes → validation error
4. Test: valid notes → review_status == "draft"
5. Only then plug model extraction behind an interface

Non-order (avoid):
- build approval UI
- add search
- add microservices
before the first POST works`,
    tryThis:
      "Put three implementation tasks for the handoff assistant in vertical-slice order. Then write one sentence on what the first passing slice proves and one sentence on what it does not prove.",
    tryThisSteps: [
      "Order three implementation tasks as a vertical slice.",
      "Write one sentence on what the first passing slice proves.",
      "Write one sentence on what it does not prove.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `1) schema + POST draft
2) approval gate
3) audit line
Proves: one request can be drafted safely
Does not prove: production auth or scale`,
    hint: "Horizontal finish-all-models-first is the anti-pattern.",
    commonFailures: [
      {
        failure: "Implementing five endpoints with zero tests.",
        recovery: "Delete scope. Keep one endpoint + two tests until green.",
      },
      {
        failure: "Mocking everything so the slice never exercises validation.",
        recovery: "Include at least one real validation failure test.",
      },
    ],
    checkYourself: [
      {
        question: "What does a passing vertical slice prove—and what does it not prove?",
        answer: "It proves one path through the contract works under the tested cases. It does not prove production readiness, full eval coverage, or security.",
      },
      {
        question: "Why put a test inside the first slice?",
        answer: "To lock the contract immediately and prevent silent drift as you add extraction/approval features.",
      },
    ],
    defensePrompt: "What does a passing vertical slice prove—and what does it not prove?",
  }),

  buildCodingLesson({
    day: 4,
    order: 5,
    competency: "securityReliability",
    title: "SCOPE: evaluate and explain",
    mode: "defend",
    sourceIds: ["nistSsdf", "pytest"],
    objective: "Run tests and write an honest limits list—including degraded mode—before calling the prototype complete.",
    whyItMatters:
      "“It works locally” is a starting observation. Reviewers want assumptions, risks, and the next production decision.",
    teach: `Before you claim completion:
- run unit tests
- exercise invalid input
- exercise model-unavailable behavior
- document out-of-scope items
- name the next production step (authn/z, real data approvals, monitoring, etc.)

Degraded mode is required thinking: if extraction fails, what does the operator still get?

Misconception: “listing limits makes the project look weak.” Hiding limits makes you look untrustworthy.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `Completion checklist (prototype):
[x] pytest green for draft path + empty notes
[x] model unavailable returns uncertainties+=model_unavailable, review_status stays draft
[x] README states fictional data only
[x] Explicit non-goals: real credentials in repo, autonomous commanding

Rollback / degraded behavior:
If model client raises unavailable → continue with heuristic/empty extraction, mark uncertainties, require human review.`,
    tryThis:
      "Write one rollback or degraded-mode behavior for the handoff assistant. Then answer: what would you change before one hundred teams used this service? Give three bullets.",
    tryThisSteps: [
      "Write one rollback or degraded-mode behavior for the handoff assistant.",
      "Answer with three bullets: what you would change before 100 teams used it.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `Degraded: skip model, require human draft, mark model_unavailable
Before 100 teams: authZ, rate limits, eval gates, audit retention`,
    hint: "Name a user-visible fallback, not we will monitor it.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-handoff-capstone",
      label: "Complete capstone evaluation notes",
      why: "The capstone asks for degraded behavior and a production escalation concern.",
    },
    commonFailures: [
      {
        failure: "No degraded mode: hard-fail the whole API when the model is down.",
        recovery: "Prefer draft+uncertainty when the core handoff still needs human eyes.",
      },
      {
        failure: "README only shows happy-path curl.",
        recovery: "Document invalid input and unavailable-model examples too.",
      },
    ],
    checkYourself: [
      {
        question: "What would you change before one hundred teams used this service?",
        answer: "Typical answers: authentication/authorization, tenancy, data retention/governance, observability, SLOs, stronger evals, abuse resistance—not just more prompts.",
      },
      {
        question: "Why run invalid input tests before calling the prototype complete?",
        answer: "Because clients will send bad data; untested validation becomes production noise or false trust.",
      },
    ],
    defensePrompt: "What would you change before one hundred teams used this service?",
  }),

  buildCodingLesson({
    day: 4,
    order: 6,
    competency: "defense",
    title: "Prototype defense under pressure",
    mode: "defend",
    sourceIds: ["githubPr", "nistAiRmf"],
    objective: "Explain a bounded prototype to a skeptical interviewer without overstating readiness, including AI disclosure.",
    whyItMatters:
      "The capstone is not only code—it is your ability to narrate ownership, tests, trust boundaries, and next decisions under follow-up.",
    teach: `Defense outline:
1. User outcome in one sentence
2. Request/response contract
3. Trusted rule boundary vs model boundary
4. Tests you ran
5. Failure / degraded behavior
6. What AI generated and how you verified it
7. Next production decision / escalation

Misconception: “if they like the demo, questions will be easy.” Hard questions are the point. Practice them.

Misconception: “disclose AI assistance only if asked.” Disclose proactively and show your verification method.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `# Capstone defense script
$ # record or speak for ~120 seconds

Two-minute walkthrough script:

"This handoff assistant turns fictional shift notes into a structured draft for human review.
POST /handoffs accepts notes and returns issues, owners, urgency, uncertainties, and review_status.
The model only drafts extractions fields; validation and policy stay in trusted code.
review_status starts as draft; approval is a separate human step.
Tests cover empty input and the draft path; when the model is unavailable we add uncertainties instead of inventing facts.
Copilot/chat helped scaffold boilerplate; I verified behavior with pytest and a manual invalid-input check.
Before production I'd escalate authn/z and real data governance—not more UI chrome."`,
    tryThis:
      "Record or script a two-minute walkthrough using the final capstone outline. Explicitly include: AI disclosure, one test, degraded mode, and one production escalation.",
    tryThisSteps: [
      "Script a two-minute walkthrough of the capstone outline.",
      "Explicitly cover: AI disclosure, one test, degraded mode, one production escalation.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `Walkthrough hits: problem → boundary → demo path → test → degraded → what is NOT production`,
    hint: "If you cannot say what is untrusted, the defense is not ready.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-handoff-capstone",
      label: "Deliver the capstone defense",
      why: "Use the lab’s comprehension requirements as your rehearsal checklist.",
    },
    commonFailures: [
      {
        failure: "Demo-first storytelling with no contract or tests mentioned.",
        recovery: "Lead with user outcome + contract + test evidence, then show the demo.",
      },
      {
        failure: "Claiming job-readiness or production certification from the four-day sprint.",
        recovery: "Keep claims honest: bounded prototype performance and explanation under pressure.",
      },
    ],
    checkYourself: [
      {
        question: "What did AI generate, and how did you verify it?",
        answer: "Name specific assisted parts (boilerplate, draft schema) and verification (tests, manual cases, reading diffs)—not 'I used AI so it’s fine'.",
      },
      {
        question: "What must you not claim at the end of Day 4?",
        answer: "Production readiness, credentialed competence, or safety approval for real operations.",
      },
    ],
    defensePrompt:
      "Record a two-minute walkthrough using the final capstone outline. What did AI generate, and how did you verify it?",
  }),
];
