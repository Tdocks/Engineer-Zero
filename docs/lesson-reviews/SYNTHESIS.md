# Lesson quality review — synthesis (all 112 teach modules)

**Date:** 2026-07-19 (post Wave 1–6 remediation)  
**Rubric:** [LESSON_QUALITY_RUBRIC.md](../LESSON_QUALITY_RUBRIC.md)  
**Phase packets:** [lesson-reviews/](./)

**Disposition:** Internal instructional audit. Structural CI ≠ instructional quality. Not a commercial credential claim.

## Roll-up (after remediation)

| Program / slice | n | ship | revise | rewrite | Dominant issue |
| --- | ---: | ---: | ---: | ---: | --- |
| Coding Day 1 | 6 | 6 | 0 | 0 | Calibration bar; Day 1-05 JSON round-trip polish landed |
| Coding Days 2–4 | 18 | 18 | 0 | 0 | Wave 1: padding stripped, bridges, mode honesty |
| AIO 48h sprint | 8 | 8 | 0 | 0 | Wave 2: tokens/context, architecture, mock honesty, duration 55m |
| AIO foundation | 6 | 6 | 0 | 0 | Wave 2: prove verbs demoted; foundation-05 single story |
| AIO 7-day extensions | 5 | 5 | 0 | 0 | Wave 4: real practice packages |
| AIO Fast/Master core | 25 | 25 | 0 | 0 | Wave 5: authored blocks+checks; factory checks retired |
| AIO concepts | 36 | 36 | 0 | 0 | Wave 3+6: concept-specific checks; mashed cards rewritten |
| IT Support sprint | 8 | 8 | 0 | 0 | Quality bar for career tracks |
| **Total** | **112** | **112** | **0** | **0** | Human `draftReview` still required before release claims |

Approximate share: **~100% ship-ready instructional bodies** for the 112 teach modules (structural + authored). Remaining work is human walkthrough / release approval, not hollow-shell rewrite.

## Verdict by program

```text
Coding Developer (24):  Day 1–4 packages ship (Wave 1 + Day 1-05 polish)
AIO (80):               Sprint, foundation, extensions, core, concepts authored
IT Support (8):         All ship — strongest career-track bar retained
```

## Closed P0 / P1 (this program)

1. **AIO core + extensions** — authored in `lib/aio-core-authored.ts` + extension modules; `makeModule` no longer invents core checks from outcome/example.
2. **AIO concept checks** — `lib/aio-concept-checks.ts` (36 unique stems).
3. **Coding Days 2–4** — padding, bridges, mode honesty.
4. **AIO sprint + foundation** — outcome/depth/duration honesty.
5. **Mashed concepts 06/12/17/36** — focused rewrites.
6. **Anti-hollow CI** — `validateAioContent` rejects outcome-as-answer, duplicate prompts, teammate-mentions stem, core without blocks.

## What “good” looks like (templates retained)

| Example | Why |
| --- | --- |
| Coding Day 1 packages | Full teach → worked → steps → expected → failures → checks → lab bridge |
| IT sprint 02–03 | Concrete method, case, misconceptions, concept-specific distractors |
| AIO sprint-05 evaluation | Reusable taxonomy + gates |
| AIO foundation-06 | Ownership honesty + sharp example |

## Explicit gaps (deferred — separate plan)

- Human release approval (`draftReview`) still required before marketing completeness claims.
- Stripe / credentials explicitly deferred.
- Interview banks now have per-prompt rubrics/coaching + timed packs; deeper examiner essays can still improve.
- Labs/missions authored (AIO 30 labs / 10 missions); IT launch catalog complete at 12 labs + 6 missions.

## Release / scorecard note

Passing `validateCodingProgram` / `validateAioContent` / `validateItSupportContent` now includes **anti-hollow gates** for AIO teach modules, but human walkthrough remains the final instructional sign-off.
