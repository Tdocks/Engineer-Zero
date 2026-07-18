import type { CodingChallenge } from "./coding-developer";

export type TutorStage = "predict" | "region" | "concept" | "pseudocode" | "partial" | "full";

export type TutorResponse = {
  stage: TutorStage;
  title: string;
  message: string;
  nextAction: string;
};

const stages: TutorStage[] = ["predict", "region", "concept", "pseudocode", "partial", "full"];

/** Deterministic tutor fallback. It deliberately never grades work or replaces
 * a sandbox run; it only sequences the smallest useful form of assistance. */
export function codingTutorResponse(challenge: CodingChallenge, code: string, hintCount: number): TutorResponse {
  const stage = stages[Math.min(hintCount, stages.length - 1)];
  const missing = challenge.requiredSignals.filter((signal) => !code.toLowerCase().includes(signal.toLowerCase()));
  const focus = missing[0] ?? challenge.requiredSignals[0];
  const common = `This exercise is about ${challenge.expectedOutcome.toLowerCase()}`;
  if (stage === "predict") return { stage, title: "Predict before changing code", message: `${common} Before looking for a fix, write what you expect the code to receive, return, and reject.`, nextAction: "Add a one-sentence prediction to your comprehension response." };
  if (stage === "region") return { stage, title: "Find the smallest region", message: `Inspect the portion responsible for “${focus}.” Do not rewrite unrelated code; identify the single contract or branch that owns this behavior.`, nextAction: "Highlight or name that line/function, then state its current versus expected behavior." };
  if (stage === "concept") return { stage, title: "Reconnect the concept", message: `The missing signal is “${focus}.” ${common} Use the lesson’s worked example to explain why that boundary belongs there.`, nextAction: "Return to the worked example, then explain the concept in your own words." };
  if (stage === "pseudocode") return { stage, title: "Write pseudocode, not a pasted solution", message: `Outline: validate the input → apply the narrow rule → return a predictable result → verify the stated case. Adapt the steps to “${focus}.”`, nextAction: "Write three to five pseudocode steps before editing the exercise." };
  if (stage === "partial") return { stage, title: "One partial correction", message: `Add only the smallest change that makes “${focus}” visible. Then stop and predict which test or observed behavior should change.`, nextAction: "Make one focused edit and record the test you would run locally." };
  return { stage, title: "Compare a complete pattern carefully", message: `A complete solution would satisfy these visible signals: ${challenge.requiredSignals.join(", ")}. Do not copy it blindly: rebuild the behavior from your own pseudocode, run the local project, and explain every boundary.`, nextAction: "Reset the starter only if needed, rebuild independently, then complete the comprehension gate." };
}
