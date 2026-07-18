"use client";

import { useState } from "react";
import { Check, RefreshCcw, Send } from "lucide-react";
import type { CodingCompetencyKey } from "@/lib/coding-developer";

type PublicQuestion = {
  id: string;
  kind: string;
  competency: CodingCompetencyKey;
  prompt: string;
  format: "choice" | "response";
  choices?: Array<{ id: string; text: string }>;
};
type Result = {
  score: number;
  answered: number;
  total: number;
  competencyScores: Partial<Record<CodingCompetencyKey, number>>;
  feedback: Array<{ id: string; correct: boolean; rationale: string; nextDrill: string; kind: string }>;
};

export function CodingAssessment({
  onComplete,
  priorAttempts,
}: {
  onComplete: (result: Result, questionIds: string[]) => void;
  priorAttempts: Array<{ score: number; completedAt: string }>;
}) {
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});
    try {
      const attempt = crypto.randomUUID();
      const response = await fetch(`/api/coding/assessment?attempt=${encodeURIComponent(attempt)}&limit=12`);
      const body = (await response.json()) as { questions?: PublicQuestion[]; error?: string };
      if (!response.ok || !body.questions) throw new Error(body.error ?? "The assessment could not be prepared.");
      setQuestions(body.questions);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assessment could not be prepared.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (questions.some((question) => !answers[question.id]?.trim())) {
      setError("Answer every prompt before submitting. Short answers should still name the requested technical reasoning.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/coding/assessment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers, questionIds: questions.map((question) => question.id) }),
      });
      const body = (await response.json()) as Result & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "The assessment could not be scored.");
      setResult(body);
      onComplete(body, questions.map((question) => question.id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assessment could not be scored.");
    } finally {
      setLoading(false);
    }
  };

  if (!questions.length) {
    return <section className="coding-assessment-start">
      <p className="coding-kicker">RETRIEVAL CHECK</p>
      <h2>Show what you can recall before opening the next lesson.</h2>
      <p>This 12-prompt mixed check contains recognition, recall, repair, transfer, and production-judgment work. It is a study diagnostic—not a credential.</p>
      {priorAttempts.length > 0 && <p className="coding-attempt-history">Previous checks: {priorAttempts.map((attempt) => `${attempt.score}%`).join(" · ")}</p>}
      {error && <p className="coding-form-error" role="alert">{error}</p>}
      <button className="coding-primary" disabled={loading} onClick={start}>{loading ? "Preparing a new form…" : "Start a retrieval check"} <RefreshCcw size={16} /></button>
    </section>;
  }

  return <section className="coding-assessment">
    <header>
      <div><p className="coding-kicker">RETRIEVAL CHECK · {questions.length} PROMPTS</p><h2>Use your own reasoning before looking anything up.</h2></div>
      <span>{Object.keys(answers).length}/{questions.length} answered</span>
    </header>
    {questions.map((question, index) => {
      const feedback = result?.feedback.find((item) => item.id === question.id);
      return <article key={question.id} className={feedback ? (feedback.correct ? "correct" : "incorrect") : ""}>
        <p><span>{String(index + 1).padStart(2, "0")}</span>{question.kind.replace("-", " ")} · {question.competency}</p>
        <h3>{question.prompt}</h3>
        {question.format === "choice" ? <fieldset disabled={Boolean(result)}>
          <legend className="sr-only">Choose an answer</legend>
          {question.choices?.map((option) => <label key={option.id}><input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} /> <span>{option.text}</span></label>)}
        </fieldset> : <textarea disabled={Boolean(result)} value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Answer with the requested decisions and technical reasoning…" aria-label={`Answer for question ${index + 1}`} />}
        {feedback && <aside><b>{feedback.correct ? "Evidence recorded" : "Revisit this concept"}</b><p>{feedback.rationale}</p><small>Next: {feedback.nextDrill}</small></aside>}
      </article>;
    })}
    {!result ? <><p className="coding-assessment-note">The answer key and response-review conditions stay on the server. A passing check supports study planning; it does not claim independent implementation mastery.</p>{error && <p className="coding-form-error" role="alert">{error}</p>}<button className="coding-primary" disabled={loading} onClick={submit}>{loading ? "Scoring…" : "Submit retrieval check"} <Send size={16} /></button></> : <section className="coding-assessment-result"><h3>{result.score}% retrieval result</h3><p>{result.score >= 75 ? "You have a solid study signal. Use incorrect prompts as deliberate review targets before advancing." : "Use the targeted follow-ups above, then take a fresh form. The goal is dependable reasoning, not one lucky pass."}</p><button className="coding-secondary" onClick={start}>Take a new form <RefreshCcw size={15} /></button></section>}
  </section>;
}
