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
  codingBadges,
  codingConcepts,
  codingRecoveryPlan,
  codingLessons,
  codingMastery,
  emptyCodingProgress,
  validateCodingProgram,
} from "./coding-developer";
import { codingAssessmentBank, gradeCodingAssessment, publicCodingAssessment } from "./coding-assessment";
import { validateExecutionRequest } from "./coding-execution";

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
    expect(validateCodingProgram()).toEqual([]);
    expect(codingConcepts.every((concept) => concept.sourceIds.length > 0 && Boolean(concept.escalation))).toBe(true);
    expect(Object.keys(tracks)).toHaveLength(2);
  });

  it("keeps coding-program mastery at zero until learner evidence exists", () => {
    const mastery = codingMastery(emptyCodingProgress());
    expect(mastery.every((competency) => competency.level === 0)).toBe(true);
    expect(mastery.find((competency) => competency.key === "api")?.target).toBe(3);
  });

  it("uses recovery targets and milestones as evidence aids, not completion shortcuts", () => {
    const empty = emptyCodingProgress();
    expect(codingBadges(empty).every((badge) => !badge.earned)).toBe(true);
    expect(codingRecoveryPlan(empty).lessonId).toBeTruthy();
    const stronger = {
      ...empty,
      assessmentAttempts: [{ id: "attempt", score: 82, completedAt: "2026-07-18T00:00:00.000Z", questionIds: [], competencyScores: { python: 80 } }],
    };
    expect(codingBadges(stronger).find((badge) => badge.id === "retrieval-return")?.earned).toBe(true);
  });

  it("keeps Coding Developer assessment keys private while grading mixed evidence server-side", () => {
    expect(codingAssessmentBank).toHaveLength(24);
    const publicForm = publicCodingAssessment("assessment-integrity", 12);
    expect(publicForm).toHaveLength(12);
    expect(publicForm.every((question) => !("correctChoiceId" in question) && !("requiredConceptGroups" in question) && !("rationale" in question))).toBe(true);
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
