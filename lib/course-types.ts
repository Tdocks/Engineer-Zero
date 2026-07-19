import type { CapabilityLevel, CompetencyKey, LearningMode, PhaseId } from "./types";

export type SourceReference = {
  title: string;
  url: string;
  publisher: string;
  accessed: string;
  version?: string;
  locator?: string;
  supportedClaim?: string;
  revalidateBy?: string;
};
export type ReviewState = "pending" | "approved";
export type ReviewStatus = {
  author: ReviewState;
  instructionalDesign: ReviewState;
  technicalSme: ReviewState;
  accessibility: ReviewState;
  fictionalData: ReviewState;
  versionApproved: ReviewState;
  notes?: string;
};
export type Choice = { id: string; text: string };
export type AssessmentItem = {
  id: string;
  prompt: string;
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
  misconception: string;
  competency: CompetencyKey;
  difficulty: "foundation" | "applied" | "advanced";
};
export type ArtifactSchema = {
  type:
    | "explanation"
    | "decision-record"
    | "diagram"
    | "evaluation-plan"
    | "risk-register"
    | "incident-report"
    | "case-study";
  required: string[];
  minimumWords?: number;
  requiredFields?: EvidenceFieldKey[];
  requireEvidenceReference?: boolean;
};
/**
 * A substantial learner-authored deliverable that does not fit into the six
 * decision-record fields (for example a 12-row evaluation matrix or a spoken
 * interview script). It is saved with the attempt and scored deterministically.
 */
export type WorkProductSchema = {
  label: string;
  prompt: string;
  placeholder?: string;
  minimumWords?: number;
  /** Count non-empty lines beginning with `entryPrefix` when supplied. */
  minimumEntries?: number;
  entryPrefix?: string;
  requiredTerms?: string[];
  minimumTermMatches?: number;
};
export type EvidenceFieldKey =
  | "scenarioFact"
  | "decision"
  | "boundary"
  | "verification"
  | "owner"
  | "escalation";
export type StructuredEvidence = Record<EvidenceFieldKey, string> & {
  evidenceReferences: string[];
};
export type DeterministicRule = {
  id: string;
  label: string;
  requiredTerms?: string[];
  minimumMatches?: number;
  requiredSections?: string[];
};
/** A semantic lesson unit, used by the academic reader instead of generic cards. */
export type CourseBlock =
  | { type: "prose"; heading?: string; body: string }
  | { type: "caseStudy"; heading?: string; body: string }
  | { type: "workedExample"; heading?: string; body: string }
  | { type: "keyTakeaway"; heading?: string; body: string }
  | { type: "misconception"; heading?: string; items: string[] }
  | { type: "evidenceAsset"; name: string; content: string; kind?: string };
export type CourseModule = {
  id: string;
  title: string;
  phaseId: PhaseId;
  week: number;
  durationMinutes: number;
  pillar: string;
  competencies: Partial<Record<CompetencyKey, number>>;
  prerequisites: string[];
  /** Know = explain/recognize, Practice = guided work, Prove = independent evidence. */
  capabilityLevel?: CapabilityLevel;
  /** A learner-facing statement of what this activity does and does not claim. */
  performanceExpectation?: string;
  /** The organizational or technical boundary the learner must recognize. */
  roleBoundary?: string;
  /** When independent action is not appropriate, identify the accountable specialist. */
  specialistEscalationGuidance?: string;
  /** An activity can appear in one or more entry paths without duplicating its content. */
  pathAvailability?: Array<
    | "sprint-48h"
    | "sprint-7-day"
    | "interview-emergency"
    | "foundation-bridge"
    | "full-program"
    | "concept-library"
  >;
  conceptGroup?: string;
  /** Research basis for the activity format, separate from sources for technical facts. */
  instructionalDesign?: {
    approach: string;
    rationale: string;
    sources: SourceReference[];
  };
  outcome: string;
  overview: string;
  /** Authored lesson sequence. `sections` remains during the catalog migration. */
  blocks?: CourseBlock[];
  sections: Array<{ heading: string; body: string }>;
  workedExample: string;
  misconceptions: string[];
  knowledgeChecks: AssessmentItem[];
  artifact: ArtifactSchema;
  workProduct?: WorkProductSchema;
  rules: DeterministicRule[];
  sources: SourceReference[];
  review: ReviewStatus;
  mdxPath: string;
};
export type ContentModule = CourseModule;
export type LessonDefinition = CourseModule;
export type QuestionChoice = Choice;
export type LabDefinition = {
  id: string;
  title: string;
  phaseId: PhaseId;
  pathAvailability?: CourseModule["pathAvailability"];
  mode: LearningMode;
  capabilityLevel?: CapabilityLevel;
  competencies: Partial<Record<CompetencyKey, number>>;
  scenario: string;
  assets: Array<{
    name: string;
    kind: "document" | "log" | "code" | "dataset" | "diagram";
    content: string;
  }>;
  task: string;
  workProduct?: WorkProductSchema;
  evidence: ArtifactSchema;
  rules: DeterministicRule[];
  debrief: string;
  revisionPrompt: string;
  sources: SourceReference[];
  review: ReviewStatus;
};
export type MissionStep = {
  id: string;
  title: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    safe: boolean;
    consequence: string;
    disposition?: "no-ai" | "conventional" | "read-only-ai" | "human-approved" | "unsafe";
    nextStepId?: string;
  }>;
  requiredChoiceId: string;
  acceptableChoiceIds?: string[];
};
export type MissionDefinition = {
  id: string;
  title: string;
  phaseId: PhaseId;
  competencies: Partial<Record<CompetencyKey, number>>;
  briefing: string;
  startStepId: string;
  steps: MissionStep[];
  artifact: ArtifactSchema;
  rules?: DeterministicRule[];
  debrief: string;
  sources: SourceReference[];
  review: ReviewStatus;
};
export type InterviewPrompt = {
  id: string;
  category: string;
  prompt: string;
  why: string;
  strongAnswer: string;
  commonMiss: string;
  followUp: string;
  rubric: string[];
  /** Timed mock duration when this prompt is used as a scenario drill. */
  timedMinutes?: 30 | 45 | 60 | 90;
  /** Optional fictional constraint or artifact the examinee must use under time pressure. */
  scenarioArtifact?: string;
  /** Primary-source records that support the technical claims or role practice
   * in this prompt. Examiner guidance remains server-only until an attempt is saved. */
  sources: SourceReference[];
};
export type ContentAttempt = {
  id: string;
  itemId: string;
  version: string;
  answers: Record<string, string>;
  artifact: string;
  evidence?: StructuredEvidence;
  ruleResults: Array<{ id: string; passed: boolean }>;
  score: number;
  revisionOf?: string;
  hintCount: number;
  createdAt: string;
};
export type Attempt = ContentAttempt;

export const draftReview: ReviewStatus = {
  author: "approved",
  instructionalDesign: "pending",
  technicalSme: "pending",
  accessibility: "pending",
  fictionalData: "approved",
  versionApproved: "pending",
  notes:
    "Internal draft: human instructional-design, technical, accessibility, and release approval are still required.",
};

export function isReleaseApproved(review: ReviewStatus) {
  return Object.entries(review)
    .filter(([key]) => key !== "notes")
    .every(([, state]) => state === "approved");
}
