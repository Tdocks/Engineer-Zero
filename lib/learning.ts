import { competencyLabels, tracks } from "./tracks";
import type { CompetencyKey, LearnerState, TrackId } from "./types";

export const emptyLearnerState: LearnerState = {
  assessments: { "applied-ai-operations": {}, "it-support-technician": {} },
  assessmentSummaries: {},
  progress: {},
  projects: [],
  answers: {},
  enrolled: ["applied-ai-operations", "it-support-technician"],
  activeTrack: "applied-ai-operations",
  launchpad: {
    resumeSummary: "",
    linkedinHeadline: "",
    linkedinAbout: "",
    portfolioIntro: "",
    outreach: [],
    applications: [],
    interviews: [],
    coachBrief: "",
    workshopInterest: false,
  },
  accountability: {
    targetMinutes: 45,
    daysPerWeek: 5,
    completedDates: [],
    recoveredDates: [],
    remindersEnabled: false,
  },
  courseAttempts: [],
  courseDrafts: {},
  preferences: { theme: "system" },
  capstoneReview: { status: "not-submitted" },
  programProgress: {},
};
export const learnerStorageKey = "engineer-zero-commercial-preview-v1";

export function normalizeLearnerState(
  saved: Partial<LearnerState>,
): LearnerState {
  return {
    ...emptyLearnerState,
    ...saved,
    assessments: { ...emptyLearnerState.assessments, ...saved.assessments },
    assessmentSummaries: {
      ...emptyLearnerState.assessmentSummaries,
      ...saved.assessmentSummaries,
    },
    launchpad: {
      ...emptyLearnerState.launchpad,
      ...saved.launchpad,
      outreach: saved.launchpad?.outreach ?? [],
      applications: saved.launchpad?.applications ?? [],
      interviews: saved.launchpad?.interviews ?? [],
    },
    accountability: {
      ...emptyLearnerState.accountability,
      ...saved.accountability,
    },
    courseAttempts: saved.courseAttempts ?? [],
    courseDrafts: saved.courseDrafts ?? {},
    preferences: {
      ...emptyLearnerState.preferences,
      ...saved.preferences,
    },
    capstoneReview: saved.capstoneReview ?? emptyLearnerState.capstoneReview,
    programProgress: Object.fromEntries(Object.entries(saved.programProgress ?? {}).map(([programId, progress]) => [
      programId,
      programId === "coding-developer"
        ? {
            ...progress,
            assessmentAttempts: progress.assessmentAttempts ?? [],
            interviewAttempts: progress.interviewAttempts ?? [],
            completedContinuationIds: progress.completedContinuationIds ?? [],
            continuationAttempts: progress.continuationAttempts ?? {},
            bossBattleAttempts: progress.bossBattleAttempts ?? {},
            reviewBoardAttempts: progress.reviewBoardAttempts ?? {},
            spacedReviewDue: progress.spacedReviewDue ?? [],
            reviewSchedule: progress.reviewSchedule ?? [],
            recallResponses: progress.recallResponses ?? {},
            workbenchDrafts: progress.workbenchDrafts ?? {},
            workbenchSnapshots: progress.workbenchSnapshots ?? {},
            challengeAttemptHistory: progress.challengeAttemptHistory ?? {},
            terminalSession: progress.terminalSession,
          }
        : progress,
    ])),
  };
}

export function localDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}
export function accountabilityStatus(state: LearnerState) {
  const today = localDay();
  const yesterday = localDay(-1);
  const complete = new Set([
    ...state.accountability.completedDates,
    ...state.accountability.recoveredDates,
  ]);
  let streak = 0;
  for (let offset = 0; complete.has(localDay(-offset)); offset += 1)
    streak += 1;
  return {
    today,
    yesterday,
    streak,
    didStudyToday: complete.has(today),
    canRecoverYesterday:
      !complete.has(yesterday) &&
      !state.accountability.recoveredDates.includes(yesterday),
  };
}

export function reviewText(text: string) {
  const normalized = text.toLowerCase();
  const keywords = [
    "constraint",
    "risk",
    "test",
    "verify",
    "human",
    "permission",
    "escalat",
    "evidence",
    "audit",
    "rollback",
    "metric",
    "impact",
  ];
  const matches = keywords.filter((item) => normalized.includes(item)).length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.min(
    100,
    Math.round(25 + Math.min(wordCount, 180) * 0.27 + matches * 7),
  );
  return {
    score,
    feedback:
      score >= 70
        ? "Strong response. You show a clear operating boundary and evidence-based next step. Tighten it by naming the precise success signal or escalation owner."
        : "Start with impact and constraints, then recommend one safe action, a verification step, and the point where you would escalate.",
    followUp:
      "What would change your mind, and how would you communicate that decision to the affected user?",
  };
}

