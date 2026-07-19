# Coding Developer Program Checkpoint — 2026-07-17

## Architecture decision

Coding Developer is a reusable program, not a third career track. Applied AI Operations Engineer imports selected verified fundamentals; IT Support imports selected terminal, scripting, and Git foundations. The two existing career tracks and their learner evidence remain intact.

## Implemented foundation

- Dedicated route: `/programs/coding-developer`.
- Four-day Mission Map with 24 authored lesson packages (teach / worked example / try-this / failures / checks / lab bridge; ~25–40 min each) and a realistic focused-hour daily cadence.
- Six practice challenges: terminal navigation, deterministic Python triage, FastAPI API design, test repair, structured AI extraction, and capstone defense.
- Source registry with canonical URLs, versions, claim mappings, and verification date. It includes technical sources and two instructional-method sources.
- Lesson reader, safe in-browser terminal simulator, browser-only structural review, comprehension prompts, self-attested local-run/test records, and an engineering Review Board.
- Local progress persists through the shared learner-state model without requiring career-track onboarding.
- Day 1, 2, and 3 local starter projects plus Day 4 and continued AIO prototypes under `prototypes/`.

## Local project progression

| Day | Project | Evidence expected |
| --- | --- | --- |
| 1 | `prototypes/coding-developer/equipment-triage-cli` | Deterministic rules, validation, JSON output, unit tests, and a repaired threshold defect. |
| 2 | `prototypes/coding-developer/equipment-triage-api` | Typed FastAPI route, separated service logic, request validation, and API tests. |
| 3 | `prototypes/coding-developer/ai-maintenance-report-triage` | Structured extraction, optional local-only hosted-model adapter, deterministic policy, safe degraded mode, and evaluation cases. |
| 4 | `prototypes/human-approved-operations-triage` | Approval boundary, idempotency, audit trail, escalation, and oral project defense. |

## Verified at this checkpoint

- Day 1 CLI: 4 unit tests passed with Python 3.14.5.
- Day 2 FastAPI starter: 4 tests passed in a clean, temporary virtual environment.
- Day 3 AI starter: 3 tests passed in the same isolated environment; the installed OpenAI SDK exposes the structured-output adapter surface. No credential or live model request was used.
- Web app: lint has one pre-existing ESLint configuration warning; `npm test` passes 18 tests; `npm run build` passes.

## Explicitly not complete

- Browser review is a transparent structural/comprehension record, not proof of code execution or independent competence.
- Arbitrary learner code is not executed in the web application. A future sandbox must be isolated, ephemeral, resource-limited, and network-denied by default.
- Local progress is browser-owned in the current personal-pilot model. Commercial readiness, credentials, and trusted assessment require authenticated server-side evidence and reviewer approval.
- The one-month continuation, full Interview Arena, formal assessment forms, source revalidation automation, and managed code sandbox remain next phases.

## Next implementation order

1. Add day-level retrieval checks, a timed Interview Arena, and review-board scoring that distinguishes an explanation from a rubric-approved defense.
2. Add the four-week continuation modules: persistence/SQL, RAG/evaluation, collaboration/review, and final operational AI assistant.
3. Add a protected execution-provider interface only after a sandbox vendor and data-safety policy are selected.
4. Move trusted readiness and credential decisions behind authenticated server records.
