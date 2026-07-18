export type ModelStrategyId = "structured-fast" | "freeform-large" | "rules-only";

export const codingModelStrategyScenario = {
  title: "Choose a bounded model strategy",
  task: "A fictional operations team needs a draft extraction of equipment, observations, and uncertainties from varied free-text maintenance reports. A person will review every result before any action.",
  constraints: ["p95 response under 2 seconds", "estimated inference cost under $0.02 per report", "schema validation before trusted policy", "visible degraded mode when the provider is unavailable"],
  options: [
    { id: "structured-fast", title: "Fast structured extraction with a safe fallback", p95Latency: "0.9 s", estimatedCost: "$0.009", schemaSupport: "Validated JSON schema", fallback: "Return a review-required degraded draft with no invented facts", tradeoff: "Best fit for this bounded prototype; still needs an evaluation set and provider monitoring." },
    { id: "freeform-large", title: "Largest free-form summary model with automatic retries", p95Latency: "3.5 s", estimatedCost: "$0.061", schemaSupport: "Narrative text only", fallback: "Retry until a fluent answer appears", tradeoff: "May sound polished, but exceeds the budget/latency constraints and has no dependable structured contract." },
    { id: "rules-only", title: "Deterministic keyword rules with no language model", p95Latency: "0.12 s", estimatedCost: "$0.000", schemaSupport: "Deterministic fields only", fallback: "Return no extracted observations", tradeoff: "Safe and inexpensive, but cannot meet the stated goal of extracting varied free-text observations without a separate rules authoring effort." },
  ] as const,
} as const;
