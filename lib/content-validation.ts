import {
  aioInterviewPrompts,
  aioLabs,
  aioMissions,
  aioModules,
} from "./aio-content";
import { itSupportLabs, itSupportMissions, itSupportSprintModules } from "./it-support-content";
import { isReleaseApproved } from "./course-types";

type Validation = { id: string; message: string };

export function validateAioContent(
  options: { requireReleaseApproval?: boolean } = {},
) {
  const errors: Validation[] = [];
  const ids = new Set<string>();
  const addId = (id: string) => {
    if (ids.has(id)) errors.push({ id, message: "Duplicate stable ID." });
    ids.add(id);
  };
  for (const moduleDefinition of aioModules) {
    addId(moduleDefinition.id);
    const isFoundationOrConcept =
      moduleDefinition.phaseId === "foundation-bridge" ||
      moduleDefinition.pathAvailability?.includes("concept-library");
    const requiredChecks =
      moduleDefinition.capabilityLevel === "know" ||
      moduleDefinition.pathAvailability?.includes("sprint-7-day")
        ? 1
        : 3;
    if (!moduleDefinition.outcome || !moduleDefinition.overview || moduleDefinition.sections.length < 4)
      errors.push({
        id: moduleDefinition.id,
        message: "Module needs authored instruction and four instructional sections.",
      });
    if (moduleDefinition.knowledgeChecks.length < requiredChecks)
      errors.push({
        id: moduleDefinition.id,
        message: `Module needs ${requiredChecks} credible knowledge check${requiredChecks === 1 ? "" : "s"}.`,
      });
    if (
      isFoundationOrConcept &&
      (!moduleDefinition.capabilityLevel ||
        !moduleDefinition.performanceExpectation ||
        !moduleDefinition.roleBoundary ||
        !moduleDefinition.specialistEscalationGuidance ||
        !moduleDefinition.pathAvailability?.length)
    )
      errors.push({
        id: moduleDefinition.id,
        message: "Foundation and concept modules need capability, expectation, boundary, escalation, and path metadata.",
      });
    if (
      moduleDefinition.capabilityLevel === "know" &&
      (moduleDefinition.artifact.requiredFields?.length ?? 0) > 3
    )
      errors.push({
        id: moduleDefinition.id,
        message: "Know modules must use concise conceptual evidence rather than a full independent-performance rubric.",
      });
    if (!moduleDefinition.artifact.required.length || !moduleDefinition.rules.length)
      errors.push({
        id: moduleDefinition.id,
        message:
          "Module needs artifact evidence and deterministic rubric rules.",
      });
    if (!moduleDefinition.sources.length)
      errors.push({
        id: moduleDefinition.id,
        message: "Module needs at least one source reference.",
      });
    if (moduleDefinition.sources.some((source) => !source.version || !source.locator || !source.supportedClaim || !source.revalidateBy))
      errors.push({ id: moduleDefinition.id, message: "Module source references need version, locator, supported claim, and revalidation date." });
    if (!moduleDefinition.instructionalDesign?.approach || !moduleDefinition.instructionalDesign.rationale || !moduleDefinition.instructionalDesign.sources.length)
      errors.push({ id: moduleDefinition.id, message: "Module needs a documented instructional-design rationale and source mapping." });
    if (moduleDefinition.instructionalDesign?.sources.some((source) => !source.version || !source.locator || !source.supportedClaim || !source.revalidateBy))
      errors.push({ id: moduleDefinition.id, message: "Instructional-design sources need version, locator, supported claim, and revalidation date." });
    for (const question of moduleDefinition.knowledgeChecks) {
      if (question.choices.length !== 4)
        errors.push({ id: question.id, message: "Knowledge check needs four choices." });
      if (!question.choices.some((choice) => choice.id === question.correctChoiceId))
        errors.push({ id: question.id, message: "Knowledge check answer key is invalid." });
      if (question.choices.some((choice) => choice.text.trim().length < 32))
        errors.push({ id: question.id, message: "Knowledge check has a weak distractor." });
    }
    if (options.requireReleaseApproval && !isReleaseApproved(moduleDefinition.review))
      errors.push({
        id: moduleDefinition.id,
        message: "Module has not passed all required human reviews.",
      });
  }
  for (const lab of aioLabs) {
    addId(lab.id);
    if (!lab.scenario || !lab.task || !lab.debrief || !lab.revisionPrompt)
      errors.push({
        id: lab.id,
        message: "Lab needs scenario, task, debrief, and revision path.",
      });
    if (
      !lab.assets.length ||
      !lab.evidence.required.length ||
      lab.rules.length < 2 ||
      !lab.sources.length
    )
      errors.push({
        id: lab.id,
        message: "Lab needs sources, fictional evidence, and multiple scoring criteria.",
      });
    if (!lab.evidence.requiredFields?.length || !lab.evidence.requireEvidenceReference)
      errors.push({ id: lab.id, message: "Lab needs structured evidence fields and at least one linked fictional evidence asset." });
    if (lab.sources.some((source) => !source.version || !source.locator || !source.supportedClaim || !source.revalidateBy))
      errors.push({ id: lab.id, message: "Lab source references need traceable version metadata." });
  }
  for (const mission of aioMissions) {
    addId(mission.id);
    const decisionNodes = mission.steps.filter((step) => step.id.startsWith("step-"));
    if (
      decisionNodes.length < 3 ||
      decisionNodes.some((step) => step.options.length < 3)
    )
      errors.push({
        id: mission.id,
        message: "Mission needs three decisions with three plausible options each.",
      });
    if (!mission.startStepId || !mission.steps.some((step) => step.options.some((option) => option.nextStepId)))
      errors.push({ id: mission.id, message: "Mission needs a reachable branch transition from its initial state." });
    if (!mission.debrief || !mission.artifact.required.length || !mission.sources.length)
      errors.push({
        id: mission.id,
        message: "Mission needs sources, a debrief, and saved evidence.",
      });
    if (!mission.artifact.requiredFields?.length)
      errors.push({ id: mission.id, message: "Mission needs structured evidence fields." });
    if (mission.sources.some((source) => !source.version || !source.locator || !source.supportedClaim || !source.revalidateBy))
      errors.push({ id: mission.id, message: "Mission source references need traceable version metadata." });
  }
  const questionIds = new Set(
    aioInterviewPrompts.map((question) => question.id),
  );
  if (questionIds.size !== aioInterviewPrompts.length)
    errors.push({
      id: "interview-bank",
      message: "Interview IDs must be unique.",
    });
  if (aioInterviewPrompts.length !== 150)
    errors.push({
      id: "interview-bank",
      message: "Exactly 150 authored interview prompts are required.",
    });
  return errors;
}

