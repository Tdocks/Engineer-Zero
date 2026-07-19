"use client";

import { Check, FlaskConical } from "lucide-react";
import { codingSourceList, type CodingLesson } from "@/lib/coding-developer";

function paragraphs(text: string) {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function CodingLessonReader({
  lesson,
  completed,
  onComplete,
  onOpenBridge,
}: {
  lesson: CodingLesson;
  completed: boolean;
  onComplete: () => void;
  onOpenBridge?: (bridge: NonNullable<CodingLesson["bridgeToLab"]>) => void;
}) {
  const steps = (lesson.tryThisSteps ?? []).map((step) => step.trim()).filter(Boolean);

  return (
    <article className="coding-reader coding-reader-package">
      <p className="coding-kicker">
        DAY {lesson.day} · {lesson.mode} · ~{lesson.durationMinutes} min
      </p>
      <h2>{lesson.title}</h2>
      <p className="coding-objective">{lesson.objective}</p>

      <section className="coding-why">
        <span>Why this matters</span>
        <p>{lesson.whyItMatters}</p>
      </section>

      <section className="coding-teach">
        <h3>Teach</h3>
        {paragraphs(lesson.teach).map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </section>

      <section className="coding-worked">
        <span>Worked example</span>
        <pre>{lesson.workedExample}</pre>
      </section>

      <section className="coding-practice">
        <span>Try this</span>
        <p className="coding-practice-intro">{lesson.tryThis}</p>
        {steps.length > 0 ? (
          <ol className="coding-try-steps">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
        {lesson.tryThisStarter ? (
          <div className="coding-starter-block">
            <span>Starter</span>
            <pre className="coding-starter">{lesson.tryThisStarter}</pre>
          </div>
        ) : null}
        {lesson.expectedOutput ? (
          <div className="coding-expected">
            <span>Expected output / shape</span>
            <pre>{lesson.expectedOutput}</pre>
          </div>
        ) : null}
        {lesson.hint ? (
          <details className="coding-hint">
            <summary>Hint</summary>
            <p>{lesson.hint}</p>
          </details>
        ) : null}
      </section>

      <section className="coding-failures">
        <span>Common failures</span>
        <ul>
          {(lesson.commonFailures ?? []).map((item) => (
            <li key={item.failure}>
              <b>{item.failure}</b>
              <p>{item.recovery}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="coding-checks">
        <span>Check yourself</span>
        <ol>
          {(lesson.checkYourself ?? []).map((item) => (
            <li key={item.question}>
              <p>{item.question}</p>
              <details>
                <summary>Reveal answer</summary>
                <p>{item.answer}</p>
              </details>
            </li>
          ))}
        </ol>
      </section>

      {lesson.bridgeToLab ? (
        <section className="coding-bridge">
          <span>Bridge to lab</span>
          <p>{lesson.bridgeToLab.why}</p>
          <button
            type="button"
            className="coding-primary"
            onClick={() => onOpenBridge?.(lesson.bridgeToLab!)}
          >
            <FlaskConical size={16} aria-hidden="true" />
            {lesson.bridgeToLab.label}
          </button>
        </section>
      ) : null}

      <section className="coding-defense">
        <span>Defense prompt</span>
        <p>{lesson.defensePrompt}</p>
      </section>

      <section className="coding-sources">
        <h3>Source notes</h3>
        {codingSourceList(lesson.sourceIds).map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
            <b>
              {source.publisher} · {source.title}
            </b>
            <small>
              {source.version} · verified {source.lastVerified} · revalidate {source.revalidateBy}
              <br />
              Supports: {source.supportedClaim}
            </small>
          </a>
        ))}
      </section>

      <button type="button" className="coding-primary" onClick={onComplete}>
        {completed ? "Evidence recorded" : "Mark learning session complete"} <Check size={16} aria-hidden="true" />
      </button>
    </article>
  );
}
