# Coding Developer Master Plan Audit — 2026-07-18

This audit measures the current repository against `Zero-to-Prototype AI Software Engineer`. It is evidence-based and does not treat a rendered page as proof of a learning outcome.

## Current disposition

**Internal learning product — not a commercial or job-readiness credential.** The four-day pathway is materially implemented, but the full plan remains incomplete until trusted learner records, a configured isolated sandbox, richer automatic grading, and human-review workflow exist.

## Requirement coverage

| Master-plan requirement | Current evidence | Status |
| --- | --- | --- |
| Python, FastAPI, Git/GitHub, pytest, SQL, hosted-model progression | Four-day curriculum, local CLI/API/AI projects, SQLite Issue Tracker, a protected fictional Git change-review simulation, and Mission Operations Handoff capstone with optional local OpenAI adapter | Partial: team Git workflow is simulated; it is not yet verified through a hosted collaborative repository. |
| Honest four-day outcome | Shared-program promise and graduation language explicitly limit claims | Implemented. |
| Observe → explain → modify → complete → repair → build → defend | Lesson modes, safe terminal, Code Lab, systems labs, comprehension gates, Review Board | Partial: individual lesson completion remains local/self-recorded. |
| Retrieval, spacing, interleaving, self-explanation, specific feedback | Protected 12-prompt mixed retrieval forms, five persisted recall returns per completed lesson, a write-before-reveal recall workspace, comprehension gates, targeted responses | Partial: delayed-review notifications and adaptive sequencing are not yet implemented. |
| Ten competency categories and Level 0 start | Eleven source-mapped coding competencies and zero-evidence mastery calculation | Implemented for local pilot. |
| Four days of instruction and capstones | 24 authored lessons, six challenges, four runnable starter projects, and a Day 4 handoff capstone | Implemented for local pilot. |
| Mission Map | Course map, daily cadence, local-project paths, mastery targets | Implemented. |
| Terminal Simulator | Persisted fictional filesystem; guided/unguided mode; navigation, file operations, command history, recovery, replay, and path map | Implemented as a safe training simulator; it deliberately is not the learner's host terminal. |
| Code Lab | Editor, draft diff, persisted drafts/snapshots, six-entry learner-owned revision replay with submitted code/explanation and deterministic review feedback, local-project handoff, and protected isolated-runner UI | Partial: execution output remains unavailable until an isolated provider is configured; revision history is local study evidence only. |
| API Simulator | Factual request builder, validation and failure paths | Implemented as deterministic browser simulation. |
| AI Systems Lab | Structured-output comparison, injection decision, server-reviewed context-window assembly, human-approved tool workflow, evaluation dataset, and Debug Bay with 12 distinct failure classes | Partial: no real model-cost/latency telemetry or live model execution until a controlled provider is configured. |
| Interview Arena | Timed public prompts, guided/limited/no-hint mode, follow-up pressure questions, a two-round changing-requirements exercise, server-owned evidence rubric, and local response replay | Partial: no voice transcription, code replay, or dynamic live coach. |
| Review Board | Five reviewer perspectives and saved local responses with role-specific deterministic evidence checks | Partial: no human or qualified-reviewer approval workflow. |
| Assessment engine | Server-only answer keys, per-attempt mixed forms, balanced correct-answer positions, response feedback, local attempt records; server-owned Code Lab rubric and distinct-evidence checks in Interview Arena reject repeated keyword padding | Partial: deterministic study review still cannot certify independent coding skill or runtime correctness. |
| Assessment weights | Functional, decomposition, defense, debugging, data, security categories exist in challenge/interview mappings | Partial: no trusted aggregate graduation calculation yet. |
| Gamification | Six XP categories, evidence milestones, five boss battles, targeted recovery drills, and delayed-recall prompts | Partial: daily streak and cross-device recovery routing require trusted learner records. |
| One-month continuation | Four sequenced continuation modules with artifacts, defense prompts, SQLite Issue Tracker, knowledge assistant, and handoff capstone | Partial: reviewer-approved artifacts and collaborative hosted Git evidence are still absent. |
| Versioned source-of-truth | Source registry includes publisher, canonical URL, version, locator, claim, verified/revalidation dates, hierarchy type, deprecation status/replacement metadata, review status, individually authored per-concept definition/application/limitation/assessment mappings, and a source-health publication report | Partial: automatic scheduled revalidation and independent technical approval remain to be added. |
| Isolated code execution | Server-side `ExecutionProvider` contract validates bounded requests; unconfigured provider refuses execution | Partial by design: no sandbox provider is configured and the main web process never executes learner code. |
| AI tutor | Deterministic progressive tutor follows prediction → failing region → concept → pseudocode → partial correction → complete-pattern hierarchy; it reads the current local draft, classifies learner-supplied local error output, and links the supporting source trail | Partial: it does not execute code, inspect a real sandbox result, or use a live provider-backed tutor. |
| Guardrails | No production/safety-critical claims; fictional data; provider failures degrade safely | Implemented in current local product. |

