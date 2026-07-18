# Coding Developer sandbox-provider contract

The main Engineer Zero application must never execute learner code. A sandbox is optional and remains disabled unless approval + endpoint + token are configured.

## Personal local mode

For solo practice, set:

- `CODING_SANDBOX_PERSONAL=true`
- `CODING_SANDBOX_APPROVED=true`
- `CODING_SANDBOX_ENDPOINT=http://127.0.0.1:8787/run` (loopback HTTP only)
- `CODING_SANDBOX_TOKEN=…`

The in-repo runner lives under [`sandbox/`](../sandbox/). Loopback HTTP is rejected unless `CODING_SANDBOX_PERSONAL=true`. Non-loopback hosts still require HTTPS.

Personal runs are local practice evidence only—not commercial credentials. Human credential review is Coming soon.

## Hosted mode

Without personal mode, all three values are required and the endpoint must be HTTPS:

- `CODING_SANDBOX_APPROVED=true`
- `CODING_SANDBOX_ENDPOINT` — an HTTPS endpoint without credentials, a query string, or a fragment
- `CODING_SANDBOX_TOKEN` — a server-only credential

The approval marker is deliberately separate from the endpoint and token. It prevents an accidental configuration change from activating arbitrary code execution before the provider has completed security review.

## Required isolation controls

The separately operated provider must enforce all of these controls, rather than merely accepting them from the application:

- Temporary workspace per request; delete it after completion.
- Read-only base image and non-root process.
- No outbound network, host mounts, Docker socket, privileged access, or sibling-container visibility **inside the learner container**.
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

Record these launch artifacts outside this repository before setting `CODING_SANDBOX_APPROVED=true`:

1. Provider name, image digest, deployment region, and approval date.
2. Evidence that outbound network, host mounts, Docker socket access, privilege escalation, and sibling-container visibility are denied.
3. A test that an infinite loop is terminated, a memory limit is enforced, and oversized stdout/stderr is truncated.
4. A test proving the provider rejects paths outside the temporary workspace and commands outside the documented allowlist.
5. An audit sample showing request metadata and result metadata without source code, learner secrets, or provider credentials.
6. Named security and engineering reviewers, plus a planned re-review date after any runner-image or provider change.

If a provider returns malformed data, claims a duration beyond the declared limit, or cannot be reached, Engineer Zero treats the attempt as unavailable. It must not show a passing run, award runtime evidence, or modify the learner's project.
