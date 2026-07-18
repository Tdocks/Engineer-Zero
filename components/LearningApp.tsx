"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, BrainCircuit, BriefcaseBusiness, Code2, Compass, FlaskConical, Gauge, LayoutDashboard, ListChecks, Sparkles, SunMoon } from "lucide-react";
import {
  competencyLabels,
  crashCoursePlan,
  trackList,
  tracks,
} from "@/lib/tracks";
import {
  accountabilityStatus,
  graduationStatus,
  localDay,
  learnerStorageKey,
  nextActivity,
  reviewText,
  trackReadiness,
} from "@/lib/learning";
import { useLearnerState } from "@/hooks/useLearnerState";
import type {
  Activity,
  AssessmentSummary,
  CareerLaunchpad,
  LearnerState,
  ProjectDraft,
  TrackId,
} from "@/lib/types";
import { AioCourseSurface } from "@/components/AioCourseSurface";
import { AioInterviewStudio } from "@/components/AioInterviewStudio";

type View =
  | "today"
  | "tracks"
  | "academy"
  | "labs"
  | "missions"
  | "projects"
  | "interview"
  | "launchpad"
  | "guidance"
  | "readiness";
const nav: Array<[View, string, typeof LayoutDashboard]> = [
  ["today", "Today", LayoutDashboard],
  ["tracks", "Tracks", Compass],
  ["academy", "Academy", BookOpen],
  ["labs", "Labs", FlaskConical],
  ["missions", "Missions", ListChecks],
  ["projects", "Projects", BriefcaseBusiness],
  ["interview", "Interview", BrainCircuit],
  ["launchpad", "Launchpad", Compass],
  ["guidance", "Guidance", Sparkles],
  ["readiness", "Readiness", Gauge],
];
const mobileNav: Array<[View, string, typeof LayoutDashboard]> = [
  ["today", "Today", LayoutDashboard],
  ["academy", "Learn", BookOpen],
  ["labs", "Labs", FlaskConical],
  ["interview", "Practice", BrainCircuit],
  ["readiness", "Progress", Gauge],
];
const mobileMoreNav = nav.filter(
  ([id]) => !mobileNav.some(([mobileId]) => mobileId === id) && id !== "today",
);

