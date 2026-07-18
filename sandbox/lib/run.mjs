import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import {
  MAX_CPU_MS,
  MAX_MEMORY_MB,
  MAX_OUTPUT_BYTES,
  truncateOutput,
} from "./validate.mjs";

const IMAGE = process.env.SANDBOX_PYTHON_IMAGE || "engineer-zero-sandbox-python:local";

function runProcess(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    const started = Date.now();
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, options.timeoutMs ?? MAX_CPU_MS + 2_000);

    child.stdout.on("data", (chunk) => {
      if (stdout.length < MAX_OUTPUT_BYTES * 2) stdout = Buffer.concat([stdout, chunk]);
    });
    child.stderr.on("data", (chunk) => {
      if (stderr.length < MAX_OUTPUT_BYTES * 2) stderr = Buffer.concat([stderr, chunk]);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        exitCode: 1,
        stdout: "",
        stderr: error.message,
        durationMs: Date.now() - started,
        timedOut: false,
        spawnError: true,
      });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({
        exitCode: code,
        stdout: stdout.toString("utf8"),
        stderr: stderr.toString("utf8"),
        durationMs: Date.now() - started,
        timedOut: signal === "SIGKILL",
        spawnError: false,
      });
    });
  });
}

async function writeWorkspace(files) {
  const root = await mkdtemp(join(tmpdir(), "e0-sandbox-"));
  for (const file of files) {
    const target = join(root, file.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.content, "utf8");
  }
  return root;
}

/**
 * Execute a validated request inside an ephemeral, network-denied Docker container.
 */
export async function executeInDocker(request) {
  let workspace = null;
  const started = Date.now();
  try {
    workspace = await writeWorkspace(request.files);
    const commandParts = request.command.split(" ");
    const args = [
      "run",
      "--rm",
      "--network", "none",
      "--read-only",
      "--tmpfs", "/tmp:rw,noexec,nosuid,size=16m",
      "--mount", `type=bind,source=${workspace},target=/workspace`,
      "--workdir", "/workspace",
      "--user", "10001:10001",
      "--memory", `${MAX_MEMORY_MB}m`,
      "--memory-swap", `${MAX_MEMORY_MB}m`,
      "--cpus", "1",
      "--pids-limit", "64",
      "--cap-drop", "ALL",
      "--security-opt", "no-new-privileges",
      IMAGE,
      ...commandParts,
    ];

    const result = await runProcess("docker", args, { timeoutMs: MAX_CPU_MS + 1_500 });
    const durationMs = Math.min(result.durationMs, MAX_CPU_MS);
    if (result.spawnError) {
      return {
        status: "unavailable",
        stdout: "",
        stderr: "",
        exitCode: null,
        durationMs: Date.now() - started,
        message: "Docker could not start the isolated runner. Is Docker Desktop running and is the python image built?",
      };
    }
    if (result.timedOut) {
      return {
        status: "completed",
        stdout: truncateOutput(result.stdout),
        stderr: truncateOutput(`${result.stderr}\nExecution timed out after ${MAX_CPU_MS}ms.`),
        exitCode: 124,
        durationMs: MAX_CPU_MS,
        message: "Completed in an isolated, network-denied workspace (timed out and killed).",
      };
    }
    return {
      status: "completed",
      stdout: truncateOutput(result.stdout, MAX_OUTPUT_BYTES),
      stderr: truncateOutput(result.stderr, MAX_OUTPUT_BYTES),
      exitCode: result.exitCode,
      durationMs,
      message: "Completed in an isolated, network-denied workspace.",
    };
  } catch (error) {
    return {
      status: "unavailable",
      stdout: "",
      stderr: "",
      exitCode: null,
      durationMs: Date.now() - started,
      message: error instanceof Error ? error.message : "Sandbox execution failed.",
    };
  } finally {
    if (workspace) await rm(workspace, { recursive: true, force: true }).catch(() => undefined);
  }
}
