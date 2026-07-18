# Applied AI Operations Engineer — Full Content Audit

**Status:** Content remediation required before commercial release

**Scope:** Applied AI Operations Engineer track only. This review covers curriculum, lessons, assessments, labs, missions, projects, interview practice, scoring, and content operations.

## Executive conclusion

The track has the right product thesis: AI-native engineering, safe enterprise judgment, applied LLM systems, production thinking, and technical leadership. Its topic inventory is substantially better than a generic “prompt engineering course.”

It is not yet a complete course. The current implementation is a polished **course catalog and evidence UI** with a small number of real prompts. Most listed lessons, labs, missions, and interview questions are generated from shared generic templates. A learner cannot currently acquire, practice, receive targeted feedback on, and prove the majority of the claimed skills.

Do not market this track as complete until the following release gate is met:

1. Every required module has a real lesson body, worked example, misconception check, scored practice, and remediation path.
2. Every lab includes supplied fictional artifacts and an explicit expected decision—not only a title and a free-text box.
3. Every interview prompt is independently authored; generated “variation N” questions are removed.
4. Readiness scoring uses the actual competencies practiced by an activity.
5. Graduation requires reviewed evidence, not merely a long answer containing selected keywords.

## What exists today

| Area | Current state | Release judgment |
|---|---|---|
| Role framing | Strong and aligned with technical-partner work | Keep |
| Reality Check | 24 distinct questions with good high-level coverage | Rewrite assessment mechanics |
| 48-hour path | Eight named blocks, but only three attached activities | Incomplete |
| Lessons | 25 listed lesson titles; no MDX lesson bodies exist | Not course-ready |
| Labs | 20 listed labs; 17 are generic title-only templates | Not lab-ready |
| Missions | 10 listed missions; most are generic title-only templates | Not mission-ready |
| Projects | Two good starter templates | Expand and grade |
| Interview practice | 150 records generated from six base prompts | Not interview-ready |
| Feedback | Generic keyword/length scoring | Unsafe as an instructional authority |
| Readiness | Visually useful, but competency mappings are overly broad | Rework before credentialing |

### Important implementation findings

- The `content/` directory contains only an MDX convention README. There are no authored lesson bodies.
- All 20 generated Fast Track lessons share generic objectives and are mapped to `foundations`, even when the lesson is about security, architecture, evaluation, or leadership.
- All generated labs are mapped to `production`; all generated missions are mapped to `leadership`. This makes the readiness matrix misleading.
- The 150-question interview bank cycles through six authored prompts and adds a suffix such as “variation 7.” It is not a 150-question bank.
- The diagnostic and multiple-choice activities put the correct choice in position A. This creates a test-taking pattern, not a valid assessment.
- Activity feedback is generic. For text responses, it is calculated from length and the presence of words such as “risk,” “verify,” or “audit.”
- A learner can satisfy some graduation requirements with generic prose because the system does not evaluate factual correctness, evidence specificity, or the actual artifact.

## Content quality standard for every required learning item

Every production module must be authored as a content package—not a card title.

### Required lesson package

1. **Role outcome:** why the skill matters in an Applied AI Operations engagement.
2. **Measurable objective:** observable learner action, not “understand RAG.”
3. **Prerequisites:** concepts and artifacts the learner must already have.
4. **Concise instruction:** 600–1,200 words for a normal lesson; no filler.
5. **Worked fictional example:** a secure-enterprise scenario with realistic constraints.
6. **Architecture visual or process map:** when it materially clarifies a system boundary.
7. **Common failure modes:** at least three plausible mistakes.
8. **Knowledge check:** three to five independently written questions with explanations for every answer.
9. **Transfer prompt:** a short written or diagrammatic application to a new case.
10. **Completion evidence:** a saved decision, diagram, test plan, or explanation that can be revisited in interview practice.
11. **Remediation:** direct links to the prerequisite or targeted practice when the learner misses the check.

### Required quiz standard