## Verified implementation evidence

- `npm test`: 34 tests pass after the instructional engine, source-record/governance, boss-battle, tutor, continuation, recovery, execution-boundary, answer-integrity, anti-padding, review-board, learner-draft, terminal-simulation, context-window, evaluation-set, human-approved-tool-workflow, and two-round requirement-change interview work.
- `npm run build`: succeeds and includes protected assessment and execution routes.
- Local projects remain separate from the web process and use only fictional training data. Their independent test suites pass from their own folders (4 CLI, 4 API, 3 AI-triage, 5 approval-workflow, 4 handoff-capstone tests); they intentionally must not be collected as one Python package.

## Mandatory next gates before any commercial claim

1. Configure an isolated, network-denied execution provider with CPU/memory/time/output limits and audit events.
2. Finish the authenticated evidence path for labs, interviews, project snapshots, timers, and graduation records; a protected verified-assessment route and schema now exist.
3. Add an automated source-revalidation job and reviewer workflow for source changes.
4. Derive a verified weighted readiness calculation from server-owned coding attempts rather than local-study records.
5. Require qualified human review for any credential or portfolio-readiness claim.

## Latest integrity controls

- Code Lab gives only a **local study review**. It must observe the required non-comment code structures, reject prohibited patterns, and find every activity-specific evidence claim in distinct explanatory segments. A string of checklist words or headings cannot mark the lab reviewed.
- Interview Arena uses the same evidence-segment and repetition checks. It remains a preparation tool rather than an authority on a learner's job performance.
- The changing-requirements interview requires a minimally defensible initial prototype before it reveals a team-authorization and write-back constraint. Its server-side review scores the initial scope and the revision separately; a polished revision cannot erase a missing initial design.
- Interview responses retain a local revision history by prompt, including support level and elapsed practice time. It is explicitly learner-owned preparation history, not a verified assessment transcript or hiring record.
- Tool workflow disposition keys are held server-side. The learner sees fictional reports, model proposals, arguments, and policy signals, then must distinguish read-only authorized retrieval, human-approved external actions, and rejected unsafe requests. The simulation never invokes a credential or operational tool.
- Context-window assembly similarly holds its accepted bundle server-side. Learners work from source freshness, team authorization, relevance, injection risk, and a finite instructional token estimate; this is a conceptual simulation and not provider token accounting.
- The tutor keeps local error output in learner-owned browser state and explicitly warns against including secrets, tokens, or organizational data. Its error classifier points to a diagnostic boundary—syntax, environment, JSON shape, validation, test expectation, credential/authorization, or type shape—without providing a hidden solution or claiming a run occurred.
- The source-health report makes overdue or deprecated materials block publication. All current records are still only author-verified; an independent technical reviewer must mark them approved before a commercial credential claim is defensible.
