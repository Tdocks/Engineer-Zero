import "server-only";

import type { ModelStrategyId } from "@/lib/coding-model-strategy";

export function reviewCodingModelStrategy(strategy: ModelStrategyId | "", rationale: string) {
  const normalized = rationale.toLowerCase();
  const requiredClaims = ["latency", "cost", "schema", "fallback", "human"];
  const missingClaims = requiredClaims.filter((claim) => !normalized.includes(claim));
  const complete = strategy === "structured-fast" && missingClaims.length === 0;
  return {
    complete,
    missingClaims,
    feedback: complete
      ? "This strategy meets the fictional latency and cost constraints while preserving a schema boundary, a human reviewer, and a visible degraded fallback. It is still a prototype decision that requires evaluation and provider monitoring."
      : "Choose a strategy that meets the stated extraction need and constraints, then explain latency, cost, schema validation, human review, and a safe fallback. A fluent answer or a cheap path alone does not satisfy the system boundary.",
  };
}
