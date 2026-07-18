"use client";

import { useEffect, useState } from "react";
import type { LearnerState } from "@/lib/types";

type Prompt = {
  id: string;
  category: string;
  prompt: string;
  why: string;
};

export function AioInterviewStudio({
  state,
  setState,
}: {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
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
  const [practiceMode, setPracticeMode] = useState<"guided" | "rapid" | "defense">("guided");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/course/interviews")
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
  }, []);
  const filtered =
    category === "All"
      ? prompts
      : prompts.filter((prompt) => prompt.category === category);
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
  const score = async () => {
    if (!selected) return;
    const response = await fetch("/api/course/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId: selected.id, response: answer }),
    });
    const result = await response.json() as {
      score?: number; feedback?: string; followUp?: string; examinerGuidance?: { strongAnswer: string; commonMiss: string; rubric: string[] }; error?: string;
    };
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
  if (!selected)
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
        <select
          className="studio-select"
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
        <select className="studio-select" value={practiceMode} onChange={(event) => setPracticeMode(event.target.value as typeof practiceMode)}>
          <option value="guided">Guided practice</option>
          <option value="rapid">Rapid technical round</option>
          <option value="defense">Project defense</option>
        </select>
      </div>
      <section className="crash-plan">
        <div>
          <span className="eyebrow amber">48-HOUR INTERVIEW SPRINT</span>
          <h3>Eight blocks. Eight artifacts. One honest packet.</h3>
          <p>
            Use Academy for the full sprint instruction, then return here for
            rapid technical, system-design, leadership, and project-defense
            rounds.
          </p>
        </div>
      </section>
      <div className="interview-layout">
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
      </div>
    </div>
  );
}
