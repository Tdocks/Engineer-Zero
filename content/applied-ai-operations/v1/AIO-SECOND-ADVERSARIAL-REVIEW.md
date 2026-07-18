# Applied AI Operations Engineer — Second Adversarial Accreditation Review

**Audit date:** 2026-07-17  
**Scope:** Applied AI Operations Engineer only  
**Method:** Static manifest and route inspection, direct public API probes, adversarial scoring probes, content-shape analysis, current primary-source review, and learner-flow UI inspection.  
**Release decision:** **FAIL — not eligible for commercial release or credential issuance.**

## Executive judgment

The track now has meaningful first-pass protections: the 24-question baseline is server graded, its public form does not reveal answer keys, choice order varies by attempt, and a conventional/no-AI path exists in at least one mission. Those are real improvements.

The track still does not meet an institute-quality or commercial credential standard. A learner can earn complete activity evidence with meaningless repeated keywords; trusted readiness and credential signals remain browser-owned; interview answer guidance is delivered before the first attempt; all 40 lessons share one generated instructional structure; and the missions are sequential choice lists rather than stateful simulations. The product should remain an internal draft and should not represent readiness, completion, or certification as independently verified.

## Verified strengths

| Area | Verified evidence | Judgment |
| --- | --- | --- |
| Baseline key isolation | `GET /api/aio/baseline` returns 24 questions without `correctChoiceId`; `POST` grades server-side. | Pass for baseline answer-key isolation. |
| Baseline variation | A public attempt returned varied question and choice order; direct inspection confirms a per-attempt shuffle. | Pass, with predictability caveat below. |
| Core catalog coverage | Public catalog reports 40 modules, 30 labs, and 10 missions; Interview Studio reports 150 prompts. | Quantity target met; quality target not met. |
| Fictional-data posture | All reviewed scenarios are explicitly fictional and sanitized. | Pass for current content boundary. |
| AI restraint | The inspection-note mission accepts conventional workflow at its first decision when AI is unjustified. | Pass for one demonstrated no-AI/conventional outcome. |

## Severity-ranked findings

### P0 — release blockers

| ID | Finding and reproduced evidence | Learner / business impact | Required remediation |
| --- | --- | --- |
| AIO2-01 | **Artifact completion is gameable.** A direct `POST /api/course/grade` for `aio-lab-01` using 124 words of repeated `context`, `constraint`, `decision`, `verification`, `audience`, `tradeoff`, and `evidence` scored **100** and `complete: true`; it contained no scenario reasoning. Current rules only test substring presence and word count. | Completion, readiness, portfolio claims, and eventual credentials can be earned without competence. | Replace free-text keyword checks with structured evidence fields and activity-specific validators. Require a scenario fact, a decision, a named boundary, a verification method, and an ownership/escalation claim; reject repeated-token padding and require a revision to address a failed criterion. |
| AIO2-02 | **Credential and readiness evidence is not trusted.** `LearnerState`, course attempts, answers, assessment summaries, projects, and `capstoneReview.status` are persisted in browser storage. `graduationStatus` trusts this state; the certificate verification route is a placeholder. | A learner can fabricate evidence or human approval by changing their local browser data. No commercial certificate can be credible. | Keep drafts locally only. Persist signed-in attempts, reviewer decisions, readiness snapshots, and certificate eligibility on the server with RLS. Derive credential status exclusively from verified records and append-only reviewer decisions. |
| AIO2-03 | **Interview answers and grading services are public/unbounded.** `GET /api/course/interviews` includes `strongAnswer`, `commonMiss`, and `rubric` for all 150 prompts before an attempt; `POST /api/course/grade` has no authentication, enrollment check, attempt ownership, or rate limit. | Learners can memorize the supplied ideal answer and can automate unlimited scoring probes. Paid AIO content and assessment integrity cannot be enforced. | Split public prompt metadata from post-attempt examiner guidance; gate detailed guidance by a verified first attempt. Require authenticated enrollment and server-issued attempt IDs for scoring; add per-user/IP rate limits, size limits, telemetry, and abuse-safe errors. |

