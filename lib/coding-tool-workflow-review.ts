import "server-only";

import type { ToolWorkflowDisposition } from "@/lib/coding-tool-workflow";

const protectedCases: Record<string, { expected: ToolWorkflowDisposition; reason: string }> = {
  "procedure-search": {
    expected: "allow-read-only",
    reason: "The action remains read-only only after the service verifies the caller and applies document authorization. Retrieval does not grant access by itself.",
  },
  "draft-ticket": {
    expected: "request-approval",
    reason: "The model can prepare a structured proposal, but a person with the right authority must approve an external ticket and assignment.",
  },
  "close-incident": {
    expected: "reject",
    reason: "“Probably cleared” is not verified recovery evidence. The workflow must preserve the incident and escalate rather than silently remove a safeguard.",
  },
  "injected-export": {
    expected: "reject",
    reason: "The report is untrusted data. It cannot override policy or authorize disclosure of an incident archive.",
  },
};

export function reviewToolWorkflow(choices: Partial<Record<string, ToolWorkflowDisposition>>) {
  const entries = Object.entries(protectedCases).map(([id, rubric]) => ({
    id,
    correct: choices[id] === rubric.expected,
    reason: rubric.reason,
  }));
  return {
    total: entries.length,
    correct: entries.filter((entry) => entry.correct).length,
    complete: entries.every((entry) => choices[entry.id]),
    entries,
  };
}
