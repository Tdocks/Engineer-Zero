"use client";

import { useMemo, useState } from "react";
import { CornerDownLeft, Eye, Flag, History, MapPin, RotateCcw, TerminalSquare } from "lucide-react";
import { codingTerminalStatus, initialCodingTerminalSession, runCodingTerminalCommand, type CodingTerminalSession } from "@/lib/coding-terminal";

export function CodingTerminalSimulator({ session, onChange }: { session?: CodingTerminalSession; onChange: (next: CodingTerminalSession) => void }) {
  const current = session ?? initialCodingTerminalSession();
  const [input, setInput] = useState("");
  const status = useMemo(() => codingTerminalStatus(current), [current]);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onChange(runCodingTerminalCommand(current, input));
    setInput("");
  };
  const replay = (index: number) => {
    let next = initialCodingTerminalSession();
    for (const command of current.history.slice(0, index + 1)) next = runCodingTerminalCommand(next, command);
    onChange(next);
  };
  return (
    <section className="terminal-simulator" aria-label="Safe terminal simulator">
      <header className="terminal-title">
        <div>
          <TerminalSquare size={16} aria-hidden="true" />
          <div>
            <b>Safe terminal simulator</b>
            <small>Fictional exercise · nothing on your computer changes</small>
          </div>
        </div>
        <div className="terminal-mode">
          <label>
            Practice mode
            <select
              value={current.mode}
              onChange={(event) => onChange({ ...current, mode: event.target.value as CodingTerminalSession["mode"] })}
            >
              <option value="guided">Guided</option>
              <option value="unguided">Unguided</option>
            </select>
          </label>
          <button type="button" className="coding-secondary" onClick={() => onChange(initialCodingTerminalSession())}>
            <RotateCcw size={14} aria-hidden="true" /> Reset
          </button>
        </div>
      </header>
      <div className="terminal-workspace">
        <div className="terminal-screen">
          <div className="terminal-screen-label">
            <span>Console output</span>
            <span>Read-only history</span>
          </div>
          <pre aria-live="polite">
            {current.transcript.map((entry, index) => (
              <span className={entry.kind} key={`${entry.command}-${index}`}>
                {entry.command ? `${current.cwd} $ ${entry.command}\n` : ""}
                {entry.output}
                {"\n"}
              </span>
            ))}
          </pre>
          <form className="terminal-input" onSubmit={submit}>
            <div className="terminal-input-label">
              <span>Type your command here</span>
              <kbd>Enter</kbd>
            </div>
            <div className="terminal-input-row">
              <span className="terminal-prompt">{current.cwd} $</span>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                aria-label="Terminal command"
                placeholder={current.mode === "guided" ? "Try pwd" : "Enter a command"}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button type="submit" aria-label="Run safe terminal command">
                <CornerDownLeft size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
        <aside className="terminal-guide">
          <section>
            <span>
              <MapPin size={14} aria-hidden="true" /> Path map
            </span>
            <b>/home/learner{status.projectCreated ? "/ai_prototype" : ""}</b>
            <p>
              Current: <code>{status.path}</code>
            </p>
          </section>
          <section>
            <span>
              <Flag size={14} aria-hidden="true" /> Challenge status
            </span>
            <ul>
              <li className={status.projectCreated ? "done" : ""}>
                {status.projectCreated ? "✓" : "○"} Create <code>ai_prototype</code>
              </li>
              <li className={status.mainCreated ? "done" : ""}>
                {status.mainCreated ? "✓" : "○"} Create <code>main.py</code> inside it
              </li>
              <li className={status.recoveredFromWrongFolder ? "done" : ""}>
                {status.recoveredFromWrongFolder ? "✓" : "○"} Recover after one safe mistake
              </li>
            </ul>
          </section>
          {current.mode === "guided" && (
            <section>
              <span>
                <Eye size={14} aria-hidden="true" /> Guided cue
              </span>
              <p>
                Create the folder, enter it, and create the file. You may safely make a wrong-folder mistake first, then use{" "}
                <code>pwd</code> and <code>cd</code> to recover.
              </p>
              <small>Available: pwd, ls, cd, mkdir, touch, cp, mv, rm, clear, history, ^C</small>
            </section>
          )}
          <section>
            <span>
              <History size={14} aria-hidden="true" /> Replay
            </span>
            {current.history.length ? (
              <ol>
                {current.history.slice(-5).map((command, index) => (
                  <li key={`${command}-${index}`}>
                    <button type="button" onClick={() => replay(Math.max(0, current.history.length - 5 + index))}>
                      {command}
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No commands to replay yet.</p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
