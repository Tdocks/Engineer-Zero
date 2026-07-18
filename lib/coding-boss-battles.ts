import type { CodingCompetencyKey } from "./coding-developer";

export type CodingBossBattle = {
  id: string;
  title: string;
  phase: "terminal" | "api" | "ai" | "discovery" | "review";
  scenario: string;
  evidence: string;
  task: string;
  requiredClaims: string[];
  targetedHint: string;
  recoveryDrill: string;
  delayedRecall: string;
  competencyWeights: Partial<Record<CodingCompetencyKey, number>>;
};

export const codingBossBattles: CodingBossBattle[] = [
  {
    id: "boss-terminal-recovery", title: "Terminal escape room", phase: "terminal",
    scenario: "You created a project file in the wrong fictional directory. The next task must not rely on guesswork or destructive commands.",
    evidence: "/home/learner $ touch main.py\n/home/learner $ python main.py\npython: cannot open file 'main.py'\n/home/learner $ pwd\n/home/learner",
    task: "Describe the smallest safe recovery sequence and explain how each command verifies the outcome.",
    requiredClaims: ["pwd", "ls", "cd", "ai_prototype", "verify"], targetedHint: "Start by proving your current directory; do not create more files until the path is known.", recoveryDrill: "Replay the Safe Terminal lab from the parent directory and narrate the recovery.", delayedRecall: "Tomorrow: write the four command purposes from memory.", competencyWeights: { terminal: 1, testingDebugging: .4, defense: .4 },
  },
  {
    id: "boss-api-recovery", title: "Broken API recovery", phase: "api",
    scenario: "A fictional triage endpoint accepts an empty equipment name, classifies 90 as REVIEW, and performs all logic inside the route.",
    evidence: "POST /triage {\"equipment\": \"\", \"temperature\": 90}\n200 {\"status\": \"REVIEW\"}\n# route contains parsing, threshold condition, response formatting",
    task: "Classify the defects, state the first safe repair order, and name the tests that prevent regression.",
    requiredClaims: ["validation", "90", "service", "422", "test"], targetedHint: "Separate transport validation, the deterministic rule, and the proof of the exact boundary.", recoveryDrill: "Complete the Test Before Fix lab and add a request-validation case.", delayedRecall: "Tomorrow: explain why HTTP testing cannot replace direct service tests.", competencyWeights: { api: 1, testingDebugging: 1, dataInterfaces: .7, defense: .5 },
  },
  {
    id: "boss-hallucination", title: "AI hallucination investigation", phase: "ai",
    scenario: "A fictional model output confidently states a maintenance action that is absent from the supplied note and asks to execute it immediately.",
    evidence: "note: ‘Pump 7 has grinding noise; temperature unit missing.’\nmodel output: ‘Replace pump 7 now. I executed the action.’",
    task: "Contain the failure, identify the untrusted claim, and redesign the bounded workflow before another model call.",
    requiredClaims: ["untrusted", "validation", "uncertaint", "human", "approval"], targetedHint: "A fluent sentence is not evidence, authority, or a completed action.", recoveryDrill: "Repeat the AI Systems Lab with structured output and injection-as-data choices.", delayedRecall: "Tomorrow: give the trusted/untrusted path without looking at the diagram.", competencyWeights: { aiApplications: 1, securityReliability: 1, testingDebugging: .7, defense: .7 },
  },
  {
    id: "boss-unclear-requirement", title: "Unclear-requirements interview", phase: "discovery",
    scenario: "A stakeholder says, ‘Make an AI agent that handles every shift note by Friday.’ No data owner, error tolerance, or approval path is known.",
    evidence: "Requested outcome: ‘automate every note’\nKnown constraints: unknown\nProposed deadline: Friday",
    task: "Lead the first discovery conversation and recommend the smallest responsible next step.",
    requiredClaims: ["user", "input", "success", "scope", "read-only", "owner"], targetedHint: "Do not accept ‘agent’ as a requirement. Ask what decision, user, and evidence actually matter.", recoveryDrill: "Return to SCOPE: specify the problem and write a five-line prototype brief.", delayedRecall: "Tomorrow: name the first five questions before proposing a stack.", competencyWeights: { decomposition: 1, architecture: .7, aiApplications: .6, defense: 1 },
  },
  {
    id: "boss-production-review", title: "Production-readiness review", phase: "review",
    scenario: "A local demo works once. A leader asks to connect it to internal notes and make it broadly available next week.",
    evidence: "Current evidence: one local run; two unit tests; no named data owner; no evaluation set; no monitoring; no rollback plan.",
    task: "Give an honest go/no-go recommendation, name the missing evidence, and state the safe pilot boundary.",
    requiredClaims: ["no-go", "authorization", "evaluation", "monitor", "rollback", "pilot"], targetedHint: "A prototype needs a decision about expansion, not a promise that local success scales.", recoveryDrill: "Use the Review Board to produce an evidence packet and one explicit next production decision.", delayedRecall: "Tomorrow: distinguish a prototype limitation from a production control.", competencyWeights: { architecture: .8, securityReliability: 1, testingDebugging: .6, defense: 1 },
  },
];

function words(value: string) {
  return value.toLowerCase().match(/[a-z0-9][a-z0-9'/-]*/g) ?? [];
}

export function reviewBossBattle(battle: CodingBossBattle, response: string, hintCount: number) {
  const responseWords = words(response);
  const segments = response.toLowerCase().split(/[\n.!?]+/).map((segment) => segment.trim()).filter(Boolean);
  const uniqueRatio = responseWords.length ? new Set(responseWords).size / responseWords.length : 0;
  const found = battle.requiredClaims.filter((claim) => segments.some((segment) => words(segment).length >= 8 && segment.includes(claim)));
  const missing = battle.requiredClaims.filter((claim) => !found.includes(claim));
  const hasDepth = responseWords.length >= 75;
  const hasStructure = segments.length >= 3 && uniqueRatio >= .42;
  const specific = hasDepth && hasStructure;
  const score = Math.max(0, Math.min(100, Math.round((found.length / battle.requiredClaims.length) * 70 + (hasDepth ? 20 : 0) + (hasStructure ? 10 : 0) - (hintCount > 1 ? 5 : 0))));
  return {
    score,
    missing,
    status: missing.length === 0 && specific ? "reviewed" as const : "needs-retry" as const,
    feedback: missing.length
      ? `Before retrying, make these decisions explicit in full sentences: ${missing.join(", ")}.`
      : specific
        ? "The core decisions are specific enough to review. Revisit the delayed-recall prompt tomorrow without notes."
        : "Your core decisions are present. Add distinct evidence sentences, the order of recovery, and a concrete verification step before retrying; a list of labels is not a recovery plan.",
  };
}