export const aioContentCounts = {
  lessons: aioModules.length,
  labs: aioLabs.length,
  missions: aioMissions.length,
  interviews: aioInterviewPrompts.length,
};

/** Structural release gate for authored IT Support content. Generated catalog
 * scaffolding is deliberately excluded: it cannot pass this validator. */
export function validateItSupportContent(
  options: { requireReleaseApproval?: boolean } = {},
) {
  const errors: Validation[] = [];
  const ids = new Set<string>();
  const add = (id: string) => {
    if (ids.has(id)) errors.push({ id, message: "Duplicate stable ID." });
    ids.add(id);
  };
  for (const module of itSupportSprintModules) {
    add(module.id);
    if (!module.outcome || !module.overview || (module.blocks?.length ?? 0) < 4)
      errors.push({ id: module.id, message: "Module needs authored instruction and a multi-block lesson." });
    if (module.knowledgeChecks.length !== 3)
      errors.push({ id: module.id, message: "Sprint module needs exactly three authored knowledge checks." });
    if (!module.artifact.required.length || !module.artifact.requiredFields?.length || module.rules.length < 3)
      errors.push({ id: module.id, message: "Module needs structured evidence and at least three deterministic rules." });
    if (!module.roleBoundary || !module.specialistEscalationGuidance || !module.performanceExpectation)
      errors.push({ id: module.id, message: "Module needs explicit performance, boundary, and escalation guidance." });
    if (!module.sources.length || module.sources.some((record) => !record.version || !record.locator || !record.supportedClaim || !record.revalidateBy))
      errors.push({ id: module.id, message: "Module needs versioned, claim-mapped source records." });
    if (!module.instructionalDesign?.sources.length)
      errors.push({ id: module.id, message: "Module needs a documented instructional-design basis." });
    for (const question of module.knowledgeChecks) {
      if (question.choices.length !== 4 || !question.choices.some((choice) => choice.id === question.correctChoiceId))
        errors.push({ id: question.id, message: "Knowledge check answer structure is invalid." });
      if (question.choices.some((choice) => choice.text.trim().length < 55))
        errors.push({ id: question.id, message: "Knowledge check contains a weak distractor." });
    }
    if (options.requireReleaseApproval && !isReleaseApproved(module.review))
      errors.push({ id: module.id, message: "Module lacks qualified release approval." });
  }
  for (const lab of itSupportLabs) {
    add(lab.id);
    if (!lab.scenario || !lab.task || lab.assets.length < 3 || !lab.debrief || !lab.revisionPrompt)
      errors.push({ id: lab.id, message: "Lab needs scenario, distinct evidence assets, task, debrief, and revision path." });
    if (!lab.evidence.requiredFields?.length || !lab.evidence.requireEvidenceReference || lab.rules.length < 3)
      errors.push({ id: lab.id, message: "Lab needs linked structured evidence and activity-specific rules." });
    if (!lab.sources.length || lab.sources.some((record) => !record.version || !record.locator || !record.supportedClaim || !record.revalidateBy))
      errors.push({ id: lab.id, message: "Lab needs versioned, claim-mapped source records." });
    if (options.requireReleaseApproval && !isReleaseApproved(lab.review))
      errors.push({ id: lab.id, message: "Lab lacks qualified release approval." });
  }
  for (const mission of itSupportMissions) {
    add(mission.id);
    if (mission.steps.length < 4 || mission.steps.some((step) => step.options.length < 1))
      errors.push({ id: mission.id, message: "Mission needs a persisted decision path and outcome." });
    const decisionSteps = mission.steps.filter((step) => step.id !== "outcome");
    if (decisionSteps.some((step) => step.options.length < 3 || !step.options.some((option) => option.safe) || !step.options.some((option) => !option.safe)))
      errors.push({ id: mission.id, message: "Each decision needs plausible safe and unsafe outcomes." });
    if (!mission.artifact.requiredFields?.length || (mission.rules?.length ?? 0) < 3 || !mission.debrief)
      errors.push({ id: mission.id, message: "Mission needs structured evidence, deterministic rules, and debrief." });
    if (!mission.sources.length || mission.sources.some((record) => !record.version || !record.locator || !record.supportedClaim || !record.revalidateBy))
      errors.push({ id: mission.id, message: "Mission needs versioned, claim-mapped source records." });
    if (options.requireReleaseApproval && !isReleaseApproved(mission.review))
      errors.push({ id: mission.id, message: "Mission lacks qualified release approval." });
  }
  return errors;
}

export const itSupportContentCounts = {
  sprintModules: itSupportSprintModules.length,
  labs: itSupportLabs.length,
  missions: itSupportMissions.length,
};
