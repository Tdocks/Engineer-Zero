# Coding Developer local projects

These projects are the local, runnable counterpart to the Engineer Zero Coding Developer program. They are intentionally small, use fictional data, and have no connection to real organizational systems.

| Day | Project | What it proves |
| --- | --- | --- |
| 1 | `equipment-triage-cli` | Python functions, structured data, validation, JSON output, and boundary tests. |
| 2 | `equipment-triage-api` | FastAPI request/response models, separated business logic, and API tests. |
| 3 | `ai-maintenance-report-triage` | Structured model extraction, deterministic policy, safe fallback, and human-review status. |
| 4 | `../human-approved-operations-triage` | Approval gates, idempotency, audit evidence, safe escalation, and prototype defense. |
| Continued AIO practice | `../permission-aware-knowledge-assistant` | Authorization before retrieval, cited evidence, abstention, and auditability. |

## Safety boundary

Run these projects only with the supplied fictional data. Do not point them at a real model endpoint, operational system, internal document set, or credential. A running starter project is learning evidence—not authorization to operate an enterprise system.

## Evidence checklist

For each project, save the test output, one deliberate failure and repair, a short architecture explanation, and an AI-assistance disclosure. The program’s Review Board uses those records to distinguish a learner who can explain a working prototype from someone who only pasted generated code.

## Run each project independently

Each folder is a separate learning repository with its own application package and tests. Change into a project folder before installing dependencies or running its test suite. Do not run every project’s tests from this parent directory: several intentionally use conventional names such as `app` and `test_service.py`, which Python would otherwise treat as one package during collection.
