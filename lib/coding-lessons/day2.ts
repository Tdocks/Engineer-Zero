import { buildCodingLesson, type CodingLessonPackage } from "../coding-lesson-package";

export const codingLessonsDay2: CodingLessonPackage[] = [
  buildCodingLesson({
    day: 2,
    order: 1,
    competency: "terminal",
    title: "Cold rebuild and environments",
    mode: "repair",
    sourceIds: ["pythonVenv"],
    objective: "Recreate a Day 1-style project startup using an isolated virtual environment and explain why global installs are risky.",
    whyItMatters:
      "If every project shares one global Python site-packages folder, dependency versions collide and “works on my machine” becomes un-debuggable. A venv is a cheap boundary.",
    teach: `A virtual environment is a project-local Python plus a project-local package directory. Creating one does not install your app logic; it creates an isolated place to install tools like pytest or FastAPI for that project.

Typical flow:
1. Create: \`python -m venv .venv\`
2. Activate (Unix-like): \`source .venv/bin/activate\`
3. Install project needs into that environment
4. Run: \`python main.py\` or \`pytest\`

Misconception: “venv is Docker.” It is not an OS container. It mainly isolates Python packages and the interpreter symlink for a project.

Misconception: “activation is permanent.” Activation updates your current shell session. New terminals need activation again (or an explicit path to \`.venv/bin/python\`).

Cold rebuild practice means you can recreate the startup path from memory: where the project lives, how the environment is created, how you verify which Python is active (\`which python\` / \`python -V\`).

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `$ cd equipment-triage-api
$ python -m venv .venv
$ source .venv/bin/activate
$ which python
/.../equipment-triage-api/.venv/bin/python

$ python -m pip install fastapi uvicorn pytest
$ python -c "import fastapi; print('ok')"
ok

Deactivate when switching projects:
$ deactivate

If \`which python\` still points outside .venv after activation, stop and fix activation before installing packages globally by accident.`,
    tryThis:
      "Write the environment setup commands for your OS without notes: create .venv, activate it, verify which python, install nothing yet. Then state one sentence on why a second project should not reuse the first project's venv.",
    tryThisSteps: [
      "Write create-venv / activate / which-python commands for your OS from memory.",
      "State one sentence why a second project should not reuse this venv.",
      "Write a 4-line notes block: built / assumption / failure / verify.",
    ],
    expectedOutput: `$ python3 -m venv .venv
$ source .venv/bin/activate   # Windows: .venv\Scripts\activate
$ which python
.../.venv/bin/python`,
    hint: "Activate before which python. If which still points outside .venv, activation failed.",
    commonFailures: [
      {
        failure: "Installing packages before activation.",
        recovery: "Check which python. Activate, reinstall into .venv, and verify import inside that interpreter.",
      },
      {
        failure: "Committing a huge .venv to git by accident.",
        recovery: "Keep .venv local and ignored. Commit requirements or lock metadata, not the environment tree.",
      },
    ],
    checkYourself: [
      {
        question: "Why not install every project package globally?",
        answer: "Versions conflict across projects and break reproducibility; a venv keeps each project's dependencies isolated and explicit.",
      },
      {
        question: "What command proves activation worked?",
        answer: "which python (or an equivalent) showing the path under .venv/bin (or Scripts on Windows).",
      },
    ],
    defensePrompt: "Why not install every project package globally? Answer with one failure mode a venv prevents.",
  }),

  buildCodingLesson({
    day: 2,
    order: 2,
    competency: "dataInterfaces",
    title: "Requests, responses, and JSON",
    mode: "observe",
    sourceIds: ["fastapiBody"],
    objective: "Describe the client/service contract for a triage POST, including success and invalid-request categories.",
    whyItMatters:
      "If you cannot name method, path, body, status code, and response shape, you cannot test an API—you can only click around and hope.",
    teach: `A client sends an HTTP request: method, path, headers, and optional body. A service decides whether the request is acceptable, then returns a status code and response body.

JSON is a data interchange format, not validation. A JSON body can be well-formed and still wrong for your policy (missing equipment name, temperature as a string, extra unknown fields depending on config).

For triage:
- Success path: valid ReadingIn → evaluate → TriageOut with 200
- Client error path: invalid body → 422/400-style validation failure (framework-dependent details)
- Do not return NORMAL as a way to mean “bad request”

Misconception: “if JSON parses, the request is valid.” Parsing is necessary, not sufficient. Schema validation and business rules are separate layers.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `Client intent:
POST /triage
Content-Type: application/json
{"equipment":"pump-7","temperature":94}

Happy-path response (conceptual):
200 OK
{"equipment":"pump-7","level":"URGENT"}

Invalid request example:
POST /triage
{"equipment":"","temperature":"hot"}

Expected category: client error / validation failure
Not expected: {"level":"NORMAL"} pretending the reading was fine

Contract checklist:
- route + method
- required fields
- types
- success status + body
- invalid body behavior`,
    tryThis:
      "Build a request for a missing equipment name and predict the response category (success vs client validation failure). Write the JSON body, the field that fails, and what the client should NOT receive as a triage level.",
    tryThisSteps: [
      "Write a JSON request body with a missing equipment name.",
      "Predict success vs client validation failure and name the failing field.",
      "State what triage level the client must NOT receive for that bad request.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `POST /triage
{ "equipment": "", "temperature": 94 }
→ 4xx validation failure
→ no URGENT/REVIEW/NORMAL body pretending success`,
    hint: "Empty string is still a present key—validation should reject it before service rules run.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-triage-api",
      label: "Open Equipment Triage API",
      why: "You will turn this contract into typed FastAPI models and a testable service boundary.",
    },
    commonFailures: [
      {
        failure: "Returning 200 NORMAL for invalid JSON fields.",
        recovery: "Keep validation errors separate from triage labels. Invalid input is not a reading.",
      },
      {
        failure: "Documenting only the happy path.",
        recovery: "Always specify one invalid body and the expected failure category.",
      },
    ],
    checkYourself: [
      {
        question: "Why is an invalid request a client error rather than a normal triage result?",
        answer: "Because the service never received a trustworthy reading to classify; failing validation is not the same as judging risk as NORMAL.",
      },
      {
        question: "What does JSON validation still not guarantee?",
        answer: "That values make operational sense beyond types/shape—e.g., business rules, auth, and downstream policy still matter.",
      },
    ],
    defensePrompt: "Why is an invalid request a client error rather than a normal triage result?",
  }),

  buildCodingLesson({
    day: 2,
    order: 3,
    competency: "api",
    title: "FastAPI routes and request models",
    mode: "build",
    sourceIds: ["fastapiBody", "fastapiResponse"],
    objective: "Create a typed POST /triage route that accepts a validated request model and returns a typed result.",
    whyItMatters:
      "Typed request models make the contract executable. They catch missing fields early and generate documentation you can actually show in a review.",
    teach: `FastAPI uses annotated models (commonly Pydantic) to parse and validate request bodies. A route handler should declare what it accepts and what it returns.

Minimal shape:
- \`ReadingIn\` with equipment + temperature
- \`TriageOut\` with equipment + level (or equivalent)
- \`@app.post("/triage")\` handler that calls business logic

Prefer rejecting empty equipment names at the model boundary (constraints / validators) so illegal requests never reach triage logic.

Misconception: “dict in, dict out is fine for prototypes.” It is fast to type and slow to trust. You lose field errors, docs, and a clear boundary for tests.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class ReadingIn(BaseModel):
    equipment: str = Field(min_length=1)
    temperature: float

class TriageOut(BaseModel):
    equipment: str
    level: str

def evaluate_reading(temperature: float) -> str:
    if temperature >= 90:
        return "URGENT"
    if temperature >= 80:
        return "REVIEW"
    return "NORMAL"

@app.post("/triage", response_model=TriageOut)
def triage(reading: ReadingIn) -> TriageOut:
    return TriageOut(equipment=reading.equipment, level=evaluate_reading(reading.temperature))`,
    tryThis:
      "Add or tighten a field constraint that rejects an empty equipment name. State whether the rejection happens in the model layer or the service layer, and why that choice matters.",
    tryThisSteps: [
      "Add or tighten a constraint that rejects empty equipment names.",
      "Name whether rejection lives in the model layer or the service layer.",
      "Write one sentence on why that layer choice matters.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `ReadingIn.equipment: min_length=1 (or equivalent)
Empty name → request validation error before evaluate_reading runs`,
    hint: "Prefer model constraints so every route gets the same guard for free.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-triage-api",
      label: "Build the typed /triage endpoint",
      why: "The lab requires FastAPI + BaseModel signals and a comprehension of validation vs service ownership.",
    },
    commonFailures: [
      {
        failure: "Putting threshold logic inside Field validators.",
        recovery: "Keep transport validation in the model; keep triage policy in evaluate_reading/service code.",
      },
      {
        failure: "Forgetting response_model and returning an ad-hoc dict.",
        recovery: "Declare TriageOut so response shape stays honest under change.",
      },
    ],
    checkYourself: [
      {
        question: "Why prefer a typed request model to a raw dictionary at the API boundary?",
        answer: "It validates shape/types, documents the contract, and keeps illegal requests out of business logic.",
      },
      {
        question: "Where should an empty equipment name be rejected?",
        answer: "At request validation (model constraints), before triage rules run.",
      },
    ],
    defensePrompt: "Why prefer a typed request model to a raw dictionary at the API boundary?",
  }),

  buildCodingLesson({
    day: 2,
    order: 4,
    competency: "api",
    title: "Separate route from business logic",
    mode: "modify",
    sourceIds: ["fastapiBody"],
    objective: "Keep deterministic triage rules in a service function that can be tested without starting a web server.",
    whyItMatters:
      "If thresholds live inside the route, every test must go through HTTP. That is slower, noisier, and encourages under-testing boundaries.",
    teach: `Split responsibilities:
- Route: HTTP status, parsing, response model wiring
- Service: deterministic domain rules
- (Later) Repository: persistence

For Day 2, moving \`evaluate_reading\` into a service module is enough. The route becomes a thin adapter.

Misconception: “separation is only for large systems.” Small prototypes benefit first because tests become trivial and CLI/API can share the same function.

Misconception: “I’ll extract after it works.” Extraction after spaghetti is more expensive. Draw the boundary while the file is still short.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `# services.py
def evaluate_reading(temperature: float) -> str:
    if temperature >= 90:
        return "URGENT"
    if temperature >= 80:
        return "REVIEW"
    return "NORMAL"

# main.py (route)
@app.post("/triage")
def triage(reading: ReadingIn) -> TriageOut:
    level = evaluate_reading(reading.temperature)
    return TriageOut(equipment=reading.equipment, level=level)

# tests can import evaluate_reading directly—no TestClient required for rule unit tests`,
    tryThis:
      "Move threshold logic out of a route into a service function. List two tests you can now write without HTTP and one test that still needs the route layer.",
    tryThisSteps: [
      "Move threshold logic from the route into a service function.",
      "List two tests you can write without HTTP.",
      "List one test that still needs the route / TestClient layer.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `services.evaluate_reading(90) → 'URGENT'
route only wires ReadingIn → service → TriageOut`,
    hint: "If thresholds remain in the route decorator body, you have not finished the extraction.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-triage-api",
      label: "Apply the service boundary in Code Lab",
      why: "Your comprehension prompt asks which layer owns the threshold rule.",
    },
    commonFailures: [
      {
        failure: "Copy-pasting evaluate_reading into both route and tests differently.",
        recovery: "One service function, imported by route and tests.",
      },
      {
        failure: "Testing only through TestClient and never calling the service.",
        recovery: "Add direct unit tests for 80/90 boundaries first.",
      },
    ],
    checkYourself: [
      {
        question: "Why test the service function before testing every rule through HTTP?",
        answer: "It is faster, isolates policy bugs from transport noise, and gives precise failure messages on thresholds.",
      },
      {
        question: "What belongs in the route after extraction?",
        answer: "Request/response wiring and calling the service—not threshold arithmetic.",
      },
    ],
    defensePrompt: "Why would testing the service function first be faster than testing every rule through HTTP?",
  }),

  buildCodingLesson({
    day: 2,
    order: 5,
    competency: "testingDebugging",
    title: "Tests as evidence",
    mode: "build",
    sourceIds: ["pytest"],
    objective: "Write pytest cases for normal, boundary, and invalid behavior—and explain what a suite does not prove.",
    whyItMatters:
      "A demo can lie. A small suite makes one behavioral claim at a time and catches regressions when thresholds change.",
    teach: `A useful test asserts one meaningful behavior. Name tests after the requirement, not after the implementation whim.

Minimum set for triage rules:
- normal case (e.g., 70 → NORMAL)
- urgent boundary (90 → URGENT)
- review boundary (80 → REVIEW)
- invalid input path (if parsing is in scope)

Misconception: “tests prove correctness.” Tests prove the cases you wrote. They are evidence against known requirements, not a certificate of perfection.

Misconception: “one happy-path test is enough for a prototype.” Boundary bugs are the usual production foot-gun.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `from services import evaluate_reading

def test_high_temperature_is_urgent():
    assert evaluate_reading(94) == "URGENT"

def test_urgent_boundary_is_inclusive():
    assert evaluate_reading(90) == "URGENT"

def test_review_boundary_is_inclusive():
    assert evaluate_reading(80) == "REVIEW"

def test_cool_reading_is_normal():
    assert evaluate_reading(70) == "NORMAL"

$ pytest -q
....                                                                   [100%]`,
    tryThis:
      "Add a boundary test for exactly 90 and an invalid-input test (at parsing layer or API layer). Name the regression each test is meant to catch.",
    tryThisSteps: [
      "Add a boundary test for temperature == 90.",
      "Add an invalid-input test at parse or API layer.",
      "Name the regression each test is meant to catch.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `assert evaluate_reading(90) == 'URGENT'
invalid body / non-numeric temperature → 4xx or ValueError (not NORMAL)`,
    hint: "Boundaries are where off-by-one policies hide. Test the exact edges you claim.",
    bridgeToLab: {
      workspace: "lab",
      challengeId: "coding-test-repair",
      label: "Open Test before fix",
      why: "Practice repairing a suite that missed the 90-degree boundary.",
    },
    commonFailures: [
      {
        failure: "Only testing 91 and calling the boundary 'covered'.",
        recovery: "Test exactly 90. Off-by-one lives on the edge.",
      },
      {
        failure: "Asserting vague truthiness instead of exact labels.",
        recovery: "Assert == 'URGENT' (or the exact contract string).",
      },
    ],
    checkYourself: [
      {
        question: "Which test would catch the most likely regression after changing a threshold?",
        answer: "An explicit boundary test at the old/new threshold (e.g., 90), not only a far-away happy path.",
      },
      {
        question: "What does a green suite not prove?",
        answer: "Unwritten requirements, production readiness, security, or behavior under untested inputs.",
      },
    ],
    defensePrompt: "Which test would catch the most likely regression after changing a threshold?",
  }),

  buildCodingLesson({
    day: 2,
    order: 6,
    competency: "git",
    title: "Record a reviewable change",
    mode: "defend",
    sourceIds: ["githubPr"],
    objective: "Stage a coherent change, write a commit message that states intent, and list what a reviewer still needs beyond the diff.",
    whyItMatters:
      "If your history is noise, reviewers cannot trust your prototype story. A reviewable commit is part of engineering communication, not bureaucracy.",
    teach: `A commit should capture one coherent intent: “Add triage boundary tests,” not “stuff” plus formatting plus an unrelated rename.

Basic loop:
- \`git status\` — what changed
- \`git diff\` — what the change actually is
- \`git add <files>\` — stage intentionally
- \`git commit -m "..."\` — record why

Pull requests (when used) add human review context: intent, test evidence, risks, screenshots/logs as needed.

Misconception: “commit message describes the files.” Prefer describing the user-visible or reviewer-visible intent.

Misconception: “prototype work doesn’t need history.” Interview and team settings both punish irreproducible changes.

Practice note: do not skim this lesson as a definition card. Re-state the objective in your own words, complete the Try this prompt with a visible artifact (commands, code, or written brief), then answer the Check yourself items without looking. If you cannot explain the worked example out loud, re-run it before marking the session complete. The Code Lab or Systems Lab bridge is where you prove the same idea under a tighter contract—use it the same day while the explanation is still fresh.`,
    workedExample: `$ git status
modified:   app/services.py
modified:   tests/test_services.py

$ git diff
# show threshold and test changes only

$ git add app/services.py tests/test_services.py
$ git commit -m "Add inclusive 90C urgent boundary tests"

Reviewer still needs:
- why the boundary changed
- how you validated (pytest output)
- any remaining risks (API validation not covered, etc.)`,
    tryThis:
      "Write a commit message for an API validation fix that rejects empty equipment names. Include a 3-bullet reviewer checklist you would paste into a PR description.",
    tryThisSteps: [
      "Write a commit message for rejecting empty equipment names.",
      "Add a 3-bullet reviewer checklist for the PR description.",
      "Write a 4-line notes block.",
    ],
    expectedOutput: `feat: reject empty equipment names on /triage

- model constraint
- test for empty string
- no service change required`,
    hint: "Subject line states the user-visible behavior; body lists evidence a reviewer can check.",
    commonFailures: [
      {
        failure: "Staging unrelated files with the feature change.",
        recovery: "Use git status/diff, add paths intentionally, unstage noise.",
      },
      {
        failure: "Commit message: 'update'.",
        recovery: "State the behavior change in present imperative: 'Reject empty equipment names in ReadingIn'.",
      },
    ],
    checkYourself: [
      {
        question: "What would a reviewer need besides the changed code?",
        answer: "Intent, how to test, observed results, and known risks/limitations.",
      },
      {
        question: "What makes a commit coherent?",
        answer: "One intent with related files; no unrelated refactors mixed in without note.",
      },
    ],
    defensePrompt: "What would a reviewer need besides the changed code?",
  }),
];
