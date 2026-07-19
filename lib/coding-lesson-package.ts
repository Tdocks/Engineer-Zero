import type { CodingCompetencyKey, CodingLesson } from "./coding-developer";

export type CodingLessonFailure = {
  failure: string;
  recovery: string;
};

export type CodingLessonCheck = {
  question: string;
  answer: string;
};

export type CodingLessonBridge = {
  workspace: "lab" | "systems";
  challengeId?: string;
  label: string;
  why: string;
};

/** Rich instructional package. Legacy fields (explanation, practicePrompt) are
 * filled from teach/tryThis so older callers and review packet scans still work. */
export type CodingLessonPackage = CodingLesson & {
  whyItMatters: string;
  teach: string;
  tryThis: string;
  tryThisStarter?: string;
  tryThisSteps?: string[];
  expectedOutput?: string;
  hint?: string;
  commonFailures: CodingLessonFailure[];
  checkYourself: CodingLessonCheck[];
  bridgeToLab?: CodingLessonBridge;
};

export type CodingLessonDraft = {
  day: 1 | 2 | 3 | 4;
  order: number;
  competency: CodingCompetencyKey;
  title: string;
  objective: string;
  whyItMatters: string;
  teach: string;
  workedExample: string;
  tryThis: string;
  tryThisStarter?: string;
  tryThisSteps?: string[];
  expectedOutput?: string;
  hint?: string;
  commonFailures: CodingLessonFailure[];
  checkYourself: CodingLessonCheck[];
  defensePrompt: string;
  sourceIds: string[];
  mode: CodingLesson["mode"];
  bridgeToLab?: CodingLessonBridge;
  durationMinutes?: number;
};

const minTeachChars = 700;
const minWorkedChars = 240;
const minTryThisChars = 140;

export function buildCodingLesson(draft: CodingLessonDraft): CodingLessonPackage {
  const id = `coding-day-${draft.day}-${String(draft.order).padStart(2, "0")}`;
  return {
    id,
    day: draft.day,
    order: draft.order,
    title: draft.title,
    durationMinutes: draft.durationMinutes ?? 35,
    competency: draft.competency,
    objective: draft.objective,
    whyItMatters: draft.whyItMatters,
    teach: draft.teach,
    explanation: draft.teach,
    workedExample: draft.workedExample,
    tryThis: draft.tryThis,
    practicePrompt: draft.tryThis,
    tryThisStarter: draft.tryThisStarter,
    tryThisSteps: draft.tryThisSteps,
    expectedOutput: draft.expectedOutput,
    hint: draft.hint,
    commonFailures: draft.commonFailures,
    checkYourself: draft.checkYourself,
    defensePrompt: draft.defensePrompt,
    sourceIds: draft.sourceIds,
    mode: draft.mode,
    bridgeToLab: draft.bridgeToLab,
  };
}

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateLessonPackageDepth(lesson: CodingLessonPackage): string[] {
  const issues: string[] = [];
  if (!lesson.whyItMatters?.trim()) issues.push(`${lesson.id}: missing whyItMatters`);
  if ((lesson.teach?.length ?? 0) < minTeachChars) {
    issues.push(`${lesson.id}: teach block too short (${lesson.teach?.length ?? 0} chars, need ${minTeachChars})`);
  }
  if ((lesson.workedExample?.length ?? 0) < minWorkedChars) {
    issues.push(`${lesson.id}: workedExample too short`);
  }
  if (
    !lesson.workedExample.includes("\n") ||
    !/(→|\$|# |>>>|assert |return |def |pwd|ls |cd |POST |Case:|Workflow|Client |Handoff|Slice |Tradeoff)/m.test(lesson.workedExample)
  ) {
    issues.push(`${lesson.id}: workedExample must be multi-step with commands or code`);
  }
  const steps = (lesson.tryThisSteps ?? []).map((step) => step.trim()).filter(Boolean);
  if (lesson.tryThisSteps !== undefined && steps.length < 2) {
    issues.push(`${lesson.id}: tryThisSteps must include at least 2 non-empty steps when present`);
  }
  const tryThisLen = lesson.tryThis?.length ?? 0;
  const stepsChars = steps.join(" ").length;
  // Short intro is fine when a numbered checklist carries the practice detail.
  if (tryThisLen < minTryThisChars && steps.length < 2 && stepsChars < minTryThisChars) {
    issues.push(`${lesson.id}: tryThis too short`);
  }
  if (lesson.id === "coding-day-1-03" || lesson.id === "coding-day-1-04") {
    if (!lesson.expectedOutput?.trim()) {
      issues.push(`${lesson.id}: expectedOutput required for early Python packages`);
    }
    if (steps.length < 2) {
      issues.push(`${lesson.id}: tryThisSteps required (≥2) for early Python packages`);
    }
  }
  if (!lesson.commonFailures?.length || lesson.commonFailures.length < 2) {
    issues.push(`${lesson.id}: need at least 2 commonFailures`);
  }
  if (!lesson.checkYourself?.length || lesson.checkYourself.length < 2) {
    issues.push(`${lesson.id}: need at least 2 checkYourself items`);
  }
  for (const item of lesson.checkYourself ?? []) {
    if (!item.question?.trim() || !item.answer?.trim()) issues.push(`${lesson.id}: incomplete checkYourself item`);
  }
  for (const item of lesson.commonFailures ?? []) {
    if (!item.failure?.trim() || !item.recovery?.trim()) issues.push(`${lesson.id}: incomplete commonFailures item`);
  }
  if (wordCount([lesson.teach, lesson.workedExample, lesson.tryThis, lesson.whyItMatters].join(" ")) < 240) {
    issues.push(`${lesson.id}: overall instructional word count below package floor`);
  }
  return issues;
}

/** Day 1 labs that should be bridged from specific lessons. */
export const day1LabBridgeExpectations: Record<string, string> = {
  "coding-day-1-02": "coding-terminal-escape",
  "coding-day-1-04": "coding-triage-cli",
  "coding-day-1-06": "coding-triage-cli",
};
