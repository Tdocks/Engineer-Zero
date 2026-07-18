import "server-only";

/**
 * Contract for a future isolated code-execution service. The Next.js process
 * never executes learner input. A provider must run in an ephemeral, network-
 * denied sandbox with a read-only base image and explicit resource limits.
 */
export type ExecutionRequest = {
  language: "python";
  files: Array<{ path: string; content: string }>;
  command: string;
  exerciseId: string;
};

export type ExecutionResult = {
  status: "completed" | "rejected" | "unavailable";
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number | null;
  message: string;
};

export type ExecutionProvider = {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
};

const maxFiles = 12;
const maxFileBytes = 30_000;
const maxSourceBytes = 100_000;
const safePath = /^[a-zA-Z0-9_./-]+\.py$/;

export function validateExecutionRequest(request: ExecutionRequest): string | null {
  if (request.language !== "python") return "Only the Python learning runtime is planned for this exercise.";
  if (!request.exerciseId || request.exerciseId.length > 120) return "A known exercise ID is required.";
  if (!request.files.length || request.files.length > maxFiles) return `Submit between one and ${maxFiles} Python files.`;
  if (request.command !== "python -m pytest -q" && request.command !== "python main.py") return "Only the documented exercise commands are permitted.";
  let total = 0;
  for (const file of request.files) {
    if (!safePath.test(file.path) || file.path.includes("..") || file.path.startsWith("/")) return "File paths must be relative Python files inside the temporary exercise workspace.";
    const bytes = new TextEncoder().encode(file.content).length;
    if (bytes > maxFileBytes) return "An exercise file exceeds the permitted size.";
    total += bytes;
  }
  return total > maxSourceBytes ? "The submitted source exceeds the permitted exercise size." : null;
}

export class UnconfiguredExecutionProvider implements ExecutionProvider {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const invalid = validateExecutionRequest(request);
    if (invalid) return { status: "rejected", stdout: "", stderr: "", exitCode: null, durationMs: null, message: invalid };
    return {
      status: "unavailable",
      stdout: "",
      stderr: "",
      exitCode: null,
      durationMs: null,
      message: "Live code execution is intentionally unavailable until an isolated sandbox provider is configured. Use the local starter repository and its documented test command; learner code is never run inside the web application server.",
    };
  }
}

export const codingExecutionProvider: ExecutionProvider = new UnconfiguredExecutionProvider();
