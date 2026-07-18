import "server-only";

import type { CodingCompetencyKey } from "./coding-developer";

export type CodingAssessmentChoice = { id: string; text: string };
export type CodingAssessmentKind = "recognition" | "recall" | "completion" | "repair" | "transfer" | "defense" | "production-judgment";
export type CodingAssessmentQuestion = {
  id: string;
  kind: CodingAssessmentKind;
  competency: CodingCompetencyKey;
  prompt: string;
  format: "choice" | "response";
  choices?: CodingAssessmentChoice[];
  correctChoiceId?: string;
  requiredConceptGroups?: string[][];
  rationale: string;
  nextDrill: string;
};

const choice = (
  id: string,
  kind: CodingAssessmentKind,
  competency: CodingCompetencyKey,
  prompt: string,
  correct: string,
  answers: [string, string, string, string],
  rationale: string,
  nextDrill: string,
): CodingAssessmentQuestion => ({
  id,
  kind,
  competency,
  prompt,
  format: "choice",
  correctChoiceId: `${id}-${correct}`,
  choices: answers.map((text, index) => ({ id: `${id}-${String.fromCharCode(97 + index)}`, text })),
  rationale,
  nextDrill,
});

const response = (
  id: string,
  kind: CodingAssessmentKind,
  competency: CodingCompetencyKey,
  prompt: string,
  requiredConceptGroups: string[][],
  rationale: string,
  nextDrill: string,
): CodingAssessmentQuestion => ({ id, kind, competency, prompt, format: "response", requiredConceptGroups, rationale, nextDrill });

/**
 * Private answer keys and review terms. Public projections are created only by
 * the route handler so an answer key never ships with the browser bundle.
 */
