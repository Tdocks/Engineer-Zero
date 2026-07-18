"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Flag, Lightbulb, Send } from "lucide-react";
import { codingInterviewPrompts } from "@/lib/coding-interview-prompts";
import type { CodingProgramProgress } from "@/lib/coding-developer";

type InterviewReview = { score: number; missing: string[]; hasStructure: boolean; complete: boolean; initialComplete?: boolean; initialMissing?: string[] };
type InterviewAttempt = CodingProgramProgress["interviewAttempts"][number];

export function CodingInterviewArena({ attempts, onComplete }: { attempts: InterviewAttempt[]; onComplete: (attempt: Omit<InterviewAttempt, "id" | "completedAt">) => void }) {
  const [promptId, setPromptId] = useState(codingInterviewPrompts[0].id);
  const [support, setSupport] = useState<"guided" | "limited" | "no-hints">("guided");
  const [response, setResponse] = useState("");
  const [initialResponse, setInitialResponse] = useState("");
  const [changeDelivered, setChangeDelivered] = useState(false);
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
      const request = await fetch("/api/coding/interview-review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ promptId: prompt.id, response, initialResponse: prompt.mode === "requirements-change" ? initialResponse : undefined }) });
      const result = await request.json() as InterviewReview & { error?: string };
      if (!request.ok || typeof result.score !== "number" || !Array.isArray(result.missing)) throw new Error(result.error ?? "The interview response could not be reviewed.");
      setSubmitted(result); setRunning(false); onComplete({ promptId: prompt.id, score: result.score, response, initialResponse: isRequirementChange ? initialResponse : undefined, support, elapsedSeconds: Math.max(0, (prompt.durationMinutes * 60) - secondsLeft) });
    } catch (error) { setReviewError(error instanceof Error ? error.message : "The interview response could not be reviewed."); }
    finally { setSubmitting(false); }
  };
  const choosePrompt = (id: string) => {
    const next = codingInterviewPrompts.find((item) => item.id === id) ?? codingInterviewPrompts[0];
    setPromptId(next.id);
    setRunning(false);
    setSecondsLeft(next.durationMinutes * 60);
    setResponse("");
    setInitialResponse("");
    setChangeDelivered(false);
    setSubmitted(null);
  };
  const initialWordCount = initialResponse.trim() ? initialResponse.trim().split(/\s+/).length : 0;
  const responseWordCount = response.trim() ? response.trim().split(/\s+/).length : 0;
  const isRequirementChange = prompt.mode === "requirements-change";
  const promptAttempts = useMemo(() => attempts.filter((attempt) => attempt.promptId === prompt.id).slice().reverse(), [attempts, prompt.id]);
  const canSubmit = isRequirementChange
    ? changeDelivered && initialWordCount >= 70 && responseWordCount >= 100
    : responseWordCount >= 70;
  return <section className="coding-interview-arena">
    <header><p className="coding-kicker">INTERVIEW ARENA</p><h2>Explain the work when the prompt changes.</h2><p>Practice mode gives structured help. Assessment-style modes remove it gradually. This is feedback for study, not an automated hiring decision.</p></header>
    <div className="interview-arena-layout"><aside><span>Prompt set</span>{codingInterviewPrompts.map((item) => <button key={item.id} className={item.id === prompt.id ? "active" : ""} onClick={() => choosePrompt(item.id)}><small>{item.mode.replace("-", " ")}</small><b>{item.title}</b></button>)}</aside><article><div className="arena-toolbar"><label>Mode<select value={support} onChange={(event) => setSupport(event.target.value as typeof support)}><option value="guided">Guided</option><option value="limited">Limited hints</option><option value="no-hints">No hints</option></select></label><span><Clock3 size={16} /> {format(secondsLeft)}</span><button className="coding-secondary" onClick={() => setRunning((value) => !value)}>{running ? "Pause" : "Start timer"}</button></div><p className="coding-kicker">{prompt.mode.replace("-", " ")} · {prompt.durationMinutes} MINUTES</p><h3>{prompt.title}</h3><p className="arena-prompt">{prompt.prompt}</p>{support === "guided" && <aside className="arena-hint"><Lightbulb size={16} /><span>{prompt.guidedHint}</span></aside>}{support === "limited" && <aside className="arena-hint"><Lightbulb size={16} /><span>Structure your answer into outcome, implementation boundary, evidence, and limitation.</span></aside>}{isRequirementChange ? <section className="arena-change-workflow"><section><span>Round 1 · initial prototype</span><p>Scope the smallest safe prototype before the reviewer changes the requirement. Name the user outcome, the data contract, and what stays outside the first slice.</p><textarea value={initialResponse} disabled={Boolean(submitted) || changeDelivered} onChange={(event) => setInitialResponse(event.target.value)} placeholder="Describe the thin first version before you learn about the new constraint…" aria-label="Initial prototype response" /><small>{initialWordCount} / 70 words</small>{!changeDelivered && <button className="coding-secondary" disabled={initialWordCount < 70} onClick={() => setChangeDelivered(true)}>Receive new constraint <Flag size={16} /></button>}</section>{changeDelivered && <section className="arena-change-reveal"><span>New constraint from the reviewer</span><p>Each team may see only its own fictional handoff notes. The reviewer also requests automatic write-back. Re-scope the design under this new identity and action boundary.</p></section>}{changeDelivered && <section><span>Round 2 · revised recommendation</span><p>Revise the plan. Be explicit about authorization, the narrowest safe action, validation, escalation or rollback, and the evidence that would justify a later expansion.</p><textarea value={response} disabled={Boolean(submitted)} onChange={(event) => setResponse(event.target.value)} placeholder="Write the revised recommendation after the constraint changes…" aria-label="Revised interview response" /><small>{responseWordCount} / 100 words</small></section>}</section> : <textarea value={response} disabled={Boolean(submitted)} onChange={(event) => setResponse(event.target.value)} placeholder="Use distinct sentences or short paragraphs for outcome, approach, verification, boundary, and next decision…" aria-label="Interview response" />}{!submitted ? <><button className="coding-primary" disabled={submitting || !canSubmit} onClick={submit}>{submitting ? "Reviewing…" : "Submit response"} <Send size={16} /></button>{reviewError && <p className="coding-form-error" role="alert">{reviewError}</p>}</> : <section className="arena-feedback"><b>{submitted.score}% response evidence</b><p>{submitted.complete ? "Your two-round response contains distinct, specific reasoning with enough depth for a useful self-review. Use the follow-up question next." : "Strengthen the missing reasoning. The review checks distinct evidence segments, depth, and repetition—not just word count."}</p>{submitted.initialComplete === false && <section><span>First-round prototype</span><p>Make the initial scope specific before treating the revised answer as a complete response.</p>{submitted.initialMissing && <ul>{submitted.initialMissing.map((item) => <li key={item}>Add {item} to the initial prototype recommendation.</li>)}</ul>}</section>}{submitted.missing.length > 0 && <ul>{submitted.missing.map((item) => <li key={item}>Make {item} specific and support it with a concrete decision or verification step.</li>)}</ul>}{!submitted.hasStructure && <p>Use at least four distinct reasoning sentences or short paragraphs; repeated terms do not establish independent evidence.</p>}<section><span>Follow-up pressure question</span><p>{prompt.followUp}</p></section></section>}{promptAttempts.length > 0 && <section className="arena-attempt-history"><header><span>Response replay</span><p>Local study history. Review the change in reasoning before you try this prompt again.</p></header>{promptAttempts.slice(0, 3).map((attempt) => <article key={attempt.id}><div><b>{attempt.score}% evidence</b><small>{attempt.support.replace("-", " ")} · {Math.ceil(attempt.elapsedSeconds / 60)} min · {new Date(attempt.completedAt).toLocaleDateString()}</small></div>{attempt.initialResponse && <p><strong>Initial scope:</strong> {attempt.initialResponse}</p>}<p><strong>Submitted response:</strong> {attempt.response}</p></article>)}</section>}</article></div>
  </section>;
}