- Mix recall, interpretation, tradeoff, and scenario-transfer questions.
- Randomize answer order. Never make the same position correct by convention.
- Include plausible distractors based on real misconceptions, not obviously absurd answers.
- Explain why the correct answer is correct and why each distractor fails.
- Tag every item with competency, difficulty, source module, and misconception category.
- Require a minimum score for knowledge checks, but allow retry after feedback.
- Separate diagnostic questions from mastery questions; do not teach through the baseline assessment.

### Required lab package

Each lab needs a scenario brief, fictional inputs, constraints, a learner task, expected evidence, hidden evaluation criteria, model answer or debrief, and a revision loop.

The four AI-native modes must change the work—not merely the badge:

| Mode | Required behavior |
|---|---|
| Solo | No Kyra answer or generated solution. Learner reasons independently and receives deterministic debrief afterward. |
| Pair Programming | Kyra may ask questions and offer bounded hints, but records the hint level used. |
| AI Builder | Learner receives flawed generated code/configuration/plan and must identify defects, explain risk, and submit a safe revision. |
| Production Incident | Kyra unavailable. Learner receives time-stamped artifacts, must contain impact, decide, communicate, recover, and write prevention notes. |

## Revised curriculum architecture

Python should be the primary implementation language. Rust is valuable as an advanced systems elective, but it should not compete with Python, APIs, testing, security, evaluation, and architecture during the job-ready path. The role needs credible coding and system judgment; it does not require shallow exposure to two languages.

### Reality Check — 45 to 60 minutes

**Purpose:** establish the baseline and explain the role’s real operating model.

1. What the role is: technical partner, prototype builder, architecture advisor, and implementation owner.
2. AI suitability: AI, conventional automation, search, process redesign, or no build.
3. High-trust enterprise boundaries: synthetic data, authorization, data classification awareness, auditability, controlled rollout.
4. Baseline assessment: 24 questions, randomized order, explanation after submission, and a competency-specific study prescription.

### 48-Hour Interview Sprint — eight complete blocks

Every block needs a short lesson, drill, saved artifact, and review criterion.

| Block | Deliverable | Required practice |
|---|---|---|
| 1. Role narrative | 90-second answer to “Why this role?” | Rewrite against a credibility rubric |
| 2. LLM fundamentals | Model-selection recommendation | Tokens, context, sampling, structured output, tool calling |
| 3. RAG | Explain a grounded assistant plus retrieval flow diagram | Chunking, metadata, citations, permissions, failures |
| 4. Secure enterprise AI | Data-flow boundary recommendation | Prompt injection, PII/controlled-data awareness, least privilege, audit |
| 5. Evaluation | Mini evaluation plan and failure taxonomy | Golden set, groundedness, latency, safety, regression |
| 6. System design | One-page architecture and rollout answer | Identity, retrieval, model gateway, tools, observability, fallback |
| 7. Project defense | Two completed case-study cards | Personal contribution, tradeoffs, results, limitations, next iteration |
| 8. Full mock loop | Scored recruiter, technical, system-design, and behavioral session | Retake weak answers after feedback |

The current path names all eight blocks but only attaches activities to role narrative, RAG, and secure boundary. The other five must be authored before the “48-hour” claim is credible.

### Fast Track — 10 job-ready modules

1. **Discovery and AI suitability** — workflow map, stakeholder interview, use-case triage.
2. **Software service foundations** — Python, HTTP, JSON schemas, APIs, errors, logging, tests.
3. **Data, identity, and permissions** — SQL basics, authentication versus authorization, access boundaries.
4. **LLM interaction design** — system instructions, context construction, structured output, prompt injection.
5. **Retrieval systems** — embeddings, hybrid retrieval, chunks, metadata, reranking, citations, freshness.
6. **Tools and workflows** — deterministic workflow versus agent, timeouts, retries, idempotency, approvals.
7. **Evaluation engineering** — datasets, rubrics, offline/online evaluation, regressions, human review.
8. **Secure enterprise AI** — model boundaries, input/output controls, audit events, threat modeling, escalation.
9. **Production architecture** — queues, caching, observability, cost, latency, fallbacks, rollout and rollback.
10. **Technical leadership** — decision records, risk register, executive explanation, pilot proposal, project defense.

