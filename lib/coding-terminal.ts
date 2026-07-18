export type TerminalEntry = "file" | "directory";

export type CodingTerminalSession = {
  cwd: string;
  entries: Record<string, TerminalEntry>;
  history: string[];
  transcript: Array<{ command: string; output: string; kind: "success" | "error" | "system" }>;
  mode: "guided" | "unguided";
};

export const initialCodingTerminalSession = (): CodingTerminalSession => ({
  cwd: "/home/learner",
  entries: {
    "/": "directory",
    "/home": "directory",
    "/home/learner": "directory",
    "/home/learner/notes.txt": "file",
    "/home/learner/readme.md": "file",
  },
  history: [],
  transcript: [{ command: "", output: "Safe terminal simulator · no files on your computer are changed.", kind: "system" }],
  mode: "guided",
});

function normalizePath(cwd: string, input: string) {
  const pieces = (input.startsWith("/") ? input : `${cwd}/${input}`).split("/");
  const resolved: string[] = [];
  for (const piece of pieces) {
    if (!piece || piece === ".") continue;
    if (piece === "..") { resolved.pop(); continue; }
    resolved.push(piece);
  }
  return `/${resolved.join("/")}` || "/";
}

function parentPath(path: string) {
  const index = path.lastIndexOf("/");
  return index <= 0 ? "/" : path.slice(0, index);
}

function nameOf(path: string) {
  return path === "/" ? "/" : path.slice(path.lastIndexOf("/") + 1);
}

function directChildren(entries: Record<string, TerminalEntry>, cwd: string) {
  return Object.keys(entries)
    .filter((path) => path !== cwd && parentPath(path) === cwd)
    .sort((left, right) => left.localeCompare(right))
    .map((path) => `${nameOf(path)}${entries[path] === "directory" ? "/" : ""}`);
}

function append(session: CodingTerminalSession, command: string, output: string, kind: "success" | "error" | "system") {
  return { ...session, history: command ? [...session.history, command] : session.history, transcript: [...session.transcript, { command, output, kind }] };
}

function needArgument(command: string, args: string[], session: CodingTerminalSession) {
  return args.length ? null : append(session, command, `${command}: missing path operand`, "error");
}

/** Runs a deliberately tiny, non-host-backed shell language for instruction. */
export function runCodingTerminalCommand(session: CodingTerminalSession, raw: string): CodingTerminalSession {
  const command = raw.trim();
  if (!command) return session;
  if (command === "clear") return { ...session, history: [...session.history, command], transcript: [{ command: "", output: "Safe terminal simulator · no files on your computer are changed.", kind: "system" }] };
  if (command === "^C" || command.toLowerCase() === "ctrl+c") return append(session, command, "^C · simulated process interrupted safely", "system");
  if (command === "history") return append(session, command, session.history.map((entry, index) => `${index + 1}  ${entry}`).join("\n") || "No commands yet.", "success");

  const [operation, ...args] = command.split(/\s+/);
  if (operation === "pwd") return append(session, command, session.cwd, "success");
  if (operation === "ls") {
    const target = args[0] ? normalizePath(session.cwd, args[0]) : session.cwd;
    if (session.entries[target] !== "directory") return append(session, command, `ls: ${args[0] ?? target}: no such directory`, "error");
    return append(session, command, directChildren(session.entries, target).join("  ") || "(empty)", "success");
  }
  if (operation === "cd") {
    const missing = needArgument(operation, args, session);
    if (missing) return missing;
    const target = normalizePath(session.cwd, args[0]);
    if (session.entries[target] !== "directory") return append(session, command, `cd: ${args[0]}: no such directory`, "error");
    return append({ ...session, cwd: target }, command, `entered ${target}`, "success");
  }
  if (operation === "mkdir" || operation === "touch") {
    const missing = needArgument(operation, args, session);
    if (missing) return missing;
    const target = normalizePath(session.cwd, args[0]);
    if (session.entries[target]) return append(session, command, `${operation}: ${args[0]}: already exists`, "error");
    if (session.entries[parentPath(target)] !== "directory") return append(session, command, `${operation}: parent directory does not exist`, "error");
    const entries = { ...session.entries, [target]: operation === "mkdir" ? "directory" as const : "file" as const };
    return append({ ...session, entries }, command, `created ${operation === "mkdir" ? "directory" : "file"} ${target}`, "success");
  }
  if (operation === "cp" || operation === "mv") {
    if (args.length < 2) return append(session, command, `${operation}: source and destination are required`, "error");
    const source = normalizePath(session.cwd, args[0]);
    const requestedDestination = normalizePath(session.cwd, args[1]);
    if (!session.entries[source]) return append(session, command, `${operation}: ${args[0]}: no such file or directory`, "error");
    const destination = session.entries[requestedDestination] === "directory" ? `${requestedDestination}/${nameOf(source)}` : requestedDestination;
    if (session.entries[destination]) return append(session, command, `${operation}: ${args[1]}: destination already exists`, "error");
    if (session.entries[parentPath(destination)] !== "directory") return append(session, command, `${operation}: destination parent does not exist`, "error");
    if (session.entries[source] === "directory") return append(session, command, `${operation}: directory operations are intentionally outside this beginner exercise`, "error");
    const entries = { ...session.entries, [destination]: session.entries[source] };
    if (operation === "mv") delete entries[source];
    return append({ ...session, entries }, command, `${operation === "cp" ? "copied" : "moved"} ${nameOf(source)} to ${destination}`, "success");
  }
  if (operation === "rm") {
    const missing = needArgument(operation, args, session);
    if (missing) return missing;
    const target = normalizePath(session.cwd, args[0]);
    if (!session.entries[target]) return append(session, command, `rm: ${args[0]}: no such file`, "error");
    if (session.entries[target] === "directory") return append(session, command, "rm: directory removal is disabled in this safe exercise", "error");
    const entries = { ...session.entries };
    delete entries[target];
    return append({ ...session, entries }, command, `removed ${target}`, "success");
  }
  return append(session, command, `${operation}: command not recognized in this safe exercise. Try pwd, ls, cd, mkdir, touch, cp, mv, rm, clear, history, or ^C.`, "error");
}

export function codingTerminalStatus(session: CodingTerminalSession) {
  const project = "/home/learner/ai_prototype";
  const madeMistake = session.transcript.some((entry) => entry.command === "touch main.py" && entry.output.includes("/home/learner/main.py"));
  const repairedMistake = session.history.some((entry) => entry === "mv main.py ai_prototype/main.py" || entry === "mv ../main.py main.py" || entry === "mv /home/learner/main.py /home/learner/ai_prototype/main.py");
  return {
    projectCreated: session.entries[project] === "directory",
    mainCreated: session.entries[`${project}/main.py`] === "file",
    recoveredFromWrongFolder: madeMistake && repairedMistake && session.cwd === project,
    path: session.cwd,
  };
}
