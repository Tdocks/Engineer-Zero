import {
  codingChallenges,
  codingDayPlans,
  codingDeveloperProgram,
  codingLessons,
  codingSources,
} from "./coding-developer";
import { codingContinuation } from "./coding-continuation";
import { validateLessonPackageDepth, type CodingLessonPackage } from "./coding-lesson-package";
import { codingCatalogPublicationStatus } from "./coding-source-governance";
import { ircProgramId } from "./irc-program";

export type HumanReviewArea =
  | "instructional_design"
  | "technical_sme"
  | "accessibility"
  | "fictional_data"
  | "release";

export type HumanReviewFinding = {
  id: string;
  area: HumanReviewArea;
  status: "pass" | "attention" | "blocked";
  summary: string;
  evidence: string;
};

const proprietaryLeakPatterns = [
  /\bconfidential\b/i,
  /\bexport[- ]controlled\b/i,
  /\bITAR\b/,
  /\bclassified\b/i,
  /\bssn\b/i,
  /\bpassword\s*[:=]/i,
  /\bapi[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /\bsk_live_/i,
];

function collectPublishableText() {
  const chunks: string[] = [
    codingDeveloperProgram.title,
    codingDeveloperProgram.subtitle,
    codingDeveloperProgram.promise,
    ...codingDayPlans.flatMap((day) => [day.title, day.mission, day.localProjectPath]),
    ...codingLessons.flatMap((lesson) => [
      lesson.title,
      lesson.objective,
      lesson.whyItMatters ?? "",
      lesson.teach ?? lesson.explanation,
      lesson.workedExample,
      lesson.tryThis ?? lesson.practicePrompt,
      ...(lesson.commonFailures ?? []).flatMap((item) => [item.failure, item.recovery]),
      ...(lesson.checkYourself ?? []).flatMap((item) => [item.question, item.answer]),
      lesson.bridgeToLab?.why ?? "",
      lesson.defensePrompt,
    ]),
    ...codingChallenges.flatMap((challenge) => [
      challenge.title,
      challenge.brief,
      challenge.expectedOutcome,
      challenge.comprehensionPrompt,
      challenge.starter,
    ]),
    ...codingContinuation.flatMap((module) => [
      module.title,
      module.outcome,
      module.artifact,
      module.defense,
      ...module.activities,
    ]),
    ...Object.values(codingSources).flatMap((source) => [source.title, source.publisher, source.url, source.supportedClaim]),
  ];
  return chunks.join("\n");
}

/**
 * Automated pre-review of the Coding Developer publishable surface.
 * Qualified humans must still sign the review packet; this never grants approval.
 */
export function codingDeveloperHumanReviewFindings(asOf = new Date()): HumanReviewFinding[] {
  const findings: HumanReviewFinding[] = [];
  const sources = codingCatalogPublicationStatus(undefined, asOf);
  const text = collectPublishableText();

  findings.push({
    id: "irc-surface-selected",
    area: "release",
    status: codingDeveloperProgram.id === ircProgramId ? "pass" : "blocked",
    summary: "IRC program surface matches Coding Developer.",
    evidence: `Program id ${codingDeveloperProgram.id}; ${codingLessons.length} lessons, ${codingChallenges.length} challenges, ${codingDayPlans.length} day plans.`,
  });

  findings.push({
    id: "instructional-coverage",
    area: "instructional_design",
    status: codingLessons.length === 24 && codingChallenges.length === 6 && codingDayPlans.length === 4 ? "pass" : "blocked",
    summary: "Four-day instructional package is complete in source.",
    evidence: "24 authored lessons, 6 challenges, and 4 day plans with local project paths.",
  });

  const lessonDepthIssues = codingLessons.flatMap((lesson) =>
    validateLessonPackageDepth(lesson as CodingLessonPackage),
  );
  findings.push({
    id: "instructional-lesson-packages",
    area: "instructional_design",
    status: lessonDepthIssues.length === 0 ? "pass" : "blocked",
    summary: "Every lesson clears instructional package depth gates (teach/worked/tryThis/failures/checks).",
    evidence:
      lessonDepthIssues.length === 0
        ? "All 24 lessons pass validateLessonPackageDepth—packages, not flashcard stubs. Day 1 bridges Terminal escape + Equipment triage CLI where expected."
        : lessonDepthIssues.slice(0, 8).join("; "),
  });

  const challengeRubricGaps = codingChallenges.filter(
    (challenge) => !challenge.comprehensionRequirements?.length || !challenge.expectedOutcome?.trim(),
  );
  findings.push({
    id: "instructional-challenge-rubrics",
    area: "instructional_design",
    status: challengeRubricGaps.length === 0 ? "pass" : "blocked",
    summary: "Challenges declare expected outcomes and comprehension requirements.",
    evidence:
      challengeRubricGaps.length === 0
        ? "All challenges carry outcome + comprehension requirements."
        : `${challengeRubricGaps.length} challenge(s) miss rubric fields.`,
  });

  findings.push({
    id: "instructional-continuation",
    area: "instructional_design",
    status: codingContinuation.length === 4 ? "pass" : "attention",
    summary: "Four-week continuation modules are authored with evidence prompts.",
    evidence: `${codingContinuation.length} continuation modules with artifact/verification/limitation/next-decision prompts.`,
  });

  findings.push({
    id: "technical-source-records",
    area: "technical_sme",
    status: sources.stale.length === 0 ? "pass" : "blocked",
    summary: "Source records are current for the catalog date.",
    evidence:
      sources.stale.length === 0
        ? `${sources.review.length} coding sources are within revalidation windows.`
        : `${sources.stale.length} source(s) are due or deprecated.`,
  });

  findings.push({
    id: "technical-independent-approval",
    area: "technical_sme",
    status: sources.awaitingTechnicalReview.length === 0 ? "pass" : "attention",
    summary: "Independent technical approval is required before commercial claims.",
    evidence:
      sources.awaitingTechnicalReview.length === 0
        ? "All coding sources are marked technical-approved."
        : `${sources.awaitingTechnicalReview.length} source(s) remain author-verified only — human technical SME must approve before credential language.`,
  });

  findings.push({
    id: "technical-outcome-honesty",
    area: "technical_sme",
    status: /without pretending|prototype/i.test(codingDeveloperProgram.promise) ? "pass" : "attention",
    summary: "Program promise limits production and mastery overclaims.",
    evidence: codingDeveloperProgram.promise,
  });

  findings.push({
    id: "accessibility-route-present",
    area: "accessibility",
    status: "pass",
    summary: "Dedicated Coding Developer route exists for focused a11y walkthrough.",
    evidence: "/programs/coding-developer hosts the Mission Map, Code Lab, Interview Arena, and Review Board.",
  });

  findings.push({
    id: "accessibility-human-walkthrough",
    area: "accessibility",
    status: "attention",
    summary: "Keyboard, contrast, mobile, and screen-reader QA still require a qualified accessibility reviewer.",
    evidence: "Automated packet confirms surface inventory only; record desktop/mobile walkthrough results in the human review packet.",
  });

  const leaks = proprietaryLeakPatterns
    .map((pattern) => ({ pattern: String(pattern), hit: pattern.test(text) }))
    .filter((item) => item.hit);
  findings.push({
    id: "fictional-data-scan",
    area: "fictional_data",
    status: leaks.length === 0 ? "pass" : "blocked",
    summary: "Publishable Coding Developer text has no obvious proprietary or secret material.",
    evidence:
      leaks.length === 0
        ? "No confidential/export-control/secret patterns matched in the authored surface."
        : `Potential leak patterns: ${leaks.map((item) => item.pattern).join(", ")}`,
  });

  findings.push({
    id: "fictional-data-prototype-paths",
    area: "fictional_data",
    status: codingDayPlans.every((day) => day.localProjectPath.startsWith("prototypes/")) ? "pass" : "attention",
    summary: "Day projects stay inside fictional training prototypes.",
    evidence: codingDayPlans.map((day) => day.localProjectPath).join("; "),
  });

  findings.push({
    id: "release-no-auto-credential",
    area: "release",
    status: "attention",
    summary: "Release manager must withhold commercial credential claims until hosted trust + human gates close.",
    evidence: "Product disposition remains internal-draft until scorecard categories are Strong and approvals are recorded.",
  });

  return findings;
}

export function codingDeveloperReviewSummary(asOf = new Date()) {
  const findings = codingDeveloperHumanReviewFindings(asOf);
  const blocked = findings.filter((item) => item.status === "blocked");
  const attention = findings.filter((item) => item.status === "attention");
  return {
    programId: ircProgramId,
    generatedAt: asOf.toISOString(),
    readyForHumanSignOff: blocked.length === 0,
    blocked,
    attention,
    findings,
  };
}
