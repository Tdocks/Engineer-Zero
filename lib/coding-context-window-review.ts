import "server-only";

import { codingContextBudget } from "./coding-context-window";

const required = new Set(["current-report", "approved-procedure"]);
const excluded = new Set(["old-procedure", "cross-team-history", "injected-note"]);

export function reviewCodingContextWindow(selected: string[], totalTokens: number) {
  const selectedSet = new Set(selected);
  const missing = [...required].filter((id) => !selectedSet.has(id));
  const unsafe = [...excluded].filter((id) => selectedSet.has(id));
  const withinBudget = totalTokens <= codingContextBudget;
  const complete = missing.length === 0 && unsafe.length === 0 && withinBudget;
  return {
    complete,
    withinBudget,
    totalTokens,
    budget: codingContextBudget,
    missing,
    unsafe,
    feedback: complete
      ? "The model receives the current assigned-team report and current authorized procedure only. Trusted policy still decides what happens next."
      : "Context needs a revision: keep the current authorized evidence, remove stale/cross-team/injected content, and stay inside the bounded context budget.",
  };
}
