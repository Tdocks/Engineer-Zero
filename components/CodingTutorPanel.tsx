"use client";

import { useEffect, useState } from "react";
import { BookOpenText, Lightbulb, MessageCircleQuestion } from "lucide-react";
import { codingSourceList, type CodingChallenge } from "@/lib/coding-developer";
import { codingTutorResponse } from "@/lib/coding-tutor";

type CodingTutorPanelProps = {
  challenge: CodingChallenge;
  code: string;
  initialErrorOutput?: string;
  onHint: (count: number) => void;
  onErrorOutput: (value: string) => void;
};

export function CodingTutorPanel({ challenge, code, initialErrorOutput = "", onHint, onErrorOutput }: CodingTutorPanelProps) {
  const [hintCount, setHintCount] = useState(0);
  const [errorOutput, setErrorOutput] = useState(initialErrorOutput);
  useEffect(() => { setHintCount(0); setErrorOutput(initialErrorOutput); }, [challenge.id, initialErrorOutput]);
  const response = hintCount ? codingTutorResponse(challenge, code, hintCount - 1, errorOutput) : null;
  const requestHint = () => { const next = Math.min(hintCount + 1, 6); setHintCount(next); onHint(next); };
  return <section className="coding-tutor-panel" aria-live="polite">
    <header><MessageCircleQuestion size={17} /><div><span>Guided tutor</span><b>Get the smallest useful hint.</b></div></header>
    <p>This deterministic tutor reads the code in this lab and any local error you choose to describe. It never runs, completes, or sends your code anywhere.</p>
    <label className="coding-tutor-error-input"><span>Observed local error <em>optional</em></span><textarea value={errorOutput} onChange={(event) => { const value = event.target.value; setErrorOutput(value); onErrorOutput(value); }} placeholder="Paste only fictional or local error output. Never include secrets, tokens, or organizational data." aria-label="Observed local error output" /><small>This is a study note, not proof that the browser ran your code.</small></label>
    {response && <aside><span>{response.stage}</span><h4>{response.title}</h4><p>{response.message}</p>{response.observedError && <div className="coding-tutor-diagnosis"><b>{response.observedError.category}</b><p>{response.observedError.diagnosis}</p></div>}<small>{response.nextAction}</small></aside>}
    <div className="coding-tutor-sources"><BookOpenText size={15} /><div><b>Source trail</b><p>{codingSourceList(challenge.sourceIds).map((source, index) => <span key={source.id}>{index > 0 && " · "}<a href={source.url} target="_blank" rel="noreferrer">{source.publisher}</a>: {source.supportedClaim}</span>)}</p></div></div>
    <button className="coding-secondary" onClick={requestHint} disabled={hintCount >= 6}><Lightbulb size={15} /> {hintCount ? "Next level of support" : "Ask for a first hint"}</button>
  </section>;
}
