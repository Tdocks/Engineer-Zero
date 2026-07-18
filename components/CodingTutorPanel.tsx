"use client";

import { useState } from "react";
import { Lightbulb, MessageCircleQuestion } from "lucide-react";
import type { CodingChallenge } from "@/lib/coding-developer";
import { codingTutorResponse } from "@/lib/coding-tutor";

export function CodingTutorPanel({ challenge, code, onHint }: { challenge: CodingChallenge; code: string; onHint: (count: number) => void }) {
  const [hintCount, setHintCount] = useState(0);
  const response = hintCount ? codingTutorResponse(challenge, code, hintCount - 1) : null;
  const requestHint = () => { const next = Math.min(hintCount + 1, 6); setHintCount(next); onHint(next); };
  return <section className="coding-tutor-panel" aria-live="polite">
    <header><MessageCircleQuestion size={17} /><div><span>Guided tutor</span><b>Get the smallest useful hint.</b></div></header>
    <p>This deterministic tutor never runs or completes your code. It moves from prediction to a full pattern only after repeated requests.</p>
    {response && <aside><span>{response.stage}</span><h4>{response.title}</h4><p>{response.message}</p><small>{response.nextAction}</small></aside>}
    <button className="coding-secondary" onClick={requestHint} disabled={hintCount >= 6}><Lightbulb size={15} /> {hintCount ? "Next level of support" : "Ask for a first hint"}</button>
  </section>;
}
