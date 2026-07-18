# Coding Developer sandbox-provider contract

The main Engineer Zero application must never execute learner code. A sandbox is optional and remains disabled unless both `CODING_SANDBOX_ENDPOINT` and `CODING_SANDBOX_TOKEN` are configured.

## Required isolation controls

The separately operated provider must enforce all of these controls, rather than merely accepting them from the application:

- Temporary workspace per request; delete it after completion.
- Read-only base image and non-root process.
- No outbound network, host mounts, Docker socket, privileged access, or sibling-container visibility.
- Maximum 10 seconds CPU/wall execution, 256 MB memory, and 32 KB each of stdout/stderr.
- A dependency allowlist for introductory Python work.
- Process-tree termination after timeout and audit events that exclude source-code contents and credentials.

## Request shape

The application sends only a bounded `ExecutionRequest` plus a policy declaration:

```json
{
  "request": {
    "language": "python",
    "exerciseId": "coding-triage-cli",
    "command": "python -m pytest -q",
    "files": [{ "path": "main.py", "content": "…" }]
  },
  "policy": {
    "network": "denied",
    "readOnlyBaseImage": true,
    "maxCpuMs": 10000,
    "maxMemoryMb": 256,
    "maxOutputBytes": 32000,
    "maxWorkspaceBytes": 100000
  }
}
```

It accepts only a JSON result with `status`, `stdout`, `stderr`, `exitCode`, and `durationMs`. A malformed, slow, or unavailable response is presented as a safe unavailable state. The course must not claim execution evidence if the provider does not return a bounded result.

## Launch verification

Before enabling the variables, security review must confirm the isolation controls with a controlled breakout test, timeout test, output-limit test, denied-network test, and audit-event inspection. This document is an interface contract, not evidence that a provider meets it.
