import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  accountabilityStatus,
  emptyLearnerState,
  graduationStatus,
  normalizeLearnerState,
  reviewText,
  trackReadiness,
} from "./learning";
import { tracks } from "./tracks";
import { aioContentCounts, validateAioContent } from "./content-validation";
import { gradeCourseAttempt } from "./aio-grade";
import { aioMissions, aioModules } from "./aio-content";
import { aioBaseline, shuffledAioBaseline } from "./aio-baseline";
import { aioPublicCatalog } from "./aio-public-catalog";
import { aioFoundationModules, aioRoleConcepts } from "./aio-foundation";
import { recommendAioFoundationStart } from "./aio-foundation-path";
import {
  codingChallenges,
  codingDayPlans,
  codingDeveloperProgram,
  codingSources,
  codingBadges,
  codingConcepts,
  codingConceptRecords,
  codingRecoveryPlan,
  codingLessons,
  codingMastery,
  codingReadiness,
  codingGraduationStatus,
  emptyCodingProgress,
  reviewScheduleForLesson,
  validateCodingProgram,
} from "./coding-developer";
import { codingAssessmentBank, gradeCodingAssessment, publicCodingAssessment } from "./coding-assessment";
import { createCodingExecutionProvider, validateExecutionRequest } from "./coding-execution";
import { codingBossBattles, reviewBossBattle } from "./coding-boss-battles";
import { classifyTutorError, codingTutorResponse } from "./coding-tutor";
import { reviewCodingGitChange } from "./coding-git-review-rubric";
import { reviewCodingTests } from "./coding-test-review-rubric";
import { reviewCodingModelStrategy } from "./coding-model-strategy-rubric";
import { reviewCodingMachineFlow } from "./coding-machine-flow-rubric";
import { codingTerminalStatus, initialCodingTerminalSession, runCodingTerminalCommand } from "./coding-terminal";
import { codingInterviewPrompts } from "./coding-interview-prompts";
import { reviewCodingInterview, reviewRequirementChangeInterview } from "./coding-interviews";
import { reviewCodingChallenge, validateCodingChallengeRubrics } from "./coding-challenge-review";
import { codingCatalogPublicationStatus, codingSourceReviewReport } from "./coding-source-governance";
import { codingReviewBoardPrompts } from "./coding-review-board-prompts";
import { reviewCodingBoardResponse } from "./coding-review-board";
import { codingEvaluationCases, scoreCodingEvaluation } from "./coding-evaluation";
import { codingToolWorkflowCases, toolWorkflowOptionsFor } from "./coding-tool-workflow";
import { reviewToolWorkflow } from "./coding-tool-workflow-review";
import { codingContextBudget, codingContextChunks, selectedContextTokens } from "./coding-context-window";
import { reviewCodingContextWindow } from "./coding-context-window-review";

