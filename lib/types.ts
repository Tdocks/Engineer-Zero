export type TrackId = "applied-ai-operations" | "it-support-technician";
export type PhaseId =
  | "reality-check"
  | "crash-course"
  | "foundation-bridge"
  | "fast-track"
  | "master-track"
  | "interview-simulator";
export type CapabilityLevel = "know" | "practice" | "prove";
export type ActivityType = "lesson" | "drill" | "lab" | "mission" | "interview";
export type LearningMode =
  "Solo" | "Pair Programming" | "AI Builder" | "Production Incident";
export type CompetencyKey =
  | "foundations"
  | "roleJudgment"
  | "architecture"
  | "security"
  | "production"
  | "leadership"
  | "communication"
  | "aiCollaboration";

export type Rubric = {
  criteria: Array<{ label: string; weight: number }>;
  minimumEvidence: string[];
};
export type Activity = {
  id: string;
  phaseId: PhaseId;
  type: ActivityType;
  title: string;
  summary: string;
  duration: number;
  pillar: string;
  objectives: string[];
  evidence: string;
  competencies: Partial<Record<CompetencyKey, number>>;
  rubric: Rubric;
  mode?: LearningMode;
  choices?: string[];
  correctChoice?: number;
  prompt?: string;
  capstone?: boolean;
  capabilityLevel?: CapabilityLevel;
};
export type TrackDefinition = {
  id: TrackId;
  title: string;
  subtitle: string;
  price: string;
  accent: string;
  roleSummary: string;
  competencyWeights: Record<CompetencyKey, number>;
  assessment: AssessmentQuestion[];
  phases: Array<{
    id: PhaseId;
    title: string;
    duration: string;
    summary: string;
  }>;
  activities: Activity[];
  projects: ProjectTemplate[];
  interviewQuestions: InterviewQuestion[];
};
export type AssessmentQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correct: number;
  competency: CompetencyKey;
};
export type AssessmentSummary = {
  score: number;
  competencyScores: Partial<Record<CompetencyKey, number>>;
  completedAt: string;
  version: string;
};
export type ProjectTemplate = {
  id: string;
  title: string;
  problem: string;
  constraints: string;
  architecture: string;
  success: string;
  defense: string;
  repositoryPath?: string;
  requiredEvidence?: string[];
};
export type InterviewQuestion = {
  id: string;
  category: string;
  prompt: string;
  why: string;
  answerShape: string;
};
export type LearnerProfile = {
  name: string;
  targetTrack: TrackId;
  interviewDate?: string;
  experience: "new" | "builder" | "experienced";
  goal: "interview" | "career" | "both";
};
export type ProjectDraft = ProjectTemplate & {
  contribution: string;
  risks: string;
  result: string;
  reflection: string;
  updatedAt: string;
};
export type Progress = Record<
  string,
  { status: "complete"; score: number; updatedAt: string; feedback: string }
>;
export type OutreachContact = {
  id: string;
  name: string;
  company: string;
  role: string;
  channel: "LinkedIn" | "Email" | "Referral" | "Event";
  status: "Draft" | "Sent" | "Replied" | "Meeting";
  nextStep: string;
  updatedAt: string;
};
export type JobApplication = {
  id: string;
  company: string;
  role: string;
  status: "Saved" | "Applied" | "Screen" | "Interview" | "Offer" | "Closed";
  nextStep: string;
  updatedAt: string;
};
export type InterviewAppointment = {
  id: string;
  company: string;
  role: string;
  date: string;
  stage: string;
  preparation: string;
};
export type CareerLaunchpad = {
  resumeSummary: string;
  linkedinHeadline: string;
  linkedinAbout: string;
  portfolioIntro: string;
  outreach: OutreachContact[];
  applications: JobApplication[];
  interviews: InterviewAppointment[];
  coachBrief: string;
  workshopInterest: boolean;
};
export type Accountability = {
  targetMinutes: number;
  daysPerWeek: number;
  completedDates: string[];
  recoveredDates: string[];
  remindersEnabled: boolean;
};
export type CourseAttemptRecord = {
  id: string;
  itemId: string;
  version: string;
  kind: "module" | "lab" | "mission";
  score: number;
  complete: boolean;
  artifact: string;
  evidence?: import("./course-types").StructuredEvidence;
  answers: Record<string, string>;
  missionChoices: Record<string, string>;
  hintCount: number;
  revisionOf?: string;
  createdAt: string;
  competencies?: Partial<Record<CompetencyKey, number>>;
  evidenceDimension?: "understands" | "builds" | "troubleshoots" | "defends" | "aiCollaboration";
  capabilityLevel?: CapabilityLevel;
};
export type ThemePreference = "system" | "light" | "dark";
export type LearnerPreferences = {
  theme: ThemePreference;
  currentRoute?: string;
};
export type CourseStage =
  | "learn"
  | "check"
  | "practice"
  | "debrief"
  | "revision";
export type CourseDraft = {
  itemId: string;
  kind: "module" | "lab" | "mission";
  version: string;
  stage: CourseStage;
  answers: Record<string, string>;
  missionChoices: Record<string, string>;
  evidence: import("./course-types").StructuredEvidence;
  hintCount: number;
  revisionOf?: string;
  updatedAt: string;
};
export type CapstoneReview = {
  status:
    "not-submitted" | "ready-for-review" | "approved" | "changes-requested";
  reviewerName?: string;
  note?: string;
  updatedAt?: string;
};
export type LearnerState = {
  profile?: LearnerProfile;
  assessments: Record<TrackId, Record<string, number | string>>;
  assessmentSummaries: Partial<Record<TrackId, AssessmentSummary>>;
  progress: Progress;
  projects: ProjectDraft[];
  answers: Record<string, string>;
  enrolled: TrackId[];
  activeTrack: TrackId;
  launchpad: CareerLaunchpad;
  accountability: Accountability;
  courseAttempts: CourseAttemptRecord[];
  courseDrafts: Record<string, CourseDraft>;
  preferences: LearnerPreferences;
  capstoneReview: CapstoneReview;
};
