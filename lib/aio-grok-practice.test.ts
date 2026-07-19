import { describe, expect, it } from "vitest";
import {
  fallbackGrokPracticeResult,
  getGrokPracticeTask,
  grokPracticeTasks,
  isGrokPracticeTaskId,
} from "./aio-grok-practice";

describe("aio-grok-practice", () => {
  it("exposes exactly three bounded fixtures", () => {
    expect(grokPracticeTasks.map((task) => task.id)).toEqual([
      "classify-cite",
      "abstain-conflict",
      "schema-repair",
    ]);
    expect(isGrokPracticeTaskId("classify-cite")).toBe(true);
    expect(isGrokPracticeTaskId("open-chat")).toBe(false);
  });

  it("returns deterministic fallback envelopes", () => {
    const task = getGrokPracticeTask("abstain-conflict")!;
    const result = fallbackGrokPracticeResult(task, "no key");
    expect(result.mode).toBe("fallback");
    expect(result.output.status).toBe("abstain");
    expect(result.output.conflict).toBe(true);
    expect(result.output.citations.length).toBeGreaterThanOrEqual(2);
  });
});
