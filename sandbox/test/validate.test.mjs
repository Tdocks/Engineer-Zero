import assert from "node:assert/strict";
import { test } from "node:test";
import { truncateOutput, validateSandboxPayload } from "../lib/validate.mjs";

test("rejects absolute paths and parent traversal", () => {
  assert.equal(
    validateSandboxPayload({
      request: {
        language: "python",
        exerciseId: "coding-triage-cli",
        command: "python main.py",
        files: [{ path: "../evil.py", content: "print(1)" }],
      },
    }),
    "File paths must be relative Python files inside the temporary exercise workspace.",
  );
  assert.equal(
    validateSandboxPayload({
      request: {
        language: "python",
        exerciseId: "coding-triage-cli",
        command: "python main.py",
        files: [{ path: "/tmp/evil.py", content: "print(1)" }],
      },
    }),
    "File paths must be relative Python files inside the temporary exercise workspace.",
  );
});

test("rejects non-allowlisted commands", () => {
  assert.equal(
    validateSandboxPayload({
      request: {
        language: "python",
        exerciseId: "coding-triage-cli",
        command: "python -c 'import os; os.system(\"id\")'",
        files: [{ path: "main.py", content: "print(1)" }],
      },
    }),
    "Only the documented exercise commands are permitted.",
  );
});

test("accepts a bounded pytest request", () => {
  assert.equal(
    validateSandboxPayload({
      request: {
        language: "python",
        exerciseId: "coding-triage-cli",
        command: "python -m pytest -q",
        files: [
          { path: "main.py", content: "def evaluate_reading(temperature: float) -> str:\n    return \"URGENT\" if temperature >= 90 else \"NORMAL\"\n" },
          { path: "test_main.py", content: "from main import evaluate_reading\n\ndef test_hot():\n    assert evaluate_reading(90) == \"URGENT\"\n" },
        ],
      },
    }),
    null,
  );
});

test("truncates oversized stdout", () => {
  const large = "x".repeat(40_000);
  const truncated = truncateOutput(large, 100);
  assert.ok(truncated.length < large.length);
  assert.ok(truncated.includes("…[truncated]"));
});
