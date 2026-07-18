# Applied AI Operations Engineer — Content Release Workflow

## Purpose

The Applied AI Operations Engineer curriculum uses only original instruction and fictional, sanitized enterprise scenarios. It must not be presented as a commercially released or institute-approved course until its required human reviews are complete.

## Required review sequence

1. **Author review** — verifies measurable role outcome, prerequisites, worked example, misconceptions, knowledge checks, artifact, debrief, and revision path.
2. **Instructional-design review** — checks sequencing, cognitive load, assessment alignment, accessibility of language, and whether the practice actually demonstrates the stated objective.
3. **Technical/SME review** — checks engineering accuracy, secure-AI boundaries, model/retrieval/evaluation tradeoffs, and whether a fictional scenario could teach unsafe assumptions.
4. **Accessibility review** — checks headings, keyboard path, semantics, readable contrast, unambiguous controls, and non-color-only feedback.
5. **Fictional-data review** — confirms there is no real internal, proprietary, export-controlled, personal, or operationally sensitive data.
6. **Release approval** — records content version, review evidence, owner, and decision.

## Release gate

The typed manifest records each review state. Runtime content currently carries internal-draft status. The validator deliberately fails commercial-release approval until all six states are marked approved by qualified human reviewers.

## Calibration process

Before release, run a learner pilot with at least:

- one zero-knowledge learner;
- one AI-assisted builder;
- one practitioner who can challenge technical accuracy.

Compare rubrics against reviewer scoring. Resolve ambiguous completion rules, misleading distractors, unsupported claims, accessibility defects, and scenario branches that reward unsafe choices. Add the observed failure as a permanent regression case before version approval.

## Versioning

- Keep module IDs stable.
- Increment the content version for a meaningful instruction, rubric, source, or scenario revision.
- Preserve previous attempts with their original content version.
- Do not overwrite a completed learner artifact when a module changes; prompt for a new attempt only when the learning outcome or scoring standard materially changes.
