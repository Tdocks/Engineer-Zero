import type { CodingChallenge } from "./coding-developer";

export type TutorStage = "predict" | "region" | "concept" | "pseudocode" | "partial" | "full";

export type TutorResponse = {
  stage: TutorStage;
  title: string;
  message: string;
  nextAction: string;
  observedError?: {
    category: string;
    diagnosis: string;
  };
};

const stages: TutorStage[] = ["predict", "region", "concept", "pseudocode", "partial", "full"];

type TutorErrorInsight = TutorResponse["observedError"];

/**
 * Classifies only common, learner-supplied local error text. This is not a
 * code-execution result and deliberately returns a diagnostic direction, not
 * a repair or hidden solution.
 */
export function classifyTutorError(errorOutput?: string): TutorErrorInsight {
  const normalized = errorOutput?.trim().toLowerCase() ?? "";
  if (!normalized) return undefined;
  if (normalized.includes("syntaxerror") || normalized.includes("indentationerror")) return {
    category: "Syntax or indentation",
    diagnosis: "Read the first file and line named by the traceback, then check the nearby punctuation and indentation before changing any program logic.",
  };
  if (normalized.includes("modulenotfounderror") || normalized.includes("no module named")) return {
    category: "Environment or import",
    diagnosis: "Confirm the active virtual environment and the module name or working directory. Do not add packages until you know which import the project expects.",
  };
  if (normalized.includes("jsondecodeerror") || normalized.includes("invalid json")) return {
    category: "JSON shape",
    diagnosis: "Compare the supplied JSON with the declared request or response shape. Check delimiters, quoted keys, and whether the value should be an object, list, string, or number.",
  };
  if (normalized.includes("422") || normalized.includes("validationerror") || normalized.includes("pydantic")) return {
    category: "Request validation",
    diagnosis: "Treat this as a contract mismatch first. Compare the request field names and types with the input schema before changing the route or business rule.",
  };
  if (normalized.includes("assertionerror") || normalized.includes("assert ")) return {
    category: "Test expectation",
    diagnosis: "Identify the exact expected and actual values. Then decide whether the requirement, implementation, or test assumption is wrong—do not weaken the assertion just to make it pass.",
  };
  if (normalized.includes("api key") || normalized.includes("credential") || normalized.includes("unauthorized") || normalized.includes("forbidden")) return {
    category: "Credentials or authorization",
    diagnosis: "Stop before retrying. Verify the fictional training configuration and the intended permission boundary; never paste secrets into the tutor or hard-code credentials into a project.",
  };
  if (normalized.includes("keyerror") || normalized.includes("attributeerror") || normalized.includes("typeerror")) return {
    category: "Data shape or type",
    diagnosis: "Inspect the value at the failing boundary and compare it with the shape your function expects. Add or improve a narrow validation check rather than catching the error broadly.",
  };
  return {
    category: "Traceback triage",
    diagnosis: "Start with the exception type and first application file named in the traceback. State the expected versus observed behavior, then make one narrow hypothesis before editing.",
  };
}

/** Deterministic tutor fallback. It deliberately never grades work, receives
 * secrets, or replaces a sandbox run; it only sequences the smallest useful
 * form of assistance from learner-supplied code and local error text. */
export function codingTutorResponse(challenge: CodingChallenge, code: string, hintCount: number, errorOutput?: string): TutorResponse {
  const stage = stages[Math.min(hintCount, stages.length - 1)];
  const missing = challenge.requiredSignals.filter((signal) => !code.toLowerCase().includes(signal.toLowerCase()));
  const focus = missing[0] ?? challenge.requiredSignals[0];
  const common = `This exercise is about ${challenge.expectedOutcome.toLowerCase()}`;
  const observedError = classifyTutorError(errorOutput);
  if (stage === "predict") return { stage, title: "Predict before changing code", message: `${common} Before looking for a fix, write what you expect the code to receive, return, and reject.`, nextAction: "Add a one-sentence prediction to your comprehension response.", observedError };
  if (stage === "region") return { stage, title: "Find the smallest region", message: `Inspect the portion responsible for “${focus}.” Do not rewrite unrelated code; identify the single contract or branch that owns this behavior.`, nextAction: "Highlight or name that line/function, then state its current versus expected behavior.", observedError };
  if (stage === "concept") return { stage, title: "Reconnect the concept", message: `The missing signal is “${focus}.” ${common} Use the lesson’s worked example to explain why that boundary belongs there.`, nextAction: "Return to the worked example, then explain the concept in your own words.", observedError };
  if (stage === "pseudocode") return { stage, title: "Write pseudocode, not a pasted solution", message: `Outline: validate the input → apply the narrow rule → return a predictable result → verify the stated case. Adapt the steps to “${focus}.”`, nextAction: "Write three to five pseudocode steps before editing the exercise.", observedError };
  if (stage === "partial") return { stage, title: "One partial correction", message: `Add only the smallest change that makes “${focus}” visible. Then stop and predict which test or observed behavior should change.`, nextAction: "Make one focused edit and record the test you would run locally.", observedError };
  return { stage, title: "Compare a complete pattern carefully", message: `A complete solution would satisfy these visible signals: ${challenge.requiredSignals.join(", ")}. Do not copy it blindly: rebuild the behavior from your own pseudocode, run the local project, and explain every boundary.`, nextAction: "Reset the starter only if needed, rebuild independently, then complete the comprehension gate.", observedError };
}