export function trackReadiness(state: LearnerState, trackId: TrackId) {
  const track = tracks[trackId];
  const assessment = state.assessments[trackId];
  const storedSummary = state.assessmentSummaries[trackId];
  const assessmentScore = storedSummary
    ? storedSummary.score
    : Object.values(assessment).length
    ? Object.entries(assessment).reduce(
        (total, [id, answer]) =>
          total +
          (track.assessment.find((item) => item.id === id)?.correct === answer
            ? 85
            : 32),
        0,
      ) / Object.keys(assessment).length
    : 45;
  const related = track.activities.filter(
    (activity) => state.progress[activity.id],
  );
  const activityScore = related.length
    ? related.reduce(
        (total, activity) => total + state.progress[activity.id].score,
        0,
      ) / related.length
    : 0;
  // Course IDs are track-prefixed and local state can contain work for more
  // than one track. Keep readiness evidence isolated without pretending that
  // an IT Support simulation proves an AIO competency (or the reverse).
  const coursePrefix = trackId === "applied-ai-operations" ? "aio-" : "it-";
  const courseAttempts = state.courseAttempts.filter(
    (attempt) => attempt.complete && attempt.itemId.startsWith(coursePrefix),
  );
  const capabilityWeight = { know: 0.3, practice: 0.65, prove: 1 } as const;
  const courseScore = courseAttempts.length
    ? courseAttempts.reduce(
        (sum, attempt) => sum + attempt.score * capabilityWeight[attempt.capabilityLevel ?? "prove"],
        0,
      ) /
      courseAttempts.reduce((sum, attempt) => sum + capabilityWeight[attempt.capabilityLevel ?? "prove"], 0)
    : 0;
  const overall = Math.round(
    Math.min(
      97,
      trackId === "applied-ai-operations"
        ? assessmentScore * 0.55 +
            activityScore * 0.2 +
            courseScore * 0.15 +
            Math.min(state.projects.length * 5, 10)
        : assessmentScore * 0.57 +
            activityScore * 0.23 +
            courseScore * 0.1 +
            Math.min(state.projects.length * 5, 10),
    ),
  );
  const signals = Object.entries(competencyLabels).map(([key, label]) => {
    const competency = key as CompetencyKey;
    const base =
      storedSummary?.competencyScores[competency] !== undefined
        ? storedSummary.competencyScores[competency]! * 0.52
        : assessmentScore * 0.52;
    const relevantAttempts = courseAttempts.filter((attempt) => attempt.competencies?.[competency]);
    const dimensions = {
      understands: base,
      builds: 0,
      troubleshoots: 0,
      defends: 0,
      aiCollaboration: 0,
    };
    for (const attempt of relevantAttempts) {
      const competencyWeight = attempt.competencies?.[competency] ?? 0;
      const value = attempt.score * competencyWeight;
      const capability = attempt.capabilityLevel ?? "prove";
      // Know activities increase conceptual fluency only. They never create an
      // independent build, troubleshooting, or defense signal.
      if (capability === "know") {
        dimensions.understands += value * 0.07;
        continue;
      }
      if (capability === "practice") {
        dimensions.understands += value * 0.06;
        if (attempt.evidenceDimension === "troubleshoots") dimensions.troubleshoots += value * 0.035;
        if (attempt.evidenceDimension === "aiCollaboration") dimensions.aiCollaboration += value * 0.035;
        continue;
      }
      dimensions.understands += value * 0.04;
      if (attempt.evidenceDimension === "builds") dimensions.builds += value * 0.075;
      if (attempt.evidenceDimension === "troubleshoots") dimensions.troubleshoots += value * 0.075;
      if (attempt.evidenceDimension === "defends") dimensions.defends += value * 0.075;
      if (attempt.evidenceDimension === "aiCollaboration") dimensions.aiCollaboration += value * 0.075;
    }
    if (competency === "communication" && state.projects.length) {
      dimensions.defends += 8;
      dimensions.understands += 4;
    }
    const boundedDimensions = Object.fromEntries(
      Object.entries(dimensions).map(([dimension, value]) => [dimension, Math.round(Math.min(96, value))]),
    ) as Record<keyof typeof dimensions, number>;
    const value = Math.round(
      (boundedDimensions.understands * 0.45 + boundedDimensions.builds * 0.2 + boundedDimensions.troubleshoots * 0.15 + boundedDimensions.defends * 0.15 + boundedDimensions.aiCollaboration * 0.05),
    );
    return {
      key: competency,
      label,
      value,
      dimensions: boundedDimensions,
    };
  });
  return {
    overall,
    signals,
    weakest: [...signals].sort((a, b) => a.value - b.value)[0],
  };
}

