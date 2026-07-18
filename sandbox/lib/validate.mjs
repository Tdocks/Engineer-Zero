/**
 * Request validation for the Engineer Zero sandbox runner.
 * Isolation policy is enforced by the runner, never trusted from the client.
 */

export const ALLOWED_COMMANDS = new Set(["python main.py", "python -m pytest -q"]);
export const SAFE_PATH = /^[a-zA-Z0-9_./-]+\.py$/;
export const MAX_FILES = 12;
export const MAX_FILE_BYTES = 30_000;
export const MAX_SOURCE_BYTES = 100_000;
export const MAX_CPU_MS = 10_000;
export const MAX_MEMORY_MB = 256;
export const MAX_OUTPUT_BYTES = 32_000;

export function validateSandboxPayload(body) {
  if (!body || typeof body !== "object") return "Request body must be JSON.";
  const request = body.request;
  if (!request || typeof request !== "object") return "Missing execution request.";
  if (request.language !== "python") return "Only the Python learning runtime is supported.";
  if (!request.exerciseId || typeof request.exerciseId !== "string" || request.exerciseId.length > 120) {
    return "A known exercise ID is required.";
  }
  if (!ALLOWED_COMMANDS.has(request.command)) return "Only the documented exercise commands are permitted.";
  if (!Array.isArray(request.files) || request.files.length < 1 || request.files.length > MAX_FILES) {
    return `Submit between one and ${MAX_FILES} Python files.`;
  }
  let total = 0;
  for (const file of request.files) {
    if (!file || typeof file.path !== "string" || typeof file.content !== "string") {
      return "Each file must include a path and content string.";
    }
    if (!SAFE_PATH.test(file.path) || file.path.includes("..") || file.path.startsWith("/")) {
      return "File paths must be relative Python files inside the temporary exercise workspace.";
    }
    const bytes = Buffer.byteLength(file.content, "utf8");
    if (bytes > MAX_FILE_BYTES) return "An exercise file exceeds the permitted size.";
    total += bytes;
  }
  if (total > MAX_SOURCE_BYTES) return "The submitted source exceeds the permitted exercise size.";
  return null;
}

export function truncateOutput(text, maxBytes = MAX_OUTPUT_BYTES) {
  const buffer = Buffer.from(String(text ?? ""), "utf8");
  if (buffer.length <= maxBytes) return buffer.toString("utf8");
  return buffer.subarray(0, maxBytes).toString("utf8") + "\n…[truncated]";
}

export function auditSummary(request, result) {
  return {
    exerciseId: request.exerciseId,
    command: request.command,
    fileCount: request.files.length,
    fileBytes: request.files.map((file) => ({
      path: file.path,
      bytes: Buffer.byteLength(file.content, "utf8"),
    })),
    status: result.status,
    exitCode: result.exitCode,
    durationMs: result.durationMs,
    stdoutBytes: Buffer.byteLength(result.stdout ?? "", "utf8"),
    stderrBytes: Buffer.byteLength(result.stderr ?? "", "utf8"),
  };
}
