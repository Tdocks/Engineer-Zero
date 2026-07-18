"use client";

import { useState } from "react";
import { Check, ChevronRight, Lightbulb, RotateCcw, ShieldAlert } from "lucide-react";
import { codingBossBattles, reviewBossBattle } from "@/lib/coding-boss-battles";

export function CodingBossBattles({ attempts, onComplete }: { attempts: Record<string, { score: number; response: string; hintCount: number; status: "needs-retry" | "reviewed" }>; onComplete: (id: string, result: { score: number; response: string; hintCount: number; status: "needs-retry" | "reviewed" }) => void }) {
  const [selectedId, setSelectedId] = useState(codingBossBattles[0].id);
  const [response, setResponse] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<ReturnType<typeof reviewBossBattle> | null>(null);
  const battle = codingBossBattles.find((item) => item.id === selectedId) ?? codingBossBattles[0];
  const choose = (id: string) => { setSelectedId(id); setResponse(attempts[id]?.response ?? ""); setHintCount(attempts[id]?.hintCount ?? 0); setShowHint(false); setFeedback(null); };
  const submit = () => { const result = reviewBossBattle(battle, response, hintCount); setFeedback(result); onComplete(battle.id, { ...result, response, hintCount }); };
  return <section className="coding-boss-battles">
    <header><p className="coding-kicker">BOSS BATTLES</p><h2>Recover under pressure—without answer dumping.</h2><p>Each challenge uses fictional evidence. A failed first attempt unlocks one narrow hint, a smaller recovery drill, and a delayed recall prompt.</p></header>
    <div className="boss-layout"><aside>{codingBossBattles.map((item) => <button key={item.id} className={item.id === battle.id ? "active" : ""} onClick={() => choose(item.id)}><span>{item.phase}</span><b>{item.title}</b>{attempts[item.id]?.status === "reviewed" && <Check size={15} />}</button>)}</aside><article><p className="coding-kicker">{battle.phase} / evidence-led decision</p><h3>{battle.title}</h3><p>{battle.scenario}</p><pre>{battle.evidence}</pre><section><h4>Your task</h4><p>{battle.task}</p></section>{showHint && <aside className="boss-hint"><Lightbulb size={16} /><p>{battle.targetedHint}</p></aside>}<textarea value={response} onChange={(event) => setResponse(event.target.value)} placeholder="State your observed evidence, decisions, verification, and next safe step…" aria-label={`${battle.title} response`} />{!showHint && <button className="coding-secondary" onClick={() => { setShowHint(true); setHintCount((count) => count + 1); }}><Lightbulb size={15} /> Use one targeted hint</button>}<button className="coding-primary" disabled={response.trim().split(/\s+/).length < 25} onClick={submit}>Submit evidence <ChevronRight size={16} /></button>{feedback && <section className={feedback.status === "reviewed" ? "boss-feedback reviewed" : "boss-feedback"}><b>{feedback.status === "reviewed" ? "Reviewable attempt" : "Recovery required"}</b><p>{feedback.feedback}</p><small><ShieldAlert size={14} /> Recovery drill: {battle.recoveryDrill}</small><small><RotateCcw size={14} /> Delayed recall: {battle.delayedRecall}</small></section>}</article></div>
  </section>;
}