### Master Track — six advanced modules and capstone

1. Reliability and observability for AI workflows.
2. Evaluation recovery and model/prompt change management.
3. Complex retrieval: conflict, freshness, policy-aware access, and evidence quality.
4. AI security review and red-team response.
5. Multi-team delivery: prioritization, approvals, skepticism, and adoption.
6. Advanced implementation elective: Python async/service hardening; optional Rust systems component.
7. **Capstone:** permission-aware operational AI assistant, evaluation plan, human approval boundary, audit design, and executive implementation recommendation.

## Lesson audit and replacements

The present 20 generated lesson titles are mostly correct topics. They must become authored modules with specific evidence. Do not retain them as generic cards.

| Current title group | Keep? | Required replacement evidence |
|---|---|---|
| API contracts, schema validation, SQL, auth, Git | Keep, sequence early | Python API design, schema, test, SQL query, authorization decision record |
| Prompt hierarchy, embeddings, chunking, agents | Keep, split into distinct lessons | Annotated prompt, retrieval flow, chunk design, deterministic workflow chart |
| Evaluation, model selection, observability | Keep, make central | Golden set, scorecard, regression report, tracing plan |
| Queues, Docker, deployment | Keep, reduce breadth | Production design review, failure/rollback plan rather than tool memorization |
| Stakeholder discovery, ADRs, risk registers, communication | Keep, elevate | Interview transcript, workflow map, ADR, risk register, executive summary |
| Python async and Rust ownership | Keep as implementation electives | Debugged Python async case; optional Rust error/ownership exercise |

## Lab remediation plan — 20 real labs

Each lab below should include synthetic documents, logs, snippets, datasets, expected evidence, deterministic checks, and a debrief.

1. **Prompt-injection triage** — label malicious instructions in user and retrieved content; redesign instruction/data separation.
2. **Structured-output contract** — repair invalid JSON/schema handling and produce failure responses.
3. **Citation grounding** — identify unsupported statements in answers against retrieved passages.
4. **Chunking comparison** — compare three chunk strategies against a small retrieval set.
5. **Metadata and permission filter** — prevent cross-role retrieval leakage.
6. **Hybrid retrieval tuning** — choose lexical/vector/reranking configuration from evaluation results.
7. **Stale-document conflict** — surface conflict, avoid false resolution, route to owner.
8. **Tool permission audit** — reduce an over-privileged action schema to least privilege.
9. **Approval-gate design** — place human approval and rollback boundaries in a tool workflow.
10. **Idempotency incident** — recover duplicate action attempts from synthetic audit logs.
11. **Timeout and retry analysis** — separate transient failure from unsafe repeated execution.
12. **Golden dataset design** — create representative positive, negative, adversarial, and abstention cases.
13. **Regression triage** — diagnose quality drop after prompt/model change using evaluation output.
14. **Latency/cost decision** — choose model/caching/fallback design under a stated budget and SLO.
15. **Audit-log reconstruction** — answer what happened, who approved it, and what must be retained.
16. **API validation review** — find missing input validation, error boundaries, and auth checks.
17. **Async failure diagnosis** — fix race/timeout/error-propagation behavior in a short Python service.
18. **Feature-flag rollback** — plan a safe rollout reversal from monitoring signals.
19. **AI-generated PR review** — identify security, test, and maintainability defects in generated code.
20. **Production Incident final** — no Kyra; contain a defective document assistant, restore safe mode, communicate, and write prevention items.

No “lab” should be passed with a one-option multiple-choice answer or generic 40-word response.

## Mission remediation plan — 10 multi-step scenarios

1. Skeptical engineering-team discovery.
2. Restricted-data pilot proposal.
3. Conflicting procedure investigation.
4. Procedure assistant architecture review.
5. Prototype-to-production rollout.
6. Evaluation failure investigation.
7. AI safety red-team review.
8. Cross-team priority conflict.
9. Executive implementation recommendation.
10. Capstone defense.

