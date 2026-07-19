# Phase 4 — AIO sprint extensions + core

**Rubric:** [LESSON_QUALITY_RUBRIC.md](../LESSON_QUALITY_RUBRIC.md)  
**Modules:** 30 (extensions 5 + core 25) · **Re-scored:** 2026-07-19 (Waves 4–5)

## Summary

| Metric | Value |
| --- | --- |
| Modules reviewed | 30 |
| ship / revise / rewrite | **30 / 0 / 0** |
| P0 / P1 count | **0 / 0** |
| Pause notes for human walkthrough | Spot-check ProcedureDesk tour (ext-01), core-01 discovery, core-15 injection, core-25 capstone. |

Extensions are authored practice packages. Core uses `coreEditorialBlocks` + `coreKnowledgeChecks` in `lib/aio-core-authored.ts`; `makeModule` refuses core shells without authored blocks/checks and no longer pastes outcome/example as answers.

## Scorecard — 7-day extensions

| id | title | Coh | Depth | Ex | Prac | Ret | Hon | Avg | Verdict | Sev | Notes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| aio-sprint-extension-01-prototype-tour | Prototype tour: permission-aware knowledge | 5 | 4 | 4 | 5 | 5 | 5 | 4.7 | ship | — | ProcedureDesk authz→retrieve→cite |
| aio-sprint-extension-02-api-reading | Read an API without pretending to be senior | 5 | 4 | 4 | 5 | 5 | 5 | 4.7 | ship | — | Request→schema→log→pytest |
| aio-sprint-extension-03-retrieval-evaluation | Retrieval and evaluation deepening | 5 | 4 | 4 | 5 | 5 | 5 | 4.7 | ship | — | Compare packs + edge case |
| aio-sprint-extension-04-safe-boundaries | Boundary drill: no AI is a valid answer | 5 | 4 | 4 | 5 | 5 | 5 | 4.7 | ship | — | Classify autonomy levels |
| aio-sprint-extension-05-defense-loop | System design and project-defense loop | 5 | 4 | 4 | 5 | 5 | 5 | 4.7 | ship | — | Timed rubric defense |

## Scorecard — Fast/Master core

All 25: **ship** (authored blocks ≥4, 3 concept-specific checks, honest capability). Sample:

| id | title | Verdict | Notes |
| --- | --- | --- | --- |
| aio-core-01 | Discovery and workflow mapping | ship | Batch A |
| aio-core-05 | Schemas and structured output | ship | Batch A |
| aio-core-10 | State, timeouts, retries, and idempotency | ship | Batch B |
| aio-core-15 | Threat modeling and prompt injection | ship | Batch C |
| aio-core-20 | Risk registers and approval mapping | ship | Batch D |
| aio-core-25 | Capstone integration and defense | ship | Batch E |

## P0 / P1 backlog (this phase)

| id | Sev | Fix note |
| --- | --- | --- |
| — | — | Waves 4–5 closed |
