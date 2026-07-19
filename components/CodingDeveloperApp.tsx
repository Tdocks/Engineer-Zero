"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Braces, Bug, Check, CircleAlert, ClipboardCheck, Code2, Flag, GitBranch, Mic, Route, Swords, Workflow } from "lucide-react";
import { useLearnerState } from "@/hooks/useLearnerState";
import { CodingAssessment } from "@/components/CodingAssessment";
import { CodingSystemsLab } from "@/components/CodingSystemsLab";
import { CodingContinuation } from "@/components/CodingContinuation";
import { CodingInterviewArena } from "@/components/CodingInterviewArena";
import { CodingBossBattles } from "@/components/CodingBossBattles";
import { CodingTutorPanel } from "@/components/CodingTutorPanel";
import { CodingFileWorkbench } from "@/components/CodingFileWorkbench";
import { CodingTerminalSimulator } from "@/components/CodingTerminalSimulator";
import { CodingRecallPractice } from "@/components/CodingRecallPractice";
import { CodingLessonReader } from "@/components/CodingLessonReader";
import { codingReviewBoardPrompts } from "@/lib/coding-review-board-prompts";
import {
  codingChallenges,
  codingDayPlans,
  codingCompetencies,
  codingBadges,
  codingRecoveryPlan,
  codingDeveloperProgram,
  codingInstructionalSourceIds,
  codingLessons,
  codingMastery,
  codingReadiness,
  codingGraduationStatus,
  codingSourceList,
  emptyCodingProgress,
  nextCodingLesson,
  reviewScheduleForLesson,
  type CodingChallenge,
  type CodingCompetencyKey,
  type CodingLesson,
} from "@/lib/coding-developer";
import type { CodingContinuationSubmission } from "@/lib/coding-continuation";

type Workspace = "map" | "lesson" | "assessment" | "lab" | "systems" | "boss" | "interview" | "continuation" | "review" | "recall";

function updateDate() {
  return new Date().toISOString();
}

