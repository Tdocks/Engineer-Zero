import "server-only";

import { aioLabs, aioMissions, aioModules } from "./aio-content";
import type {
  ArtifactSchema,
  EvidenceFieldKey,
  StructuredEvidence,
} from "./course-types";

export type CourseItemKind = "module" | "lab" | "mission";
export type CourseItem =
  | (typeof aioModules)[number]
  | (typeof aioLabs)[number]
  | (typeof aioMissions)[number];

const evidenceKeys: EvidenceFieldKey[] = [
  "scenarioFact",
  "decision",
  "boundary",
  "verification",
  "owner",
  "escalation",
];
const labels: Record<EvidenceFieldKey, string> = {
  scenarioFact: "Scenario fact",
  decision: "Decision",
  boundary: "Boundary",
  verification: "Verification",
  owner: "Accountable owner",
  escalation: "Escalation or rollback",
};

export function findCourseItem(
  kind: CourseItemKind,
  itemId: string,
): CourseItem | undefined {
  if (kind === "module") return aioModules.find((item) => item.id === itemId);
  if (kind === "lab") return aioLabs.find((item) => item.id === itemId);
  return aioMissions.find((item) => item.id === itemId);
}

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lexicalDiversity(value: string) {
  const tokens = words(normalize(value)).filter((token) => token.length > 2);
  return tokens.length ? new Set(tokens).size / tokens.length : 0;
}

function distinctEnough(values: string[]) {
  const normalized = values.map(normalize).filter(Boolean);
  return new Set(normalized).size === normalized.length;
}

function artifactText(evidence: StructuredEvidence) {
  return evidenceKeys
    .map((key) => `${labels[key]}: ${evidence[key]}`)
    .join("\n");
}

export function emptyEvidence(): StructuredEvidence {
  return {
    scenarioFact: "",
    decision: "",
    boundary: "",
    verification: "",
    owner: "",
    escalation: "",
    evidenceReferences: [],
  };
}

function gradeEvidence(
  evidence: StructuredEvidence,
  schema: ArtifactSchema,
  validEvidenceReferences: string[],
) {
  const requiredFields = schema.requiredFields ?? evidenceKeys;
  const fieldChecks = requiredFields.map((key) => {
    const value = evidence[key] ?? "";
    const fieldWords = words(value).length;
    const diversity = lexicalDiversity(value);
    const passed = fieldWords >= 8 && diversity >= 0.45;
    return {
      id: `field-${key}`,
      label: labels[key],
      passed,
      detail: passed
        ? "Specific, distinct reasoning recorded."
        : fieldWords < 8
          ? "Add a specific statement of at least eight words."
          : "Replace repeated or padded language with concrete reasoning.",
    };
  });
  const selectedReferences = evidence.evidenceReferences.filter((reference) =>
    validEvidenceReferences.includes(reference),
  );
  const evidenceReferenceCheck = {
    id: "evidence-references",
    label: "Evidence references",
    passed:
      !schema.requireEvidenceReference ||
      validEvidenceReferences.length === 0 ||
      selectedReferences.length > 0,
    detail:
      validEvidenceReferences.length === 0
        ? "No simulated evidence asset is required for this activity."
        : selectedReferences.length
          ? `${selectedReferences.length} simulated asset(s) linked to the decision.`
          : "Link at least one supplied simulated evidence asset.",
  };
  const distinctCheck = {
    id: "distinct-fields",
    label: "Distinct reasoning",
    passed: distinctEnough(requiredFields.map((key) => evidence[key] ?? "")),
    detail: "Each evidence field must make a different claim; copied headings do not count.",
  };
  const text = artifactText(evidence);
  return {
    wordCount: words(text).length,
    artifactLength: fieldChecks.every((check) => check.passed),
    checks: [...fieldChecks, evidenceReferenceCheck, distinctCheck],
  };
}

function gradeActivityRules(
  evidence: StructuredEvidence,
  rules: Array<{
    id: string;
    label: string;
    requiredTerms?: string[];
    minimumMatches?: number;
    requiredSections?: string[];
  }>,
) {
  const fieldForSection: Record<string, EvidenceFieldKey> = {
    context: "scenarioFact",
    "scenario fact": "scenarioFact",
    constraint: "boundary",
    boundary: "boundary",
    decision: "decision",
    verification: "verification",
    owner: "owner",
    escalation: "escalation",
  };
  const fullText = normalize(artifactText(evidence));
  return rules.map((rule) => {
    const requiredFields = (rule.requiredSections ?? [])
      .map((section) => fieldForSection[normalize(section)])
      .filter((field): field is EvidenceFieldKey => Boolean(field));
    const fieldsPresent = requiredFields.every((field) => words(evidence[field] ?? "").length >= 8);
    const matchedTerms = (rule.requiredTerms ?? []).filter((term) => fullText.includes(normalize(term)));
    const termsPresent = matchedTerms.length >= (rule.minimumMatches ?? rule.requiredTerms?.length ?? 0);
    const passed = fieldsPresent && termsPresent;
    return {
      id: `rule-${rule.id}`,
      label: rule.label,
      passed,
      detail: passed
        ? "Activity-specific requirement is present."
        : requiredFields.length && !fieldsPresent
          ? "Make the required decision fields specific and complete."
          : `Add concrete reasoning that addresses: ${(rule.requiredTerms ?? []).join(", ")}.`,
    };
  });
}

