"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Flag, Lightbulb, Send } from "lucide-react";
import { codingInterviewPrompts, reviewCodingInterview } from "@/lib/coding-interviews";

export function CodingInterviewArena({ onComplete }: { onComplete: (id: string, score: number, response: string) => void }) {
  const [promptId, setPromptId] = useState(codingInterviewPrompts[0].id);
  const [support, setSupport] = useState<"guided" | "limited" | "no-hints">("guided");
  const [response, setResponse] = useState("");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(codingInterviewPrompts[0].durationMinutes * 60);
  const [submitted, setSubmitted] = useState<ReturnType<typeof reviewCodingInterview> | null>(null);
  const prompt = useMemo(() => codingInterviewPrompts.find((item) => item.id === promptId) ?? codingInterviewPrompts[0], [promptId]);
  useEffect(() => { if (!running || secondsLeft <= 0) return; const timer = window.setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000); return () => window.clearInterval(timer); }, [running, secondsLeft]);
  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const submit = () => { const result = reviewCodingInterview(prompt, response); setSubmitted(result); setRunning(false); onComplete(prompt.id, result.score, response); };
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
    <div className="interview-arena-layout"><aside><span>Prompt set</span>{codingInterviewPrompts.map((item) => <button key={item.id} className={item.id === prompt.id ? "active" : ""} onClick={() => choosePrompt(item.id)}><small>{item.mode.replace("-", " ")}</small><b>{item.title}</b></button>)}</aside><article><div className="arena-toolbar"><label>Mode<select value={support} onChange={(event) => setSupport(event.target.value as typeof support)}><option value="guided">Guided</option><option value="limited">Limited hints</option><option value="no-hints">No hints</option></select></label><span><Clock3 size={16} /> {format(secondsLeft)}</span><button className="coding-secondary" onClick={() => setRunning((value) => !value)}>{running ? "Pause" : "Start timer"}</button></div><p className="coding-kicker">{prompt.mode.replace("-", " ")} · {prompt.durationMinutes} MINUTES</p><h3>{prompt.title}</h3><p className="arena-prompt">{prompt.prompt}</p>{support === "guided" && <aside className="arena-hint"><Lightbulb size={16} /><span>{prompt.guidedHint}</span></aside>}{support === "limited" && <aside className="arena-hint"><Lightbulb size={16} /><span>Start with the operational outcome, then make the boundary and verification explicit.</span></aside>}<textarea value={response} disabled={Boolean(submitted)} onChange={(event) => setResponse(event.target.value)} placeholder="Speak as if you are explaining your own design to an interviewer…" aria-label="Interview response" />{!submitted ? <button className="coding-primary" disabled={response.trim().split(/\s+/).length < 30} onClick={submit}>Submit response <Send size={16} /></button> : <section className="arena-feedback"><b>{submitted.score}% response evidence</b><p>{submitted.complete ? "Your response covered the expected reasoning and had enough depth for a useful self-review. Use the follow-up question next." : "Strengthen the missing reasoning before retrying. More words alone do not improve the answer."}</p>{submitted.missing.length > 0 && <ul>{submitted.missing.map((item) => <li key={item}>Make the {item} explicit.</li>)}</ul>}<section><span>Follow-up pressure question</span><p>{prompt.followUp}</p></section></section>}</article></div>
  </section>;
}