export function CodingDeveloperApp() {
  const { state, setState } = useLearnerState("applied-ai-operations");
  const progress = state.programProgress["coding-developer"] ?? emptyCodingProgress();
  const [workspace, setWorkspace] = useState<Workspace>("map");
  const [selectedLessonId, setSelectedLessonId] = useState(() => nextCodingLesson(progress).id);
  const [selectedChallengeId, setSelectedChallengeId] = useState(codingChallenges[0].id);
  const [code, setCode] = useState(() => codingChallenges[0].starter);
  const [explanation, setExplanation] = useState("");
  const [localRunConfirmed, setLocalRunConfirmed] = useState(false);
  const [testConfirmed, setTestConfirmed] = useState(false);
  const [reviewingChallenge, setReviewingChallenge] = useState(false);
  const [challengeReviewError, setChallengeReviewError] = useState("");
  const [reviewingBoardId, setReviewingBoardId] = useState<string | null>(null);
  const [boardReviewError, setBoardReviewError] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme;
  }, [state.preferences.theme]);

  const lesson = codingLessons.find((item) => item.id === selectedLessonId) ?? codingLessons[0];
  const challenge = codingChallenges.find((item) => item.id === selectedChallengeId) ?? codingChallenges[0];
  const mastery = useMemo(() => codingMastery(progress), [progress]);
  const readiness = useMemo(() => codingReadiness(progress), [progress]);
  const graduation = useMemo(() => codingGraduationStatus(progress), [progress]);
  const badges = useMemo(() => codingBadges(progress), [progress]);
  const recovery = useMemo(() => codingRecoveryPlan(progress), [progress]);
  const upcomingReviews = useMemo(() => (progress.reviewSchedule ?? [])
    .filter((review) => !review.completedAt)
    .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime())
    .slice(0, 3), [progress.reviewSchedule]);
  const currentDayLessons = codingLessons.filter((item) => item.day === progress.activeDay);
  const completedToday = currentDayLessons.filter((item) => progress.completedLessonIds.includes(item.id)).length;

  const setProgress = (next: typeof progress) =>
    setState((current) => ({
      ...current,
      programProgress: { ...current.programProgress, "coding-developer": next },
    }));

  const markLesson = (item: CodingLesson) => {
    const completedLessonIds = progress.completedLessonIds.includes(item.id)
      ? progress.completedLessonIds
      : [...progress.completedLessonIds, item.id];
    const xpKey = item.competency === "testingDebugging" ? "debugger" : item.competency === "aiApplications" ? "aiJudgment" : item.competency === "securityReliability" ? "reliability" : item.competency === "defense" ? "communication" : item.competency === "api" || item.competency === "dataInterfaces" ? "systems" : "builder";
    setProgress({
      ...progress,
      completedLessonIds,
      activeDay: item.day < 4 && currentDayLessons.every((candidate) => completedLessonIds.includes(candidate.id)) ? ((item.day + 1) as 1 | 2 | 3 | 4) : progress.activeDay,
      xp: { ...progress.xp, [xpKey]: (progress.xp[xpKey] ?? 0) + 25 },
      spacedReviewDue: [...new Set([...progress.spacedReviewDue, item.id])],
      reviewSchedule: [
        ...(progress.reviewSchedule ?? []).filter((entry) => entry.lessonId !== item.id),
        ...reviewScheduleForLesson(item.id),
      ],
    });
  };

  const selectLesson = (item: CodingLesson) => {
    setSelectedLessonId(item.id);
    setWorkspace("lesson");
  };
  const selectRecall = (reviewId: string) => {
    const review = progress.reviewSchedule.find((item) => item.id === reviewId);
    if (!review) return;
    setSelectedLessonId(review.lessonId);
    setSelectedReviewId(review.id);
    setWorkspace("recall");
  };
  const completeRecall = (reviewId: string, response: string) => {
    setProgress({
      ...progress,
      reviewSchedule: progress.reviewSchedule.map((review) => review.id === reviewId ? { ...review, completedAt: updateDate() } : review),
      recallResponses: { ...(progress.recallResponses ?? {}), [reviewId]: { response, completedAt: updateDate() } },
      xp: { ...progress.xp, communication: (progress.xp.communication ?? 0) + 5 },
    });
    setWorkspace("map");
  };
  const selectChallenge = (item: CodingChallenge) => {
    setSelectedChallengeId(item.id);
    const draft = progress.workbenchDrafts?.[item.id];
    setCode((draft ?? [{ role: "source", content: item.starter }]).filter((file) => file.role === "source").map((file) => file.content).join("\n"));
    const previous = progress.challengeAttempts[item.id];
    setExplanation(previous?.explanation ?? "");
    setLocalRunConfirmed(previous?.localRunConfirmed ?? false);
    setTestConfirmed(previous?.testConfirmed ?? false);
    setWorkspace("lab");
  };
  const recordAssessment = (
    result: { score: number; competencyScores: Partial<Record<CodingCompetencyKey, number>> },
    questionIds: string[],
  ) => setProgress({
    ...progress,
    assessmentAttempts: [...(progress.assessmentAttempts ?? []), {
      id: crypto.randomUUID(),
      score: result.score,
      competencyScores: result.competencyScores,
      questionIds,
      completedAt: updateDate(),
    }],
    xp: { ...progress.xp, systems: (progress.xp.systems ?? 0) + 10 },
  });
  const recordSystemsEvidence = (key: string, value: string) => setProgress({
    ...progress,
    notes: { ...progress.notes, [key]: value },
    xp: { ...progress.xp, systems: (progress.xp.systems ?? 0) + 12 },
  });
  const recordContinuationEvidence = (id: string, attempt: { submission: CodingContinuationSubmission; score: number; status: "needs-revision" | "reviewed"; feedback: string; missing: string[]; updatedAt: string }) => setProgress({
    ...progress,
    completedContinuationIds: attempt.status === "reviewed" ? [...new Set([...(progress.completedContinuationIds ?? []), id])] : (progress.completedContinuationIds ?? []).filter((item) => item !== id),
    continuationAttempts: { ...(progress.continuationAttempts ?? {}), [id]: attempt },
    notes: { ...progress.notes, [`continuation-${id}`]: Object.values(attempt.submission).join("\n\n") },
    xp: attempt.status === "reviewed" ? { ...progress.xp, communication: (progress.xp.communication ?? 0) + 30 } : progress.xp,
  });
  const recordInterviewEvidence = (attempt: Omit<typeof progress.interviewAttempts[number], "id" | "completedAt">) => setProgress({
    ...progress,
    interviewAttempts: [...(progress.interviewAttempts ?? []), { ...attempt, id: crypto.randomUUID(), completedAt: updateDate() }],
    notes: { ...progress.notes, [`interview-${attempt.promptId}`]: `${attempt.score}%\n${attempt.response}` },
    xp: { ...progress.xp, communication: (progress.xp.communication ?? 0) + Math.max(8, Math.round(attempt.score / 8)) },
  });
  const recordBossBattle = (id: string, result: { score: number; response: string; hintCount: number; status: "needs-retry" | "reviewed" }) => setProgress({
    ...progress,
    bossBattleAttempts: { ...(progress.bossBattleAttempts ?? {}), [id]: { ...result, updatedAt: updateDate() } },
    xp: result.status === "reviewed" ? { ...progress.xp, reliability: (progress.xp.reliability ?? 0) + 20, debugger: (progress.xp.debugger ?? 0) + 12 } : progress.xp,
  });
  const reviewBoardResponse = async (id: string) => {
    const response = progress.reviewBoardAttempts?.[id]?.response ?? "";
    setReviewingBoardId(id); setBoardReviewError("");
    try {
      const request = await fetch("/api/coding/review-board", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reviewerId: id, response }) });
      const result = await request.json() as { score?: number; status?: "needs-revision" | "reviewed"; feedback?: string; error?: string };
      if (!request.ok || typeof result.score !== "number" || !result.status || !result.feedback) throw new Error(result.error ?? "The review response could not be scored.");
      setProgress({ ...progress, reviewBoardAttempts: { ...(progress.reviewBoardAttempts ?? {}), [id]: { response, score: result.score, status: result.status, updatedAt: updateDate() } }, xp: result.status === "reviewed" ? { ...progress.xp, communication: (progress.xp.communication ?? 0) + 15 } : progress.xp });
    } catch (error) { setBoardReviewError(error instanceof Error ? error.message : "The review response could not be scored."); }
    finally { setReviewingBoardId(null); }
  };
  const submitChallenge = async () => {
    const submittedDesign = challenge.kind === "terminal"
      ? (progress.terminalSession?.transcript.map((entry) => `${entry.command}\n${entry.output}`).join("\n") ?? "")
      : code;
    setReviewingChallenge(true);
    setChallengeReviewError("");
    try {
      const response = await fetch("/api/coding/challenge-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, code: submittedDesign, explanation }),
      });
      const result = await response.json() as { score?: number; status?: "needs-revision" | "reviewed"; feedback?: string; error?: string };
      if (!response.ok || typeof result.score !== "number" || !result.status || !result.feedback) throw new Error(result.error ?? "The design review could not be completed.");
      const reviewedAt = updateDate();
      const attempt = { id: crypto.randomUUID(), code: submittedDesign, explanation, score: result.score, status: result.status, feedback: result.feedback, localRunConfirmed, testConfirmed, updatedAt: reviewedAt };
      setProgress({
        ...progress,
        challengeAttempts: {
          ...progress.challengeAttempts,
          [challenge.id]: { score: result.score, status: result.status, feedback: result.feedback, explanation, localRunConfirmed, testConfirmed, updatedAt: reviewedAt },
        },
        challengeAttemptHistory: { ...(progress.challengeAttemptHistory ?? {}), [challenge.id]: [...(progress.challengeAttemptHistory?.[challenge.id] ?? []), attempt].slice(-6) },
        xp: result.status === "reviewed"
          ? { ...progress.xp, builder: (progress.xp.builder ?? 0) + Math.max(5, Math.round(result.score / 10)) }
          : progress.xp,
      });
    } catch (error) {
      setChallengeReviewError(error instanceof Error ? error.message : "The design review could not be completed.");
    } finally {
      setReviewingChallenge(false);
    }
  };
  return (
    <main className="coding-program">
      <header className="coding-header">
        <Link href="/learn" className="course-back">← Return to Engineer Zero</Link>
        <div className="coding-header-actions">
          <span className="coding-status"><span /> Shared program · local progress saved</span>
          <label className="coding-theme">
            <span className="sr-only">Choose color theme</span>
            <select
              value={state.preferences.theme}
              aria-label="Choose color theme"
              onChange={(event) => setState((current) => ({
                ...current,
                preferences: { ...current.preferences, theme: event.target.value as "system" | "light" | "dark" },
              }))}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </header>

      <section className="coding-hero">
        <div>
          <p className="coding-kicker">LAUNCHCODE AI / CODING DEVELOPER</p>
          <h1>{codingDeveloperProgram.title}</h1>
          <p>{codingDeveloperProgram.promise}</p>
        </div>
        <aside>
          <span>Current mission</span>
          <b>Day {progress.activeDay} of 4</b>
          <p>{completedToday} of {currentDayLessons.length} learning sessions completed today.</p>
          <button onClick={() => selectLesson(nextCodingLesson(progress))}>Continue learning →</button>
        </aside>
      </section>

      <nav className="coding-nav" aria-label="Coding Developer workspace">
        {([
          ["map", "Mission map", Flag],
          ["lesson", "Lesson reader", BookOpen],
          ["assessment", "Retrieval checks", ClipboardCheck],
          ["lab", "Code lab", Code2],
          ["systems", "Systems lab", Workflow],
          ["boss", "Boss battles", Swords],
          ["interview", "Interview Arena", Mic],
          ["continuation", "Continue", Route],
          ["review", "Review board", GitBranch],
        ] as const).map(([id, label, Icon]) => <button key={id} className={workspace === id ? "active" : ""} onClick={() => setWorkspace(id)}><Icon size={16} aria-hidden="true" />{label}</button>)}
      </nav>

      {workspace === "map" && (
        <section className="coding-map">
          <div className="coding-map-intro">
            <p className="coding-kicker">THE FOUR-DAY INTENSIVE</p>
            <h2>Build a small prototype. Keep the claims honest.</h2>
            <p>This program trains bounded prototype performance and technical conversation. It does not certify production engineering or safety-critical software ownership.</p>
          </div>
          <div className="coding-days">
            {([1, 2, 3, 4] as const).map((day) => {
              const dayPlan = codingDayPlans.find((plan) => plan.day === day)!;
              const dayLessons = codingLessons.filter((item) => item.day === day);
              const complete = dayLessons.filter((item) => progress.completedLessonIds.includes(item.id)).length;
              const capstone = codingChallenges.find((item) => item.day === day && ["code", "api", "ai", "defense"].includes(item.kind));
              const isCurrent = day === progress.activeDay;
              return (
                <article key={day} className={isCurrent ? "current" : ""}>
                  <div className="coding-day-meta">
                    <span className="coding-day-index">Day {day}</span>
                    <small>{complete}/{dayLessons.length} sessions</small>
                    {isCurrent && <em>Current</em>}
                    <i className="coding-day-progress" aria-hidden="true"><em style={{ width: `${dayLessons.length ? (complete / dayLessons.length) * 100 : 0}%` }} /></i>
                  </div>
                  <div className="coding-day-copy">
                    <h3>{dayPlan.title}</h3>
                    <p className="coding-day-mission">{dayPlan.mission}</p>
                    <details className="coding-day-cadence">
                      <summary>{dayPlan.focusedHours} focused hours · recommended cadence</summary>
                      <ul>{dayPlan.cadence.map((block) => <li key={block.label}><b>{block.label}</b><span>{block.purpose}</span></li>)}</ul>
                      <code>{dayPlan.localProjectPath}</code>
                    </details>
                    {capstone && (
                      <button type="button" className="coding-capstone-link" onClick={() => selectChallenge(capstone)}>
                        <span>Capstone lab</span>
                        {capstone.title} <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                  <ol className="coding-day-sessions" aria-label={`Day ${day} sessions`}>
                    {dayLessons.map((item) => {
                      const done = progress.completedLessonIds.includes(item.id);
                      return (
                        <li key={item.id}>
                          <button type="button" onClick={() => selectLesson(item)}>
                            <span className={done ? "done" : ""}>{done ? <Check size={13} aria-hidden="true" /> : item.order}</span>
                            <b>{item.title}</b>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </article>
              );
            })}
          </div>
          <section className="coding-mastery" aria-label="Four-day mastery targets">
            <header><div><p className="coding-kicker">EVIDENCE, NOT CONFIDENCE</p><h2>Four-day target profile</h2></div><p>Every category begins at Level 0. Completion requires practice and defense—not just a running app.</p></header>
            <div>{mastery.map((item) => <article key={item.key}><b>{item.title}</b><span>Level {item.level} <small>/ target {item.target}</small></span><i><em style={{ width: `${Math.min(100, item.level * 20)}%` }} /></i><p>{item.description}</p></article>)}</div>
          </section>
          <section className="coding-readiness" aria-label="Local four-day readiness signal">
            <header><div><p className="coding-kicker">WEIGHTED EVIDENCE</p><h2>Local four-day readiness signal</h2></div><p><b>{readiness.overall}%</b> derived from visible learning evidence—not a credential, hiring score, or production-readiness claim.</p></header>
            <div>{readiness.dimensions.map((dimension) => <article key={dimension.key}><span>{dimension.label} <small>{dimension.weight}% weight</small></span><b>{dimension.score}%</b><i><em style={{ width: `${dimension.score}%` }} /></i></article>)}</div>
          </section>
          <section className="coding-recovery" aria-label="Next recovery target">
            <div><p className="coding-kicker">RECOVERY, NOT PENALTY</p><h2>Make the next weak link visible.</h2><p>{recovery.message}</p></div>
            <aside><b>{codingCompetencies.find((item) => item.key === recovery.competency)?.title ?? "Next evidence"}</b><p>Return to one precise lesson, then create or repair one focused artifact. Passing a screen is not the same as proving the skill.</p><button onClick={() => recovery.lessonId && selectLesson(codingLessons.find((item) => item.id === recovery.lessonId) ?? codingLessons[0])}>Open recovery lesson →</button></aside>
          </section>
          <section className="coding-review-schedule" aria-label="Upcoming retrieval practice">
            <header><p className="coding-kicker">SPACED RETRIEVAL</p><h2>Return to ideas before they fade.</h2><p>Opening a review is not completion. Recall the idea first, then check it against the lesson or retrieval checks.</p></header>
            {upcomingReviews.length ? <ul>{upcomingReviews.map((review) => {
              const item = codingLessons.find((lesson) => lesson.id === review.lessonId);
              return <li key={review.id}><div><b>{item?.title ?? "Learning review"}</b><span>{review.interval.replace("-", " ")} · {new Date(review.dueAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span></div><button onClick={() => selectRecall(review.id)}>Open recall prompt →</button></li>;
            })}</ul> : <p className="coding-review-empty">Finish one learning session to schedule five short recall returns across the next week.</p>}
          </section>
          <section className="coding-badges" aria-label="Learning milestones">
            <header><p className="coding-kicker">MILESTONES</p><h2>Earn evidence, not streaks.</h2></header>
            <div>{badges.map((badge) => <article key={badge.id} className={badge.earned ? "earned" : ""}><span>{badge.earned ? "Earned" : "In progress"}</span><b>{badge.title}</b><p>{badge.description}</p></article>)}</div>
          </section>
          <details className="coding-method-note">
            <summary>Why this program uses recall, repair, practice, and defense</summary>
            <p>Each day alternates short instruction with retrieval, guided modification, repair, an independent local build, and explanation. This is an instructional design choice—not evidence that a learner is already job-ready.</p>
            <div>{codingSourceList([...codingInstructionalSourceIds]).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><b>{source.publisher} · {source.title}</b><small>{source.version} · verified {source.lastVerified} · revalidate {source.revalidateBy}<br />Supports: {source.supportedClaim}</small></a>)}</div>
          </details>
        </section>
      )}

      {workspace === "lesson" && (
        <section className="coding-lesson-layout">
          <aside className="coding-lesson-index">
            {([1, 2, 3, 4] as const).map((day) => <section key={day}><b>Day {day}</b>{codingLessons.filter((item) => item.day === day).map((item) => <button key={item.id} className={lesson.id === item.id ? "active" : ""} onClick={() => setSelectedLessonId(item.id)}>{progress.completedLessonIds.includes(item.id) && <Check size={13} />} {item.title}</button>)}</section>)}
          </aside>
          <CodingLessonReader
            lesson={lesson}
            completed={progress.completedLessonIds.includes(lesson.id)}
            onComplete={() => markLesson(lesson)}
            onOpenBridge={(bridge) => {
              if (bridge.workspace === "systems") {
                setWorkspace("systems");
                return;
              }
              if (bridge.challengeId) {
                const target = codingChallenges.find((item) => item.id === bridge.challengeId);
                if (target) selectChallenge(target);
                else setWorkspace("lab");
              } else {
                setWorkspace("lab");
              }
            }}
          />
        </section>
      )}

      {workspace === "recall" && (() => {
        const review = progress.reviewSchedule.find((item) => item.id === selectedReviewId) ?? progress.reviewSchedule.find((item) => item.lessonId === lesson.id && !item.completedAt);
        return review ? <CodingRecallPractice lesson={lesson} review={review} initialResponse={progress.recallResponses?.[review.id]?.response} onComplete={(response) => completeRecall(review.id, response)} /> : <section className="coding-assessment-start"><p className="coding-kicker">RECALL COMPLETE</p><h2>Select a scheduled review from the Mission Map.</h2><button className="coding-primary" onClick={() => setWorkspace("map")}>Return to Mission Map</button></section>;
      })()}

      {workspace === "assessment" && <CodingAssessment onComplete={recordAssessment} priorAttempts={progress.assessmentAttempts ?? []} />}

      {workspace === "systems" && <CodingSystemsLab onEvidence={recordSystemsEvidence} />}

      {workspace === "boss" && <CodingBossBattles attempts={progress.bossBattleAttempts ?? {}} onComplete={recordBossBattle} />}

      {workspace === "interview" && <CodingInterviewArena attempts={progress.interviewAttempts ?? []} onComplete={recordInterviewEvidence} />}

      {workspace === "continuation" && <CodingContinuation completedIds={progress.completedContinuationIds ?? []} attempts={progress.continuationAttempts ?? {}} onComplete={recordContinuationEvidence} />}

      {workspace === "lab" && (
        <section className="coding-lab-layout">
          <aside className="coding-challenge-list">
            <p className="coding-kicker">SAFE PRACTICE LABS</p>
            {codingChallenges.map((item) => <button key={item.id} className={challenge.id === item.id ? "active" : ""} onClick={() => selectChallenge(item)}><span>Day {item.day}</span><b>{item.title}</b><small>{item.kind}</small></button>)}
          </aside>
          <article className="coding-lab">
            <header><div><p className="coding-kicker">DAY {challenge.day} · {challenge.kind}</p><h2>{challenge.title}</h2><p>{challenge.brief}</p></div><span className="coding-safe"><CircleAlert size={15} /> Browser review only</span></header>
            {challenge.kind === "terminal" ? (
              <CodingTerminalSimulator session={progress.terminalSession} onChange={(terminalSession) => setProgress({ ...progress, terminalSession })} />
            ) : (
              <><CodingFileWorkbench
                key={challenge.id}
                challenge={challenge}
                initialFiles={progress.workbenchDrafts?.[challenge.id]}
                initialSnapshots={progress.workbenchSnapshots?.[challenge.id]}
                onCodeChange={setCode}
                onFilesChange={(files) => setProgress({ ...progress, workbenchDrafts: { ...(progress.workbenchDrafts ?? {}), [challenge.id]: files } })}
                onSnapshotsChange={(snapshots) => setProgress({ ...progress, workbenchSnapshots: { ...(progress.workbenchSnapshots ?? {}), [challenge.id]: snapshots } })}
              /><button className="coding-primary coding-workbench-review" onClick={submitChallenge} disabled={reviewingChallenge}>{reviewingChallenge ? "Reviewing…" : "Review visible design"} <Braces size={16} /></button></>
            )}
            {challenge.kind !== "terminal" && <CodingTutorPanel challenge={challenge} code={code} initialErrorOutput={progress.notes[`tutor-error-${challenge.id}`] ?? ""} onHint={(count) => setProgress({ ...progress, notes: { ...progress.notes, [`tutor-${challenge.id}`]: `${count} guided hint${count === 1 ? "" : "s"} used` } })} onErrorOutput={(value) => setProgress({ ...progress, notes: { ...progress.notes, [`tutor-error-${challenge.id}`]: value } })} />}
            <section className="coding-checklist"><h3>Visible design checks</h3><ul>{challenge.requiredSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul><p>{challenge.expectedOutcome}</p></section>
            <section className="coding-comprehension">
              <header><span>Comprehension gate</span><h3>{challenge.comprehensionPrompt}</h3><p>Address the points below in separate, concrete sentences. The study review checks for distinct claims and rejects repeated labels or keyword padding; it is not an automated claim of independent coding ability.</p></header>
              <ul>{challenge.comprehensionRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
              <textarea value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="Explain the behavior, the boundary, and how you would verify it…" aria-label={`${challenge.title} comprehension explanation`} />
              <label><input type="checkbox" checked={localRunConfirmed} onChange={(event) => setLocalRunConfirmed(event.target.checked)} /> I ran or will run the corresponding project locally; this is a self-attestation, not verified execution.</label>
              {challenge.day >= 2 && <label><input type="checkbox" checked={testConfirmed} onChange={(event) => setTestConfirmed(event.target.checked)} /> I inspected the relevant test output or can name the test I still need to add.</label>}
              <button className="coding-primary" onClick={submitChallenge} disabled={reviewingChallenge}>{reviewingChallenge ? "Reviewing…" : "Review design and explanation"} <Braces size={16} /></button>
            </section>
            {challengeReviewError && <p className="coding-form-error" role="alert">{challengeReviewError}</p>}
            {progress.challengeAttempts[challenge.id] && <section className="coding-feedback"><b>{progress.challengeAttempts[challenge.id].status === "reviewed" ? "Review recorded" : "Revision needed"} · {progress.challengeAttempts[challenge.id].score}% evidence completeness</b><p>{progress.challengeAttempts[challenge.id].feedback}</p></section>}
            {(progress.challengeAttemptHistory?.[challenge.id]?.length ?? 0) > 0 && <details className="coding-attempt-replay"><summary>Revision trail <span>{progress.challengeAttemptHistory[challenge.id].length} saved {progress.challengeAttemptHistory[challenge.id].length === 1 ? "attempt" : "attempts"}</span></summary><p>This local study history shows what you submitted and how the deterministic review changed. It is not proof that this code executed.</p>{[...(progress.challengeAttemptHistory[challenge.id] ?? [])].reverse().map((attempt, index) => <article key={attempt.id}><header><b>Revision {progress.challengeAttemptHistory[challenge.id].length - index}</b><span>{attempt.status === "reviewed" ? "reviewed" : "needs revision"} · {attempt.score}% · {new Date(attempt.updatedAt).toLocaleString()}</span></header><p>{attempt.feedback}</p><details><summary>Show submitted work</summary><pre>{attempt.code}</pre><p>{attempt.explanation || "No written explanation was saved for this attempt."}</p></details></article>)}</details>}
            <section className="coding-local-handoff"><h3>Run it for real</h3><p>This lab deliberately does not execute arbitrary learner code. Build the corresponding local starter project, run its tests in your own isolated environment, then return to defend the result.</p><code>python -m venv .venv && source .venv/bin/activate</code></section>
          </article>
        </section>
      )}

      {workspace === "review" && (
        <section className="coding-review-board">
          <header><p className="coding-kicker">ENGINEERING REVIEW BOARD</p><h2>Defend the Mission Operations Handoff Assistant.</h2><p>Answer in order: user outcome, system boundary, data contract, tests, failure behavior, and next production decision. Deterministic study review works now; qualified human credential approval is Coming soon.</p></header>
          <div>{codingReviewBoardPrompts.map((reviewer) => {
            const attempt = progress.reviewBoardAttempts?.[reviewer.id];
            return <article key={reviewer.id}><span>{reviewer.role}</span><p>{reviewer.prompt}</p><textarea value={attempt?.response ?? ""} onChange={(event) => setProgress({ ...progress, reviewBoardAttempts: { ...(progress.reviewBoardAttempts ?? {}), [reviewer.id]: { response: event.target.value, score: attempt?.score ?? 0, status: attempt?.status ?? "needs-revision", updatedAt: attempt?.updatedAt ?? updateDate() } } })} placeholder="State a specific decision, evidence, and remaining limitation in separate sentences…" /><button className="coding-secondary" disabled={reviewingBoardId === reviewer.id} onClick={() => reviewBoardResponse(reviewer.id)}>{reviewingBoardId === reviewer.id ? "Reviewing…" : "Review this response"}</button>{attempt && <aside><b>{attempt.status === "reviewed" ? "Review recorded" : "Revision needed"} · {attempt.score}% evidence completeness</b><p>{attempt.status === "reviewed" ? "The server-side rubric found distinct role-specific evidence. This is local preparation evidence, not an approval decision." : "Revise with specific role-relevant evidence, separate decisions, and a concrete limitation before re-submitting."}</p></aside>}</article>;
          })}</div>
          {boardReviewError && <p className="coding-form-error" role="alert">{boardReviewError}</p>}
          <section className="coding-graduation"><h3>Four-day graduation standard</h3><p>Completion means you can navigate a project, build a typed FastAPI prototype, validate input, test key behavior, use AI only at a defensible boundary, explain failure behavior, and disclose what you built or reviewed. It does not represent production or safety-critical software certification.</p><ul>{graduation.checks.map((check) => <li key={check.id} className={check.passed ? "done" : ""}>{check.passed ? <Check size={15} /> : <span />} {check.label}</li>)}</ul><b>{graduation.readyForReviewer ? "Local evidence looks complete. Qualified human credential review is Coming soon (backlog)—not required for personal practice." : `${graduation.readiness}% local evidence signal — continue building the missing evidence above.`}</b><p className="coding-coming-soon">Coming soon: instructional, technical, accessibility, and fictional-data human sign-offs for commercial launch.</p></section>
        </section>
      )}
    </main>
  );
}
