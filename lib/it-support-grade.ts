import "server-only";

import { itSupportLabs, itSupportSprintModules } from "./it-support-content";
import type { ArtifactSchema, EvidenceFieldKey, StructuredEvidence } from "./course-types";

const evidenceKeys: EvidenceFieldKey[] = ["scenarioFact", "decision", "boundary", "verification", "owner", "escalation"];
const labels: Record<EvidenceFieldKey, string> = {
  scenarioFact: "Scenario fact",
  decision: "Decision",
  boundary: "Boundary",
  verification: "Verification",
  owner: "Accountable owner",
  escalation: "Escalation or rollback",
};

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function lexicalDiversity(value: string) {
  const tokens = words(normalize(value)).filter((token) => token.length > 2);
  return tokens.length ? new Set(tokens).size / tokens.length : 0;
}

function artifactText(evidence: StructuredEvidence) {
  return evidenceKeys.map((key) => `${labels[key]}: ${evidence[key]}`).join("\n");
}

function gradeEvidence(evidence: StructuredEvidence, schema: ArtifactSchema) {
  const required = schema.requiredFields ?? evidenceKeys;
  const fieldChecks = required.map((key) => {
    const value = evidence[key] ?? "";
    const tokenCount = words(value).length;
    const passed = tokenCount >= 8 && lexicalDiversity(value) >= 0.45;
    return {
      id: `field-${key}`,
      label: labels[key],
      passed,
      detail: passed ? "Specific, distinct reasoning recorded." : tokenCount < 8 ? "Add a specific statement of at least eight words." : "Replace repeated or padded language with concrete reasoning.",
    };
  });
  const distinct = new Set(required.map((key) => normalize(evidence[key] ?? "")).filter(Boolean));
  return {
    wordCount: words(artifactText(evidence)).length,
    artifactLength: fieldChecks.every((check) => check.passed),
    checks: [
      ...fieldChecks,
      {
        id: "distinct-fields",
        label: "Distinct reasoning",
        passed: distinct.size === required.length,
        detail: "Each evidence field must make a different claim; copied headings do not count.",
      },
    ],
  };
}

function gradeRules(
  evidence: StructuredEvidence,
  rules: Array<{ id: string; label: string; requiredTerms?: string[]; minimumMatches?: number }>,
) {
  const text = normalize(artifactText(evidence));
  return rules.map((rule) => {
    const matched = (rule.requiredTerms ?? []).filter((term) => text.includes(normalize(term)));
    const required = rule.minimumMatches ?? rule.requiredTerms?.length ?? 0;
    const passed = matched.length >= required;
    return {
      id: `rule-${rule.id}`,
      label: rule.label,
      passed,
      detail: passed
        ? "Activity-specific requirement is present."
        : `Add specific reasoning that addresses: ${(rule.requiredTerms ?? []).join(", ")}.`,
    };
  });
}

/** Scores only authored IT Support Sprint modules. Unsupported activity kinds
 * deliberately receive no completion result until their own simulations exist. */
export function gradeItSupportCourseAttempt(input: {
  kind: "module" | "lab";
  itemId: string;
  answers: Record<string, string>;
  evidence: StructuredEvidence;
}) {
  const module = input.kind === "module"
    ? itSupportSprintModules.find((candidate) => candidate.id === input.itemId)
    : undefined;
  const lab = input.kind === "lab"
    ? itSupportLabs.find((candidate) => candidate.id === input.itemId)
    : undefined;
  const item = module ?? lab;
  if (!item) return null;
  const questions = module?.knowledgeChecks ?? [];
  let correct = 0;
  const checks = questions.map((question) => {
    const isCorrect = input.answers[question.id] === question.correctChoiceId;
    if (isCorrect) correct += 1;
    return {
      id: question.id,
      correct: isCorrect,
      explanation: isCorrect ? question.explanation : `Revisit this misconception: ${question.misconception}. ${question.explanation}`,
    };
  });
  const schema = module ? module.artifact : lab!.evidence;
  const baseRubric = gradeEvidence(input.evidence, schema);
  const rubric = {
    ...baseRubric,
    checks: [...baseRubric.checks, ...gradeRules(input.evidence, item.rules)],
  };
  const checkScore = questions.length ? (correct / questions.length) * 40 : 40;
  const evidenceScore = (rubric.checks.filter((check) => check.passed).length / rubric.checks.length) * 60;
  const score = Math.round(checkScore + evidenceScore);
  const complete = correct === questions.length && rubric.checks.every((check) => check.passed) && score >= 75;
  return {
    itemId: item.id,
    score,
    complete,
    checks,
    rubric,
    feedback: complete
      ? "Evidence saved. Your incident reasoning includes a specific decision, boundary, verification, owner, and escalation path."
      : "Revision required. Revisit the missed decision and make each evidence field specific to this fictional scenario.",
    artifact: artifactText(input.evidence),
  };
}
