# Few-Day AIO Interview Path — True-Zero Pilot Protocol

**Purpose:** Produce the human evidence required to raise the product claim  
“true zero → partner/judgment screen + guided prototype defense” from **Medium** to **High**.

**Non-goal:** Do **not** coach or market pilots as independent implementers in 3–5 days. That claim stays **rejected**.

**Related:** [`AIO_INTERVIEW_READINESS_BAR.md`](AIO_INTERVIEW_READINESS_BAR.md), [`AIO_INTERVIEWER_CALIBRATION.md`](AIO_INTERVIEWER_CALIBRATION.md), [`AIO_EMERGENCY_PATH_RESCORE.md`](AIO_EMERGENCY_PATH_RESCORE.md), playlist in `lib/aio-interview-emergency-path.ts`.

---

## Recruitment criteria

Recruit **≥3** learners who:

| Include | Exclude |
| --- | --- |
| No prior Python / API / AI-ops coursework beyond casual browsing | Professional software engineers |
| Willing to dedicate ~6–8 focused hours/day for 5 calendar days (or ~31h within 7 days) | Learners who already ship FastAPI services |
| Agree to export or screenshot gate progress and save Interview Studio artifacts | Anyone coached toward “I can build production AI systems in a week” |

Label each pilot `P1` / `P2` / `P3`. Record prior exposure honestly (none / light scripting / other).

---

## Daily schedule (mapped to emergency playlist)

| Day | Focus | Playlist IDs (approx.) | Target hours |
| --- | --- | --- | --- |
| 1 | Coding foundations I + Watch→Do | `ep-d1-*` | 7–9 |
| 2 | Coding foundations II + Sprint 01–02 + lab 01 | `ep-d2-*` | 7–9 |
| 3 | Sprint 03–05 + lab 05 | `ep-d3-*` | 5–7 |
| 4 | Sprint 06–07 + lab 06 + procedure-assistant challenge | `ep-d4-*` | 5–7 |
| 5 | Sprint 08 + timed four-round mock + oral probe dry-run | `ep-d5-*` | 4–6 |

Open the product with `?path=interview-emergency` so Watch→Do and emergency gates are visible.

**Stop criterion (Day 1):** If a pilot exceeds **12 focused hours** without any reviewed Coding challenge for the bridge set, pause the pilot, capture the stuck lesson/challenge ID, and route them to Foundation rather than forcing packet complete.

---

## Metrics to capture

Use the data sheet below (copy one row per pilot). Prefer product state over memory:

| Metric | Source |
| --- | --- |
| Seat time (start/end per day) | Pilot log |
| First abandonment / stuck ID | Pilot log |
| Gate flags | Few-Day checklist banner: codingBridge, sprintModules, requiredLabs, timedMock, oralProbeDryRun, packetComplete |
| Mock quality | `interviewMockAttempts` (4 rounds + ≥60-word revision) |
| Probe dry-run | `oralProbeDryRuns` (10 probes, without-notes attestation) |
| Human probe scores | [`AIO_INTERVIEWER_CALIBRATION.md`](AIO_INTERVIEWER_CALIBRATION.md) after Day 5 |

---

## Pass bar to raise confidence to High

All of the following must hold:

1. **≥2 of 3** pilots reach `packetComplete` within **≤38 focused hours**.
2. Of pilots who complete, **≥2 of 3** score **≥10/12** oral probes Strong-or-Partial from an independent interviewer, with must-pass on probes **4, 5, 6, 10, 11** (see calibration doc).
3. **Zero** pilots are coached or marketed as independent implementers.
4. Studio vs human agreement check in the calibration doc does not systematically fail authz/conflict/abstain while Studio passes.

Until this bar clears, keep the judgment claim at **Medium** in [`AIO_EMERGENCY_PATH_RESCORE.md`](AIO_EMERGENCY_PATH_RESCORE.md).

---

## Pilot data sheet template

Copy into a spreadsheet or fill below after each run.

### Pilot identity

| Field | P1 | P2 | P3 |
| --- | --- | --- | --- |
| Pseudonym | | | |
| Prior coding exposure | none / light / other | | |
| Start date | | | |
| End date | | | |
| Total focused hours | | | |
| `packetComplete` (Y/N) | | | |
| Hours to `packetComplete` | | | |
| First stuck item ID | | | |
| Timed mock saved (Y/N) | | | |
| Oral probe dry-run saved (Y/N) | | | |
| Human probe score (/12) | | | |
| Must-pass 4/5/6/10/11 cleared (Y/N) | | | |
| Notes | | | |

### Daily log (repeat per pilot)

| Day | Start | End | Hours | Completed playlist IDs | Stuck / notes |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

---

## Operator checklist

- [ ] Three true-zero pilots recruited with written dedication commitment
- [ ] Each pilot uses emergency path UI (`path=interview-emergency`)
- [ ] Data sheet filled for seat time, abandon points, gates
- [ ] Mock + probe dry-run artifacts preserved (export or screenshot)
- [ ] Calibration interview scheduled with someone who has not seen Studio scores first
- [ ] Results pasted into rescore evidence table before any High claim