export function nextActivity(state: LearnerState, trackId: TrackId) {
  const track = tracks[trackId];
  return (
    track.activities.find((activity) => !state.progress[activity.id]) ??
    track.activities[track.activities.length - 1]
  );
}

export function graduationStatus(state: LearnerState, trackId: TrackId) {
  const readiness = trackReadiness(state, trackId);
  const track = tracks[trackId];
  const capstone = track.activities.find((activity) => activity.capstone);
  const completeProject = state.projects.some(
    (project) =>
      project.id.startsWith(trackId) &&
      [
        project.contribution,
        project.risks,
        project.result,
        project.reflection,
      ].every((item) => item.trim().length >= 40),
  );
  const interviewEvidence = Object.entries(state.answers).filter(
    ([id, answer]) =>
      (track.interviewQuestions.some((question) => question.id === id) ||
        track.activities.some(
          (activity) =>
            activity.id === id &&
            (activity.type === "interview" || activity.type === "drill"),
        )) &&
      answer.trim().length >= 60,
  ).length;
  const caseStudies = state.projects.filter(
    (project) =>
      project.id.startsWith(trackId) &&
      [
        project.contribution,
        project.risks,
        project.result,
        project.reflection,
      ].every((item) => item.trim().length >= 40),
  ).length;
  const checks = [
    {
      label: "75% readiness signal",
      done: readiness.overall >= 75,
      detail: String(readiness.overall) + "% current",
    },
    ...(trackId === "applied-ai-operations"
      ? [{
          label: "Six Foundation Prove activities",
          done: ["aio-foundation-01-system-map", "aio-foundation-02-python-reasoning", "aio-foundation-03-developer-workflow", "aio-foundation-04-validated-api", "aio-foundation-05-data-tests-identity", "aio-foundation-06-ai-native-engineering"].every((id) => state.courseAttempts.some((attempt) => attempt.itemId === id && attempt.complete && attempt.capabilityLevel === "prove")),
          detail: `${["aio-foundation-01-system-map", "aio-foundation-02-python-reasoning", "aio-foundation-03-developer-workflow", "aio-foundation-04-validated-api", "aio-foundation-05-data-tests-identity", "aio-foundation-06-ai-native-engineering"].filter((id) => state.courseAttempts.some((attempt) => attempt.itemId === id && attempt.complete && attempt.capabilityLevel === "prove")).length}/6 independently proven`,
        }]
      : []),
    {
      label: "Capstone evidence",
      done: Boolean(capstone && state.progress[capstone.id]),
      detail: capstone?.title ?? "Capstone",
    },
    {
      label:
        trackId === "applied-ai-operations"
          ? "Two defensible case studies"
          : "Defensible case study",
      done:
        trackId === "applied-ai-operations"
          ? caseStudies >= 2
          : completeProject,
      detail:
        trackId === "applied-ai-operations"
          ? String(caseStudies) + "/2 complete"
          : "Contribution, risks, result, and reflection",
    },
    {
      label: "Three scored interview answers",
      done: interviewEvidence >= 3,
      detail: String(interviewEvidence) + "/3 saved",
    },
    ...(trackId === "applied-ai-operations"
      ? [
          {
            label: "Verified server evidence",
            done: false,
            detail:
              "Local pilot evidence is useful for practice but cannot qualify a credential until authenticated verification is configured.",
          },
          {
            label: "Qualified reviewer approval",
            done: state.capstoneReview.status === "approved",
            detail:
              state.capstoneReview.status === "approved"
                ? "Approved by reviewer"
                : "Human review required; certificates are never automatic.",
          },
        ]
      : []),
  ];
  return {
    eligible: checks.every((check) => check.done),
    checks,
    remaining: checks.filter((check) => !check.done).length,
  };
}