describe("Engineer Zero track engine", () => {
  it("migrates existing learner records to Premium Academy preferences and drafts", () => {
    const migrated = normalizeLearnerState({
      activeTrack: "applied-ai-operations",
      progress: {},
      projects: [],
      answers: {},
      enrolled: ["applied-ai-operations"],
    });
    expect(migrated.preferences.theme).toBe("system");
    expect(migrated.courseDrafts).toEqual({});
  });

  it("ships both active tracks with full interview banks", () => {
    expect(Object.keys(tracks)).toHaveLength(2);
    expect(tracks["applied-ai-operations"].interviewQuestions).toHaveLength(
      150,
    );
    expect(tracks["it-support-technician"].interviewQuestions).toHaveLength(
      150,
    );
  });

  it("ships a source-mapped shared coding program rather than a third career track", () => {
    expect(codingDeveloperProgram.id).toBe("coding-developer");
    expect(codingLessons).toHaveLength(24);
    expect(codingChallenges).toHaveLength(6);
    expect(codingDayPlans.every((day) => day.focusedHours === 10 && day.cadence.length >= 6)).toBe(true);
    expect(codingChallenges.every((challenge) => Boolean(challenge.comprehensionPrompt) && challenge.comprehensionRequirements.length >= 4)).toBe(true);
    expect(new Set(codingLessons.map((lesson) => lesson.day))).toEqual(
      new Set([1, 2, 3, 4]),
    );
    expect(new Set(codingLessons.map((lesson) => lesson.mode))).toEqual(
      new Set(["observe", "modify", "complete", "repair", "build", "defend"]),
    );
    expect(validateCodingProgram()).toEqual([]);
    expect(validateCodingChallengeRubrics()).toEqual([]);
    expect(codingConcepts.every((concept) => concept.sourceIds.length > 0 && Boolean(concept.escalation))).toBe(true);
    expect(codingConceptRecords.every((record) => record.officialSources.length > 0 && record.officialSources.every((source) => source.revalidateBy && source.deprecationStatus) && record.assessmentIds.length > 0 && Boolean(record.knownLimitations))).toBe(true);
    expect(Object.keys(tracks)).toHaveLength(2);
  });

  it("keeps coding-program mastery at zero until learner evidence exists", () => {
    const mastery = codingMastery(emptyCodingProgress());
    expect(mastery.every((competency) => competency.level === 0)).toBe(true);
    expect(mastery.find((competency) => competency.key === "api")?.target).toBe(3);
    expect(codingReadiness(emptyCodingProgress()).overall).toBe(0);
    expect(codingGraduationStatus(emptyCodingProgress()).readyForReviewer).toBe(false);
  });

  it("creates durable spaced-retrieval events rather than treating review as a completed click", () => {
    const from = new Date("2026-07-18T20:00:00.000Z");
    const review = reviewScheduleForLesson("coding-day-1-01", from);
    expect(review.map((item) => item.interval)).toEqual(["20-minutes", "end-of-day", "next-morning", "three-days", "one-week"]);
    expect(new Date(review.find((item) => item.interval === "end-of-day")!.dueAt).getTime()).toBeGreaterThan(from.getTime());
    expect(review.every((item) => !item.completedAt)).toBe(true);
  });

  it("keeps terminal practice inside a fictional filesystem while supporting safe recovery", () => {
    let terminal = initialCodingTerminalSession();
    for (const command of ["mkdir ai_prototype", "touch main.py", "cd ai_prototype", "mv ../main.py main.py", "pwd", "history"]) {
      terminal = runCodingTerminalCommand(terminal, command);
    }
    expect(terminal.entries["/home/learner/ai_prototype/main.py"]).toBe("file");
    expect(codingTerminalStatus(terminal).recoveredFromWrongFolder).toBe(true);
    expect(runCodingTerminalCommand(terminal, "rm -rf /").transcript.at(-1)?.kind).toBe("error");
    expect(runCodingTerminalCommand(terminal, "rm -rf /").entries["/"]).toBe("directory");
  });

  it("migrates earlier Coding Developer progress to durable drafts and snapshots", () => {
    const legacyCoding = { ...emptyCodingProgress() } as Record<string, unknown>;
    delete legacyCoding.reviewSchedule;
    delete legacyCoding.recallResponses;
    delete legacyCoding.reviewBoardAttempts;
    delete legacyCoding.interviewAttempts;
    delete legacyCoding.workbenchDrafts;
    delete legacyCoding.workbenchSnapshots;
    const migrated = normalizeLearnerState({
      programProgress: { "coding-developer": legacyCoding as never },
    });
    const coding = migrated.programProgress["coding-developer"]!;
    expect(coding.reviewSchedule).toEqual([]);
    expect(coding.interviewAttempts).toEqual([]);
    expect(coding.recallResponses).toEqual({});
    expect(coding.reviewBoardAttempts).toEqual({});
    expect(coding.workbenchDrafts).toEqual({});
    expect(coding.workbenchSnapshots).toEqual({});
  });

  it("uses recovery targets and milestones as evidence aids, not completion shortcuts", () => {
    const empty = emptyCodingProgress();
    expect(codingBadges(empty).every((badge) => !badge.earned)).toBe(true);
    expect(empty.challengeAttemptHistory).toEqual({});
    expect(codingRecoveryPlan(empty).lessonId).toBeTruthy();
    const stronger = {
      ...empty,
      assessmentAttempts: [{ id: "attempt", score: 82, completedAt: "2026-07-18T00:00:00.000Z", questionIds: [], competencyScores: { python: 80 } }],
    };
    expect(codingBadges(stronger).find((badge) => badge.id === "retrieval-return")?.earned).toBe(true);
  });

  it("makes each boss battle fail recoverably rather than revealing a full solution", () => {
    expect(codingBossBattles).toHaveLength(5);
    const battle = codingBossBattles.find((item) => item.id === "boss-api-recovery")!;
    const weak = reviewBossBattle(battle, "I would look at it.", 0);
    expect(weak.status).toBe("needs-retry");
    expect(weak.missing).toContain("validation");
    const strong = reviewBossBattle(battle, "The request validation must reject the empty equipment field with a 422 response before the route calls a pure service function. I would repair the exact 90 threshold in the service, add a direct boundary test, add an HTTP validation test, inspect the response contract, keep formatting in the route, and rerun the focused regression suite before making any broader change. The recovery is complete only after the requirement and verification are visible to a reviewer.", 0);
    expect(strong.status).toBe("reviewed");
    expect(reviewBossBattle(battle, "validation 90 service 422 test ".repeat(20), 0).status).toBe("needs-retry");
  });

  it("keeps coding tutor assistance progressive and non-executing", () => {
    const challenge = codingChallenges.find((item) => item.id === "coding-triage-api")!;
    expect(codingTutorResponse(challenge, challenge.starter, 0).stage).toBe("predict");
    expect(codingTutorResponse(challenge, challenge.starter, 5).stage).toBe("full");
    expect(codingTutorResponse(challenge, challenge.starter, 5).message).toContain("rebuild");
    const response = codingTutorResponse(challenge, challenge.starter, 1, "pydantic ValidationError: field required");
    expect(response.observedError?.category).toBe("Request validation");
    expect(response.observedError?.diagnosis).toContain("contract mismatch");
    expect(classifyTutorError("ModuleNotFoundError: No module named 'fastapi'")?.category).toBe("Environment or import");
  });

  it("requires a focused, secret-free Git review with an exact regression test", () => {
    const weak = reviewCodingGitChange(["app/services.py", ".env"], "misc-edits", "I changed the service.");
    expect(weak.complete).toBe(false);
    expect(weak.unsafe).toContain(".env");
    const strong = reviewCodingGitChange(["app/services.py", "tests/test_services.py", "README.md"], "threshold-boundary", "The 88 degree boundary changes deterministic triage behavior, so I added a direct test and updated the README. The .env secret remains outside the commit.");
    expect(strong.complete).toBe(true);
  });

  it("distinguishes test quality failures from a passing test result", () => {
    const weak = reviewCodingTests({ "empty-assertion": "wrong-requirement" });
    expect(weak.correct).toBe(0);
    const strong = reviewCodingTests({ "empty-assertion": "no-behavior", "wrong-expectation": "wrong-requirement", "clock-coupling": "flaky-dependency", "private-helper": "implementation-coupling", "boundary-gap": "missing-boundary" });
    expect(strong.correct).toBe(5);
  });

  it("requires a model strategy to satisfy constraints and name the safe boundary", () => {
    expect(reviewCodingModelStrategy("freeform-large", "It writes fluent summaries.").complete).toBe(false);
    const reviewed = reviewCodingModelStrategy("structured-fast", "The strategy meets the latency and cost budget, validates a schema, preserves human review, and has a degraded fallback when a provider fails.");
    expect(reviewed.complete).toBe(true);
  });

  it("requires the beginner command-path sequence and an explanatory mental model", () => {
    const wrong = reviewCodingMachineFlow(["shell", "keyboard", "operating-system", "python", "program", "output"], "The shell starts Python.");
    expect(wrong.complete).toBe(false);
    const right = reviewCodingMachineFlow(["keyboard", "shell", "operating-system", "python", "program", "output"], "The keyboard sends a command to the shell. The shell asks the operating system to start Python, which runs the program and sends output back to the terminal.");
    expect(right.complete).toBe(true);
  });

  it("does not let keyword stuffing pass coding interview evidence review", () => {
    const prompt = codingInterviewPrompts.find((item) => item.id === "interview-triage-api")!;
    const stuffed = "user validation service test limitation ".repeat(30);
    expect(reviewCodingInterview(prompt.id, stuffed)?.complete).toBe(false);
    const evidenceRich = "The operations team needs a bounded way to replace manual reading of fictional sensor reports, so I would scope the prototype to triage only. The POST request uses a typed input schema and validation before returning a structured response. The route delegates deterministic threshold policy to a pure service function, keeping the business boundary easy to test. I would assert the exact 90-degree boundary and one invalid reading so a rule change has regression evidence. This is a prototype limitation: it has no identity or production monitoring, so my next decision would be a controlled pilot with those owners involved. I would document that decision, retain the test output, and ask the operations owner whether the proposed workflow actually reduces manual review time.";
    expect(reviewCodingInterview(prompt.id, evidenceRich)?.complete).toBe(true);
  });

  it("requires both an initial scope and a revised safe design when requirements change", () => {
    const incomplete = reviewRequirementChangeInterview("We can make a prototype.", "authorization scope human approval rollback evaluation ".repeat(30));
    expect(incomplete?.initialComplete).toBe(false);
    expect(incomplete?.complete).toBe(false);
    const initial = "The operations team needs a small prototype so a user can review fictional handoff notes instead of searching manually. The input is a handoff note request with a simple schema that names the team and note fields. The first slice is read-only, keeps write access out of scope, and records the boundary before any later expansion. I would verify that the team can find an approved note before I introduce AI, persistence changes, or action automation.";
    const revised = "Each team must have a verified identity and authorization check before the service retrieves any handoff note, so I would scope the first narrow prototype revision to team-filtered read-only retrieval. The prototype would not automatically write back because a human reviewer must approve any consequential action after trusted validation of the structured proposal. I would preserve the identity decision and audit record, and I would add a reversible rollback or escalation path if a permission check fails. To evaluate the change, I would test cross-team access denial, a correct team retrieval, an invalid request, and measure whether reviewers can still complete their workflow without an unsafe write path. The next decision would be whether representative evidence supports a separately authorized, human-approved drafting action.";
    const reviewed = reviewRequirementChangeInterview(initial, revised);
    expect(reviewed?.initialComplete).toBe(true);
    expect(reviewed?.complete).toBe(true);
    expect(reviewed?.score).toBeGreaterThanOrEqual(90);
  });

  it("requires role-specific evidence in engineering review responses", () => {
    const prompt = codingReviewBoardPrompts.find((item) => item.id === "software")!;
    expect(reviewCodingBoardResponse(prompt.id, "route service test boundary ".repeat(30))?.status).toBe("needs-revision");
    const response = "The HTTP route receives the request model and returns the response, while the service function owns the deterministic business threshold. Keeping the route separate makes the policy reusable and lets a direct test isolate logic without standing up a web server. I would write an assertion that a reading of exactly 90 is URGENT because that boundary is the behavior most likely to regress after a rule edit. The remaining production limitation is that this prototype lacks identity, monitoring, and a deployment owner, so I would scope the next pilot with those responsibilities in place. I would retain the focused test output in the project evidence packet for a reviewer.";
    expect(reviewCodingBoardResponse(prompt.id, response)?.status).toBe("reviewed");
  });

  it("uses an evaluation set that rewards bounded accept, escalate, and reject decisions", () => {
    expect(codingEvaluationCases).toHaveLength(6);
    const allCorrect = Object.fromEntries(codingEvaluationCases.map((item) => [item.id, item.expected]));
    expect(scoreCodingEvaluation(allCorrect)).toMatchObject({ correct: 6, total: 6, complete: true, score: 100 });
    expect(scoreCodingEvaluation({ injection: "accept" })).toMatchObject({ correct: 0, total: 6, complete: false, score: 0 });
  });

  it("keeps tool workflow answer keys server-side while varying client option positions", () => {
    expect(codingToolWorkflowCases).toHaveLength(4);
    expect(codingToolWorkflowCases.every((item) => !("expected" in item))).toBe(true);
    expect(new Set(codingToolWorkflowCases.map((item) => toolWorkflowOptionsFor(item.id).join(","))).size).toBeGreaterThan(1);
    expect(reviewToolWorkflow({
      "procedure-search": "allow-read-only",
      "draft-ticket": "request-approval",
      "close-incident": "reject",
      "injected-export": "reject",
    })).toMatchObject({ correct: 4, total: 4, complete: true });
    expect(reviewToolWorkflow({
      "procedure-search": "request-approval",
      "draft-ticket": "allow-read-only",
      "close-incident": "allow-read-only",
      "injected-export": "allow-read-only",
    })).toMatchObject({ correct: 0, total: 4, complete: true });
  });

  it("treats context construction as a bounded authorization and freshness decision", () => {
    expect(codingContextChunks).toHaveLength(5);
    expect(codingContextChunks.every((chunk) => !("expected" in chunk))).toBe(true);
    const safe = ["current-report", "approved-procedure"];
    expect(selectedContextTokens(safe)).toBe(160);
    expect(reviewCodingContextWindow(safe, selectedContextTokens(safe))).toMatchObject({ complete: true, withinBudget: true, budget: codingContextBudget });
    const unsafe = ["current-report", "approved-procedure", "old-procedure", "cross-team-history", "injected-note"];
    expect(reviewCodingContextWindow(unsafe, selectedContextTokens(unsafe))).toMatchObject({ complete: false, withinBudget: false });
  });

  it("does not let visible syntax or repeated labels become Code Lab evidence", () => {
    const challenge = codingChallenges.find((item) => item.id === "coding-triage-cli")!;
    const visibleButEmpty = "def evaluate_reading(temperature: float):\n    if temperature:\n        return 'NORMAL'\n    elif temperature:\n        return 'REVIEW'";
    const stuffed = "input output threshold deterministic test ".repeat(35);
    expect(reviewCodingChallenge(challenge.id, visibleButEmpty, stuffed)?.status).toBe("needs-revision");
    const evidenceRich = "The input is a temperature value and the function returns NORMAL, REVIEW, or URGENT for the calling CLI. I would test the exact 90-degree threshold boundary because a temperature of 89 and 90 must deliberately take different branches. This remains a deterministic rule rather than an AI task because the explicit threshold must be repeatable and easy to audit. I would add an assertion for 90 plus an invalid text-value check that raises a visible validation error instead of quietly returning NORMAL. Before expanding the prototype, I would run those tests and document the rule assumptions for the operations owner.";
    expect(reviewCodingChallenge(challenge.id, visibleButEmpty, evidenceRich)?.status).toBe("reviewed");
  });

  it("keeps dated sources visible and blocks commercial publication when review is due", () => {
    const report = codingSourceReviewReport(undefined, new Date("2026-07-18T12:00:00.000Z"));
    expect(report).toHaveLength(Object.keys(codingSources).length);
    expect(report.every((source) => source.disposition === "current" && Boolean(source.reviewStatus))).toBe(true);
    const overdue = codingCatalogPublicationStatus(undefined, new Date("2027-02-01T12:00:00.000Z"));
    expect(overdue.publishable).toBe(false);
    expect(overdue.stale.length).toBeGreaterThan(0);
    expect(codingCatalogPublicationStatus().awaitingTechnicalReview.length).toBeGreaterThan(0);
  });

  it("keeps Coding Developer assessment keys private while grading mixed evidence server-side", () => {
    expect(codingAssessmentBank).toHaveLength(24);
    const publicForm = publicCodingAssessment("assessment-integrity", 12);
    expect(publicForm).toHaveLength(12);
    expect(publicForm.every((question) => !("correctChoiceId" in question) && !("requiredConceptGroups" in question) && !("rationale" in question))).toBe(true);
    const choicePositions = publicForm
      .filter((question) => question.format === "choice")
      .map((question) => {
        const privateQuestion = codingAssessmentBank.find((item) => item.id === question.id)!;
        return question.choices!.findIndex((choice) => choice.id === privateQuestion.correctChoiceId);
      });
    expect(new Set(choicePositions).size).toBe(Math.min(4, choicePositions.length));
    const privateChoice = codingAssessmentBank.find((question) => question.format === "choice")!;
    const privateResponse = codingAssessmentBank.find((question) => question.format === "response")!;
    const result = gradeCodingAssessment({
      [privateChoice.id]: privateChoice.correctChoiceId!,
      [privateResponse.id]: "Use mkdir, cd, touch, and pwd to create the project, enter it, create main.py, and verify the working directory.",
    }, [privateChoice.id, privateResponse.id]);
    expect(result.complete).toBe(true);
    expect(result.score).toBe(100);
  });

  it("never treats the main web process as an arbitrary-code runtime", () => {
    expect(validateExecutionRequest({ language: "python", exerciseId: "safe", command: "python main.py", files: [{ path: "main.py", content: "print('fictional training')" }] })).toBeNull();
    expect(validateExecutionRequest({ language: "python", exerciseId: "unsafe", command: "rm -rf /", files: [{ path: "main.py", content: "print('no')" }] })).toContain("documented exercise commands");
    expect(validateExecutionRequest({ language: "python", exerciseId: "unsafe", command: "python main.py", files: [{ path: "../outside.py", content: "print('no')" }] })).toContain("relative Python files");
    const unconfigured = createCodingExecutionProvider({} as NodeJS.ProcessEnv);
    expect(unconfigured.policy).toBeNull();
    const configured = createCodingExecutionProvider({ CODING_SANDBOX_ENDPOINT: "https://sandbox.invalid/run", CODING_SANDBOX_TOKEN: "test" } as NodeJS.ProcessEnv);
    expect(configured.policy?.network).toBe("denied");
    expect(configured.policy?.readOnlyBaseImage).toBe(true);
  });

  it("uses 24 distinct protected AIO baseline decisions", () => {
    expect(aioBaseline).toHaveLength(24);
    expect(new Set(aioBaseline.map((question) => question.prompt)).size).toBe(24);
    expect(tracks["it-support-technician"].assessment).toHaveLength(24);
  });

  it("does not expose AIO baseline answer keys or a fixed answer position", () => {
    const publicForm = shuffledAioBaseline("adversarial-review");
    expect(publicForm.every((question) => !("correctChoiceId" in question))).toBe(true);
    const answerPositions = publicForm.map((question) => {
      const privateQuestion = aioBaseline.find((item) => item.id === question.id)!;
      return question.choices.findIndex(
        (choice) => choice.id === privateQuestion.correctChoiceId,
      );
    });
    expect(new Set(answerPositions)).toEqual(new Set([0, 1, 2, 3]));
    for (const question of aioBaseline) {
      expect(question.choices).toHaveLength(4);
      expect(question.choices.every((choice) => choice.text.length >= 55)).toBe(
        true,
      );
    }
  });

  it("keeps course answer keys and private completion rules out of the browser catalog", async () => {
    const catalog = aioPublicCatalog("test-seed") as {
      modules: Array<Record<string, unknown>>;
      labs: Array<Record<string, unknown>>;
      missions: Array<{ steps: Array<Record<string, unknown>> }>;
    };
    expect("rules" in catalog.modules[0]).toBe(false);
    expect("review" in catalog.modules[0]).toBe(false);
    expect((catalog.modules[0].knowledgeChecks as Array<Record<string, unknown>>).every((question) => !("correctChoiceId" in question))).toBe(true);
    expect("rules" in catalog.labs[0]).toBe(false);
    expect(catalog.missions[0].steps.every((step) => !("requiredChoiceId" in step) && !("acceptableChoiceIds" in step))).toBe(true);
  });

  it("ships the applied-AI institute catalog with complete evidence definitions", () => {
    expect(aioContentCounts).toEqual({
      lessons: 80,
      labs: 30,
      missions: 10,
      interviews: 150,
    });
    expect(validateAioContent()).toEqual([]);
    expect(
      validateAioContent({ requireReleaseApproval: true }).length,
    ).toBeGreaterThan(0);
  });

  it("ships a source-mapped six-week foundation and 36 concept-only cards", () => {
    expect(aioFoundationModules).toHaveLength(6);
    expect(aioRoleConcepts).toHaveLength(36);
    expect(aioFoundationModules.every((module) => module.capabilityLevel === "prove" && module.phaseId === "foundation-bridge")).toBe(true);
    expect(aioRoleConcepts.every((module) => module.capabilityLevel === "know" && module.artifact.requiredFields?.length === 3)).toBe(true);
    expect(aioModules.every((module) => module.sources.every((source) => Boolean(source.url && source.version && source.locator && source.supportedClaim && source.revalidateBy)))).toBe(true);
  });

  it("routes an unassessed learner to the foundation and a strong baseline to Fast Track remediation", () => {
    expect(recommendAioFoundationStart().week).toBe(1);
    expect(recommendAioFoundationStart({ score: 90, competencyScores: { foundations: 90, architecture: 86, security: 88 }, completedAt: "2026-07-17", version: "test" }).phaseId).toBe("fast-track");
  });

  it("does not convert Know evidence into independent build or troubleshooting readiness", () => {
    const concept = aioRoleConcepts[0];
    const state = {
      ...emptyLearnerState,
      courseAttempts: [{
        id: "know-attempt",
        itemId: concept.id,
        version: "test",
        kind: "module" as const,
        score: 94,
        complete: true,
        artifact: "",
        answers: {},
        missionChoices: {},
        hintCount: 0,
        createdAt: new Date().toISOString(),
        competencies: concept.competencies,
        capabilityLevel: "know" as const,
        evidenceDimension: "understands" as const,
      }],
    };
    const readiness = trackReadiness(state, "applied-ai-operations");
    const foundations = readiness.signals.find((signal) => signal.key === "foundations")!;
    expect(foundations.dimensions.understands).toBeGreaterThan(0);
    expect(foundations.dimensions.builds).toBe(0);
    expect(foundations.dimensions.troubleshoots).toBe(0);
  });

  it("grades AIO work by choice ID and deterministic artifact requirements", () => {
    const itemId = "aio-sprint-01-role-narrative";
    const incomplete = gradeCourseAttempt({
      kind: "module",
      itemId,
      answers: {},
      evidence: {
        scenarioFact: "context only",
        decision: "",
        boundary: "",
        verification: "",
        owner: "",
        escalation: "",
        evidenceReferences: [],
      },
    });
    expect(incomplete?.complete).toBe(false);
    const moduleDefinition = aioModules.find((item) => item.id === itemId)!;
    const complete = gradeCourseAttempt({
      kind: "module",
      itemId,
      answers: Object.fromEntries(
        moduleDefinition.knowledgeChecks.map((question) => [question.id, question.correctChoiceId]),
      ),
      evidence: {
        scenarioFact: "The fictional engineering team loses time finding the current procedure during a controlled shift handoff.",
        decision: "Run a read-only cited retrieval pilot rather than an autonomous assistant or unbounded document search.",
        boundary: "Authorize the requester before retrieval, expose no write tools, and abstain when current sources conflict.",
        verification: "Test supported, denied, stale, conflicting, injected, and unsupported cases before pilot expansion, then review failures weekly.",
        owner: "The named policy owner publishes the decision record while the engineering lead owns the controlled pilot outcome.",
        escalation: "Stop expansion and return users to ordinary search if the agreed safety threshold is missed or evidence conflicts.",
        evidenceReferences: [],
      },
    });
    expect(complete?.complete).toBe(true);
  });

  it("accepts conventional automation when the mission facts make AI unnecessary", () => {
    const mission = aioMissions.find(
      (item) => item.title === "The inspection-note request",
    )!;
    const missionChoices = Object.fromEntries(
      [["step-1", "conventional"], ["conventional-review", "confirm"]],
    );
    const result = gradeCourseAttempt({
      kind: "mission",
      itemId: mission.id,
      answers: {},
      missionChoices,
      evidence: {
        scenarioFact: "The fictional inspection team already uses a stable checklist with fixed fields and only a small free-text summary.",
        decision: "Retain conventional form automation and defer AI until a specific unresolved language task is demonstrated.",
        boundary: "The approved checklist remains the system of record and no model receives write access to inspection records.",
        verification: "Compare rework and field accuracy against the existing baseline while preserving the original audit trail.",
        owner: "The operations owner publishes the decision record and reviewers confirm whether the form workflow meets the need.",
        escalation: "Revisit a narrow read-only drafting pilot only after representative evidence shows a genuine unsolved language problem.",
        evidenceReferences: [],
      },
    });
    expect(result?.complete).toBe(true);
    expect(result?.checks[0]?.correct).toBe(true);
  });

  it("changes the mission path after an unsafe decision and preserves the containment step", () => {
    const mission = aioMissions.find((item) => item.title === "The autonomous ticket proposal")!;
    const result = gradeCourseAttempt({
      kind: "mission",
      itemId: mission.id,
      answers: {},
      missionChoices: { "step-1": "unsafe", containment: "contain" },
      evidence: {
        scenarioFact: "The fictional team wants a model to open and close operational tickets from ambiguous natural-language messages.",
        decision: "Contain the unsafe direct-write proposal before it reaches the ticket system.",
        boundary: "The model cannot receive direct ticket authority or select its own permissions.",
        verification: "Inspect the preserved audit trace and prove no ticket state changed from the unsafe path.",
        owner: "The workflow owner and ticket-system owner review the containment record together.",
        escalation: "Return to discovery and a human-approved draft workflow before any automation is reconsidered.",
        evidenceReferences: [],
      },
    });
    expect(result?.complete).toBe(false);
    expect(result?.checks).toHaveLength(2);
    expect(result?.checks[1]?.correct).toBe(true);
  });

  it("rejects keyword stuffing and duplicated evidence fields", () => {
    const itemId = "aio-sprint-01-role-narrative";
    const repeated = "context constraint decision verification owner escalation evidence ".repeat(10);
    const result = gradeCourseAttempt({
      kind: "module",
      itemId,
      answers: {},
      evidence: {
        scenarioFact: repeated,
        decision: repeated,
        boundary: repeated,
        verification: repeated,
        owner: repeated,
        escalation: repeated,
        evidenceReferences: [],
      },
    });
    expect(result?.complete).toBe(false);
    expect(result?.rubric.checks.some((check) => check.id === "distinct-fields" && !check.passed)).toBe(true);
  });

  it("includes all four AI-native lab modes", () => {
    const modes = new Set(
      tracks["it-support-technician"].activities
        .filter((activity) => activity.type === "lab")
        .map((activity) => activity.mode),
    );
    expect(modes).toEqual(
      new Set([
        "Solo",
        "Pair Programming",
        "AI Builder",
        "Production Incident",
      ]),
    );
  });

  it("rewards evidence-based responses and produces a readiness signal", () => {
    const review = reviewText(
      "First I would clarify impact and constraints, then use a permissioned action, verify with evidence, document the audit trail, and escalate risk to the owner.",
    );
    expect(review.score).toBeGreaterThan(65);
    const readiness = trackReadiness(
      emptyLearnerState,
      "applied-ai-operations",
    );
    expect(readiness.overall).toBeGreaterThan(0);
  });

  it("requires capstone, project, interview, and readiness evidence before graduation", () => {
    const trackId = "it-support-technician" as const;
    const track = tracks[trackId];
    const capstone = track.activities.find((activity) => activity.capstone)!;
    const answers = Object.fromEntries(
      track.assessment.map((question) => [question.id, question.correct]),
    );
    const state = {
      ...emptyLearnerState,
      assessments: { ...emptyLearnerState.assessments, [trackId]: answers },
      progress: {
        [capstone.id]: {
          status: "complete" as const,
          score: 92,
          feedback: "Defensible capstone",
          updatedAt: new Date().toISOString(),
        },
      },
      projects: [
        {
          ...track.projects[0],
          id: `${trackId}-${track.projects[0].id}`,
          contribution:
            "I personally mapped the operating need, drafted the system design, and documented the stakeholder decisions.",
          risks:
            "I identified access, recovery, security, and false-confidence risks along with escalation and rollback controls.",
          result:
            "The prototype shortened triage and produced a documented safe recovery path that reviewers could verify.",
          reflection:
            "Next I would improve the evaluation set, validate the rollout with users, and publish a revised runbook.",
          updatedAt: new Date().toISOString(),
        },
      ],
      answers: Object.fromEntries(
        track.interviewQuestions
          .slice(0, 3)
          .map((question) => [
            question.id,
            "I would clarify impact and risk, gather evidence, make a safe recommendation, verify the outcome, communicate the checkpoint, and document the escalation path.",
          ]),
      ),
    };
    expect(graduationStatus(emptyLearnerState, trackId).eligible).toBe(false);
    expect(graduationStatus(state, trackId).eligible).toBe(true);
    expect(accountabilityStatus(emptyLearnerState).didStudyToday).toBe(false);
  });
});
