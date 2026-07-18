"use client";

import { useMemo, useState } from "react";
import { Check, FileCode2, FileText, FolderTree, RotateCcw, Save, SearchCheck } from "lucide-react";
import type { CodingChallenge } from "@/lib/coding-developer";
import { starterWorkbenchFiles, visibleCheckStatus, type WorkbenchFile } from "@/lib/coding-workbench";

export function CodingFileWorkbench({ challenge, onCodeChange, onSnapshot }: { challenge: CodingChallenge; onCodeChange: (combinedSource: string) => void; onSnapshot: (summary: string) => void }) {
  const [files, setFiles] = useState(() => starterWorkbenchFiles(challenge));
  const [selectedPath, setSelectedPath] = useState(() => starterWorkbenchFiles(challenge)[0].path);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [showChecks, setShowChecks] = useState(false);
  const selected = files.find((file) => file.path === selectedPath) ?? files[0];
  const checks = useMemo(() => visibleCheckStatus(challenge, files), [challenge, files]);
  const updateFile = (content: string) => {
    const next = files.map((file) => file.path === selected.path ? { ...file, content } : file);
    setFiles(next);
    onCodeChange(next.filter((file) => file.role === "source").map((file) => file.content).join("\n"));
  };
  const reset = () => { const next = starterWorkbenchFiles(challenge); setFiles(next); setSelectedPath(next[0].path); setShowChecks(false); onCodeChange(next[0].content); };
  const snapshot = () => { const count = snapshotCount + 1; setSnapshotCount(count); onSnapshot(`Snapshot ${count}: ${checks.passed.length}/${challenge.requiredSignals.length} visible design checks present in ${challenge.title}.`); };
  return <section className="coding-file-workbench" aria-label="Code lab workbench">
    <header><div><span><FolderTree size={15} /> Fictional local workspace</span><small>Browser preparation only · execution evidence comes from the isolated runner or the supplied local project.</small></div><div><button className="coding-secondary" onClick={snapshot}><Save size={15} /> Save snapshot {snapshotCount ? `(${snapshotCount})` : ""}</button><button className="coding-secondary" onClick={reset}><RotateCcw size={15} /> Reset files</button></div></header>
    <div className="workbench-body"><aside><span>Project files</span>{files.map((file) => <button key={file.path} className={selected.path === file.path ? "active" : ""} onClick={() => setSelectedPath(file.path)}>{file.role === "source" ? <FileCode2 size={15} /> : <FileText size={15} />} {file.path}</button>)}</aside><div><header><span><FileCode2 size={15} /> {selected.path}</span><small>{selected.editable ? "Editable source" : selected.role === "test" ? "Visible learning checks" : "Project note"}</small></header>{selected.editable ? <textarea value={selected.content} onChange={(event) => updateFile(event.target.value)} spellCheck={false} aria-label={`${selected.path} editor`} /> : <pre>{selected.content}</pre>}<footer><span>{selected.editable ? "Draft changes stay in this local study session." : "Read-only supporting material."}</span><button className="coding-secondary" onClick={() => setShowChecks((value) => !value)}><SearchCheck size={15} /> {showChecks ? "Hide" : "Preview"} visible checks</button></footer></div></div>
    {showChecks && <section className="workbench-checks"><header><b>Visible structural checks</b><span>{checks.passed.length}/{challenge.requiredSignals.length} detected</span></header><ul>{challenge.requiredSignals.map((signal) => <li key={signal} className={checks.passed.includes(signal) ? "pass" : ""}>{checks.passed.includes(signal) ? <Check size={14} /> : <span />} {signal}</li>)}</ul><p>These checks confirm only visible exercise structure. Run the local project’s tests or an approved isolated runner before treating behavior as verified.</p></section>}
  </section>;
}
