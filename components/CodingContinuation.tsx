"use client";

import { useState } from "react";
import { Check, LockKeyhole, Send } from "lucide-react";
import { codingContinuation, type CodingContinuationSubmission } from "@/lib/coding-continuation";

type ContinuationAttempt = {
  submission: CodingContinuationSubmission;
  score: number;
  status: "needs-revision" | "reviewed";
  feedback: string;
  missing: string[];
  updatedAt: string;
};

const emptySubmission: CodingContinuationSubmission = { artifact: "", verification: "", limitation: "", nextDecision: "" };

export function CodingContinuation({ completedIds, attempts, onComplete }: { completedIds: string[]; attempts: Record<string, ContinuationAttempt>; onComplete: (id: string, attempt: ContinuationAttempt) => void }) {
  const [selectedId, setSelectedId] = useState(codingContinuation[0].id);
  const [submission, setSubmission] = useState<CodingContinuationSubmission>(emptySubmission);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");
  const item = codingContinuation.find((module) => module.id === selectedId) ?? codingContinuation[0];
  const priorWeeksDone = codingContinuation.filter((module) => module.week < item.week).every((module) => completedIds.includes(module.id));
  const attempt = attempts[item.id];
  const select = (id: string) => {
    setSelectedId(id);
    setSubmission(attempts[id]?.submission ?? emptySubmission);
    setError("");
  };
  const submit = async () => {
    setReviewing(true); setError("");
    try {
      const response = await fetch("/api/coding/continuation-review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ moduleId: item.id, submission }) });
      const result = await response.json() as Omit<ContinuationAttempt, "submission" | "updatedAt"> & { error?: string };
      if (!response.ok || typeof result.score !== "number" || !result.status || !Array.isArray(result.missing) || !result.feedback) throw new Error(result.error ?? "The continuation evidence could not be reviewed.");
      onComplete(item.id, { submission, score: result.score, status: result.status, feedback: result.feedback, missing: result.missing, updatedAt: new Date().toISOString() });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The continuation evidence could not be reviewed."); }
    finally { setReviewing(false); }
  };
  const complete = attempt?.status === "reviewed";
  return <section className="coding-continuation">
    <header><p className="coding-kicker">ONE-MONTH CONTINUATION</p><h2>Turn a four-day prototype into durable engineering practice.</h2><p>Each week now requires evidence of a concrete artifact, a verification step, an honest limitation, and an accountable next decision. It does not claim external runtime or reviewer verification until those systems are enabled.</p></header>
    <div className="continuation-layout"><aside>{codingContinuation.map((module) => <button key={module.id} className={module.id === item.id ? "active" : ""} onClick={() => select(module.id)}><span>Week {module.week}</span><b>{module.title}</b>{attempts[module.id]?.status === "reviewed" && <Check size={15} />}</button>)}</aside><article><p className="coding-kicker">WEEK {item.week}</p><h3>{item.title}</h3><p className="continuation-outcome">{item.outcome}</p><h4>Practice sequence</h4><ol>{item.activities.map((activity) => <li key={activity}>{activity}</li>)}</ol><section><span>Required artifact</span><p>{item.artifact}</p>{item.localProjectPath && <code>{item.localProjectPath}</code>}</section><section><span>Defense</span><p>{item.defense}</p></section>{!priorWeeksDone && <p className="coding-form-error"><LockKeyhole size={15} /> Complete and review the earlier continuation evidence first. The requirements remain visible so you can see the destination.</p>}<div className="continuation-evidence-form">{(Object.keys(item.evidencePrompts) as Array<keyof CodingContinuationSubmission>).map((field) => <label key={field}><b>{field === "artifact" ? "Artifact" : field === "verification" ? "Verification" : field === "limitation" ? "Honest limitation" : "Next accountable decision"}</b><span>{item.evidencePrompts[field]}</span><textarea value={submission[field]} disabled={!priorWeeksDone || complete} onChange={(event) => setSubmission((current) => ({ ...current, [field]: event.target.value }))} /></label>)}</div><footer><div><b>{complete ? `Reviewed local evidence · ${attempt.score}%` : "Submit evidence for deterministic review"}</b><p>{attempt ? attempt.feedback : "Each section must contain its own concrete evidence. Generic project descriptions and repeated keywords cannot complete this activity."}</p>{attempt?.missing.length ? <small>Add: {attempt.missing.join("; ")}.</small> : null}</div><button className="coding-primary" disabled={!priorWeeksDone || reviewing || Object.values(submission).some((value) => value.trim().length < 18)} onClick={submit}>{reviewing ? "Reviewing evidence…" : <><Send size={16} /> Review continuation evidence</>}</button></footer>{error && <p className="coding-form-error" role="alert">{error}</p>}</article></div>
  </section>;
}
