import "server-only";

type EvidenceRequirement = {
  id: string;
  label: string;
  anchors: string[];
  minAnchors?: number;
};

export type CodingReviewBoardPrompt = {
  id: string;
  role: string;
  prompt: string;
  evidenceRequirements: EvidenceRequirement[];
};

const evidence = (id: string, label: string, anchors: string[], minAnchors = 2): EvidenceRequirement => ({ id, label, anchors, minAnchors });

export const codingReviewBoardPrompts: CodingReviewBoardPrompt[] = [
  {
    id: "product", role: "Product representative", prompt: "Which manual handoff decision becomes easier, and how will you know it helped?",
    evidenceRequirements: [
      evidence("outcome", "a concrete user outcome", ["handoff", "manual", "user", "decision", "shift"]),
      evidence("scope", "a bounded prototype scope", ["scope", "prototype", "only", "not", "limit"]),
      evidence("measure", "a measurable signal of usefulness", ["measure", "time", "metric", "review", "feedback"]),
      evidence("owner", "an accountable user or owner", ["owner", "operations", "user", "team", "stakeholder"]),
    ],
  },
  {
    id: "software", role: "Software engineer", prompt: "Why is the route separate from the service function, and which test proves the important business behavior?",
    evidenceRequirements: [
      evidence("boundary", "the route-versus-service boundary", ["route", "service", "function", "http", "business"]),
      evidence("reason", "a testability or reuse reason", ["test", "reuse", "logic", "isolate", "boundary"]),
      evidence("test", "a concrete business-rule test", ["assert", "test", "90", "threshold", "urgent"]),
      evidence("limitation", "a remaining system limitation", ["limitation", "production", "identity", "monitoring", "scale"]),
    ],
  },
  {
    id: "security", role: "Security engineer", prompt: "What data is out of scope for the model and how do you prevent an untrusted note from changing system behavior?",
    evidenceRequirements: [
      evidence("data", "a specific data boundary", ["data", "sensitive", "scope", "model", "send"]),
      evidence("injection", "untrusted-note or injection handling", ["untrusted", "injection", "note", "instruction", "data"]),
      evidence("validation", "trusted validation or policy", ["validation", "schema", "trusted", "policy", "code"]),
      evidence("escalation", "an escalation or audit step", ["audit", "log", "security", "escalate", "review"]),
    ],
  },
  {
    id: "operations", role: "Operations user", prompt: "What happens when the model is unavailable during a shift handoff?",
    evidenceRequirements: [
      evidence("failure", "the specific model-unavailable condition", ["model", "unavailable", "failure", "provider", "timeout"]),
      evidence("fallback", "a bounded degraded or manual fallback", ["fallback", "degraded", "manual", "draft", "continue"]),
      evidence("approval", "human review or approval behavior", ["human", "review", "approve", "operator", "owner"]),
      evidence("communication", "visible operational communication", ["message", "communicate", "log", "status", "notify"]),
    ],
  },
  {
    id: "assurance", role: "Assurance reviewer", prompt: "What makes this a prototype rather than an approved operational system?",
    evidenceRequirements: [
      evidence("limits", "a clear prototype limit", ["prototype", "limit", "not", "approved", "production"]),
      evidence("evidence", "test or evaluation evidence", ["test", "evaluation", "evidence", "assert", "case"]),
      evidence("approval", "a formal approval or accountable owner", ["approval", "owner", "review", "security", "authority"]),
      evidence("next", "a specific next production decision", ["next", "pilot", "monitoring", "risk", "scale"]),
    ],
  },
];

function words(value: string) {
  return value.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
}

export function reviewCodingBoardResponse(promptId: string, response: string) {
  const prompt = codingReviewBoardPrompts.find((item) => item.id === promptId);
  if (!prompt) return null;
  const segments = response.toLowerCase().split(/[\n.!?]+/).map((segment) => segment.trim()).filter(Boolean);
  const responseWords = words(response);
  const uniqueRatio = responseWords.length ? new Set(responseWords).size / responseWords.length : 0;
  const found = prompt.evidenceRequirements.filter((requirement) => segments.some((segment) => {
    const anchors = requirement.anchors.filter((anchor) => segment.includes(anchor)).length;
    return anchors >= (requirement.minAnchors ?? 2) && words(segment).length >= 8;
  }));
  const hasDepth = responseWords.length >= 85;
  const hasStructure = segments.length >= prompt.evidenceRequirements.length && uniqueRatio >= .42;
  const complete = found.length === prompt.evidenceRequirements.length && hasDepth && hasStructure;
  return {
    score: Math.round((found.length / prompt.evidenceRequirements.length) * 70 + (hasDepth ? 20 : 0) + (hasStructure ? 10 : 0)),
    status: complete ? "reviewed" as const : "needs-revision" as const,
    missing: prompt.evidenceRequirements.filter((item) => !found.includes(item)).map((item) => item.label),
    feedback: complete
      ? "This response gives the reviewer distinct role-specific claims. It remains local preparation evidence, not an approval decision."
      : "Strengthen the response with distinct, concrete evidence for: " + prompt.evidenceRequirements.filter((item) => !found.includes(item)).map((item) => item.label).join("; ") + ". Avoid repeating the prompt labels.",
  };
}
