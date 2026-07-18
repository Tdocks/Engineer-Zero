"use client";

import { useState } from "react";
import { Check, EyeOff } from "lucide-react";
import type { CodingLesson, CodingProgramProgress } from "@/lib/coding-developer";

type ReviewEvent = CodingProgramProgress["reviewSchedule"][number];

export function CodingRecallPractice({ lesson, review, initialResponse, onComplete }: {
  lesson: CodingLesson;
  review: ReviewEvent;
  initialResponse?: string;
  onComplete: (response: string) => void;
}) {
  const [response, setResponse] = useState(initialResponse ?? "");
  const [revealed, setRevealed] = useState(Boolean(initialResponse));
  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0;
  const canRecord = wordCount >= 35;
  return <section className="coding-recall">
    <header><p className="coding-kicker">SPACED RECALL · {review.interval.replace("-", " ")}</p><h2>Recall the idea before reopening the lesson.</h2><p>Write from memory first. Then compare your explanation with the worked example and record one correction. This is deliberate practice, not a graded implementation claim.</p></header>
    <article>
      <span>Recall prompt</span>
      <h3>{lesson.practicePrompt}</h3>
      <label>Your explanation and one verification step
        <textarea value={response} onChange={(event) => setResponse(event.target.value)} placeholder="State the concept, apply it to the fictional scenario, and name how you would verify it before checking the lesson…" aria-label={`Recall response for ${lesson.title}`} />
      </label>
      <small>{wordCount}/35 words · Use your own explanation, then check your reasoning.</small>
      {!revealed ? <button className="coding-secondary" onClick={() => setRevealed(true)}><EyeOff size={15} /> Reveal worked example after attempting</button> : <section className="coding-recall-feedback"><span>Compare and correct</span><pre>{lesson.workedExample}</pre><p><b>Defense check:</b> {lesson.defensePrompt}</p></section>}
      <button className="coding-primary" disabled={!canRecord || !revealed} onClick={() => onComplete(response)}>Record recall and return to map <Check size={16} /></button>
    </article>
  </section>;
}
