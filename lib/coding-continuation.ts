import type { CodingCompetencyKey } from "./coding-developer";

export type ContinuationModule = {
  id: string;
  week: 1 | 2 | 3 | 4;
  title: string;
  outcome: string;
  activities: string[];
  artifact: string;
  defense: string;
  competencyWeights: Partial<Record<CodingCompetencyKey, number>>;
  sourceIds: string[];
  localProjectPath?: string;
};

export const codingContinuation: ContinuationModule[] = [
  { id: "continuation-week-1-stabilize", week: 1, title: "Rebuild and stabilize", outcome: "Turn sprint exposure into recall by rebuilding the important path without copying the original solution.", activities: ["Rebuild a small triage function from memory.", "Add one missed boundary test and repair one deliberate defect.", "Record a five-minute walkthrough using the project README.", "Inspect Git history and make one focused, reviewable commit."], artifact: "A rebuilt CLI or API branch with test output and an honest AI-assistance disclosure.", defense: "Which piece could you now rebuild without help, and which one still needs deliberate practice?", competencyWeights: { python: 1, testingDebugging: 1, git: .7, defense: .8 }, sourceIds: ["pythonTutorial", "pytest", "githubPr"] },
  { id: "continuation-week-2-data", week: 2, title: "Data, persistence, and production structure", outcome: "Add a small relational data model without mistaking local persistence for production readiness.", activities: ["Model issues as rows with IDs, status, owner, and timestamps.", "Use SQLite for a fictional Mission Issue Tracker.", "Separate repository access from service behavior.", "Write API integration tests and add structured application logging."], artifact: "Mission Issue Tracker with a schema note, CRUD contract, integration tests, and a decision record for SQLite.", defense: "When would a managed relational database become justified, and what does SQLite not solve?", competencyWeights: { dataInterfaces: 1, api: .8, architecture: .8, testingDebugging: .7, securityReliability: .4 }, sourceIds: ["pythonTutorial", "fastapiBody", "pytest"], localProjectPath: "prototypes/coding-developer/mission-issue-tracker" },
  { id: "continuation-week-3-retrieval", week: 3, title: "Applied AI engineering", outcome: "Build a permission-aware, source-grounded assistant with evaluation rather than unbounded chat behavior.", activities: ["Explain embeddings, chunking, metadata, and citations as separate concerns.", "Create a fictional approved document set and evaluation cases.", "Compare structured extraction or retrieval behavior across supported and unsupported prompts.", "Add prompt-injection, stale-source, and human-escalation cases."], artifact: "Procedure and maintenance document assistant design with evaluation set, citations, and a human-review boundary.", defense: "Why is a cited answer still not automatically trustworthy, and what evidence would change the design?", competencyWeights: { aiApplications: 1, securityReliability: .9, testingDebugging: .8, architecture: .7, defense: .8 }, sourceIds: ["nistAiRmf", "owaspGenAi", "openaiStructured"], localProjectPath: "prototypes/permission-aware-knowledge-assistant" },
  { id: "continuation-week-4-team", week: 4, title: "Team delivery and interview readiness", outcome: "Package technical work so another engineer can review, run, challenge, and improve it.", activities: ["Create a branch, focused pull request, and review checklist.", "Resolve a fictional merge conflict and explain the chosen behavior.", "Write an architecture diagram, README, deployment assumptions, and risk register.", "Run a mock system-design and behavioral interview with a changing requirement."], artifact: "Operational AI Assistant portfolio package: typed API, persistence, evaluation, tests, secure configuration plan, human-review workflow, and technical defense.", defense: "What would another engineer need to run this, what would security challenge, and what is your next production decision?", competencyWeights: { git: 1, defense: 1, architecture: .9, securityReliability: .8 }, sourceIds: ["githubPr", "nistSsdf", "nistAiRmf"], localProjectPath: "prototypes/human-approved-operations-triage" },
];