Every mission should have four or more stateful steps: discovery/evidence, decision, artifact, stakeholder response, revision or escalation. Include branching outcomes—especially a correct “no AI” outcome where appropriate.

## Assessment and scoring remediation

### Reality Check

The 24 questions are a good starting bank, but must be changed as follows:

- Shuffle question and answer order.
- Add explanation after the final submission, including the learner’s misconception category.
- Add at least two questions for each competency and rebalance `communication`, `foundations`, and `roleJudgment`.
- Use scenario stems with sufficient operational context; avoid quiz questions that can be answered through vocabulary recognition alone.
- Build an alternate form for retakes.

### Required work scoring

Replace the generic keyword score with activity-specific deterministic checks:

- **Diagram/architecture:** required components and valid boundary order.
- **Evaluation plan:** coverage categories, metrics, baseline, success threshold, and failure taxonomy.
- **Risk register:** impact, probability, mitigation, owner, escalation.
- **Incident response:** containment before change, evidence preservation, communication, recovery verification, prevention.
- **Project case study:** specific personal contribution, actual constraint, tradeoff, evidence, measured or honestly framed result.

Use live Kyra only as supplemental coaching. It must not be the authority that grants required completion.

## Interview preparation remediation

Replace the generated 150-question list with an authored bank:

- 40 Applied AI fundamentals and implementation questions.
- 25 RAG, retrieval, evaluation, and agents questions.
- 25 secure enterprise AI and production architecture questions.
- 20 software/API/data/debugging questions.
- 20 discovery, architecture, and technical leadership scenarios.
- 20 behavioral/project-defense questions.

Every question requires: why it is asked, what a strong answer demonstrates, common weak answer, follow-up challenge, answer structure, and rubric. At least 30 should be timed scenario prompts with artifacts or changing constraints.

## Project and capstone remediation

The two current templates are directionally strong. Improve them with:

- A role-specific project brief and synthetic source assets.
- Required architecture diagram.
- Threat/boundary review.
- Evaluation dataset and scorecard.
- Rollout plan, success measure, and rollback condition.
- Project-defense recording or transcript.
- Revision history showing feedback incorporated.

The capstone should require a single cohesive package, not an open text response:

1. Problem and workflow map.
2. AI suitability decision.
3. Data and authorization boundary.
4. Architecture diagram.
5. Prototype scope.
6. Evaluation plan and baseline.
7. Threat/risk register.
8. Human-approval and audit design.
9. Rollout/rollback plan.
10. Executive recommendation and technical defense.

## Content operations and review process

Move long-form content into versioned MDX and pair each module with typed assessment/lab data. A module cannot ship without:

- stable ID and content version;
- objective and prerequisites;
- lesson body;
- assessment items and answer explanations;
- artifact schema and rubric;
- fictional-data review flag;
- accessibility review; and
- subject-matter review owner/date.

### Authoring order

1. Reality Check remediation and all eight Crash Course blocks.
2. The 10 Fast Track modules and their 20 labs.
3. Two projects, the capstone, and project-defense workflow.
4. The authored interview bank.
5. Master Track depth and alternate scenarios.

## Content release acceptance criteria

The Applied AI Operations Engineer track is content-complete only when:

- 100% of required lessons have authored bodies and knowledge checks.
- 100% of labs include fictional input artifacts, expected evidence, and a debrief.
- 100% of missions contain branching, multi-step state.
- All question wording is individually authored; no generated variation labels remain.
- Correct answer position is randomized and explanations are shown.
- Each competency has at least three independent evidence-producing activities.
- All readiness mappings are activity-specific rather than type-wide defaults.
- At least one knowledgeable reviewer can complete the capstone and identify no material role-accuracy gaps.
- A new learner can complete the 48-hour path and produce a credible, reviewable interview packet.

## Recommended immediate next work

Do not expand additional platform features. First author the full **48-Hour Interview Sprint**, because it provides immediate value and establishes the lesson, quiz, lab, artifact, and scoring standards the rest of the track will reuse.