function interviewWindow(date?: string) {
  if (!date) return null;
  const today = new Date(localDay() + "T00:00:00");
  const target = new Date(date + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  return {
    days,
    formatted: target.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export function LearningApp({
  initialTrack = "applied-ai-operations",
}: {
  initialTrack?: TrackId;
}) {
  const { state, setState, hydrated } = useLearnerState(initialTrack);
  const [view, setView] = useState<View>("today");
  const [onboarding, setOnboarding] = useState(true);
  const [kyra, setKyra] = useState(false);
  const [mobileMore, setMobileMore] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.dataset.theme = state.preferences.theme;
  }, [state.preferences.theme]);
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    setOnboarding(!window.localStorage.getItem(learnerStorageKey));
  }, [hydrated]);
  const track = tracks[state.activeTrack];
  const readiness = useMemo(
    () => trackReadiness(state, state.activeTrack),
    [state],
  );
  const mark = (activity: Activity, score: number, feedback: string) =>
    setState((current) => ({
      ...current,
      progress: {
        ...current.progress,
        [activity.id]: {
          status: "complete",
          score,
          feedback,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  if (onboarding)
    return (
      <Onboarding
        initialTrack={initialTrack}
        onComplete={(profile, assessment, summary) => {
          setState((current) => ({
            ...current,
            profile,
            activeTrack: profile.targetTrack,
            assessments: {
              ...current.assessments,
              [profile.targetTrack]: assessment,
            },
            assessmentSummaries: summary
              ? {
                  ...current.assessmentSummaries,
                  [profile.targetTrack]: summary,
                }
              : current.assessmentSummaries,
          }));
          setOnboarding(false);
        }}
      />
    );
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">E0</span>
          <span>
            ENGINEER
            <br />
            ZERO
          </span>
        </div>
        <span className="product-label">PERSONAL PILOT · V1</span>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? "nav active" : "nav"}
              onClick={() => setView(id)}
            >
              <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link className="coding-program-link" href="/programs/coding-developer">
            <Code2 size={15} aria-hidden="true" /> Coding program
          </Link>
          <div className="learner">
            <span>{state.profile?.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <b>{state.profile?.name}</b>
              <small>{track.title}</small>
            </div>
          </div>
          <button
            className="quiet"
            onClick={() => {
              window.localStorage.removeItem(learnerStorageKey);
              window.location.reload();
            }}
          >
            Reset preview
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">
              {view.toUpperCase()} / {track.title.toUpperCase()}
            </span>
            <h1>
              {view === "today"
                ? `Welcome back, ${state.profile?.name}.`
                : nav.find(([id]) => id === view)?.[1]}
            </h1>
          </div>
          <div className="top-actions">
            <select
              value={state.activeTrack}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  activeTrack: event.target.value as TrackId,
                }))
              }
            >
              {trackList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <button className="kyra-button" onClick={() => setKyra(true)}>
              <Sparkles size={15} aria-hidden="true" /> <span className="kyra-label">Ask Kyra</span>
            </button>
            <label className="theme-select">
              <SunMoon size={15} aria-hidden="true" />
              <span className="sr-only">Choose color theme</span>
              <select
                aria-label="Choose color theme"
                value={state.preferences.theme}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      theme: event.target.value as "system" | "light" | "dark",
                    },
                  }))
                }
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMore(true)}
              aria-expanded={mobileMore}
              aria-controls="mobile-more-workspaces"
            >
              More
            </button>
          </div>
        </header>
        {view === "today" && (
          <Today
            state={state}
            trackId={state.activeTrack}
            readiness={readiness}
            onNavigate={setView}
            setState={setState}
          />
        )}
        {view === "tracks" && (
          <Tracks state={state} setState={setState} onNavigate={setView} />
        )}
        {view === "academy" && (
          <Activities
            state={state}
            setState={setState}
            trackId={state.activeTrack}
            type="lesson"
            mark={mark}
          />
        )}
        {view === "labs" && (
          <Activities
            state={state}
            setState={setState}
            trackId={state.activeTrack}
            type="lab"
            mark={mark}
          />
        )}
        {view === "missions" && (
          <Activities
            state={state}
            setState={setState}
            trackId={state.activeTrack}
            type="mission"
            mark={mark}
          />
        )}
        {view === "projects" && <Projects state={state} setState={setState} />}
        {view === "interview" &&
          (state.activeTrack === "applied-ai-operations" ? (
            <AioInterviewStudio state={state} setState={setState} />
          ) : (
            <Interview state={state} setState={setState} mark={mark} />
          ))}
        {view === "launchpad" && (
          <Launchpad state={state} setState={setState} />
        )}
        {view === "guidance" && <Guidance state={state} setState={setState} />}
        {view === "readiness" && (
          <Readiness
            state={state}
            trackId={state.activeTrack}
            readiness={readiness}
            onNavigate={setView}
          />
        )}
      </main>
      <nav className="mobile-nav" aria-label="Primary navigation">
        {mobileNav.map(([id, label, Icon]) => (
          <button
            key={id}
            className={
              view === id ? "mobile-nav-item active" : "mobile-nav-item"
            }
            onClick={() => setView(id)}
            aria-current={view === id ? "page" : undefined}
          >
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      {mobileMore && (
        <div className="mobile-more-layer" role="presentation">
          <section
            className="mobile-more-sheet"
            id="mobile-more-workspaces"
            role="dialog"
            aria-modal="true"
            aria-label="More workspaces"
          >
            <div className="mobile-more-head">
              <div>
                <span className="eyebrow teal">MORE WORKSPACES</span>
                <h2>Keep the whole plan close.</h2>
              </div>
              <button
                className="close"
                onClick={() => setMobileMore(false)}
                aria-label="Close more workspaces"
              >
                ×
              </button>
            </div>
            <nav>
              {mobileMoreNav.map(([id, label, Icon]) => (
                <button
                  key={id}
                  className="mobile-more-item"
                  onClick={() => {
                    setView(id);
                    setMobileMore(false);
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                  <div>
                    <b>{label}</b>
                    <small>
                      {id === "tracks"
                        ? "Switch or compare career paths"
                        : id === "missions"
                          ? "Work through ambiguous scenarios"
                          : id === "projects"
                            ? "Build interview-ready case studies"
                            : id === "launchpad"
                              ? "Turn progress into applications"
                              : "Plan your next growth move"}
                    </small>
                  </div>
                  <i>→</i>
                </button>
              ))}
            </nav>
          </section>
        </div>
      )}
      {kyra && <Kyra onClose={() => setKyra(false)} />}
    </div>
  );
}

function Onboarding({
  initialTrack,
  onComplete,
}: {
  initialTrack: TrackId;
  onComplete: (
    profile: NonNullable<LearnerState["profile"]>,
    assessment: Record<string, number | string>,
    summary?: AssessmentSummary,
  ) => void;
}) {
  type PublicBaselineQuestion = {
    id: string;
    prompt: string;
    competency: string;
    choices: Array<{ id: string; text: string }>;
  };
  const [name, setName] = useState("Tyler");
  const [targetTrack, setTrack] = useState<TrackId>(initialTrack);
  const [experience, setExperience] = useState<
    "new" | "builder" | "experienced"
  >("builder");
  const [goal, setGoal] = useState<"interview" | "career" | "both">("both");
  const [interviewDate, setInterviewDate] = useState("");
  const [stage, setStage] = useState<"profile" | "assessment" | "plan">("profile");
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [baselineQuestions, setBaselineQuestions] = useState<PublicBaselineQuestion[]>([]);
  const [assessmentError, setAssessmentError] = useState("");
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [baselineAttempt, setBaselineAttempt] = useState(0);
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary>();
  const track = tracks[targetTrack];
  const questions: PublicBaselineQuestion[] = baselineQuestions;
  const answeredCount = Object.keys(answers).length;
  const pageSize = 3;
  const pageCount = Math.max(1, Math.ceil(questions.length / pageSize));
  const visibleQuestions = questions.slice(page * pageSize, (page + 1) * pageSize);
  const pageComplete = visibleQuestions.every((question) => answers[question.id] !== undefined);
  const beginAssessment = () => {
    setAnswers({});
    setAssessmentError("");
    setPage(0);
    setLoadingAssessment(true);
    setBaselineAttempt((current) => current + 1);
    setStage("assessment");
  };
  useEffect(() => {
    if (stage !== "assessment") return;
    const controller = new AbortController();
    fetch(`/api/assessments/${targetTrack}?attempt=${encodeURIComponent(crypto.randomUUID())}`, {
      signal: controller.signal,
    })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("The baseline could not be loaded.")),
      )
      .then((data: { questions: PublicBaselineQuestion[] }) => {
        setBaselineQuestions(data.questions);
        setAnswers({});
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setAssessmentError(
          reason instanceof Error ? reason.message : "The baseline could not be loaded.",
        );
      })
      .finally(() => setLoadingAssessment(false));
    return () => controller.abort();
  }, [stage, targetTrack, baselineAttempt]);
  const completeAssessment = async () => {
    setSubmitting(true);
    setAssessmentError("");
    try {
      const response = await fetch(`/api/assessments/${targetTrack}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const result = (await response.json()) as {
        score?: number;
        competencyScores?: AssessmentSummary["competencyScores"];
        version?: string;
        error?: string;
      };
      if (!response.ok || result.score === undefined || !result.competencyScores) {
        setAssessmentError(result.error ?? "The baseline could not be scored.");
        return;
      }
      setAssessmentSummary({
        score: result.score,
        competencyScores: result.competencyScores,
        completedAt: new Date().toISOString(),
        version: result.version ?? `${targetTrack}-baseline-v2`,
      });
      setStage("plan");
    } finally {
      setSubmitting(false);
    }
  };
  if (stage === "plan")
    return (
      <div className="onboard">
        <section className="welcome-card onboarding-plan">
          <div className="brand"><span className="brand-mark">E0</span><span>ENGINEER<br />ZERO</span></div>
          <div className="onboard-steps" aria-label="Onboarding progress"><span className="complete">01 · Role</span><span className="complete">02 · Starting point</span><span className="complete">03 · Reality check</span><span className="current">04 · Your plan</span></div>
          <span className="eyebrow teal">PERSONAL LEARNING PLAN</span>
          <h1>Your next step is clear.</h1>
          <p>
            Start with a focused activity, then build toward evidence you can explain in an interview. Your plan remains adjustable as your confidence changes.
          </p>
          <div className="onboarding-plan-grid">
            <div><b>{track.title}</b><span>Selected role</span></div>
            <div><b>{assessmentSummary ? `${assessmentSummary.score}%` : "Starting point set"}</b><span>{assessmentSummary ? "baseline signal" : "baseline ready"}</span></div>
            <div><b>{goal === "interview" ? "Interview Sprint" : "Foundation path"}</b><span>recommended beginning</span></div>
          </div>
          <button className="primary wide" onClick={() => onComplete({ name, targetTrack, experience, goal, interviewDate }, answers, assessmentSummary)}>
            Open today’s work →
          </button>
        </section>
      </div>
    );
  if (stage === "assessment")
    return (
      <div className="onboard">
        <section className="assessment">
          <div className="onboard-steps" aria-label="Onboarding progress">
            <span className="complete">01 · Role</span>
            <span className="complete">02 · Starting point</span>
            <span className="current">03 · Reality check</span>
            <span>04 · Your plan</span>
          </div>
          <div className="assessment-heading">
            <div>
              <span className="eyebrow teal">
                REALITY CHECK / {track.title.toUpperCase()}
              </span>
              <h1>Show us how you think.</h1>
              <p>
                Take the baseline in eight short scenarios. Your results shape
                the first sprint and identify the highest-impact gap.
              </p>
            </div>
            <div className="assessment-counter" aria-live="polite">
              <b>{answeredCount}</b>
              <span>of {questions.length || 24} answered</span>
              <i>
                <em
                  style={{
                    width: `${(answeredCount / Math.max(questions.length, 24)) * 100}%`,
                  }}
                />
              </i>
            </div>
          </div>
          <div className="assessment-meta">
            <span>Scenario set {page + 1} of {pageCount}</span>
            <span>About 2 minutes per set</span>
            <span>Answer choices are randomized for this attempt</span>
          </div>
          {loadingAssessment ? (
            <section className="empty"><h2>Preparing your baseline…</h2><p>Building a new private answer form for this attempt.</p></section>
          ) : assessmentError ? (
            <section className="empty"><h2>Baseline unavailable</h2><p>{assessmentError}</p><button className="primary" onClick={() => setBaselineAttempt((current) => current + 1)}>Try again</button></section>
          ) : (
          <div className="question-grid">
            {visibleQuestions.map((question, localIndex) => (
              <article className="question" key={question.id}>
                <span>{String(page * pageSize + localIndex + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{question.prompt}</h3>
                  {question.choices.map((choice, choiceIndex) => (
                    <button
                      key={choice.id}
                      className={
                        answers[question.id] === choice.id
                          ? "answer selected"
                          : "answer"
                      }
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: choice.id,
                        }))
                      }
                    >
                      <i>{String.fromCharCode(65 + choiceIndex)}</i>
                      {choice.text}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          )}
          {!loadingAssessment && !assessmentError && (
            <div className="assessment-actions">
              <button className="quiet" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Back</button>
              {page < pageCount - 1 ? (
                <button className="primary" disabled={!pageComplete} onClick={() => setPage((current) => current + 1)}>Continue →</button>
              ) : (
                <button className="primary" disabled={answeredCount < questions.length || submitting} onClick={completeAssessment}>
                  {submitting ? "Scoring your baseline…" : "Create my learning plan →"}
                </button>
              )}
              {answeredCount < questions.length && page === pageCount - 1 && (
                <button className="link" onClick={() => setPage(Math.floor(questions.findIndex((question) => answers[question.id] === undefined) / pageSize))}>Review unanswered</button>
              )}
            </div>
          )}
        </section>
      </div>
    );
  return (
    <div className="onboard">
      <section className="welcome-card">
        <div className="brand">
          <span className="brand-mark">E0</span>
          <span>
            ENGINEER
            <br />
            ZERO
          </span>
        </div>
        <div className="onboard-steps" aria-label="Onboarding progress">
            <span className="current">01 · Role</span>
            <span>02 · Starting point</span>
            <span>03 · Reality check</span>
            <span>04 · Your plan</span>
        </div>
        <span className="eyebrow teal">A TECHNICAL LEARNING STUDIO</span>
        <h1>
          Build the judgment.
          <br />
          <em>Earn the confidence.</em>
        </h1>
        <p>
          Choose the role you are working toward. We’ll create a path around real decisions, simulated incidents, and evidence you can explain clearly.
        </p>
        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <div className="form-grid">
          <label>
            Experience
            <select
              value={experience}
              onChange={(event) =>
                setExperience(event.target.value as typeof experience)
              }
            >
              <option value="new">Starting from zero</option>
              <option value="builder">AI-assisted builder</option>
              <option value="experienced">Working professional</option>
            </select>
          </label>
          <label>
            Primary goal
            <select
              value={goal}
              onChange={(event) => setGoal(event.target.value as typeof goal)}
            >
              <option value="both">Interview + career growth</option>
              <option value="interview">Upcoming interview</option>
              <option value="career">Long-term career</option>
            </select>
          </label>
        </div>
        <label>
          Interview date <small>(optional)</small>
          <input
            type="date"
            value={interviewDate}
            onChange={(event) => setInterviewDate(event.target.value)}
          />
          <span className="field-note">
            We’ll prioritize the interview sprint when your date is close.
          </span>
        </label>
        <div className="track-choice">
          {trackList.map((item) => (
            <button
              key={item.id}
              className={targetTrack === item.id ? "chosen" : ""}
              onClick={() => setTrack(item.id)}
            >
              <span>{item.id === "applied-ai-operations" ? "AIO" : "IT"}</span>
              <div>
                <b>{item.title}</b>
                <small>{item.subtitle}</small>
              </div>
            </button>
          ))}
        </div>
        <button
          className="primary wide"
          disabled={!name.trim()}
          onClick={beginAssessment}
        >
          Build my starting plan →
        </button>
      </section>
    </div>
  );
}

function Today({
  state,
  trackId,
  readiness,
  onNavigate,
  setState,
}: {
  state: LearnerState;
  trackId: TrackId;
  readiness: ReturnType<typeof trackReadiness>;
  onNavigate: (view: View) => void;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
}) {
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [deadlineDraft, setDeadlineDraft] = useState(
    state.profile?.interviewDate ?? "",
  );
  const track = tracks[trackId];
  const next = nextActivity(state, trackId);
  const complete = Object.values(state.progress).filter(
    (item) => item.status === "complete",
  ).length;
  const completedCourseWork = state.courseAttempts.filter(
    (attempt) => attempt.complete,
  ).length;
  const verifiedEvidence = complete + completedCourseWork;
  const projectCount = state.projects.filter((project) =>
    project.id.startsWith(trackId),
  ).length;
  const interviewResponses = Object.keys(state.answers).length;
  const interview = interviewWindow(state.profile?.interviewDate);
  const progressLevel = Math.max(1, Math.floor(verifiedEvidence / 3) + 1);
  const progressIntoLevel = verifiedEvidence % 3;
  const nextLevelActivities = 3 - progressIntoLevel;
  const milestones = [
    {
      label: "First signal",
      detail: "Save your first verified piece of evidence.",
      unlocked: verifiedEvidence > 0,
    },
    {
      label: "Evidence loop",
      detail: "Complete three reviewed activities.",
      unlocked: verifiedEvidence >= 3,
    },
    {
      label: "Case builder",
      detail: "Start a project case study.",
      unlocked: projectCount > 0,
    },
    {
      label: "Pressure rep",
      detail: "Save an interview response.",
      unlocked: interviewResponses > 0,
    },
  ];
  const accountability = accountabilityStatus(state);
  const graduation = graduationStatus(state, trackId);
  const aioNextActions = trackId === "applied-ai-operations"
    ? [
        { level: "know" as const, title: "Role Concepts Library", description: "Build the vocabulary to recognize a system boundary and know when to involve a specialist." },
        { level: "practice" as const, title: "48-Hour Interview Sprint", description: "Rehearse role-relevant explanations, decisions, and project stories with targeted feedback." },
        { level: "prove" as const, title: "Zero-to-Role Foundation", description: "Create independent Python and system evidence before claiming implementation capability." },
      ]
    : [];
  const checkIn = () =>
    setState((current) => ({
      ...current,
      accountability: {
        ...current.accountability,
        completedDates: current.accountability.completedDates.includes(
          accountability.today,
        )
          ? current.accountability.completedDates
          : [...current.accountability.completedDates, accountability.today],
      },
    }));
  const recover = () =>
    setState((current) => ({
      ...current,
      accountability: {
        ...current.accountability,
        recoveredDates: [
          ...current.accountability.recoveredDates,
          accountability.yesterday,
        ],
      },
    }));
  const saveDeadline = () => {
    setState((current) => ({
      ...current,
      profile: current.profile
        ? { ...current.profile, interviewDate: deadlineDraft }
        : current.profile,
    }));
    setEditingDeadline(false);
  };
  return (
    <div className="content">
      <section className="hero">
        <div>
          <span className="eyebrow teal">{track.subtitle.toUpperCase()}</span>
          <h2>{track.roleSummary}</h2>
          <p>
            Everything here is evidence-based. Learn by building, diagnosing,
            explaining, troubleshooting, and improving—not by clicking
            “complete.”
          </p>
        </div>
        <div className="score-card score-card-visual">
          <div
            className="readiness-ring"
            style={{
              background: `conic-gradient(var(--teal) 0deg ${readiness.overall * 3.6}deg, #273346 ${readiness.overall * 3.6}deg 360deg)`,
            }}
            aria-label={`${readiness.overall}% readiness`}
          >
            <div>
              <b>{readiness.overall}</b>
              <small>%</small>
            </div>
          </div>
          <div>
            <span>READINESS SIGNAL</span>
            <p>{verifiedEvidence} verified activities</p>
            <strong>Level {progressLevel}</strong>
            <em>
              {nextLevelActivities}{" "}
              {nextLevelActivities === 1 ? "activity" : "activities"} to next
              level
            </em>
          </div>
        </div>
      </section>
      <section className="next-card">
        <div>
          <span className="eyebrow amber">
            NEXT BEST ACTION · {next.duration} MIN
          </span>
          <h2>{next.title}</h2>
          <p>{next.summary}</p>
          <div className="tags">
            <span>{next.phaseId.replace("-", " ")}</span>
            <span>{next.pillar}</span>
          </div>
        </div>
        <button
          className="primary"
          onClick={() =>
            onNavigate(
              next.type === "lab"
                ? "labs"
                : next.type === "mission"
                  ? "missions"
                  : next.type === "interview" || next.type === "drill"
                    ? "interview"
                    : "academy",
            )
          }
        >
          Open activity →
        </button>
      </section>
      {trackId === "applied-ai-operations" && (
        <section className="evidence-path" aria-label="Next evidence by capability level">
          <header>
            <span className="eyebrow teal">NEXT BEST BY EVIDENCE LEVEL</span>
            <p>Concept fluency, guided practice, and independent proof are tracked separately.</p>
          </header>
          <div>
            {aioNextActions.map(({ level, title, description }) => (
              <article key={level}>
                <b className={`capability ${level}`}>{level}</b>
                <h3>{title}</h3>
                <p>{description}</p>
                <button className="link" onClick={() => onNavigate("academy")}>Open Academy →</button>
              </article>
            ))}
          </div>
        </section>
      )}
      <section
        className={interview ? "countdown-card active" : "countdown-card"}
      >
        <div className="countdown-marker">
          <span>{interview ? "◷" : "＋"}</span>
          <small>{interview ? "INTERVIEW WINDOW" : "SET A TARGET"}</small>
        </div>
        <div className="countdown-copy">
          {editingDeadline || !interview ? (
            <>
              <h2>Give the sprint a date.</h2>
              <p>
                A real deadline changes the recommended practice sequence and
                keeps the most interview-relevant work in front of you.
              </p>
              <div className="deadline-form">
                <input
                  type="date"
                  value={deadlineDraft}
                  onChange={(event) => setDeadlineDraft(event.target.value)}
                  aria-label="Interview date"
                />
                <button className="primary" onClick={saveDeadline}>
                  Save target
                </button>
                {editingDeadline && (
                  <button
                    className="link"
                    onClick={() => {
                      setDeadlineDraft(state.profile?.interviewDate ?? "");
                      setEditingDeadline(false);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h2>
                {interview.days < 0
                  ? "Interview date passed"
                  : interview.days === 0
                    ? "Interview day"
                    : interview.days === 1
                      ? "1 day to interview"
                      : interview.days + " days to interview"}
              </h2>
              <p>
                {interview.formatted} · Keep your packet, system-design
                practice, and project stories sharp.
              </p>
            </>
          )}
        </div>
        {interview && !editingDeadline && (
          <div className="countdown-actions">
            <button className="primary" onClick={() => onNavigate("interview")}>
              Open sprint →
            </button>
            <button className="link" onClick={() => setEditingDeadline(true)}>
              Change date
            </button>
          </div>
        )}
      </section>
      <section
        className="momentum-trail"
        aria-label="Earned learning milestones"
      >
        <div className="momentum-heading">
          <span className="eyebrow">EARNED MOMENTUM</span>
          <p>
            Progress comes from evidence, not passive completion. Your next
            unlock follows the work you save.
          </p>
        </div>
        <div className="milestone-list">
          {milestones.map((milestone, index) => (
            <article
              className={
                milestone.unlocked ? "milestone unlocked" : "milestone"
              }
              key={milestone.label}
            >
              <span>
                {milestone.unlocked ? "✓" : String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <b>{milestone.label}</b>
                <small>
                  {milestone.unlocked ? "Unlocked" : milestone.detail}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="accountability-grid">
        <article className="daily-card">
          <span className="eyebrow amber">DAILY CADENCE</span>
          <h2>{accountability.streak}-day consistency streak</h2>
          <p>
            {state.accountability.targetMinutes} focused minutes ·{" "}
            {state.accountability.daysPerWeek} days each week. A recovery day
            preserves momentum after life happens.
          </p>
          <div>
            <button
              className="primary"
              disabled={accountability.didStudyToday}
              onClick={checkIn}
            >
              {accountability.didStudyToday
                ? "Practice logged ✓"
                : "Log today’s practice"}
            </button>
            {accountability.canRecoverYesterday && (
              <button className="link" onClick={recover}>
                Use recovery for yesterday
              </button>
            )}
          </div>
        </article>
        <article className="daily-card graduation-mini">
          <span className="eyebrow teal">GRADUATION GATE</span>
          <h2>
            {graduation.eligible
              ? "Ready for verification"
              : `${graduation.remaining} evidence gaps left`}
          </h2>
          <p>
            Graduation is earned through readiness, capstone work, a case study,
            and interview practice.
          </p>
          <button className="secondary" onClick={() => onNavigate("readiness")}>
            View standard →
          </button>
        </article>
      </section>
      <section className="split">
        <div className="panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">YOUR READINESS</span>
              <h2>Capability evidence</h2>
            </div>
            <button className="link" onClick={() => onNavigate("readiness")}>
              Full map →
            </button>
          </div>
          {readiness.signals.slice(0, 5).map((item) => (
            <Signal key={item.key} label={item.label} value={item.value} />
          ))}
        </div>
        <div className="panel crash">
          <span className="eyebrow amber">CAREER LAUNCHPAD</span>
          <h2>Turn work into interviews.</h2>
          <p>
            Build the résumé story, LinkedIn positioning, outreach list,
            application plan, and interview calendar alongside your training.
          </p>
          <button className="secondary" onClick={() => onNavigate("launchpad")}>
            Open Launchpad →
          </button>
        </div>
      </section>
    </div>
  );
}

function Tracks({
  state,
  setState,
  onNavigate,
}: {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
  onNavigate: (view: View) => void;
}) {
  return (
    <div className="content">
      <div className="section-title">
        <div>
          <span className="eyebrow">CAREER TRACKS</span>
          <h2>Choose the work you want to own.</h2>
        </div>
        <span className="commerce-note">PAYMENT INTEGRATION READY</span>
      </div>
      <div className="track-grid">
        {trackList.map((track) => {
          const readiness = trackReadiness(state, track.id);
          const enrolled = state.enrolled.includes(track.id);
          return (
            <article className={`track-card ${track.accent}`} key={track.id}>
              <span className="track-number">
                {track.id === "applied-ai-operations" ? "01" : "02"}
              </span>
              <span className="eyebrow">
                {enrolled ? "ENROLLED" : "PREVIEW"}
              </span>
              <h2>{track.title}</h2>
              <p>{track.subtitle}</p>
              <div className="track-metric">
                <b>{readiness.overall}%</b>
                <span>readiness signal</span>
              </div>
              <ul>
                {track.phases.map((phase) => (
                  <li key={phase.id}>↗ {phase.title}</li>
                ))}
              </ul>
              <footer>
                <strong>{track.price}</strong>
                <div>
                  {enrolled ? (
                    <button
                      className="primary"
                      onClick={() => {
                        setState((current) => ({
                          ...current,
                          activeTrack: track.id,
                        }));
                        onNavigate("today");
                      }}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      className="primary"
                      onClick={() =>
                        setState((current) => ({
                          ...current,
                          enrolled: [...current.enrolled, track.id],
                          activeTrack: track.id,
                        }))
                      }
                    >
                      Preview enrollment →
                    </button>
                  )}
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Activities({
  state,
  setState,
  trackId,
  type,
  mark,
}: {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
  trackId: TrackId;
  type: "lesson" | "lab" | "mission";
  mark: (activity: Activity, score: number, feedback: string) => void;
}) {
  const [open, setOpen] = useState<Activity | null>(null);
  if (
    trackId === "applied-ai-operations" ||
    (trackId === "it-support-technician" && (type === "lesson" || type === "lab" || type === "mission"))
  )
    return (
            <AioCourseSurface
              kind={type === "lesson" ? "module" : type}
              state={state}
              trackId={trackId}
            />
    );
  const activities = tracks[trackId].activities.filter(
    (activity) => activity.type === type,
  );
  const copy =
    type === "lesson"
      ? ["ACADEMY", "Concepts that end in evidence."]
      : type === "lab"
        ? ["AI-NATIVE LABS", "Use AI. Keep your judgment."]
        : ["MISSIONS", "Solve the operating problem, not the feature request."];
  return (
    <div className="content">
      <div className="section-title">
        <div>
          <span className="eyebrow">{copy[0]}</span>
          <h2>{copy[1]}</h2>
        </div>
        <span className="track-name">{tracks[trackId].title}</span>
      </div>
      <p className="lede">
        {type === "lab"
          ? "Each lab records a reasoned decision. Production Incident activities intentionally remove AI assistance."
          : "Every activity requires an explanation, a decision, or an artifact before it can influence readiness."}
      </p>
      <div className="activity-grid">
        {activities.map((activity) => (
          <article className="activity-card" key={activity.id}>
            <div>
              <span className="mode">
                {activity.mode ?? activity.phaseId.replace("-", " ")}
              </span>
              <span className="eyebrow teal">{activity.pillar}</span>
            </div>
            <h3>{activity.title}</h3>
            <p>{activity.summary}</p>
            <footer>
              <span>
                {activity.duration} min ·{" "}
                {state.progress[activity.id]
                  ? "Evidence saved"
                  : activity.evidence}
              </span>
              <button onClick={() => setOpen(activity)}>
                {state.progress[activity.id] ? "Review →" : "Start →"}
              </button>
            </footer>
          </article>
        ))}
      </div>
      {open && (
        <ActivityModal
          activity={open}
          onClose={() => setOpen(null)}
          onComplete={(score, feedback) => {
            mark(open, score, feedback);
            setOpen(null);
          }}
        />
      )}
    </div>
  );
}

function ActivityModal({
  activity,
  onClose,
  onComplete,
}: {
  activity: Activity;
  onClose: () => void;
  onComplete: (score: number, feedback: string) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const submit = () => {
    if (activity.choices && choice !== null) {
      const correct = choice === activity.correctChoice;
      const next = correct
        ? "Strong decision. You identified a safe, controlled path and can now build on it."
        : "Revisit the safe operating boundary. The strongest answer contains a scoped action, evidence, and verification point.";
      setFeedback(next);
      onComplete(correct ? 92 : 48, next);
      return;
    }
    const review = reviewText(text);
    setFeedback(`${review.score}% · ${review.feedback}`);
    onComplete(review.score, review.feedback);
  };
  return (
    <div className="modal-layer">
      <section className="modal">
        <button className="close" onClick={onClose}>
          ×
        </button>
        <span className="eyebrow teal">
          {activity.mode ?? activity.phaseId.toUpperCase()} ·{" "}
          {activity.duration} MIN
        </span>
        <h2>{activity.title}</h2>
        <p>{activity.summary}</p>
        <div className="objective-list">
          {activity.objectives.map((item) => (
            <div key={item}>↗ {item}</div>
          ))}
        </div>
        {activity.choices ? (
          <div className="option-list">
            {activity.choices.map((item, index) => (
              <button
                key={item}
                className={choice === index ? "selected" : ""}
                onClick={() => setChoice(index)}
              >
                <i>{String.fromCharCode(65 + index)}</i>
                {item}
              </button>
            ))}
          </div>
        ) : (
          <label className="write-answer">
            <b>{activity.prompt ?? "Record your considered approach"}</b>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Name the context, constraint, decision, verification, and escalation point…"
            />
          </label>
        )}
        {feedback && <div className="feedback">{feedback}</div>}
        <button
          className="primary wide"
          disabled={
            activity.choices ? choice === null : text.trim().length < 40
          }
          onClick={submit}
        >
          {activity.evidence} →
        </button>
      </section>
    </div>
  );
}

function Projects({
  state,
  setState,
}: {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
}) {
  const templates = tracks[state.activeTrack].projects;
  const requiredFoundationProof = [
    "aio-foundation-01-system-map",
    "aio-foundation-02-python-reasoning",
    "aio-foundation-03-developer-workflow",
    "aio-foundation-04-validated-api",
    "aio-foundation-05-data-tests-identity",
    "aio-foundation-06-ai-native-engineering",
  ];
  const prototypesUnlocked =
    state.activeTrack !== "applied-ai-operations" ||
    requiredFoundationProof.every((id) =>
      state.courseAttempts.some(
        (attempt) =>
          attempt.itemId === id &&
          attempt.complete &&
          attempt.capabilityLevel === "prove",
      ),
    );
  const [active, setActive] = useState<ProjectDraft | null>(
    state.projects.find((project) =>
      project.id.startsWith(state.activeTrack),
    ) ?? null,
  );
  const create = (template: (typeof templates)[number]) => {
    if (template.repositoryPath && !prototypesUnlocked) return;
    const draft: ProjectDraft = {
      ...template,
      id: `${state.activeTrack}-${template.id}`,
      contribution: "",
      risks: "",
      result: "",
      reflection: "",
      updatedAt: new Date().toISOString(),
    };
    setState((current) => ({
      ...current,
      projects: [
        ...current.projects.filter((item) => item.id !== draft.id),
        draft,
      ],
    }));
    setActive(draft);
  };
  const update = (key: keyof ProjectDraft, value: string) => {
    if (!active) return;
    const next = {
      ...active,
      [key]: value,
      updatedAt: new Date().toISOString(),
    };
    setActive(next);
    setState((current) => ({
      ...current,
      projects: [
        ...current.projects.filter((item) => item.id !== next.id),
        next,
      ],
    }));
  };
  return (
    <div className="content">
      <div className="section-title">
        <div>
          <span className="eyebrow">PROJECT EVIDENCE</span>
          <h2>Make your work clear and credible.</h2>
        </div>
        <span className="track-name">Autosaved locally</span>
      </div>
      <p className="lede">
        Portfolio evidence is more credible when you can separate the problem,
        your personal contribution, the constraints, the test strategy, and the
        next iteration.
      </p>
      {state.activeTrack === "applied-ai-operations" && !prototypesUnlocked && (
        <section className="prototype-gate">
          <b>Local prototypes unlock after the six Foundation Bridge Prove activities.</b>
          <span>Complete the system map, Python, developer workflow, API, data/identity, and AI-native review evidence first. This keeps the repositories as real practice—not copy/paste projects.</span>
        </section>
      )}
      <div className="project-layout">
        <aside>
          {templates.map((template) => (
            <button
              key={template.id}
              className={
                active?.id === `${state.activeTrack}-${template.id}`
                  ? "selected"
                  : ""
              }
              disabled={Boolean(template.repositoryPath && !prototypesUnlocked)}
              onClick={() => create(template)}
            >
              <span>CASE STUDY</span>
              <b>{template.title}</b>
              <small>{template.repositoryPath && !prototypesUnlocked ? "Foundation proof required" : "Use template →"}</small>
            </button>
          ))}
        </aside>
        {active ? (
          <section className="editor">
            <div className="editor-head">
              <div>
                <span className="eyebrow teal">
                  {tracks[state.activeTrack].title.toUpperCase()}
                </span>
                <h2>{active.title}</h2>
              </div>
              <span>Evidence packet ready after completion.</span>
            </div>
            {active.repositoryPath && (
              <section className="prototype-guide">
                <span className="eyebrow amber">GUIDED LOCAL PROTOTYPE</span>
                <h3>Build and defend the real repository.</h3>
                <p>
                  Start in <code>{active.repositoryPath}</code>. It uses only
                  fictional data and includes tests, a README, and deliberate
                  failure exercises.
                </p>
                <ul>
                  {active.requiredEvidence?.map((item) => <li key={item}>↗ {item}</li>)}
                </ul>
              </section>
            )}
            {(
              [
                "problem",
                "constraints",
                "architecture",
                "success",
                "contribution",
                "risks",
                "result",
                "reflection",
              ] as Array<keyof ProjectDraft>
            ).map((field) => (
              <label key={field}>
                {field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (letter) => letter.toUpperCase())}
                <textarea
                  value={String(active[field])}
                  onChange={(event) => update(field, event.target.value)}
                  placeholder={
                    field === "contribution"
                      ? "What did you personally design, build, review, or lead?"
                      : "Add evidence, tradeoffs, and concrete details…"
                  }
                />
              </label>
            ))}
            <div className="defense">
              <b>Interview follow-up</b>
              <p>{active.defense}</p>
            </div>
          </section>
        ) : (
          <section className="empty">
            <h2>Start with an honest project.</h2>
            <p>
              Choose a fictional training template, then replace it with your
              own experience as your evidence grows.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function Launchpad({
  state,
  setState,
}: {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
}) {
  const launchpad = state.launchpad;
  const update = (key: keyof CareerLaunchpad, value: string) =>
    setState((current) => ({
      ...current,
      launchpad: { ...current.launchpad, [key]: value },
    }));
  const [contact, setContact] = useState({
    name: "",
    company: "",
    role: "",
    nextStep: "",
  });
  const [application, setApplication] = useState({
    company: "",
    role: "",
    nextStep: "",
  });
  const [appointment, setAppointment] = useState({
    company: "",
    role: "",
    date: "",
    stage: "",
    preparation: "",
  });
  const addContact = () => {
    if (!contact.name.trim() || !contact.company.trim()) return;
    setState((current) => ({
      ...current,
      launchpad: {
        ...current.launchpad,
        outreach: [
          ...current.launchpad.outreach,
          {
            id: crypto.randomUUID(),
            ...contact,
            channel: "LinkedIn",
            status: "Draft",
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    }));
    setContact({ name: "", company: "", role: "", nextStep: "" });
  };
  const addApplication = () => {
    if (!application.company.trim() || !application.role.trim()) return;
    setState((current) => ({
      ...current,
      launchpad: {
        ...current.launchpad,
        applications: [
          ...current.launchpad.applications,
          {
            id: crypto.randomUUID(),
            ...application,
            status: "Saved",
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    }));
    setApplication({ company: "", role: "", nextStep: "" });
  };
  const addInterview = () => {
    if (!appointment.company.trim() || !appointment.date) return;
    setState((current) => ({
      ...current,
      launchpad: {
        ...current.launchpad,
        interviews: [
          ...current.launchpad.interviews,
          { id: crypto.randomUUID(), ...appointment },
        ],
      },
    }));
    setAppointment({
      company: "",
      role: "",
      date: "",
      stage: "",
      preparation: "",
    });
  };
  return (
    <div className="content">
      <section className="launch-hero">
        <div>
          <span className="eyebrow teal">CAREER LAUNCHPAD</span>
          <h2>Build your proof before you need it.</h2>
          <p>
            Training alone is not a job search. Keep your positioning, evidence,
            outreach, applications, and interview preparation in one
            evidence-backed workspace.
          </p>
        </div>
        <div className="launch-counts">
          <b>
            {
              state.projects.filter((project) =>
                project.id.startsWith(state.activeTrack),
              ).length
            }
          </b>
          <span>case studies</span>
          <b>{launchpad.applications.length}</b>
          <span>applications tracked</span>
          <b>{launchpad.interviews.length}</b>
          <span>interviews scheduled</span>
        </div>
      </section>
      <section className="launch-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">YOUR POSITIONING</span>
            <h2>Résumé, LinkedIn, and portfolio story</h2>
          </div>
          <span className="track-name">Autosaved locally</span>
        </div>
        <div className="positioning-grid">
          <label>
            Professional summary
            <textarea
              value={launchpad.resumeSummary}
              onChange={(event) => update("resumeSummary", event.target.value)}
              placeholder="Three to five lines: role target, relevant operating strengths, technical evidence, and the value you create."
            />
          </label>
          <label>
            LinkedIn headline
            <input
              value={launchpad.linkedinHeadline}
              onChange={(event) =>
                update("linkedinHeadline", event.target.value)
              }
              placeholder="Example: Applied AI Operations Builder | Secure Enterprise Systems"
            />
          </label>
          <label>
            LinkedIn About
            <textarea
              value={launchpad.linkedinAbout}
              onChange={(event) => update("linkedinAbout", event.target.value)}
              placeholder="Write in a human voice: what you do, evidence of how you work, and what opportunity you want."
            />
          </label>
          <label>
            Portfolio introduction
            <textarea
              value={launchpad.portfolioIntro}
              onChange={(event) => update("portfolioIntro", event.target.value)}
              placeholder="Connect your case studies to the role and explain what you personally owned."
            />
          </label>
        </div>
      </section>
      <section className="tracker-grid">
        <Tracker
          title="Targeted outreach"
          subtitle="Build professional conversations—not mass applications."
          empty="No contacts yet. Add the first person you can learn from."
          items={launchpad.outreach.map((item) => ({
            id: item.id,
            title: item.name,
            meta: `${item.role || "Professional"} · ${item.company} · ${item.status}`,
            detail: item.nextStep,
          }))}
          form={
            <>
              <input
                value={contact.name}
                onChange={(event) =>
                  setContact({ ...contact, name: event.target.value })
                }
                placeholder="Name"
              />
              <input
                value={contact.company}
                onChange={(event) =>
                  setContact({ ...contact, company: event.target.value })
                }
                placeholder="Company"
              />
              <input
                value={contact.role}
                onChange={(event) =>
                  setContact({ ...contact, role: event.target.value })
                }
                placeholder="Role / connection"
              />
              <input
                value={contact.nextStep}
                onChange={(event) =>
                  setContact({ ...contact, nextStep: event.target.value })
                }
                placeholder="Next step"
              />
              <button className="primary" onClick={addContact}>
                Add contact
              </button>
            </>
          }
        />
        <Tracker
          title="Application board"
          subtitle="Every application needs an owner and a next move."
          empty="No roles saved yet. Save targets you can actually explain."
          items={launchpad.applications.map((item) => ({
            id: item.id,
            title: `${item.company} · ${item.role}`,
            meta: item.status,
            detail: item.nextStep,
          }))}
          form={
            <>
              <input
                value={application.company}
                onChange={(event) =>
                  setApplication({
                    ...application,
                    company: event.target.value,
                  })
                }
                placeholder="Company"
              />
              <input
                value={application.role}
                onChange={(event) =>
                  setApplication({ ...application, role: event.target.value })
                }
                placeholder="Target role"
              />
              <input
                value={application.nextStep}
                onChange={(event) =>
                  setApplication({
                    ...application,
                    nextStep: event.target.value,
                  })
                }
                placeholder="Next action / date"
              />
              <button className="primary" onClick={addApplication}>
                Save target
              </button>
            </>
          }
        />
      </section>
      <section className="launch-section">
        <div className="section-title">
          <div>
            <span className="eyebrow amber">INTERVIEW CALENDAR</span>
            <h2>Prepare before the calendar gets crowded.</h2>
          </div>
        </div>
        <div className="schedule-form">
          <input
            value={appointment.company}
            onChange={(event) =>
              setAppointment({ ...appointment, company: event.target.value })
            }
            placeholder="Company"
          />
          <input
            value={appointment.role}
            onChange={(event) =>
              setAppointment({ ...appointment, role: event.target.value })
            }
            placeholder="Role"
          />
          <input
            type="datetime-local"
            value={appointment.date}
            onChange={(event) =>
              setAppointment({ ...appointment, date: event.target.value })
            }
          />
          <input
            value={appointment.stage}
            onChange={(event) =>
              setAppointment({ ...appointment, stage: event.target.value })
            }
            placeholder="Stage: recruiter, technical, panel…"
          />
          <input
            value={appointment.preparation}
            onChange={(event) =>
              setAppointment({
                ...appointment,
                preparation: event.target.value,
              })
            }
            placeholder="What must be ready?"
          />
          <button className="primary" onClick={addInterview}>
            Schedule prep
          </button>
        </div>
        {launchpad.interviews.length ? (
          <div className="schedule-list">
            {launchpad.interviews.map((item) => (
              <article key={item.id}>
                <span>
                  {new Date(item.date).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <b>
                  {item.company} · {item.role || "Interview"}
                </b>
                <small>
                  {item.stage || "Interview"} ·{" "}
                  {item.preparation || "Open Interview Studio and rehearse."}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty compact">
            <h3>Your interview schedule will appear here.</h3>
            <p>
              Add a real date—or use this to schedule your own mock interview.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Tracker({
  title,
  subtitle,
  empty,
  items,
  form,
}: {
  title: string;
  subtitle: string;
  empty: string;
  items: Array<{ id: string; title: string; meta: string; detail: string }>;
  form: React.ReactNode;
}) {
  return (
    <section className="tracker">
      <span className="eyebrow">{title.toUpperCase()}</span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="tracker-items">
        {items.length ? (
          items.map((item) => (
            <article key={item.id}>
              <b>{item.title}</b>
              <span>{item.meta}</span>
              <small>{item.detail || "No next step recorded."}</small>
            </article>
          ))
        ) : (
          <div className="empty compact">
            <p>{empty}</p>
          </div>
        )}
      </div>
      <div className="tracker-form">{form}</div>
    </section>
  );
}

function Guidance({
  state,
  setState,
}: {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
}) {
  const [saved, setSaved] = useState(false);
  const updateBrief = (value: string) => {
    setSaved(false);
    setState((current) => ({
      ...current,
      launchpad: { ...current.launchpad, coachBrief: value },
    }));
  };
  const saveBrief = () => setSaved(true);
  return (
    <div className="content">
      <section className="guidance-hero">
        <span className="eyebrow violet">HUMAN GUIDANCE LAYER</span>
        <h2>Bring a strong brief to the human, not a vague request.</h2>
        <p>
          Coach matching and live workshops are intentionally a pilot-stage
          feature. Today, Engineer Zero helps learners prepare the evidence,
          questions, and context that make a human session worth paying for.
        </p>
      </section>
      <section className="guidance-grid">
        <article className="coach-brief">
          <span className="eyebrow teal">COACH BRIEF BUILDER</span>
          <h2>Ask for the right kind of help.</h2>
          <p>
            Include your target role, current evidence, the decision you are
            stuck on, and what feedback you want.
          </p>
          <textarea
            value={state.launchpad.coachBrief}
            onChange={(event) => updateBrief(event.target.value)}
            placeholder="Example: I am preparing for an IT Support Technician interview in two weeks. I need a review of my incident-triage story and whether my endpoint-lifecycle case study proves ownership…"
          />
          <button
            className="primary"
            disabled={state.launchpad.coachBrief.trim().length < 50}
            onClick={saveBrief}
          >
            {saved ? "Coach brief saved ✓" : "Save coach brief"}
          </button>
        </article>
        <article className="workshop-card">
          <span className="eyebrow amber">WORKSHOP INTEREST</span>
          <h2>Join the pilot list.</h2>
          <p>
            Future role-specific sessions will focus on interview panels,
            portfolio discussion, troubleshooting under pressure, and career
            launch strategy.
          </p>
          <button
            className={
              state.launchpad.workshopInterest
                ? "secondary selected-interest"
                : "secondary"
            }
            onClick={() =>
              setState((current) => ({
                ...current,
                launchpad: {
                  ...current.launchpad,
                  workshopInterest: !current.launchpad.workshopInterest,
                },
              }))
            }
          >
            {state.launchpad.workshopInterest
              ? "Interest recorded ✓"
              : "I’d attend a workshop"}
          </button>
          <small>
            No workshop date or paid coaching is being promised yet.
          </small>
        </article>
      </section>
      <section className="workshop-list">
        <div>
          <span className="eyebrow">SELF-GUIDED WORKSHOP PREP</span>
          <h2>Practice like a live session is next.</h2>
        </div>
        {[
          "Bring a project to a skeptical technical reviewer",
          "Explain a high-pressure incident without sounding reactive",
          "Turn a weak résumé bullet into clear evidence",
        ].map((title, index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <div>
              <b>{title}</b>
              <small>
                Build a short brief, practice in Interview Studio, then ask Kyra
                for the likely challenge.
              </small>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Interview({
  state,
  setState,
  mark,
}: {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
  mark: (activity: Activity, score: number, feedback: string) => void;
}) {
  const track = tracks[state.activeTrack];
  const [mode, setMode] = useState<"crash" | "rapid">("crash");
  const crashActivities = track.activities.filter(
    (item) => item.phaseId === "crash-course",
  );
  const rapidQuestions: Activity[] = track.interviewQuestions.map(
    (question) => ({
      id: question.id,
      phaseId: "interview-simulator",
      type: "interview",
      title: question.category,
      summary: question.why,
      duration: 12,
      pillar: question.category,
      objectives: [question.answerShape],
      evidence: "Save and score your answer",
      competencies: { communication: 1 },
      rubric: { criteria: [], minimumEvidence: [] },
      prompt: question.prompt,
    }),
  );
  const questions = mode === "crash" ? crashActivities : rapidQuestions;
  const [selectedId, setSelectedId] = useState(crashActivities[0]?.id ?? "");
  const selected = questions.find((item) => item.id === selectedId) ?? questions[0];
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const answer = drafts[selected?.id] ?? state.answers[selected?.id] ?? "";
  const [review, setReview] = useState("");
  const submit = () => {
    if (!selected) return;
    const result = reviewText(answer);
    setState((current) => ({
      ...current,
      answers: { ...current.answers, [selected.id]: answer },
    }));
    mark(selected, result.score, result.feedback);
    setReview(
      `${result.score}% · ${result.feedback} Follow-up: ${result.followUp}`,
    );
  };
  const jumpToPlan = (activityId?: string) => {
    if (!activityId) return;
    const activity = crashActivities.find((item) => item.id === activityId);
    if (activity) {
      setMode("crash");
      setSelectedId(activity.id);
      setReview("");
    }
  };
  return (
    <div className="content">
      <div className="section-title">
        <div>
          <span className="eyebrow">INTERVIEW STUDIO</span>
          <h2>Practice what you can explain.</h2>
        </div>
        <div className="toggle">
          <button
            className={mode === "crash" ? "on" : ""}
            onClick={() => {
              setMode("crash");
              setSelectedId(crashActivities[0]?.id ?? "");
              setReview("");
            }}
          >
            48-hour crash
          </button>
          <button
            className={mode === "rapid" ? "on" : ""}
            onClick={() => {
              setMode("rapid");
              setSelectedId(rapidQuestions[0]?.id ?? "");
              setReview("");
            }}
          >
            Rapid fire
          </button>
        </div>
      </div>
      {mode === "crash" && (
        <section className="crash-plan">
          <div>
            <span className="eyebrow amber">SEQUENCED EMERGENCY PATH</span>
            <h3>Study the right things in the right order.</h3>
            <p>
              Save the highlighted artifacts as you go. Use the full mock loop
              after you have a role narrative, technical explanations, and
              project evidence.
            </p>
          </div>
          <div className="crash-plan-grid">
            {crashCoursePlan[state.activeTrack].map((block, index) => (
              <button
                key={`${block.day}-${block.title}`}
                onClick={() => jumpToPlan(block.activityId)}
                className={
                  block.activityId && selected?.id === block.activityId
                    ? "active"
                    : ""
                }
              >
                <span>
                  {block.day} · {block.time}
                </span>
                <b>
                  {String(index + 1).padStart(2, "0")} {block.title}
                </b>
                <small>{block.focus}</small>
                {block.activityId && <em>Open practice →</em>}
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="interview-layout">
        <aside>
          {questions.map((question, index) => (
            <button
              className={selected?.id === question.id ? "selected" : ""}
              key={question.id}
              onClick={() => {
                setSelectedId(question.id);
                setReview("");
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <b>{question.title}</b>
                <small>{question.pillar}</small>
              </div>
            </button>
          ))}
        </aside>
        <section className="interview-card">
          <span className="eyebrow amber">
            {selected?.pillar.toUpperCase()} · {selected?.duration} MIN
          </span>
          <h2>{selected?.title}</h2>
          <p>{selected?.summary}</p>
          <div className="prompt-box">
            {selected?.prompt ?? selected?.objectives[0]}
          </div>
          <textarea
            value={answer}
            onChange={(event) => {
              if (!selected) return;
              setDrafts((current) => ({
                ...current,
                [selected.id]: event.target.value,
              }));
            }}
            placeholder="Answer as if this were the real interview. Lead with your recommendation, then evidence, tradeoffs, verification, and next step."
          />
          {review && <div className="feedback">{review}</div>}
          <button
            className="primary wide"
            disabled={answer.trim().length < 40}
            onClick={submit}
          >
            Save & score answer →
          </button>
        </section>
      </div>
    </div>
  );
}

function Readiness({
  state,
  trackId,
  readiness,
  onNavigate,
}: {
  state: LearnerState;
  trackId: TrackId;
  readiness: ReturnType<typeof trackReadiness>;
  onNavigate: (view: View) => void;
}) {
  const graduation = graduationStatus(state, trackId);
  return (
    <div className="content">
      <section className="readiness-hero">
        <div>
          <span className="eyebrow teal">
            {tracks[trackId].title.toUpperCase()}
          </span>
          <b>
            {readiness.overall}
            <small>%</small>
          </b>
          <h2>Readiness comes from evidence.</h2>
          <p>
            Your score combines scenario judgment, completed work, written
            responses, and project evidence. In this local pilot it is a
            practice signal, not independently verified credential evidence.
          </p>
        </div>
        <div>
          <span className="eyebrow amber">HIGHEST IMPACT NEXT</span>
          <h3>{readiness.weakest.label}</h3>
          <p>
            Build this signal with a targeted activity, then explain the result
            in the interview studio.
          </p>
          <button className="secondary" onClick={() => onNavigate("academy")}>
            Practice now →
          </button>
        </div>
      </section>
      <section
        className={`graduation-gate ${graduation.eligible ? "eligible" : ""}`}
      >
        <div>
          <span className="eyebrow amber">{trackId === "applied-ai-operations" ? "CREDENTIAL REVIEW STANDARD" : "TRACK GRADUATION STANDARD"}</span>
          <h2>
            {graduation.eligible
              ? "Ready for certificate review."
              : trackId === "applied-ai-operations"
                ? "Build evidence; verified review remains unavailable in this local pilot."
                : "Earn your evidence before the credential."}
          </h2>
          <p>
            A certificate represents verified demonstrated role readiness—not
            a collection of watched lessons or browser-stored scores.
          </p>
        </div>
        <div className="graduation-checks">
          {graduation.checks.map((check) => (
            <div key={check.label} className={check.done ? "done" : ""}>
              <span>{check.done ? "✓" : "○"}</span>
              <b>{check.label}</b>
              <small>{check.detail}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="matrix">
        <header>
          <span>Competency</span>
          <span>Understands</span>
          <span>Builds</span>
          <span>Troubleshoots</span>
          <span>Explains</span>
        </header>
        {readiness.signals.map((signal) => (
          <div key={signal.key}>
            <b>
              {signal.label}
              <small>{signal.value}% current signal</small>
            </b>
            {[
              ["Understands", signal.dimensions.understands],
              ["Builds", signal.dimensions.builds],
              ["Troubleshoots", signal.dimensions.troubleshoots],
              ["Explains", signal.dimensions.defends],
            ].map(
              ([label, value]) => (
                <span key={label}>
                  <i
                    style={{
                      width: `${Math.max(0, Number(value))}%`,
                    }}
                  />
                  {value}%
                </span>
              ),
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

function Kyra({ onClose }: { onClose: () => void }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const submit = () => {
    const review = reviewText(answer);
    setFeedback(
      `${review.score}% · ${review.feedback} Follow-up: ${review.followUp}`,
    );
  };
  return (
    <div className="kyra-layer">
      <section className="kyra">
        <header>
          <div>
            <span>K</span>
            <div>
              <b>Kyra</b>
              <small>Hybrid coach · structured feedback active</small>
            </div>
          </div>
          <button onClick={onClose}>×</button>
        </header>
        <div className="kyra-message">
          Start with the operating boundary. What does the user need, what is
          the risk, what authority do you have, and how will you verify the next
          move?
        </div>
        {feedback && <div className="feedback">{feedback}</div>}
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Explain your approach. Kyra will challenge the gaps, not write the answer for you…"
        />
        <footer>
          <span>Live coaching quota is configured server-side.</span>
          <button
            className="primary"
            disabled={!answer.trim()}
            onClick={submit}
          >
            Review →
          </button>
        </footer>
      </section>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div className="signal">
      <div>
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <i>
        <em style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}