export function gradeCourseAttempt(input: {
  kind: CourseItemKind;
  itemId: string;
  answers: Record<string, string>;
  evidence: StructuredEvidence;
  missionChoices?: Record<string, string>;
}) {
  const item = findCourseItem(input.kind, input.itemId);
  if (!item) return null;
  let checkCorrect = 0;
  let checkTotal = 0;
  let explanations: Array<{ id: string; correct: boolean; explanation: string }> = [];
  let schema: ArtifactSchema;
  let validEvidenceReferences: string[] = [];
  let activityRules: Array<{
    id: string;
    label: string;
    requiredTerms?: string[];
    minimumMatches?: number;
    requiredSections?: string[];
  }> = [];
  let completionFeedback = "";
  let missionPathComplete = true;

  if (input.kind === "module") {
    const definition = item as (typeof aioModules)[number];
    checkTotal = definition.knowledgeChecks.length;
    explanations = definition.knowledgeChecks.map((question) => {
      const correct = input.answers[question.id] === question.correctChoiceId;
      if (correct) checkCorrect += 1;
      return {
        id: question.id,
        correct,
        explanation: correct
          ? question.explanation
          : `Revisit this misconception: ${question.misconception}. ${question.explanation}`,
      };
    });
    schema = definition.artifact;
    activityRules = definition.rules;
    completionFeedback = "Revise the exact decision boundary and verification method; do not add generic labels.";
  } else if (input.kind === "lab") {
    const lab = item as (typeof aioLabs)[number];
    schema = lab.evidence;
    activityRules = lab.rules;
    validEvidenceReferences = lab.assets.map((asset) => asset.name);
    completionFeedback = lab.revisionPrompt;
  } else {
    const mission = item as (typeof aioMissions)[number];
    const byId = new Map<string, (typeof mission.steps)[number]>(
      mission.steps.map((step) => [step.id, step]),
    );
    const visited: Array<(typeof mission.steps)[number]> = [];
    let nextId: string | undefined = mission.startStepId;
    while (nextId && byId.has(nextId) && visited.length < mission.steps.length) {
      const step: (typeof mission.steps)[number] = byId.get(nextId)!;
      visited.push(step);
      const selected = step.options.find((option) => option.id === input.missionChoices?.[step.id]);
      if (!selected) {
        missionPathComplete = false;
        break;
      }
      nextId = selected.nextStepId;
    }
    checkTotal = visited.length;
    explanations = visited.map((step) => {
      const selected = step.options.find((option) => option.id === input.missionChoices?.[step.id]);
      const correct = Boolean(selected?.safe);
      if (correct) checkCorrect += 1;
      return { id: step.id, correct, explanation: selected?.consequence ?? "Choose a decision before submitting." };
    });
    schema = mission.artifact;
    completionFeedback = "Revise by tying your mission state to a named boundary, owner, and verification point.";
  }

  const baseRubric = gradeEvidence(input.evidence, schema, validEvidenceReferences);
  const rubric = {
    ...baseRubric,
    checks: [...baseRubric.checks, ...gradeActivityRules(input.evidence, activityRules)],
  };
  const checkScore = checkTotal ? (checkCorrect / checkTotal) * 40 : 40;
  const evidenceScore =
    (rubric.checks.filter((check) => check.passed).length / Math.max(rubric.checks.length, 1)) * 60;
  const score = Math.round(checkScore + evidenceScore);
  const complete = score >= 75 && missionPathComplete && rubric.checks.every((check) => check.passed) && (checkTotal === 0 || checkCorrect === checkTotal);
  return {
    itemId: item.id,
    score,
    complete,
    checks: explanations,
    rubric,
    feedback: complete
      ? "Evidence saved. Your decision, boundary, verification, ownership, and recovery path are all explicit. Use the debrief to improve precision."
      : `Revision required. ${completionFeedback}`,
    artifact: artifactText(input.evidence),
  };
}
