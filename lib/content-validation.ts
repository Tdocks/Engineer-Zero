import {
  aioInterviewPrompts,
  aioLabs,
  aioMissions,
  aioModules,
} from "./aio-content";
import {
  aioInterviewEmergencyRequiredLabs,
  aioInterviewEmergencyRequiredModules,
} from "./aio-interview-emergency-path";
import { mediaForModule } from "./aio-media";
import { itSupportInterviewPrompts, itSupportLabs, itSupportMissions, itSupportSprintModules } from "./it-support-content";
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
    const sectionField = {
      context: "scenarioFact",
      "scenario fact": "scenarioFact",
      constraint: "boundary",
      boundary: "boundary",
      decision: "decision",
      verification: "verification",
      owner: "owner",
      escalation: "escalation",
    } as const;
    const requiredFields = new Set(moduleDefinition.artifact.requiredFields ?? []);
    if (
      moduleDefinition.rules.some((rule) =>
        (rule.requiredSections ?? []).some((section) => {
          const field = sectionField[section.toLocaleLowerCase() as keyof typeof sectionField];
          return field && !requiredFields.has(field);
        }),
      )
    ) {
      errors.push({
        id: moduleDefinition.id,
        message: "Module scoring rules require an evidence field the learner is not shown.",
      });
    }
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
      lab.assets.length < 3 ||
      !lab.evidence.required.length ||
      lab.rules.length < 2 ||
      !lab.sources.length
    )
      errors.push({
        id: lab.id,
        message: "Lab needs ≥3 distinct fictional assets, sources, evidence, and multiple scoring criteria.",
      });
    if (new Set(lab.assets.map((asset) => asset.name)).size !== lab.assets.length)
      errors.push({ id: lab.id, message: "Lab asset names must be unique." });
    if (lab.assets.some((asset) => asset.content.trim().length < 80))
      errors.push({ id: lab.id, message: "Lab assets need substantive fictional content." });
    if (lab.rules.every((rule) => rule.id === "required-sections" || rule.id === "scenario-evidence"))
      errors.push({ id: lab.id, message: "Lab needs activity-specific scoring rules, not only generic section keywords." });
    if (!lab.evidence.requiredFields?.length || !lab.evidence.requireEvidenceReference)
      errors.push({ id: lab.id, message: "Lab needs structured evidence fields and at least one linked fictional evidence asset." });
    if (lab.sources.some((source) => !source.version || !source.locator || !source.supportedClaim || !source.revalidateBy))
      errors.push({ id: lab.id, message: "Lab source references need traceable version metadata." });
  }
  for (const moduleId of aioInterviewEmergencyRequiredModules) {
    const moduleDefinition = aioModules.find((item) => item.id === moduleId);
    if (!moduleDefinition) {
      errors.push({ id: moduleId, message: "Emergency path references a missing module." });
      continue;
    }
    if (
      (moduleDefinition.blocks?.length ?? 0) < 4 ||
      !moduleDefinition.blocks?.some((block) => block.type === "workedExample") ||
      !moduleDefinition.blocks?.some((block) => block.type === "evidenceAsset") ||
      moduleDefinition.misconceptions.length < 2 ||
      moduleDefinition.knowledgeChecks.length < 3 ||
      !moduleDefinition.workProduct
    ) {
      errors.push({
        id: moduleId,
        message:
          "Emergency module needs ≥4 blocks, worked example, try-this asset, ≥2 misconceptions, ≥3 checks, and a scored work product.",
      });
    }
    if (mediaForModule(moduleId).length < 1) {
      errors.push({ id: moduleId, message: "Emergency module needs a Watch → Do video cue." });
    }
  }
  for (const labId of aioInterviewEmergencyRequiredLabs) {
    const lab = aioLabs.find((item) => item.id === labId);
    if (!lab?.pathAvailability?.includes("interview-emergency") || !lab.workProduct) {
      errors.push({
        id: labId,
        message: "Required emergency lab needs path metadata and a scored packet work product.",
      });
    }
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
    if ((mission.rules?.length ?? 0) < 3)
      errors.push({ id: mission.id, message: "Mission needs at least three activity-specific rules." });
    if (mission.sources.some((source) => !source.version || !source.locator || !source.supportedClaim || !source.revalidateBy))
      errors.push({ id: mission.id, message: "Mission source references need traceable version metadata." });
    if (
      mission.steps.some(
        (step) =>
          step.id.startsWith("step-") &&
          step.options.length >= 3 &&
          (!step.options.some((option) => option.safe) || !step.options.some((option) => !option.safe)),
      )
    )
      errors.push({ id: mission.id, message: "Mission decisions need at least one safe and one unsafe option." });
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
  if (aioInterviewPrompts.some((question) => !question.sources.length || question.sources.some((source) => !source.version || !source.locator || !source.supportedClaim || !source.revalidateBy)))
    errors.push({ id: "interview-bank", message: "Every interview prompt needs versioned, claim-mapped source records." });
  if (new Set(aioInterviewPrompts.map((question) => question.why)).size < 100)
    errors.push({ id: "interview-bank", message: "Interview why-guidance must be substantially unique across the bank." });
  if (new Set(aioInterviewPrompts.map((question) => question.rubric.join("|"))).size < 100)
    errors.push({ id: "interview-bank", message: "Interview rubrics must not share one global template across the bank." });
  if (aioInterviewPrompts.filter((question) => question.timedMinutes).length < 30)
    errors.push({ id: "interview-bank", message: "At least 30 interview prompts need timed scenario packaging." });

  // Anti-hollow gates: knowledge checks must not paste outcome/example, and prompts must not collide.
  const promptOwners = new Map<string, string>();
  for (const moduleDefinition of aioModules) {
    const correctTexts = new Set(
      moduleDefinition.knowledgeChecks.map((question) => {
        const correct = question.choices.find((choice) => choice.id === question.correctChoiceId);
        return correct?.text.trim() ?? "";
      }),
    );
    for (const banned of [moduleDefinition.outcome.trim(), moduleDefinition.workedExample.trim()]) {
      if (banned.length >= 24 && correctTexts.has(banned)) {
        errors.push({
          id: moduleDefinition.id,
          message: "Knowledge-check correct answer must not paste the module outcome/example/workedExample string.",
        });
        break;
      }
    }
    for (const question of moduleDefinition.knowledgeChecks) {
      const normalized = question.prompt.trim().toLowerCase();
      const prior = promptOwners.get(normalized);
      if (prior && prior !== moduleDefinition.id) {
        errors.push({
          id: moduleDefinition.id,
          message: `Duplicate knowledge-check prompt also used by ${prior}.`,
        });
      } else {
        promptOwners.set(normalized, moduleDefinition.id);
      }
      if (/^a teammate mentions .+ during a fictional design review/.test(normalized)) {
        errors.push({
          id: question.id,
          message: "Concept checks must not use the templated teammate-mentions stem.",
        });
      }
    }
    if (moduleDefinition.id.startsWith("aio-core-") && !(moduleDefinition.blocks?.length ?? 0)) {
      errors.push({
        id: moduleDefinition.id,
        message: "Core modules need authored CourseBlocks; factory-only sections are not allowed.",
      });
    }
  }

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
  for (const sprintModule of itSupportSprintModules) {
    add(sprintModule.id);
    if (!sprintModule.outcome || !sprintModule.overview || (sprintModule.blocks?.length ?? 0) < 4)
      errors.push({ id: sprintModule.id, message: "Module needs authored instruction and a multi-block lesson." });
    if (sprintModule.knowledgeChecks.length !== 3)
      errors.push({ id: sprintModule.id, message: "Sprint module needs exactly three authored knowledge checks." });
    if (!sprintModule.artifact.required.length || !sprintModule.artifact.requiredFields?.length || sprintModule.rules.length < 3)
      errors.push({ id: sprintModule.id, message: "Module needs structured evidence and at least three deterministic rules." });
    if (!sprintModule.roleBoundary || !sprintModule.specialistEscalationGuidance || !sprintModule.performanceExpectation)
      errors.push({ id: sprintModule.id, message: "Module needs explicit performance, boundary, and escalation guidance." });
    if (!sprintModule.sources.length || sprintModule.sources.some((record) => !record.version || !record.locator || !record.supportedClaim || !record.revalidateBy))
      errors.push({ id: sprintModule.id, message: "Module needs versioned, claim-mapped source records." });
    if (!sprintModule.instructionalDesign?.sources.length)
      errors.push({ id: sprintModule.id, message: "Module needs a documented instructional-design basis." });
    for (const question of sprintModule.knowledgeChecks) {
      if (question.choices.length !== 4 || !question.choices.some((choice) => choice.id === question.correctChoiceId))
        errors.push({ id: question.id, message: "Knowledge check answer structure is invalid." });
      if (question.choices.some((choice) => choice.text.trim().length < 55))
        errors.push({ id: question.id, message: "Knowledge check contains a weak distractor." });
    }
    if (options.requireReleaseApproval && !isReleaseApproved(sprintModule.review))
      errors.push({ id: sprintModule.id, message: "Module lacks qualified release approval." });
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
  if (itSupportInterviewPrompts.length !== 150)
    errors.push({ id: "it-interview-bank", message: "Exactly 150 authored IT Support interview prompts are required." });
  if (new Set(itSupportInterviewPrompts.map((question) => question.id)).size !== itSupportInterviewPrompts.length)
    errors.push({ id: "it-interview-bank", message: "IT Support interview IDs must be unique." });
  if (itSupportInterviewPrompts.some((question) => !question.sources.length || question.sources.some((source) => !source.version || !source.locator || !source.supportedClaim || !source.revalidateBy)))
    errors.push({ id: "it-interview-bank", message: "Every IT Support interview prompt needs versioned, claim-mapped source records." });
  if (new Set(itSupportInterviewPrompts.map((question) => question.why)).size < 100)
    errors.push({ id: "it-interview-bank", message: "IT interview why-guidance must be scenario-specific, not one pack per theme only." });
  if (itSupportInterviewPrompts.filter((question) => question.timedMinutes).length < 30)
    errors.push({ id: "it-interview-bank", message: "At least 30 IT interview prompts need timed scenario packaging." });
  return errors;
}

export const itSupportContentCounts = {
  sprintModules: itSupportSprintModules.length,
  labs: itSupportLabs.length,
  missions: itSupportMissions.length,
};
