"use client";

import { useState } from "react";
import { Play, ShieldCheck, TestTube2 } from "lucide-react";
import type { CodingChallenge } from "@/lib/coding-developer";
import type { WorkbenchFile } from "@/lib/coding-workbench";

type ExecutionResponse = {
  status: "completed" | "rejected" | "unavailable";
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number | null;
  message: string;
};

export function CodingExecutionPanel({ challenge, files }: { challenge: CodingChallenge; files: WorkbenchFile[] }) {
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [running, setRunning] = useState(false);
  const requestRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const response = await fetch("/api/coding/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exerciseId: challenge.id,
          language: "python",
          command: "python -m pytest -q",
          files: files.filter((file) => file.path.endsWith(".py")).map(({ path, content }) => ({ path, content })),
        }),
      });
      const body = await response.json().catch(() => null) as ExecutionResponse | { error?: string } | null;
      if (body && "status" in body) setResult(body);
      else setResult({ status: "unavailable", stdout: "", stderr: "", exitCode: null, durationMs: null, message: body && "error" in body && body.error ? body.error : "The isolated runner did not return a usable result. No code was run in the web application." });
    } catch {
      setResult({ status: "unavailable", stdout: "", stderr: "", exitCode: null, durationMs: null, message: "The isolated runner could not be reached. Keep the local project unchanged and retry later; no code was run in the browser or web server." });
    } finally {
      setRunning(false);
    }
  };
  return <section className="execution-panel" aria-label="Isolated code execution">
    <header><div><span><ShieldCheck size={15} /> Isolated-runner boundary</span><p>Only a separately configured, network-denied runner may execute this fictional exercise. The web application never runs learner code.</p></div><button className="coding-secondary" onClick={requestRun} disabled={running}>{running ? "Requesting…" : <><Play size={15} /> Run visible tests</>}</button></header>
    <div className="execution-panel-meta"><span><TestTube2 size={14} /> Visible tests inspect exercise structure. A configured runner may apply hidden checks by exercise ID without exposing them here.</span></div>
    {result && <section className={`execution-result ${result.status}`} aria-live="polite"><header><b>{result.status === "completed" ? "Isolated run returned" : result.status === "rejected" ? "Run rejected safely" : "Runner unavailable"}</b><span>{result.durationMs !== null ? `${result.durationMs}ms · exit ${result.exitCode ?? "—"}` : "No execution evidence"}</span></header><p>{result.message}</p>{(result.stdout || result.stderr) && <pre>{result.stdout}{result.stderr ? `\n${result.stderr}` : ""}</pre>}</section>}
  </section>;
}