### P1 — accreditation gaps

| ID | Finding and evidence | Required remediation |
| --- | --- | --- |
| AIO2-04 | **The written curriculum is structurally generated, not independently authored.** All 40 modules share `Core idea → Decision method → Applied example → Failure test`; every first knowledge-check prompt reduces to the same template; non-Sprint modules share one symbolic prerequisite, `foundation-bridge-or-sprint`. | Replace `makeModule` output for production content with individual MDX/typed manifests. Each lesson needs a unique explanation sequence, worked example, misconception-specific checks, real prerequisite IDs, and a unique artifact prompt. |
| AIO2-05 | **Labs are formatted scenarios, not distinct simulations.** Each lab uses the same two-asset shape and the same four labels/rule pattern; Solo, Pair Programming, AI Builder, and Production Incident primarily differ by copy. Pair Programming has no bounded Socratic interaction and Incident has no simulated time/impact state. | Create per-mode simulation contracts: evidence viewer + decision state for Solo; bounded hint/critique transcript for Pair; flawed generated artifact with review diff for AI Builder; timeline, impact, communications, recovery, and no-coach lockout for Production Incident. |
| AIO2-06 | **Missions do not branch.** All 10 have exactly three sequential decisions. A choice exposes a consequence but never changes later options, evidence requirements, outcome, or recovery state. | Model missions as persisted state machines with transitions, consequences, branch-specific later decisions, escalation and recovery paths, and multiple valid dispositions such as no-AI, conventional automation, read-only assistance, approval-gated action, and stop/escalate. |
| AIO2-07 | **Readiness does not faithfully represent AIO evidence.** Course attempt gains are only associated with competency when the item ID contains `mission`; completed module and lab evidence does not map through its actual competency weights. The overall score also blends locally mutable data. | Store competency weights with every verified attempt; aggregate Understands, Builds, Troubleshoots, and Defends separately; calculate readiness from signed baseline, verified activity evidence, project review, and interview rubrics. |
| AIO2-08 | **Interview Studio measures vocabulary more than reasoning.** It awards score from signal words and word count. Timers are display-only, answer history is a single mutable value, and examiner guidance is already available from the endpoint. | Use mode-specific structured rubrics, preserve immutable first/revision attempts, enforce timed-session start/submit windows server-side, reveal guidance only after first submit, and generate follow-up pressure questions from a saved claim or missing criterion. |
| AIO2-09 | **Source traceability is insufficient for a fast-moving field.** Sources record title, URL, publisher, and an accessed date only; no source version, locator, supported claim, or review/revalidation cadence exists. NIST states AI RMF 1.0 is being revised and has a current critical-infrastructure profile effort; OWASP has current 2025 LLM material and active agentic-security work. | Add per-claim source mappings: canonical URL, document/version, section or heading locator, retrieved date, claim summary, change cadence, and reviewer. Block release if a source is stale, superseded, inaccessible, or unsupported by its cited claim. |
| AIO2-10 | **QA evidence is not sufficient.** The repository has one Vitest file and no React Testing Library, Playwright, accessibility scanner, or end-to-end configuration. | Add component tests for course flow and focus/error states, Playwright paths for every required learner journey, keyboard-only tests, and automated accessibility checks; retain human accessibility review as a separate release gate. |

### P2 — quality and operating improvements

| ID | Finding | Required remediation |
| --- | --- | --- |
| AIO2-11 | Catalog public projections omit mission disposition labels, so the UI cannot visibly distinguish conventional, read-only, human-approved, or unsafe options even though the data model supports them. | Return safe public disposition labels and render them as non-answer-revealing operating postures. |
| AIO2-12 | Course runner is a modal with no demonstrated focus trap, focus restoration, resume marker, or explicit retry control for a failed content load. | Add modal focus management, Escape/close behavior, focus return, activity resume state, and a retry action with a clear saved-draft message. |
| AIO2-13 | The content status is a single shared `draftReview` object and does not establish item-level reviewer identity, date, version approval, or change reason. | Add immutable review records keyed by content version, reviewer role, reviewer ID, decision, date, notes, and superseded-version relationship. |

