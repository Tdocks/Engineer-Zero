import type { CodingChallenge } from "./coding-developer";

export type WorkbenchFile = { path: string; content: string; editable: boolean; role: "source" | "test" | "note" };

export function starterWorkbenchFiles(challenge: CodingChallenge): WorkbenchFile[] {
  const sourcePath = challenge.kind === "api" ? "app/main.py" : challenge.kind === "ai" ? "app/extraction.py" : "main.py";
  return [
    { path: sourcePath, content: challenge.starter, editable: true, role: "source" },
    { path: "tests/test_visible.py", content: `# Visible learning checks for ${challenge.title}\n# 1. Inspect the required contract.\n${challenge.requiredSignals.map((signal) => `# - includes ${signal}`).join("\n")}\n# 2. Run the supplied local project tests before claiming execution evidence.`, editable: false, role: "test" },
    { path: "README.md", content: `# ${challenge.title}\n\n${challenge.brief}\n\n## Local evidence\nRun the project in its own local folder, preserve one failure and repair, then explain the result in the Review Board.`, editable: false, role: "note" },
  ];
}

export function visibleCheckStatus(challenge: CodingChallenge, files: WorkbenchFile[]) {
  const source = files.filter((file) => file.role === "source").map((file) => file.content).join("\n").toLowerCase();
  const passed = challenge.requiredSignals.filter((signal) => source.includes(signal.toLowerCase()));
  return { passed, missing: challenge.requiredSignals.filter((signal) => !passed.includes(signal)) };
}
