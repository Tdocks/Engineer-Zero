# Few-Day AIO — Interviewer Calibration Protocol

**Purpose:** Independent human scoring so the judgment-screen claim can move from Medium → High without trusting deterministic Studio scores alone.

**When:** After each pilot completes (or abandons) Day 5. Prefer voice for probes if the target hiring format is spoken.

**Related:** [`AIO_INTERVIEW_READINESS_BAR.md`](AIO_INTERVIEW_READINESS_BAR.md), [`AIO_FEW_DAY_PILOT_PROTOCOL.md`](AIO_FEW_DAY_PILOT_PROTOCOL.md), probes in `lib/aio-oral-probes.ts`.

---

## Blind procedure

1. Collect the pilot’s saved four-round mock (`interviewMockAttempts`: four first answers + revision) **without** showing Studio percentage scores to the interviewer.
2. Run the twelve oral probes live or async (voice preferred). Do not allow lesson notes.
3. Score each probe **Strong / Partial / Fail** using the strong-answer signals in the readiness bar / `aioOralProbes`.
4. Only after human scoring is recorded, compare against Studio round scores for the agreement check below.
5. If humans systematically Fail probes 4–6 (authz / conflict / abstain) while Studio rounds “pass,” stop and fix Studio scoring or curriculum before any High claim.

---

## Rubric

| Rating | Meaning |
| --- | --- |
| **Strong** | Names the critical constraint in own words; would clear a skeptical partner screen |
| **Partial** | Directionally correct but missing one must-have signal; recoverable with a follow-up |
| **Fail** | Wrong order, unsafe claim, or cannot explain without notes |

**Must-pass for High (cannot be Fail):** probes **4, 5, 6, 10, 11**.

**Pilot probe pass:** ≥10/12 Strong-or-Partial **and** must-pass probes cleared.

---

## Calibration rules to claim High

Across completing pilots:

| Rule | Threshold |
| --- | --- |
| Probe pass rate | ≥2 of 3 completing pilots pass the probe bar above |
| Studio agreement | Where Studio marked a round as pass-like (≥60%), human does not Fail more than **1 of 4** rounds on average |
| Divergence stop | Systematic Fail on authz/conflict/abstain while Studio passes → fix content/scoring first |
| Implementer claim | Remains rejected for all pilots |

---

## Score sheet (one per pilot)

**Pilot ID:** ________   **Date:** ________   **Interviewer:** ________   **Mode:** voice / text

### A. Four-round mock (blind)

| Round | Human Strong / Partial / Fail | Notes (boundary, evidence, ownership) | Studio % (fill after) |
| --- | --- | --- | --- |
| Fit + discovery | | | |
| Technical | | | |
| System design | | | |
| Project defense | | | |
| Revision quality | | | |

Human Fail count among 4 rounds: ____

### B. Oral probes

| # | Probe | S / P / F | Notes |
| --- | --- | --- | --- |
| 1 | Why this role, not prompt engineer? | | |
| 2 | When is conventional automation better than an LLM? | | |
| 3 | Tokens and context window, practically? | | |
| 4 | Where does authorization run in a RAG flow? **(must-pass)** | | |
| 5 | Two authorized sources conflict? **(must-pass)** | | |
| 6 | When must the system abstain? **(must-pass)** | | |
| 7 | Useful evaluation set for a procedure assistant | | |
| 8 | Why classify failures vs only rewriting prompts? | | |
| 9 | Unsafe about automatic retries on a write tool? | | |
| 10 | Defend AI-assisted work honestly? **(must-pass)** | | |
| 11 | Does approving Grok remove local security controls? **(must-pass)** | | |
| 12 | Name a Grok differentiator that still needs local eval | | |

**Strong-or-Partial count:** ____ / 12  
**Must-pass cleared (4/5/6/10/11):** Y / N  
**Pilot probe result:** Pass / Fail

### C. Agreement + content fix trigger

| Check | Result |
| --- | --- |
| Studio pass rounds human-Failed | ____ / 4 |
| Authz/conflict/abstain divergence? | Y / N — if Y, list fix tickets: ________ |

---

## After all pilots

Paste summary rows into [`AIO_EMERGENCY_PATH_RESCORE.md`](AIO_EMERGENCY_PATH_RESCORE.md) evidence table. Declare **High** only when pilot protocol + this calibration bar both clear. Keep independent-implementer claim **Low / rejected**.
