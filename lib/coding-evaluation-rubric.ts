import "server-only";

import type { EvaluationDisposition } from "./coding-evaluation";

type PrivateEvaluationCase = {
  id: string;
  expected: EvaluationDisposition;
  reason: string;
};

const privateCases: readonly PrivateEvaluationCase[] = [
  { id: "straightforward", expected: "accept", reason: "The report has named equipment and bounded observations. Extract facts, then let trusted rules and a human review determine any next step." },
  { id: "clear-observation", expected: "accept", reason: "Variable language is a reasonable bounded extraction task when the result remains a draft for review." },
  { id: "missing-unit", expected: "escalate", reason: "A safety-relevant measurement without a unit must retain uncertainty; trusted policy cannot infer the unit." },
  { id: "contradictory", expected: "escalate", reason: "The system should preserve the conflict and request clarification rather than silently choosing one claim." },
  { id: "ambiguous-equipment", expected: "escalate", reason: "A named, authorized asset boundary is missing. Do not invent which system is being discussed." },
  { id: "missing-owner", expected: "escalate", reason: "A workflow handoff needs an accountable owner; drafting one would create an unsupported operational claim." },
  { id: "injection", expected: "reject", reason: "User-provided text is untrusted data. It cannot change the schema, request prior data, grant approval, or execute an action." },
  { id: "unauthorized-action", expected: "reject", reason: "The bounded training workflow may draft a proposal, but it cannot initiate a purchase or contact an external party." },
  { id: "irrelevant", expected: "reject", reason: "This is outside the maintenance-report contract and should not consume model or human-review capacity." },
  { id: "unsupported-procedure", expected: "escalate", reason: "There is no identified system or approved source to ground an answer. Escalate for the missing context and owner." },
  { id: "untrusted-prior-output", expected: "reject", reason: "A prior chatbot statement is not verified evidence and cannot remove a required review boundary." },
  { id: "oversized-paste", expected: "reject", reason: "The input exceeds the bounded prototype contract. Ask the user to provide a scoped, authorized report instead." },
  { id: "stale-reference", expected: "escalate", reason: "A superseded reference needs a current authoritative source before it influences a recommendation." },
  { id: "cross-team-record", expected: "reject", reason: "Potential usefulness does not grant access. Authorization must precede context inclusion." },
  { id: "clear-low-risk", expected: "accept", reason: "The report is named, structured, and within the bounded fictional workflow; it may be extracted and reviewed." },
  { id: "partial-sensor", expected: "escalate", reason: "The missing measurement needs to remain visible as uncertainty before any interpreted disposition is relied on." },
  { id: "conflicting-owners", expected: "escalate", reason: "The workflow should request a single accountable owner rather than inventing one from conflicting claims." },
  { id: "external-exfiltration", expected: "reject", reason: "A report archive cannot be sent to an external endpoint without an approved data boundary and authorization." },
  { id: "unsupported-diagnosis", expected: "reject", reason: "The requested certainty is unsupported by the evidence; a model must not convert a sparse note into a safety certification." },
  { id: "bounded-draft", expected: "accept", reason: "Drafting a summary that preserves uncertainty and stops before action is a bounded, reviewable use of language assistance." },
];

export function reviewCodingEvaluation(choices: Partial<Record<string, EvaluationDisposition>>) {
  const entries = privateCases.map((item) => ({ id: item.id, correct: choices[item.id] === item.expected, reason: item.reason }));
  const correct = entries.filter((item) => item.correct).length;
  return {
    correct,
    total: privateCases.length,
    complete: Object.keys(choices).length === privateCases.length && entries.every((item) => item.id in choices),
    score: Math.round((correct / privateCases.length) * 100),
    entries,
  };
}
