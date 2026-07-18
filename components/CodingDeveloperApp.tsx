"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Braces, Bug, Check, CircleAlert, Code2, FileCode2, Flag, GitBranch, Play, RotateCcw, TerminalSquare } from "lucide-react";
import { useLearnerState } from "@/hooks/useLearnerState";
import {
  codingChallenges,
  codingDayPlans,
  codingCompetencies,
  codingDeveloperProgram,
  codingInstructionalSourceIds,
  codingLessons,
  codingMastery,
  codingSourceList,
  emptyCodingProgress,
  nextCodingLesson,
  type CodingChallenge,
  type CodingLesson,
} from "@/lib/coding-developer";

type Workspace = "map" | "lesson" | "lab" | "review";

function scoreChallenge(challenge: CodingChallenge, code: string, explanation: string) {
  const normalized = code.toLowerCase();
  const found = challenge.requiredSignals.filter((signal) => normalized.includes(signal.toLowerCase()));
  const unsafe = (challenge.antiPatterns ?? []).filter((signal) => normalized.includes(signal.toLowerCase()));
  const hasExplanation = explanation.trim().length >= 160;
  const score = Math.max(0, Math.min(100, Math.round((found.length / challenge.requiredSignals.length) * 80) - unsafe.length * 20 + (hasExplanation ? 20 : 0)));
  const missing = challenge.requiredSignals.filter((signal) => !found.includes(signal));
  const status: "needs-revision" | "reviewed" = !unsafe.length && !missing.length && hasExplanation ? "reviewed" : "needs-revision";
  return {
    score,
    status,
    feedback: unsafe.length
      ? `Pause before continuing: remove or explain ${unsafe.join(", ")}. It is not appropriate for this exercise.`
      : missing.length
        ? `You have a start. Add or explain: ${missing.join(", ")}. Then re-check the work.`
        : !hasExplanation
          ? "The visible design signals are present. Add a specific self-explanation before recording the review; a running snippet alone is not comprehension evidence."
          : "The structural signals and self-explanation are recorded. This is still not execution proof—run the project locally, inspect the tests, and defend each boundary before claiming independent capability.",
  };
}

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
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>(["Safe terminal simulator · no files on your computer are changed.", "/home/learner $"]);
  const [inProject, setInProject] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme;
  }, [state.preferences.theme]);

  const lesson = codingLessons.find((item) => item.id === selectedLessonId) ?? codingLessons[0];
  const challenge = codingChallenges.find((item) => item.id === selectedChallengeId) ?? codingChallenges[0];
  const mastery = useMemo(() => codingMastery(progress), [progress]);
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
    });
  };

  const selectLesson = (item: CodingLesson) => {
    setSelectedLessonId(item.id);
    setWorkspace("lesson");
  };
  const selectChallenge = (item: CodingChallenge) => {
    setSelectedChallengeId(item.id);
    setCode(item.starter);
    const previous = progress.challengeAttempts[item.id];
    setExplanation(previous?.explanation ?? "");
    setLocalRunConfirmed(previous?.localRunConfirmed ?? false);
    setTestConfirmed(previous?.testConfirmed ?? false);
    setWorkspace("lab");
  };
  const submitChallenge = () => {
    const submittedDesign = challenge.kind === "terminal" ? terminalLines.join("\n") : code;
    const result = scoreChallenge(challenge, submittedDesign, explanation);
    setProgress({
      ...progress,
      challengeAttempts: {
        ...progress.challengeAttempts,
        [challenge.id]: { ...result, explanation, localRunConfirmed, testConfirmed, updatedAt: updateDate() },
      },
      xp: result.status === "reviewed"
        ? { ...progress.xp, builder: (progress.xp.builder ?? 0) + Math.max(5, Math.round(result.score / 10)) }
        : progress.xp,
    });
  };
  const runTerminalCommand = () => {
    const command = terminalInput.trim();
    if (!command) return;
    let output = "command not recognized in this safe exercise";
    if (command === "pwd") output = inProject ? "/home/learner/ai_prototype" : "/home/learner";
    else if (command === "ls") output = inProject ? "main.py" : "notes.txt";
    else if (command === "mkdir ai_prototype") output = "created ai_prototype";
    else if (command === "cd ai_prototype") { setInProject(true); output = "entered /home/learner/ai_prototype"; }
    else if (command === "cd ..") { setInProject(false); output = "entered /home/learner"; }
    else if (command === "touch main.py") output = inProject ? "created main.py" : "main.py was created in the wrong folder — use cd ai_prototype, then recover it.";
    else if (command === "python main.py") output = inProject ? "Mission countdown: 42 minutes remaining" : "python: cannot open file 'main.py' — check your directory";
    else if (command === "clear") { setTerminalLines(["Safe terminal simulator · no files on your computer are changed.", inProject ? "/home/learner/ai_prototype $" : "/home/learner $"]); setTerminalInput(""); return; }
    setTerminalLines((lines) => [...lines, `${inProject ? "/home/learner/ai_prototype" : "/home/learner"} $ ${command}`, output]);
    setTerminalInput("");
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
          ["lab", "Code lab", Code2],
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
              return <article key={day} className={day === progress.activeDay ? "current" : ""}>
                <header><span>DAY {day}</span><small>{complete}/{dayLessons.length} sessions</small></header>
                <h3>{dayPlan.title}</h3>
                <p className="coding-day-mission">{dayPlan.mission}</p>
                <ol>{dayLessons.map((item) => <li key={item.id}><button onClick={() => selectLesson(item)}><span className={progress.completedLessonIds.includes(item.id) ? "done" : ""}>{progress.completedLessonIds.includes(item.id) ? <Check size={13} /> : item.order}</span>{item.title}</button></li>)}</ol>
                <details className="coding-day-cadence"><summary>{dayPlan.focusedHours} focused hours · recommended cadence</summary><ul>{dayPlan.cadence.map((block) => <li key={block.label}><b>{block.label}</b><span>{block.purpose}</span></li>)}</ul><code>{dayPlan.localProjectPath}</code></details>
                {capstone && <button className="coding-capstone-link" onClick={() => selectChallenge(capstone)}>{capstone.title} <span>→</span></button>}
              </article>;
            })}
          </div>
          <section className="coding-mastery" aria-label="Four-day mastery targets">
            <header><div><p className="coding-kicker">EVIDENCE, NOT CONFIDENCE</p><h2>Four-day target profile</h2></div><p>Every category begins at Level 0. Completion requires practice and defense—not just a running app.</p></header>
            <div>{mastery.map((item) => <article key={item.key}><b>{item.title}</b><span>Level {item.level} <small>/ target {item.target}</small></span><i><em style={{ width: `${Math.min(100, item.level * 20)}%` }} /></i><p>{item.description}</p></article>)}</div>
          </section>
          <details className="coding-method-note">
            <summary>Why this program uses recall, repair, practice, and defense</summary>
            <p>Each day alternates short instruction with retrieval, guided modification, repair, an independent local build, and explanation. This is an instructional design choice—not evidence that a learner is already job-ready.</p>
            <div>{codingSourceList([...codingInstructionalSourceIds]).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><b>{source.publisher} · {source.title}</b><small>{source.version} · verified {source.lastVerified}<br />Supports: {source.supportedClaim}</small></a>)}</div>
          </details>
        </section>
      )}

      {workspace === "lesson" && (
        <section className="coding-lesson-layout">
          <aside className="coding-lesson-index">
            {([1, 2, 3, 4] as const).map((day) => <section key={day}><b>Day {day}</b>{codingLessons.filter((item) => item.day === day).map((item) => <button key={item.id} className={lesson.id === item.id ? "active" : ""} onClick={() => setSelectedLessonId(item.id)}>{progress.completedLessonIds.includes(item.id) && <Check size={13} />} {item.title}</button>)}</section>)}
          </aside>
          <article className="coding-reader">
            <p className="coding-kicker">DAY {lesson.day} · {lesson.mode}</p>
            <h2>{lesson.title}</h2>
            <p className="coding-objective">{lesson.objective}</p>
            <section><h3>Read</h3><p>{lesson.explanation}</p></section>
            <section className="coding-worked"><span>Worked example</span><pre>{lesson.workedExample}</pre></section>
            <section className="coding-practice"><span>Practice before you continue</span><b>{lesson.practicePrompt}</b></section>
            <section className="coding-defense"><span>Defense prompt</span><p>{lesson.defensePrompt}</p></section>
            <section className="coding-sources"><h3>Source notes</h3>{codingSourceList(lesson.sourceIds).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><b>{source.publisher} · {source.title}</b><small>{source.version} · verified {source.lastVerified}<br />Supports: {source.supportedClaim}</small></a>)}</section>
            <button className="coding-primary" onClick={() => markLesson(lesson)}>{progress.completedLessonIds.includes(lesson.id) ? "Evidence recorded" : "Mark learning session complete"} <Check size={16} /></button>
          </article>
        </section>
      )}

      {workspace === "lab" && (
        <section className="coding-lab-layout">
          <aside className="coding-challenge-list">
            <p className="coding-kicker">SAFE PRACTICE LABS</p>
            {codingChallenges.map((item) => <button key={item.id} className={challenge.id === item.id ? "active" : ""} onClick={() => selectChallenge(item)}><span>Day {item.day}</span><b>{item.title}</b><small>{item.kind}</small></button>)}
          </aside>
          <article className="coding-lab">
            <header><div><p className="coding-kicker">DAY {challenge.day} · {challenge.kind}</p><h2>{challenge.title}</h2><p>{challenge.brief}</p></div><span className="coding-safe"><CircleAlert size={15} /> Browser review only</span></header>
            {challenge.kind === "terminal" ? (
              <section className="terminal-simulator">
                <div className="terminal-title"><TerminalSquare size={16} /> Safe terminal simulator <small>Commands affect only this exercise.</small></div>
                <pre>{terminalLines.join("\n")}</pre>
                <form onSubmit={(event) => { event.preventDefault(); runTerminalCommand(); }}><span>{inProject ? "/home/learner/ai_prototype" : "/home/learner"} $</span><input value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} aria-label="Terminal command" placeholder="Try pwd" autoComplete="off" /><button aria-label="Run safe terminal command"><Play size={15} /></button></form>
                <p className="terminal-hint">Try: <code>pwd</code>, <code>ls</code>, <code>mkdir ai_prototype</code>, <code>cd ai_prototype</code>, <code>touch main.py</code>, <code>python main.py</code>.</p>
              </section>
            ) : (
              <section className="coding-editor-shell">
                <header><span><FileCode2 size={15} /> exercise.py</span><small>No arbitrary code runs in the browser. Use your local terminal for execution; this checks your visible design signals.</small></header>
                <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} aria-label={`${challenge.title} code editor`} />
                <footer><button className="coding-secondary" onClick={() => setCode(challenge.starter)}><RotateCcw size={15} /> Reset starter</button><button className="coding-primary" onClick={submitChallenge}>Check work <Braces size={16} /></button></footer>
              </section>
            )}
            <section className="coding-checklist"><h3>What the reviewer looks for</h3><ul>{challenge.requiredSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul><p>{challenge.expectedOutcome}</p></section>
            <section className="coding-comprehension">
              <header><span>Comprehension gate</span><h3>{challenge.comprehensionPrompt}</h3><p>Address the points below in your own words. This records an explanation for review; it is not an automated claim of independent coding ability.</p></header>
              <ul>{challenge.comprehensionRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
              <textarea value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="Explain the behavior, the boundary, and how you would verify it…" aria-label={`${challenge.title} comprehension explanation`} />
              <label><input type="checkbox" checked={localRunConfirmed} onChange={(event) => setLocalRunConfirmed(event.target.checked)} /> I ran or will run the corresponding project locally; this is a self-attestation, not verified execution.</label>
              {challenge.day >= 2 && <label><input type="checkbox" checked={testConfirmed} onChange={(event) => setTestConfirmed(event.target.checked)} /> I inspected the relevant test output or can name the test I still need to add.</label>}
              <button className="coding-primary" onClick={submitChallenge}>Record structural review <Braces size={16} /></button>
            </section>
            {progress.challengeAttempts[challenge.id] && <section className="coding-feedback"><b>{progress.challengeAttempts[challenge.id].status === "reviewed" ? "Review recorded" : "Revision needed"} · {progress.challengeAttempts[challenge.id].score}% evidence completeness</b><p>{progress.challengeAttempts[challenge.id].feedback}</p></section>}
            <section className="coding-local-handoff"><h3>Run it for real</h3><p>This lab deliberately does not execute arbitrary learner code. Build the corresponding local starter project, run its tests in your own isolated environment, then return to defend the result.</p><code>python -m venv .venv && source .venv/bin/activate</code></section>
          </article>
        </section>
      )}

      {workspace === "review" && (
        <section className="coding-review-board">
          <header><p className="coding-kicker">ENGINEERING REVIEW BOARD</p><h2>Defend the Mission Operations Handoff Assistant.</h2><p>Answer in order: user outcome, system boundary, data contract, tests, failure behavior, and next production decision.</p></header>
          <div>{[
            ["Product representative", "Which manual handoff decision becomes easier, and how will you know it helped?"],
            ["Software engineer", "Why is the route separate from the service function, and which test proves the important business behavior?"],
            ["Security engineer", "What data is out of scope for the model and how do you prevent an untrusted note from changing system behavior?"],
            ["Operations user", "What happens when the model is unavailable during a shift handoff?"],
            ["Assurance reviewer", "What makes this a prototype rather than an approved operational system?"],
          ].map(([role, prompt]) => <article key={role}><span>{role}</span><p>{prompt}</p><textarea value={progress.notes[`review-${role}`] ?? ""} onChange={(event) => setProgress({ ...progress, notes: { ...progress.notes, [`review-${role}`]: event.target.value } })} placeholder="State your reasoning, evidence, and remaining limitation…" /></article>)}</div>
          <section className="coding-graduation"><h3>Four-day graduation standard</h3><p>Completion means you can navigate a project, build a typed FastAPI prototype, validate input, test key behavior, use AI only at a defensible boundary, explain failure behavior, and disclose what you built or reviewed. It does not represent production or safety-critical software certification.</p></section>
        </section>
      )}
    </main>
  );
}
