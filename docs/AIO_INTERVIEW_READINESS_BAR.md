# AIO Interview Readiness Bar (Few-Day Emergency Path)

**Disposition:** Internal pass criteria for the **Few-Day Interview Path** (&lt;5 calendar days, ~31–38 focused hours). Not a commercial credential. Not Foundation Prove graduation.

**Audience:** Motivated true-zero or tech-adjacent learner with technical inclination who completes Coding bridge + AIO sprint packet + timed Interview Studio reps + scored oral probes.

**Target claim:** A dedicated completer can pass a non-LeetCode Applied AI Operations **partner/judgment screen** and defend a **guided** LLM PoC without sounding thin. Not an independent production implementer.

## Pass definition

The learner **passes** when they can, without reading the lesson text aloud:

1. Answer the must-pass oral probes below in their own words at Strong or Partial (must-pass probes **4, 5, 6, 10, 11** cannot Fail).
2. Score ≥10/12 Strong-or-Partial on the scored Day-5 oral probe dry-run.
3. Point to the three packet artifacts as evidence (plus spoken narrative attest, cold architecture redraw, and Grok routing lab).
4. Show Coding bridge lesson **and reviewed challenge** completion for the guided prototype story (including broken-PR and Grok draft review when gated).
5. Complete one timed four-round Interview Studio mock and revise the weakest preserved first answer.
6. Complete prompt-engineering Sprint 11 + Grok live lab RUN-TRACE (live `XAI_API_KEY` optional; deterministic fixtures count).

Failing any must-pass probe or missing any required artifact = not interview-ready on this bar.

## Must-pass oral probes (12)

| # | Probe | Strong answer signals |
| --- | --- | --- |
| 1 | Why this role, not “prompt engineer”? | Technical partner: discover → controlled design → evaluate → defend; ownership honesty |
| 2 | When is conventional automation better than an LLM? | Clear rules / deterministic outputs; AI for ambiguous language only when evidence supports it |
| 3 | What are tokens and a context window, practically? | Budget: cost/latency/distraction/injection; minimal authorized evidence beats stuffing |
| 4 | Where does authorization run in a RAG flow? | **Before** retrieval / model context; no “retrieve all then hide” |
| 5 | What do you do when two authorized sources conflict? | Surface conflict + escalate; do not silently pick |
| 6 | When must the system abstain? | Missing, unauthorized, conflicting, or schema-invalid evidence |
| 7 | Name a useful evaluation set for a procedure assistant | Supported, denied, stale, conflict, injection, unsupported, schema, plus search/reasoning/allowlist flavors |
| 8 | Why classify failures instead of only rewriting prompts? | Category → component (retrieval, authz, schema, prompt, tool) + regression |
| 9 | What is unsafe about automatic retries on a write tool? | Duplicate consequential actions; need idempotency + bounded retries |
| 10 | How do you defend AI-assisted work honestly? | What you designed / generated / reviewed / tested / repaired; limits named |
| 11 | Does approving Grok remove local security controls? | Grok ≠ security boundary; authz, schema, allowlists, and local evals still required |
| 12 | Name a Grok differentiator that still needs local eval | Tools/search/reasoning_effort only after owned cases prove search cites, latency, allowlist behavior |

## Must-pass artifacts (3+)

| Artifact | Evidence |
| --- | --- |
| **90-second role narrative** | Written script + spoken attest (once without reading the script) |
| **1-page architecture** | Graded COMPONENT map + cold redraw without the failure-matrix asset |
| **Mini evaluation pack** | **12** representative cases with expected behavior, observable pass/fail evidence, failure category, and owner — must include **search-cite-outside-corpus**, **reasoning_effort/p95**, and **tool-write-outside-allowlist** |

## Coding bridge (hard gate)

Complete these Coding Developer lessons (or equivalent verified evidence) before claiming Few-Day path complete:

- Day 1 selected sequence: terminal navigation, first execution, functions, JSON-shaped data, defensive input (`coding-day-1-02` through `1-06`)
- Day 2 selected sequence: environment, HTTP/JSON, FastAPI contract, service separation, tests (`coding-day-2-01` through `2-05`)
- Day 3 selected sequence: deterministic-vs-model split, credentials/failure, structured extraction, approval boundaries, evaluation, oral defense (`coding-day-3-01` through `3-06`)
- Reviewed Coding challenges: terminal escape, triage CLI/API, test repair, AI extraction, `coding-aio-procedure-assistant`, `coding-aio-broken-pr-review`, and `coding-aio-grok-draft-review`

Shared mini-capstone story: **permission-aware read-only procedure assistant** — run the supplied scaffold, deliberately break and repair authz-before-retrieve ordering, and defend deny/cite/conflict/unsupported tests. Do not claim production deployment. Grok draft review proves you can direct and repair an approved-model agent scaffold without greenfield Spok ownership.

## Out of scope for few days

- Independent production ownership or on-call AI ops
- Kubernetes / Rust / platform engineering competence
- Unsupervised multi-agent builds with write tools
- Live xAI credentials or real Spok deployment
- Fast Track / Master Track completeness
- Commercial credential or job-placement guarantee
- Literal “fail-proof for every learner” marketing (pending pilot evidence)

## Relationship to other paths

| Path | Claims |
| --- | --- |
| **Few-Day Interview Path** | Interview-ready partner/judgment screen + guided PoC defense |
| **Zero-to-Role Foundation (weeks)** | Post-offer / role accelerator: read AI output, find bugs, direct the model, deepen build confidence |
| **Fast / Master** | Applied depth; off commercial “job ready” until human `draftReview` |

Reading a sprint lesson is **not** completing a timed mock. A random saved interview answer does not count. Packet complete requires the dedicated four-round Interview Studio mode, four preserved first answers, one revision of the weakest round, and a **scored** oral probe dry-run.
