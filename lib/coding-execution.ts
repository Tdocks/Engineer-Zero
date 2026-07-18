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

export type SandboxPolicy = {
  network: "denied";
  readOnlyBaseImage: true;
  maxCpuMs: number;
  maxMemoryMb: number;
  maxOutputBytes: number;
  maxWorkspaceBytes: number;
};

export type ExecutionProvider = {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  policy: SandboxPolicy | null;
  name: string;
};

export type SandboxConfiguration = {
  endpoint: string;
  token: string;
  approved: true;
};

const maxFiles = 12;
const maxFileBytes = 30_000;
const maxSourceBytes = 100_000;
const safePath = /^[a-zA-Z0-9_./-]+\.py$/;

/**
 * Enabling a remote runner is a security decision, not a convenience flag.
 * The explicit approval marker prevents a copied endpoint/token pair from
 * silently changing the product from its safe, local-project handoff mode.
 */
export function sandboxConfiguration(
  environment = process.env,
): SandboxConfiguration | null {
  const endpoint = environment.CODING_SANDBOX_ENDPOINT?.trim();
  const token = environment.CODING_SANDBOX_TOKEN?.trim();
  if (!endpoint || !token || environment.CODING_SANDBOX_APPROVED !== "true") {
    return null;
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
      return null;
    }
  } catch {
    return null;
  }

  return { endpoint, token, approved: true };
}

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
  name = "unconfigured";
  policy = null;
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

type RemoteSandboxResponse = Pick<ExecutionResult, "stdout" | "stderr" | "exitCode" | "durationMs"> & { status: "completed" | "rejected" };

/**
 * A narrow adapter for a separately operated sandbox service. The caller must
 * configure an endpoint that enforces this policy; it is never an endpoint in
 * the Next process and it never receives learner secrets. This keeps a future
 * E2B/firecracker/Kubernetes runner replaceable without teaching an unsafe
 * in-process execution pattern.
 */
export class RemoteSandboxExecutionProvider implements ExecutionProvider {
  name = "remote-isolated-sandbox";
  policy: SandboxPolicy = { network: "denied", readOnlyBaseImage: true, maxCpuMs: 10_000, maxMemoryMb: 256, maxOutputBytes: 32_000, maxWorkspaceBytes: maxSourceBytes };
  constructor(private endpoint: string, private token: string) {}

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const invalid = validateExecutionRequest(request);
    if (invalid) return { status: "rejected", stdout: "", stderr: "", exitCode: null, durationMs: null, message: invalid };
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.token}` },
        body: JSON.stringify({ request, policy: this.policy }),
        signal: AbortSignal.timeout(this.policy.maxCpuMs + 2_000),
      });
      const body = (await response.json().catch(() => null)) as RemoteSandboxResponse | null;
      const validDuration = body?.durationMs === null ||
        (typeof body?.durationMs === "number" && body.durationMs >= 0 && body.durationMs <= this.policy.maxCpuMs);
      if (!response.ok || !body || !["completed", "rejected"].includes(body.status) || typeof body.stdout !== "string" || typeof body.stderr !== "string" || (body.exitCode !== null && typeof body.exitCode !== "number") || !validDuration) {
        return { status: "unavailable", stdout: "", stderr: "", exitCode: null, durationMs: null, message: "The isolated sandbox did not return a valid bounded execution result. No learner code was run by the web application." };
      }
      const stdout = body.stdout.slice(0, this.policy.maxOutputBytes);
      const stderr = body.stderr.slice(0, this.policy.maxOutputBytes);
      return { status: body.status, stdout, stderr, exitCode: body.exitCode, durationMs: body.durationMs, message: body.status === "completed" ? "Completed in an isolated, network-denied workspace." : "The sandbox rejected this bounded exercise request." };
    } catch {
      return { status: "unavailable", stdout: "", stderr: "", exitCode: null, durationMs: null, message: "The isolated sandbox is unavailable. Keep the local project unchanged and retry later; no code ran in the web application." };
    }
  }
}

export function createCodingExecutionProvider(environment = process.env): ExecutionProvider {
  const configuration = sandboxConfiguration(environment);
  return configuration
    ? new RemoteSandboxExecutionProvider(configuration.endpoint, configuration.token)
    : new UnconfiguredExecutionProvider();
}

export const codingExecutionProvider = createCodingExecutionProvider();