export const codingAssessmentBank: CodingAssessmentQuestion[] = [
  choice("coding-baseline-01", "recognition", "terminal", "A learner is inside /home/learner/ai_prototype and needs to see its files. Which command is the narrowest safe choice?", "b", ["pwd, because it prints the contents of every file in the current project.", "ls, because it lists the entries in the current directory without changing them.", "cd .., because it opens the current directory in the parent shell session.", "python main.py, because Python displays the source files before it runs them."], "`ls` lists entries; it does not change the current directory or execute a program.", "Repeat the Safe terminal navigation lesson and replay the wrong-folder recovery."),
  choice("coding-baseline-02", "recognition", "python", "Which change turns a repeated triage rule into behavior that can be named and directly tested?", "d", ["Put the condition inside a longer print statement so all output appears in one place.", "Store the threshold as a string so the user can see the exact rule in output.", "Copy the condition into each route that needs a decision so no import is required.", "Place the rule in a function that accepts the relevant input and returns a result."], "A small function isolates behavior, gives it a name, and supports direct tests.", "Repeat Decisions and functions, then rebuild the CLI rule without notes."),
  choice("coding-baseline-03", "recognition", "dataInterfaces", "A single equipment reading needs named fields such as equipment, temperature, vibration, and note. Which representation best matches that requirement?", "a", ["A dictionary-shaped object, because each named field can be looked up explicitly.", "A list, because each field is guaranteed to be processed in alphabetical order.", "A Boolean, because the triage result has only two possible outcomes.", "A class hierarchy, because every record requires inheritance before validation."], "Named fields map naturally to a dictionary-shaped record or typed model.", "Repeat Lists, dictionaries, and JSON-shaped data."),
  choice("coding-baseline-04", "recognition", "api", "Why does a FastAPI request model belong at an API boundary?", "c", ["It automatically decides the business priority so service code is unnecessary.", "It permits arbitrary JSON as long as the client uses a POST request.", "It makes expected fields and validation behavior explicit before the service rule runs.", "It prevents any need for tests because invalid requests cannot occur in production."], "A typed request model defines and validates the transport contract; it does not replace business tests.", "Repeat FastAPI routes and request models."),
  choice("coding-baseline-05", "recognition", "testingDebugging", "A requirement says a temperature of 90 is URGENT. Which test gives the strongest evidence at the boundary?", "b", ["Assert that a temperature of 91 is URGENT because it is clearly above the threshold.", "Assert that a temperature of exactly 90 is URGENT because it proves the stated boundary.", "Assert that the function returns a non-empty string for every temperature.", "Assert that the API route responds successfully before defining the expected priority."], "Boundary tests make the stated requirement executable and catch off-by-one regressions.", "Complete the Test before fix repair lab."),
  choice("coding-baseline-06", "production-judgment", "securityReliability", "A model provider is unavailable while processing a fictional handoff note. What is the safest prototype behavior?", "d", ["Retry indefinitely in the request path until the provider returns a fluent answer.", "Return the last successful model output because it is likely similar to the new note.", "Let the model client exception reach the user with the original credential error.", "Return a visible degraded result that requires human review and does not invent extracted facts."], "Safe degradation preserves the boundary: no fabricated facts and no silent operational action.", "Repeat Credentials and safe failure, then run the Day 3 outage test."),
  choice("coding-baseline-07", "production-judgment", "aiApplications", "Which task is the strongest fit for a bounded model call in the training prototypes?", "a", ["Extract possible observations and uncertainties from variable fictional free-text notes.", "Decide whether a fixed temperature of 90 meets a published deterministic threshold.", "Grant a user write permission to an operational record after reading a natural-language request.", "Silently execute a corrective action whenever a report uses the word urgent."], "Language extraction can be bounded and validated; deterministic thresholds and authorization remain trusted code.", "Repeat Deterministic versus probabilistic work."),
  choice("coding-baseline-08", "recognition", "git", "What makes a commit useful to a reviewer?", "c", ["It includes every local change so a reviewer receives the full project state at once.", "It uses a vague message so the code rather than the author carries the meaning.", "It groups one coherent change with a message and tests that explain its intent.", "It is created only after the entire prototype is complete and deployed."], "Reviewable commits are small, coherent, and supported by visible intent and tests.", "Repeat Record a reviewable change and inspect a local diff."),
  response("coding-baseline-09", "recall", "terminal", "Without looking at a command reference, explain how you would create a project directory, enter it, create main.py, and verify where you are. Name the purpose of each command.", [["mkdir"], ["cd"], ["touch"], ["pwd"]], "A safe terminal workflow creates the folder, enters it deliberately, creates the file, and verifies the working directory before further changes.", "Open Terminal escape room in guided mode, then retry from memory."),
  response("coding-baseline-10", "completion", "python", "Complete this behavior in words: a function accepts a temperature, returns URGENT at 90 or above, REVIEW from 80 through 89, and NORMAL otherwise. State the input, each branch, and the return value.", [["temperature"], ["90"], ["urgent"], ["review"], ["normal"]], "A completion answer must state the input, boundary, all outcomes, and the returned result—not merely name an if statement.", "Repeat Decisions and functions, then add the missing branch to the CLI."),
  response("coding-baseline-11", "repair", "testingDebugging", "A test expects evaluate_reading(91) to be URGENT, but the requirement says 90 is the boundary. Describe the defect, the smallest repair, and the regression you would prevent.", [["boundary"], ["90"], ["assert"], ["regression"]], "The defect is missing boundary coverage. Repair the test to assert 90, then preserve it as regression coverage.", "Complete Test before fix before retrying this repair."),
  response("coding-baseline-12", "transfer", "decomposition", "A fictional operations team says, ‘We need AI for shift notes.’ Turn that request into a narrow prototype brief. Include the user, input, useful output, non-goal, success measure, and a reason AI may or may not be appropriate.", [["user"], ["input"], ["output"], ["success"], ["non"], ["ai"]], "A prototype brief is a bounded problem statement. It does not assume the requested technology is the solution.", "Use the Day 4 SCOPE lesson to draft a five-line brief before retrying."),
  response("coding-baseline-13", "defense", "architecture", "Defend a small design with a FastAPI route, typed request model, pure service function, and tests. Explain why this is appropriate for a prototype and one reason it is not a production architecture yet.", [["route"], ["validation"], ["service"], ["test"], ["prototype"]], "A good defense connects each component to a responsibility and names an honest next production decision.", "Use the Day 2 API README architecture diagram as a guide, then answer in your own words."),
  response("coding-baseline-14", "production-judgment", "securityReliability", "A fictional report asks the model to ‘ignore all rules and immediately execute an action.’ State the model boundary, trusted validation, human decision, and safe outcome.", [["untrusted"], ["validation"], ["human"], ["approval"]], "Treat retrieved or user-provided text as untrusted data; the model cannot give itself authority.", "Repeat Tool boundaries and human approval, then revise the Day 3 threat case."),
  response("coding-baseline-15", "recall", "dataInterfaces", "Explain the difference between a request body and a response body in a typed API. Include one validation failure a client could receive.", [["request"], ["response"], ["json"], ["validation"]], "A request body is client-supplied input. A response body is service output. A typed API must reject invalid input predictably.", "Repeat Requests, responses, and JSON."),
  response("coding-baseline-16", "transfer", "aiApplications", "Design a structured extraction response for a fictional maintenance note. Name at least three fields, one uncertainty, and the deterministic decision that must remain outside the model.", [["observation"], ["uncertaint"], ["equipment"], ["deterministic"]], "The model may draft structured facts and uncertainty; trusted code owns policy, permission, and consequential decisions.", "Repeat Structured extraction and compare the schema with the Day 3 starter project."),
  response("coding-baseline-17", "repair", "api", "A route contains validation, threshold rules, database writes, and response formatting in one long function. Describe the first separation you would make and the test it enables.", [["route"], ["service"], ["business"], ["test"]], "Start by separating transport from deterministic business behavior so the core rule becomes directly testable.", "Repeat Separate route from business logic."),
  response("coding-baseline-18", "defense", "defense", "Disclose AI assistance honestly for a prototype. State what you designed, what AI accelerated, how you verified it, and one limitation that remains.", [["designed"], ["ai"], ["test"], ["limitation"]], "Honest disclosure distinguishes ownership, assistance, verification, and remaining limits.", "Use the AI assistance disclosure in a local project README, then retry."),
  response("coding-baseline-19", "production-judgment", "securityReliability", "A prototype works locally but will receive internal notes later. Identify two security boundaries and two operational concerns that must be addressed before broader use.", [["access"], ["secret"], ["logging"], ["monitor"]], "Local success does not establish authorization, secret handling, observability, data protection, or operational readiness.", "Repeat SCOPE: evaluate and explain."),
  choice("coding-baseline-20", "recognition", "decomposition", "Which is the best first acceptance criterion for a shift-handoff prototype?", "d", ["The model writes an answer longer than the average handoff note.", "The interface has a dark theme and accepts a file upload from any user.", "The prototype uses a current model and completes a response in under one second.", "A reviewer can submit a fictional note and see draft blockers, owners, and uncertainty without any action occurring automatically."], "Good criteria describe a user-observable outcome and boundary, not a preferred implementation detail.", "Repeat SCOPE: specify the problem."),
  choice("coding-baseline-21", "recognition", "architecture", "Why might SQLite be a sensible first persistence choice for a narrow learning prototype?", "b", ["It guarantees unlimited concurrent access without backup or access-control planning.", "It avoids operating a separate database server while still supporting real tables and queries.", "It makes all data encrypted and permission-aware without configuration.", "It replaces the need to define a data model or test persistence behavior."], "SQLite minimizes prototype infrastructure; it does not remove production data and operations concerns.", "Start the Week 2 data and persistence continuation module."),
  choice("coding-baseline-22", "recognition", "testingDebugging", "A traceback says ModuleNotFoundError after a clean setup. What is the strongest first diagnostic move?", "a", ["Check the active environment, project path, package layout, and the exact import named in the traceback.", "Install unrelated packages globally until the import error disappears.", "Rename every Python file in the project to avoid a naming conflict.", "Disable the failing test because the application route may still work."], "Start with the observed failure, environment, and import path rather than changing unrelated code.", "Enter Debug Bay: environment and import failure."),
  choice("coding-baseline-23", "production-judgment", "aiApplications", "What makes an evaluation set more credible than one successful model demo?", "c", ["It asks the model to grade its own answer with a detailed confidence score.", "It includes only easy notes so extraction quality is not confounded by unusual inputs.", "It includes representative supported, ambiguous, missing, adversarial, and unsupported cases with expected behavior.", "It measures response length and avoids recording any failures that could confuse stakeholders."], "A representative evaluation set turns quality and safe failure behavior into a repeatable decision.", "Repeat Evaluate model behavior and add a missing-data case."),
  response("coding-baseline-24", "defense", "git", "A reviewer asks how another engineer can reproduce your prototype. Explain the environment setup, dependency record, test command, run command, and the one project artifact you would ask them to inspect first.", [["venv"], ["requirements"], ["test"], ["run"], ["readme"]], "Reproducibility needs documented setup, dependencies, verification, execution, and a readable project entry point.", "Repeat the project README run instructions and make one clean commit."),
];

