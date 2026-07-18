import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { executeInDocker } from "../lib/run.mjs";

const dockerAvailable = spawnSync("docker", ["info"], { encoding: "utf8" }).status === 0;
const image = process.env.SANDBOX_PYTHON_IMAGE || "engineer-zero-sandbox-python:local";
const imagePresent = dockerAvailable
  && spawnSync("docker", ["image", "inspect", image], { encoding: "utf8" }).status === 0;

test("docker runner executes pytest in a network-denied workspace", { skip: !imagePresent }, async () => {
  const result = await executeInDocker({
    language: "python",
    exerciseId: "coding-triage-cli",
    command: "python -m pytest -q",
    files: [
      {
        path: "main.py",
        content: "def evaluate_reading(temperature: float) -> str:\n    return \"URGENT\" if temperature >= 90 else \"NORMAL\"\n",
      },
      {
        path: "test_main.py",
        content: "from main import evaluate_reading\n\ndef test_boundary():\n    assert evaluate_reading(90) == \"URGENT\"\n",
      },
    ],
  });
  assert.equal(result.status, "completed");
  assert.equal(result.exitCode, 0);
  assert.ok((result.durationMs ?? 0) <= 10_000);
});

test("docker runner denies outbound network", { skip: !imagePresent }, async () => {
  const result = await executeInDocker({
    language: "python",
    exerciseId: "coding-network-denied",
    command: "python main.py",
    files: [
      {
        path: "main.py",
        content: "import urllib.request\ntry:\n    urllib.request.urlopen('https://example.com', timeout=2)\n    print('REACHED')\nexcept Exception as exc:\n    print(type(exc).__name__)\n",
      },
    ],
  });
  assert.equal(result.status, "completed");
  assert.ok(!result.stdout.includes("REACHED"));
});