## Competency coverage matrix

Counts below are inventory counts, not proof of mastery. All course inventory currently includes a generic communication weight, which inflates communication coverage and should not be read as defensible evidence.

| Competency | Instruction | Labs | Missions | Interview coverage | Evidence / defense judgment |
| --- | ---: | ---: | ---: | --- | --- |
| Software foundations | 7 | 5 | 0 | Software, data, and debugging | Present, but labs need executable or inspectable artifacts. |
| AI suitability / role judgment | 2 | 2 | 10 | Fundamentals; leadership | Mission-heavy but branches are not real. |
| Architecture | 7 | 5 | 1 | Secure enterprise architecture | Present; require component-specific diagrams and failure tests. |
| Secure enterprise AI | 6 | 5 | 2 | Secure enterprise architecture | Present; source/version controls and attack simulations need depth. |
| Production / debugging | 8 | 6 | 3 | Retrieval, evaluation, and agents; debugging | Strong topic coverage, weak proof because grading is gameable. |
| Technical leadership | 5 | 3 | 2 | Technical leadership; behavioral defense | Present; must require stakeholder-specific artifacts and review. |
| Communication | 40 shared | 30 shared | 10 shared | Behavioral/project defense | Inflated by blanket mapping; replace with authentic audience-specific scoring. |
| AI collaboration | 3 | 2 | 0 | Fundamentals / behavioral | Underrepresented; add code-review and no-AI recovery evidence. |

## Current source review

