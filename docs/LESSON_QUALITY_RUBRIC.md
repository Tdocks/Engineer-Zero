# Lesson quality rubric (Engineer Zero)

**Purpose:** Score instructional *teach* modules for coherence, teachability, and honesty. Structural CI (field presence, length floors) is necessary but not sufficient.

**Scope of this review series:** 112 teach modules — Coding Developer 24, Applied AI Operations 80, IT Support sprint 8. Labs, missions, interviews, and baselines are out of scope for scoring (noted only as gaps).

**Cadence:** Audit each phase → human walkthrough → then fixes. Only P0 (unsafe / contradictory / broken teaching) is fixed in-phase by default.

This is **not** a commercial credential or accreditation claim.

## Scoring (1–5 per criterion)

| Score | Meaning |
| --- | --- |
| 5 | Exemplary for this program; a novice can learn the stated skill from this package alone |
| 4 | Pass bar — coherent, teachable, minor polish only |
| 3 | Usable but thin, awkward, or partially misaligned |
| 2 | Cannot reliably teach the titled skill as written |
| 1 | Hollow, contradictory, unsafe, or template noise |

**Pass bar:** ≈4+ on each criterion for a `ship` verdict. Average ≥3.5 with no criterion below 3 may still be `revise`.

| Criterion | Pass bar (≈4+) |
| --- | --- |
| **Coherence** | Title, objective/outcome, teach/blocks, example, and practice all teach the *same* skill |
| **Teach depth** | Enough real instruction to learn (not a slogan card); misconceptions called out |
| **Worked example** | Multi-step, runnable or narratable; shows expected shape and what fails if skipped |
| **Practice** | Concrete try-this / artifact with scaffold a novice can attempt from the lesson |
| **Retrieval** | Checks test the objective (not trivia); answers explain *why* |
| **Honesty** | Duration, claims, and lab/bridge match what the package actually delivers |

## Verdicts

| Verdict | When |
| --- | --- |
| `ship` | All criteria ≥4 (or clearly ≥4 with one 3 that is polish-only) |
| `revise` | Teachable with targeted edits; keep structure |
| `rewrite` | Wrong shape or hollow; replace body |

## Severity tags

| Tag | Meaning |
| --- | --- |
| `P0` | Unsafe, contradictory, or factually wrong teaching |
| `P1` | Cannot teach the claimed skill as written |
| `P2` | Thin, awkward, or missing scaffold |
| `P3` | Polish (tone, density, typography of examples) |

## Program-specific notes

### Coding Developer packages
Expect: `whyItMatters`, `teach`, `workedExample`, `tryThis` (+ steps / starter / expected / hint when present), `commonFailures` (≥2), `checkYourself` (≥2), `defensePrompt`, optional `bridgeToLab`. Depth gates in `lib/coding-lesson-package.ts` are a floor, not a quality ceiling.

### AIO / IT `CourseModule`
Expect: measurable outcome, overview or blocks (≥4), worked example (field or block), misconceptions, knowledge checks with explanations, artifact/rules where capability is `practice`/`prove`. Know-level concept modules may be shorter but must not be generic templates.

## Review method (per module)

1. Read objective / outcome first.
2. Skim teach / blocks / sections — does it teach that objective?
3. Check worked example alignment.
4. Attempt practice mentally as a novice.
5. Read retrieval checks.
6. Spot-check UI when borderline.
7. Record scores + one-line evidence (no essay).

## Scorecard columns

`id | title | Coh | Depth | Example | Practice | Retrieval | Honesty | Avg | Verdict | Severity | Notes`
