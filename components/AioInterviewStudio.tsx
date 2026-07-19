"use client";

import { useEffect, useRef, useState } from "react";
import {
  aioOralProbes,
  isCompleteOralProbeDryRun,
  ORAL_PROBE_MIN_WORDS,
  ORAL_PROBE_PASS_MINIMUM,
  scoreOralProbeDryRun,
} from "@/lib/aio-oral-probes";
import type {
  InterviewMockRound,
  LearnerState,
  TrackId,
} from "@/lib/types";

type Prompt = {
  id: string;
  category: string;
  prompt: string;
  why: string;
  timedMinutes?: 30 | 45 | 60 | 90;
  scenarioArtifact?: string;
};

type PracticeMode = "guided" | "rapid" | "defense" | "mock" | "probes";

const mockRoundDefinitions: Array<{
  round: InterviewMockRound["round"];
  label: string;
  seconds: number;
  category: string;
  promptMatch: RegExp;
}> = [
  {
    round: "fit",
    label: "Fit + discovery",
    seconds: 8 * 60,
    category: "Technical leadership",
    promptMatch: /why this|stakeholder|discover|asks for an agent/i,
  },
  {
    round: "technical",
    label: "Technical fundamentals",
    seconds: 12 * 60,
    category: "Retrieval, evaluation, and agents",
    promptMatch: /retriev|rag|evaluation|authorization/i,
  },
  {
    round: "system-design",
    label: "System design",
    seconds: 15 * 60,
    category: "Secure enterprise architecture",
    promptMatch: /design|architecture|assistant|secure/i,
  },
  {
    round: "defense",
    label: "Project defense",
    seconds: 10 * 60,
    category: "Behavioral and project defense",
    promptMatch: /project|contribution|defend|built/i,
  },
];

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function AioInterviewStudio({
  state,
  setState,
  trackId = "applied-ai-operations",
  initialPracticeMode = "guided",
}: {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
  trackId?: TrackId;
  initialPracticeMode?: PracticeMode;
}) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guidance, setGuidance] = useState<{
    strongAnswer: string;
    commonMiss: string;
    rubric: string[];
    followUp: string;
  } | null>(null);
  const [category, setCategory] = useState("All");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(
    trackId === "applied-ai-operations" ? initialPracticeMode : "guided",
  );
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [mockStartedAt, setMockStartedAt] = useState("");
  const [mockRoundIndex, setMockRoundIndex] = useState(0);
  const [mockRounds, setMockRounds] = useState<InterviewMockRound[]>([]);
  const [mockRevision, setMockRevision] = useState("");
  const [mockBusy, setMockBusy] = useState(false);
  const [roundTimedOut, setRoundTimedOut] = useState(false);
  const [probeAnswers, setProbeAnswers] = useState<Record<number, string>>(() => {
    const latest = [...state.oralProbeDryRuns]
      .reverse()
      .find((dryRun) => dryRun.trackId === trackId);
    return Object.fromEntries(
      (latest?.answers ?? []).map((item) => [item.probeId, item.response]),
    );
  });
  const [answeredWithoutNotes, setAnsweredWithoutNotes] = useState(false);
  const [useColdPrompts, setUseColdPrompts] = useState(true);
  const [probeRatings, setProbeRatings] = useState<
    Record<number, "strong" | "partial" | "fail">
  >({});
  const [revealedProbeSignals, setRevealedProbeSignals] = useState<Record<number, boolean>>(
    {},
  );
  const mockBusyRef = useRef(false);
  const timeoutHandledForRoundRef = useRef<number | null>(null);
  const answerRef = useRef(answer);
  const selectedRef = useRef(selected);
  const mockRoundIndexRef = useRef(mockRoundIndex);
  const mockRoundsRef = useRef(mockRounds);
  const secondsLeftRef = useRef(secondsLeft);
  answerRef.current = answer;
  selectedRef.current = selected;
  mockRoundIndexRef.current = mockRoundIndex;
  mockRoundsRef.current = mockRounds;
  secondsLeftRef.current = secondsLeft;
  mockBusyRef.current = mockBusy;

  useEffect(() => {
    fetch(`/api/course/interviews?track=${trackId}`)
      .then((response) => response.json())
      .then((data: { prompts: Prompt[] }) => {
        setPrompts(data.prompts);
        setSelected(data.prompts[0] ?? null);
      })
      .catch(() =>
        setFeedback(
          "The interview bank could not be loaded. Refresh to retry.",
        ),
      );
  }, [trackId]);

  const filtered =
    category === "All"
      ? prompts
      : prompts.filter((prompt) => prompt.category === category);
  const promptForMockRound = (roundIndex: number, usedIds: string[]) => {
    const definition = mockRoundDefinitions[roundIndex];
    const candidates = prompts.filter(
      (prompt) =>
        !usedIds.includes(prompt.id) &&
        prompt.category === definition.category,
    );
    return (
      candidates.find((prompt) => definition.promptMatch.test(prompt.prompt)) ??
      candidates[0] ??
      prompts.find((prompt) => !usedIds.includes(prompt.id)) ??
      null
    );
  };
  const choose = (prompt: Prompt) => {
    setSelected(prompt);
    setAnswer(state.answers[prompt.id] ?? "");
    setFeedback("");
    setGuidance(null);
    setSecondsLeft(null);
  };
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const timer = window.setInterval(
      () => setSecondsLeft((current) => (current && current > 0 ? current - 1 : 0)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const requestScore = async (prompt: Prompt, responseText: string) => {
    const response = await fetch("/api/course/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        track: trackId,
        promptId: prompt.id,
        response: responseText,
      }),
    });
    const result = await response.json() as {
      score?: number; feedback?: string; followUp?: string; examinerGuidance?: { strongAnswer: string; commonMiss: string; rubric: string[] }; error?: string;
    };
    return { response, result };
  };

  const lockMockRound = async (options?: { timedOut?: boolean }) => {
    const currentSelected = selectedRef.current;
    const currentAnswer = answerRef.current;
    const currentIndex = mockRoundIndexRef.current;
    const currentRounds = mockRoundsRef.current;
    const currentSeconds = secondsLeftRef.current;
    if (
      !currentSelected ||
      currentIndex >= mockRoundDefinitions.length ||
      mockBusyRef.current
    ) {
      return;
    }
    const words = wordCount(currentAnswer);
    const definition = mockRoundDefinitions[currentIndex];
    if (words < 80) {
      setRoundTimedOut(Boolean(options?.timedOut));
      setFeedback(
        options?.timedOut
          ? `Time expired with only ${words} words. Add at least 80 words, then lock this round to continue—the clock will not restart.`
          : "Write at least 80 words before locking this round.",
      );
      setSecondsLeft(0);
      return;
    }
    setMockBusy(true);
    mockBusyRef.current = true;
    try {
      const { response, result } = await requestScore(currentSelected, currentAnswer);
      if (!response.ok || typeof result.score !== "number") {
        setFeedback(result.error ?? "The round could not be scored. Your first answer remains here.");
        return;
      }
      const nextRounds: InterviewMockRound[] = [
        ...currentRounds,
        {
          round: definition.round,
          promptId: currentSelected.id,
          prompt: currentSelected.prompt,
          firstResponse: currentAnswer.trim(),
          score: result.score,
          elapsedSeconds: Math.max(0, definition.seconds - (currentSeconds ?? 0)),
        },
      ];
      setMockRounds(nextRounds);
      const nextIndex = currentIndex + 1;
      setMockRoundIndex(nextIndex);
      setFeedback(
        options?.timedOut
          ? "Time expired — first answer locked. Continue to the next round."
          : "",
      );
      setGuidance(null);
      setRoundTimedOut(false);
      timeoutHandledForRoundRef.current = null;
      if (nextIndex < mockRoundDefinitions.length) {
        const nextPrompt = promptForMockRound(
          nextIndex,
          nextRounds.map((round) => round.promptId),
        );
        setSelected(nextPrompt);
        setAnswer("");
        setSecondsLeft(mockRoundDefinitions[nextIndex].seconds);
      } else {
        setAnswer("");
        setSecondsLeft(null);
      }
    } finally {
      setMockBusy(false);
      mockBusyRef.current = false;
    }
  };

  useEffect(() => {
    if (
      practiceMode !== "mock" ||
      !mockStartedAt ||
      mockRoundIndex >= mockRoundDefinitions.length ||
      secondsLeft !== 0 ||
      mockBusy ||
      timeoutHandledForRoundRef.current === mockRoundIndex
    ) {
      return;
    }
    timeoutHandledForRoundRef.current = mockRoundIndex;
    void lockMockRound({ timedOut: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lock once when the mock clock hits zero
  }, [secondsLeft, practiceMode, mockStartedAt, mockRoundIndex, mockBusy]);

  const score = async () => {
    if (!selected) return;
    const { response, result } = await requestScore(selected, answer);
    if (!response.ok) {
      setFeedback(result.error ?? "Interview scoring is temporarily unavailable. Your answer remains saved locally.");
      return;
    }
    setState((current) => ({
      ...current,
      answers: { ...current.answers, [selected.id]: answer },
    }));
    setFeedback(
      `${result.score}% · ${result.feedback} Follow-up: ${result.followUp}`,
    );
    if (result.examinerGuidance) setGuidance({ ...result.examinerGuidance, followUp: result.followUp ?? "" });
  };
  const startMock = () => {
    const first = promptForMockRound(0, []);
    if (!first) return;
    setMockStartedAt(new Date().toISOString());
    setMockRoundIndex(0);
    setMockRounds([]);
    setMockRevision("");
    setSelected(first);
    setAnswer("");
    setFeedback("");
    setGuidance(null);
    setRoundTimedOut(false);
    timeoutHandledForRoundRef.current = null;
    setSecondsLeft(mockRoundDefinitions[0].seconds);
  };
  const saveMock = () => {
    if (mockRounds.length !== 4 || wordCount(mockRevision) < 60) return;
    const weakest = [...mockRounds].sort((left, right) => left.score - right.score)[0];
    setState((current) => ({
      ...current,
      interviewMockAttempts: [
        ...current.interviewMockAttempts,
        {
          id: crypto.randomUUID(),
          trackId,
          startedAt: mockStartedAt,
          completedAt: new Date().toISOString(),
          rounds: mockRounds,
          revisedRound: weakest.round,
          revision: mockRevision.trim(),
        },
      ],
    }));
    setFeedback("Four-round timed mock saved with first answers and one revision.");
    setMockStartedAt("");
    setMockRounds([]);
    setMockRoundIndex(0);
    setMockRevision("");
  };
  const saveProbeDryRun = () => {
    const answers = aioOralProbes.map((probe) => ({
      probeId: probe.id,
      response: (probeAnswers[probe.id] ?? "").trim(),
    }));
    const scored = scoreOralProbeDryRun(answers);
    setProbeRatings(
      Object.fromEntries(
        scored.ratedAnswers.map((answer) => [answer.probeId, answer.rating ?? "fail"]),
      ),
    );
    setRevealedProbeSignals(
      Object.fromEntries(aioOralProbes.map((probe) => [probe.id, true])),
    );
    const draft = {
      id: crypto.randomUUID(),
      trackId,
      completedAt: new Date().toISOString(),
      answeredWithoutNotes,
      answers: scored.ratedAnswers,
      strongOrPartialCount: scored.strongOrPartialCount,
      mustPassCleared: scored.mustPassCleared,
      usedColdPrompts: useColdPrompts,
    };
    if (!isCompleteOralProbeDryRun(draft)) {
      setFeedback(
        `Need ≥${ORAL_PROBE_PASS_MINIMUM}/${aioOralProbes.length} Strong-or-Partial, must-pass probes 4/5/6/10/11 cleared, ≥${ORAL_PROBE_MIN_WORDS} words each, and the without-notes attest. Score now: ${scored.strongOrPartialCount}/${aioOralProbes.length}; must-pass ${scored.mustPassCleared ? "cleared" : "not cleared"}.`,
      );
      return;
    }
    setState((current) => ({
      ...current,
      oralProbeDryRuns: [...current.oralProbeDryRuns, draft],
    }));
    setFeedback(
      `Scored oral probe dry-run saved (${scored.strongOrPartialCount}/${aioOralProbes.length} Strong-or-Partial). Day-5 probe gate cleared.`,
    );
  };
  const probeDryRunComplete = state.oralProbeDryRuns.some(
    (dryRun) => dryRun.trackId === trackId && isCompleteOralProbeDryRun(dryRun),
  );
  const probeDraftReady =
    answeredWithoutNotes &&
    aioOralProbes.every(
      (probe) => wordCount(probeAnswers[probe.id] ?? "") >= ORAL_PROBE_MIN_WORDS,
    );

  if (!selected && practiceMode !== "probes")
    return (
      <div className="content">
        <section className="empty">
          <h2>Loading Interview Studio…</h2>
          <p>Preparing independently authored role-specific prompts.</p>
        </section>
      </div>
    );
  return (
    <div className="content">
      <div className="section-title">
        <div>
          <span className="eyebrow">INTERVIEW STUDIO</span>
          <h2>Practice what you can explain.</h2>
        </div>
        {practiceMode !== "probes" && (
          <select
            className="studio-select"
            aria-label="Interview prompt category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>All</option>
            {Array.from(new Set(prompts.map((prompt) => prompt.category))).map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        )}
        <select
          className="studio-select"
          aria-label="Interview practice mode"
          value={practiceMode}
          onChange={(event) => setPracticeMode(event.target.value as PracticeMode)}
        >
          <option value="guided">Guided practice</option>
          <option value="rapid">Rapid technical round</option>
          <option value="defense">Project defense</option>
          {trackId === "applied-ai-operations" && (
            <>
              <option value="mock">Required four-round mock</option>
              <option value="probes">Day-5 oral probe dry-run</option>
            </>
          )}
        </select>
      </div>
      <section className="crash-plan">
        <div>
          <span className="eyebrow amber">{trackId === "it-support-technician" ? "48-HOUR IT SUPPORT CRASH COURSE" : "FEW-DAY INTERVIEW PACKET"}</span>
          <h3>{trackId === "it-support-technician" ? "Technical triage, calm communication, and an honest interview packet." : "Judgment, a guided prototype story, and a real four-round mock—not implementer job-readiness."}</h3>
          <p>
            Use Academy for the full sprint instruction, then return here for
            rapid technical, operational-scenario, leadership, and project-defense rounds.
          </p>
        </div>
      </section>
      {practiceMode === "probes" && trackId === "applied-ai-operations" && (
        <section className="interview-card">
          <span className="eyebrow amber">DAY-5 PACKET GATE</span>
          <h2>Answer twelve oral probes without notes.</h2>
          <p>
            Scored practice evidence—not a credential. Need ≥{ORAL_PROBE_PASS_MINIMUM}/
            {aioOralProbes.length} Strong-or-Partial and must-pass probes 4, 5, 6, 10, and 11.
            Strong-answer signals stay hidden until you submit.
            {probeDryRunComplete ? " A passing dry-run is already saved on this device." : ""}
          </p>
          <label className="write-answer">
            <span>
              <input
                type="checkbox"
                checked={useColdPrompts}
                onChange={(event) => setUseColdPrompts(event.target.checked)}
              />{" "}
              Use cold paraphrased prompts (recommended for Day 5).
            </span>
          </label>
          {aioOralProbes.map((probe) => (
            <label className="write-answer" key={probe.id}>
              <b>
                Probe {probe.id}
                {probe.mustPassForHigh ? " (must-pass)" : ""}.{" "}
                {useColdPrompts ? probe.coldPrompt : probe.prompt}
              </b>
              {revealedProbeSignals[probe.id] ? (
                <span>
                  Rating: {probeRatings[probe.id] ?? "—"} · Signals: {probe.strongAnswerSignals}
                </span>
              ) : (
                <span>Write first. Signals unlock after scoring.</span>
              )}
              <textarea
                value={probeAnswers[probe.id] ?? ""}
                onChange={(event) =>
                  setProbeAnswers((current) => ({
                    ...current,
                    [probe.id]: event.target.value,
                  }))
                }
                placeholder="Answer in your own words…"
              />
              <small>
                {wordCount(probeAnswers[probe.id] ?? "")}/{ORAL_PROBE_MIN_WORDS} words
              </small>
            </label>
          ))}
          <label className="write-answer">
            <span>
              <input
                type="checkbox"
                checked={answeredWithoutNotes}
                onChange={(event) => setAnsweredWithoutNotes(event.target.checked)}
              />{" "}
              I answered these probes without reading lesson notes aloud or pasting curriculum text.
            </span>
          </label>
          {feedback && <div className="feedback">{feedback}</div>}
          <button
            className="primary wide"
            disabled={!probeDraftReady}
            onClick={saveProbeDryRun}
          >
            Score and save oral probe dry-run →
          </button>
        </section>
      )}
      {practiceMode === "mock" && (
        <section className="interview-card">
          {!mockStartedAt && mockRounds.length === 0 && (
            <>
              <span className="eyebrow amber">REQUIRED PRESSURE REP</span>
              <h2>Four rounds. First answers preserved.</h2>
              <p>
                This is the only Interview Studio activity that satisfies the
                Few-Day path mock gate. Complete fit, technical, system-design,
                and project-defense rounds on the clock, then revise the weakest
                first answer. When time hits zero, the round auto-locks if it
                meets the word minimum.
              </p>
              <div className="objective-list">
                {mockRoundDefinitions.map((round) => (
                  <div key={round.round}>
                    ↗ {round.label} · {Math.round(round.seconds / 60)} minutes
                  </div>
                ))}
              </div>
              {feedback && <div className="feedback">{feedback}</div>}
              <button className="primary wide" onClick={startMock}>
                Start four-round mock →
              </button>
            </>
          )}
          {mockStartedAt && mockRoundIndex < mockRoundDefinitions.length && selected && (
            <>
              <span className="eyebrow amber">
                ROUND {mockRoundIndex + 1}/4 · {mockRoundDefinitions[mockRoundIndex].label.toUpperCase()}
                {roundTimedOut || secondsLeft === 0 ? " · TIME EXPIRED" : ""}
              </span>
              <h2>{selected.prompt}</h2>
              {selected.scenarioArtifact && (
                <div className="prompt-box">{selected.scenarioArtifact}</div>
              )}
              <div className="interview-mode-row">
                <span>
                  {secondsLeft === 0
                    ? "Clock stopped. Lock this first answer to continue—time does not restart."
                    : "First answer is preserved; examiner guidance stays hidden until the loop ends."}
                </span>
                <b role="timer" aria-live="polite">
                  {Math.floor((secondsLeft ?? 0) / 60)}:
                  {String((secondsLeft ?? 0) % 60).padStart(2, "0")}
                </b>
              </div>
              <label className="write-answer">
                <b>Answer in a clear operating sequence</b>
                <span>At least 80 words: clarify, recommend, bound, verify, name ownership, and close.</span>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="First answer…"
                />
              </label>
              {feedback && <div className="feedback">{feedback}</div>}
              <button
                className="primary wide"
                disabled={wordCount(answer) < 80 || mockBusy}
                onClick={() => void lockMockRound()}
              >
                {mockBusy
                  ? "Scoring round…"
                  : secondsLeft === 0
                    ? "Lock first answer (time expired) →"
                    : "Lock first answer and continue →"}
              </button>
            </>
          )}
          {mockRounds.length === 4 && (
            <>
              <span className="eyebrow amber">REVISION ROUND</span>
              <h2>Repair the weakest first answer.</h2>
              <p>
                First answers are preserved below. Revise the lowest-scoring
                round with the missing boundary, evidence, verification, or
                ownership—not merely more words.
              </p>
              {mockRounds.map((round) => (
                <details key={round.round}>
                  <summary>
                    {round.round.replace("-", " ")} · {round.score}% · {Math.round(round.elapsedSeconds / 60)} min
                  </summary>
                  <p>{round.prompt}</p>
                  <p>{round.firstResponse}</p>
                </details>
              ))}
              <label className="write-answer">
                <b>Revised weakest answer</b>
                <span>At least 60 words. State what changed and why.</span>
                <textarea
                  value={mockRevision}
                  onChange={(event) => setMockRevision(event.target.value)}
                  placeholder="The first answer missed… I changed… because…"
                />
              </label>
              {feedback && <div className="feedback">{feedback}</div>}
              <button
                className="primary wide"
                disabled={wordCount(mockRevision) < 60}
                onClick={saveMock}
              >
                Save completed mock →
              </button>
            </>
          )}
        </section>
      )}
      {practiceMode !== "mock" && practiceMode !== "probes" && selected && <div className="interview-layout">
        <aside>
          {filtered.map((prompt, index) => (
            <button
              className={selected.id === prompt.id ? "selected" : ""}
              key={prompt.id}
              onClick={() => choose(prompt)}
            >
              <span>{String(index + 1).padStart(3, "0")}</span>
              <div>
                <b>{prompt.prompt}</b>
                <small>{prompt.category}</small>
              </div>
            </button>
          ))}
        </aside>
        <section className="interview-card">
          <span className="eyebrow amber">
            {selected.category.toUpperCase()}
          </span>
          <h2>Interview response</h2>
          <div className="prompt-box">{selected.prompt}</div>
          <div className="interview-mode-row">
            <span>{practiceMode === "guided" ? "Take time to reason clearly." : practiceMode === "rapid" ? "Two-minute technical response." : "Defend a decision under follow-up pressure."}</span>
            {practiceMode !== "guided" && <button className="quiet" onClick={() => setSecondsLeft(practiceMode === "rapid" ? 120 : 240)}>{secondsLeft === null ? "Start timer" : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}</button>}
          </div>
          <p>
            <b>Why this is asked:</b> {selected.why}
          </p>
          <div className="objective-list">
            <div>↗ Lead with a recommendation, then explain the boundary, evidence, verification, ownership, and tradeoff.</div>
            <div>↗ Save a first attempt before examiner guidance becomes available.</div>
          </div>
          <label className="write-answer">
            <b>Answer in a clear operating sequence</b>
            <span>Recommendation, boundary, evidence, verification, ownership, and tradeoff.</span>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Recommendation: …&#10;Boundary: …&#10;Evidence: …&#10;Verification: …"
            />
          </label>
          {feedback && <div className="feedback">{feedback}</div>}
          {guidance && <details className="interview-guide" open>
            <summary>Reveal examiner guidance after your first attempt</summary>
            <p>
              <b>Strong answer shape:</b> {guidance.strongAnswer}
            </p>
            <p>
              <b>Common miss:</b> {guidance.commonMiss}
            </p>
            <div className="objective-list">{guidance.rubric.map((rule) => <div key={rule}>↗ {rule}</div>)}</div>
          </details>}
          <button
            className="primary wide"
            disabled={answer.trim().length < 60}
            onClick={score}
          >
            Save structured answer →
          </button>
        </section>
      </div>}
    </div>
  );
}