| Current source | Status on 2026-07-17 | Claims it can support | Audit action |
| --- | --- | --- | --- |
| [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) | Current page states AI RMF 1.0 is under revision and notes current critical-infrastructure work. | Risk management, evaluation, governance, lifecycle decision gates. | Revalidate every release; distinguish AI RMF 1.0 from current profiles and concept work. |
| [OWASP GenAI Security Project](https://genai.owasp.org/) | Current project lists the 2025 LLM Top 10 and active security, governance, agentic-security, data-security, and red-teaming initiatives. | Threat modeling, prompt injection, data exposure, secure AI adoption. | Cite the exact OWASP resource/version per lesson rather than the home page alone. |
| [Python 3 Tutorial](https://docs.python.org/3/tutorial/) | Current documentation identifies Python 3.14.6. | Language foundations only. | Do not use it as authority for API security or production architecture. |
| [PostgreSQL documentation](https://www.postgresql.org/docs/current/) | Current documentation identifies PostgreSQL 18.4. | Relational modeling and query behavior. | Cite specific documentation sections for transactions, roles, or access rules. |
| [OpenAI Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) | Canonical guide currently redirects from the stored `platform.openai.com` URL to `developers.openai.com`. | Schema-constrained outputs and validation design. | Update canonical URL and avoid provider-specific claims where the curriculum is provider-neutral. |
| [OpenTelemetry documentation](https://opentelemetry.io/docs/) | Current primary documentation. | Traces, metrics, logs, and observability concepts. | Cite exact signal/semantic-convention pages in production modules. |
| [Docker Get Started](https://docs.docker.com/get-started/) | Current primary documentation. | Container fundamentals. | Cite exact build/runtime/security pages for production claims. |

## Commercial release gate

| Gate | Current state | Required proof to pass |
| --- | --- | --- |
| Verified learner identity and enrollment | Fail | Authenticated server session, enrollment authorization, RLS tests. |
| Trusted attempts, review, and credential eligibility | Fail | Server-owned records, audit trail, reviewer workflow, tamper tests. |
| Assessment and rubric anti-gaming | Fail | Negative tests for padding, headings-only, copied/near-duplicate evidence, invalid branches, and replayed attempts. |
| Individually authored and reviewed curriculum | Fail | Versioned manifests, per-item source claims, and recorded approvals from author, instructional design, SME, accessibility, and fictional-data review. |
| Stateful simulations | Fail | Transition tests proving later state differs by learner decision and has safe recovery. |
| Interview integrity | Fail | Post-attempt-only guidance, immutable revisions, timed-session enforcement, rubric calibration. |
| Accessibility and learner-flow QA | Fail / unverified | Keyboard, focus, mobile, reduced-motion, error/retry, reset/resume, and screen-reader test evidence plus human approval. |
| Fictional-data safety | Pass for current reviewed content | Maintain automated content scan and reviewer sign-off for every content version. |

## Decision-complete remediation backlog

### P0 — required before any paid enrollment, credential, or readiness claim

1. **Trusted learning record:** implement authenticated server-side attempts, project drafts, readiness snapshots, capstone review, and certificate eligibility; retain local storage only as an unsynced draft cache. Enforce enrollment and RLS at every learner-data route.
2. **Anti-gaming rubric engine:** replace one textarea/substring rules with a structured artifact form containing context, cited scenario evidence, boundary, recommendation, owner, verification, and rollback fields. Each activity declares required facts and forbidden contradictions. Reject repeated-token padding, exact/near-duplicate revisions, and unsupported claims.
3. **Secure assessment and interview delivery:** issue signed attempt IDs, randomize on the server, rate-limit submissions, and never send examiner guidance or private rubric evidence until the learner has saved a first attempt.

### P1 — required for institute-quality instructional claims

1. **Authored content migration:** replace the generic lesson generator with individual MDX plus typed manifests. Lock unique objectives, prerequisites, worked examples, misconceptions, checks, artifact schema, and source-claim map per module.
2. **Simulation state engine:** represent each mission as nodes, transitions, state variables, consequences, recovery/escalation actions, and branch-specific evidence. Implement dedicated simulation renderers for all four learning modes.
3. **Evidence-based readiness:** map verified attempts to actual competency weights and evidence levels—Understands, Builds, Troubleshoots, Defends—rather than using generic activity completion or ID matching.
4. **Interview Studio rebuild:** preserve first and revised attempts, run real timed sessions, gate the examiner guide, and score named reasoning claims against the prompt-specific rubric.
5. **Source governance:** add source version/locator/claim records and a revalidation cadence; block content release when source metadata or review approval is incomplete.

### P2 — launch-hardening and learner experience

1. Add public operating-disposition labels without exposing correctness, modal focus management, resume markers, retry controls, and explicit offline/draft status.
2. Add React component tests, Playwright end-to-end journeys, keyboard-only regressions, automated accessibility checks, and failure/retry tests.
3. Add reviewer dashboards, content-version change logs, calibration samples, learner-feedback triage, and release telemetry.

## Required automated regression suite

- Public baseline/catalog payloads never contain answer keys, accepted mission-choice IDs, or post-attempt examiner guidance.
- The 124-word repetition artifact used in this review fails every activity it does not reason about.
- A local browser-state modification cannot alter verified readiness, reviewer approval, certificate eligibility, or portfolio export evidence.
- Every mission has at least three reachable outcomes, one safe recovery/escalation path, and a later decision changed by earlier state.
- A production incident disables coaching at both UI and server levels.
- Retakes issue a new server attempt, preserve prior evidence, and do not reuse item/choice order.
- Keyboard-only learner can open, complete, exit, and resume each activity with correct focus restoration; mobile flow preserves progress and no answer cue appears.

## Human review obligations

No automated outcome can replace final sign-off from an instructional designer, an Applied-AI SME, an accessibility reviewer, and a fictional-data reviewer. Approval must be recorded per content version, not inferred from a shared draft flag.