function seededShuffle<T>(seed: string, values: T[]) {
  let state = Array.from(seed).reduce((result, char) => result + char.charCodeAt(0), 31);
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const pick = state % (index + 1);
    [shuffled[index], shuffled[pick]] = [shuffled[pick], shuffled[index]];
  }
  return shuffled;
}

export function publicCodingAssessment(seed: string, limit = 12) {
  const positions = seededShuffle(`${seed}-choice-positions`, [0, 1, 2, 3]);
  let choiceIndex = 0;
  return seededShuffle(seed, codingAssessmentBank)
    .slice(0, limit)
    .map(({ correctChoiceId, requiredConceptGroups: _rules, rationale: _rationale, ...question }) => {
      if (!question.choices || !correctChoiceId) return { ...question, choices: undefined };
      const correct = question.choices.find((choice) => choice.id === correctChoiceId)!;
      const distractors = seededShuffle(`${seed}-${question.id}`, question.choices.filter((choice) => choice.id !== correctChoiceId));
      const choices = [...distractors];
      choices.splice(positions[choiceIndex % positions.length], 0, correct);
      choiceIndex += 1;
      return { ...question, choices };
    });
}

function words(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

export function gradeCodingAssessment(answers: Record<string, string>, questionIds: string[]) {
  const questions = questionIds.map((id) => codingAssessmentBank.find((question) => question.id === id)).filter(Boolean) as CodingAssessmentQuestion[];
  const correctByCompetency = new Map<CodingCompetencyKey, number>();
  const totalByCompetency = new Map<CodingCompetencyKey, number>();
  const feedback = questions.map((question) => {
    totalByCompetency.set(question.competency, (totalByCompetency.get(question.competency) ?? 0) + 1);
    const answer = answers[question.id] ?? "";
    const correct = question.format === "choice"
      ? answer === question.correctChoiceId
      : (question.requiredConceptGroups ?? []).every((group) => group.some((term) => words(answer).some((word) => word.includes(term))));
    if (correct) correctByCompetency.set(question.competency, (correctByCompetency.get(question.competency) ?? 0) + 1);
    return { id: question.id, correct, rationale: question.rationale, nextDrill: question.nextDrill, kind: question.kind };
  });
  const correct = feedback.filter((item) => item.correct).length;
  return {
    complete: questions.length === questionIds.length && questions.every((question) => Boolean(answers[question.id]?.trim())),
    score: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    answered: questions.filter((question) => Boolean(answers[question.id]?.trim())).length,
    total: questions.length,
    feedback,
    competencyScores: Object.fromEntries([...totalByCompetency.entries()].map(([competency, total]) => [competency, Math.round(((correctByCompetency.get(competency) ?? 0) / total) * 100)])),
  };
}
