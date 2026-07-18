"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Flag, Lightbulb, Send } from "lucide-react";
import { codingInterviewPrompts } from "@/lib/coding-interview-prompts";

type InterviewReview = { score: number; missing: string[]; hasStructure: boolean; complete: boolean };

export function CodingInterviewArena({ onComplete }: { onComplete: (id: string, score: number, response: string) => void }) {
  const [promptId, setPromptId] = useState(codingInterviewPrompts[0].id);
  const [support, setSupport] = useState<"guided" | "limited" | "no-hints">("guided");
  const [response, setResponse] = useState("");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(codingInterviewPrompts[0].durationMinutes * 60);
  const [submitted, setSubmitted] = useState<InterviewReview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const prompt = useMemo(() => codingInterviewPrompts.find((item) => item.id === promptId) ?? codingInterviewPrompts[0], [promptId]);
  useEffect(() => { if (!running || secondsLeft <= 0) return; const timer = window.setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000); return () => window.clearInterval(timer); }, [running, secondsLeft]);
  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const submit = async () => {
    setSubmitting(true); setReviewError("");
    try {
      const request = await fetch("/api/coding/interview-review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ promptId: prompt.id, response }) });
      const result = await request.json() as InterviewReview & { error?: string };
      if (!request.ok || typeof result.score !== "number" || !Array.isArray(result.missing)) throw new Error(result.error ?? "The interview response could not be reviewed.");
      setSubmitted(result); setRunning(false); onComplete(prompt.id, result.score, response);
    } catch (error) { setReviewError(error instanceof Error ? error.message : "The interview response could not be reviewed."); }
    finally { setSubmitting(false); }
  };
  const choosePrompt = (id: string) => {
    const next = codingInterviewPrompts.find((item) => item.id === id) ?? codingInterviewPrompts[0];
    setPromptId(next.id);
    setRunning(false);
    setSecondsLeft(next.durationMinutes * 60);
    setResponse("");
    setSubmitted(null);
  };
  return <section className="coding-interview-arena">
    <header><p className="coding-kicker">INTERVIEW ARENA</p><h2>Explain the work when the prompt changes.</h2><p>Practice mode gives structured help. Assessment-style modes remove it gradually. This is feedback for study, not an automated hiring decision.</p></header>
    <div className="interview-arena-layout"><aside><span>Prompt set</span>{codingInterviewPrompts.map((item) => <button key={item.id} className={item.id === prompt.id ? "active" : ""} onClick={() => choosePrompt(item.id)}><small>{item.mode.replace("-", " ")}</small><b>{item.title}</b></button>)}</aside><article><div className="arena-toolbar"><label>Mode<select value={support} onChange={(event) => setSupport(event.target.value as typeof support)}><option value="guided">Guided</option><option value="limited">Limited hints</option><option value="no-hints">No hints</option></select></label><span><Clock3 size={16} /> {format(secondsLeft)}</span><button className="coding-secondary" onClick={() => setRunning((value) => !value)}>{running ? "Pause" : "Start timer"}</button></div><p className="coding-kicker">{prompt.mode.replace("-", " ")} · {prompt.durationMinutes} MINUTES</p><h3>{prompt.title}</h3><p className="arena-prompt">{prompt.prompt}</p>{support === "guided" && <aside className="arena-hint"><Lightbulb size={16} /><span>{prompt.guidedHint}</span></aside>}{support === "limited" && <aside className="arena-hint"><Lightbulb size={16} /><span>Structure your answer into outcome, implementation boundary, evidence, and limitation.</span></aside>}<textarea value={response} disabled={Boolean(submitted)} onChange={(event) => setResponse(event.target.value)} placeholder="Use distinct sentences or short paragraphs for outcome, approach, verification, boundary, and next decision…" aria-label="Interview response" />{!submitted ? <><button className="coding-primary" disabled={submitting || response.trim().split(/\s+/).length < 70} onClick={submit}>{submitting ? "Reviewing…" : "Submit response"} <Send size={16} /></button>{reviewError && <p className="coding-form-error" role="alert">{reviewError}</p>}</> : <section className="arena-feedback"><b>{submitted.score}% response evidence</b><p>{submitted.complete ? "Your response contains distinct, specific reasoning with enough depth for a useful self-review. Use the follow-up question next." : "Strengthen the missing reasoning. The review checks distinct evidence segments, depth, and repetition—not just word count."}</p>{submitted.missing.length > 0 && <ul>{submitted.missing.map((item) => <li key={item}>Make {item} specific and support it with a concrete decision or verification step.</li>)}</ul>}{!submitted.hasStructure && <p>Use at least four distinct reasoning sentences or short paragraphs; repeated terms do not establish independent evidence.</p>}<section><span>Follow-up pressure question</span><p>{prompt.followUp}</p></section></section>}</article></div>
  </section>;
}
