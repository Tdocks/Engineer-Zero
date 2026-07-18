"use client";

import { useState } from "react";
import { Check, LockKeyhole } from "lucide-react";
import { codingContinuation } from "@/lib/coding-continuation";

export function CodingContinuation({ completedIds, onComplete }: { completedIds: string[]; onComplete: (id: string, reflection: string) => void }) {
  const [selectedId, setSelectedId] = useState(codingContinuation[0].id);
  const [reflection, setReflection] = useState("");
  const item = codingContinuation.find((module) => module.id === selectedId) ?? codingContinuation[0];
  const completed = completedIds.includes(item.id);
  const priorWeeksDone = codingContinuation.filter((module) => module.week < item.week).every((module) => completedIds.includes(module.id));
  return <section className="coding-continuation">
    <header><p className="coding-kicker">ONE-MONTH CONTINUATION</p><h2>Turn a four-day prototype into durable engineering practice.</h2><p>The sprint starts the work. This continuation adds persistence, retrieval, team workflow, and a final portfolio package without claiming that a course alone substitutes for professional experience.</p></header>
    <div className="continuation-layout"><aside>{codingContinuation.map((module) => <button key={module.id} className={module.id === item.id ? "active" : ""} onClick={() => { setSelectedId(module.id); setReflection(""); }}><span>Week {module.week}</span><b>{module.title}</b>{completedIds.includes(module.id) && <Check size={15} />}</button>)}</aside><article><p className="coding-kicker">WEEK {item.week}</p><h3>{item.title}</h3><p className="continuation-outcome">{item.outcome}</p><h4>Practice sequence</h4><ol>{item.activities.map((activity) => <li key={activity}>{activity}</li>)}</ol><section><span>Required artifact</span><p>{item.artifact}</p>{item.localProjectPath && <code>{item.localProjectPath}</code>}</section><section><span>Defense</span><p>{item.defense}</p></section>{!priorWeeksDone && <p className="coding-form-error"><LockKeyhole size={15} /> Complete the earlier continuation evidence first. The content remains visible so you can see the destination.</p>}<label>What did you build, verify, or revise? <textarea value={reflection} disabled={!priorWeeksDone || completed} onChange={(event) => setReflection(event.target.value)} placeholder="Name a concrete artifact, test or evidence, remaining limitation, and next step…" /></label><button className="coding-primary" disabled={!priorWeeksDone || completed || reflection.trim().split(/\s+/).length < 25} onClick={() => onComplete(item.id, reflection)}>{completed ? "Evidence recorded" : "Record continuation evidence"} <Check size={16} /></button></article></div>
  </section>;
}
