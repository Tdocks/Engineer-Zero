import type { AssessmentSummary, PhaseId } from "./types";

export type FoundationRecommendation = {
  title: string;
  reason: string;
  path: "foundation-bridge" | "full-program";
  phaseId: PhaseId;
  week: number;
};

/**
 * A baseline route is guidance, not a waiver. It can move a learner forward,
 * but independent Prove evidence still gates prototypes and advanced work.
 */
export function recommendAioFoundationStart(
  summary?: AssessmentSummary,
): FoundationRecommendation {
  if (!summary) {
    return {
      title: "Start with Week 1: how software systems move work",
      reason: "No baseline evidence is saved yet. Begin with the system map so later Python, API, and AI concepts have a dependable frame.",
      path: "foundation-bridge",
      phaseId: "foundation-bridge",
      week: 1,
    };
  }
  const foundations = summary.competencyScores.foundations ?? summary.score;
  const architecture = summary.competencyScores.architecture ?? summary.score;
  const security = summary.competencyScores.security ?? summary.score;
  if (foundations < 60) {
    return {
      title: "Start with Week 1: systems and Python reasoning",
      reason: "Your baseline suggests that application boundaries and core programming vocabulary should come before API or retrieval work.",
      path: "foundation-bridge",
      phaseId: "foundation-bridge",
      week: 1,
    };
  }
  if (foundations < 75 || architecture < 65) {
    return {
      title: "Begin at Week 3: developer workflow",
      reason: "You have enough conceptual grounding to move into files, tracebacks, JSON, and debugging, while preserving the required API and testing proof tasks.",
      path: "foundation-bridge",
      phaseId: "foundation-bridge",
      week: 3,
    };
  }
  if (security < 70) {
    return {
      title: "Begin at Week 4: validated APIs, then identity",
      reason: "Your baseline can support a faster start, but API contracts and authorization evidence should be completed before any retrieval or tool workflow.",
      path: "foundation-bridge",
      phaseId: "foundation-bridge",
      week: 4,
    };
  }
  return {
    title: "Enter the Fast Track with Foundation proof tasks assigned",
    reason: "Your baseline supports faster progression. Complete the six Prove activities as remediation before local prototypes or advanced retrieval/tool work.",
    path: "full-program",
    phaseId: "fast-track",
    week: 7,
  };
}
