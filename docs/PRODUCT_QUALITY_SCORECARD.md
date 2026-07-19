# Engineer Zero — Product Quality Scorecard

## Purpose

This is the release definition for Engineer Zero’s current programs: Applied AI Operations Engineer, IT Support Technician, and the shared Coding Developer program. A completed screen, a passing build, or a browser-local completion record is not enough to mark a category strong.

## Categories

Every program is evaluated against these ten categories:

1. Instructional quality
2. Role accuracy
3. Assessment integrity
4. Simulation authenticity
5. Learner evidence
6. Interview credibility
7. UX and accessibility
8. Source governance
9. Privacy and security
10. Operational reliability

## Status definitions

- **Blocked:** a fundamental requirement is absent or unsafe to claim.
- **Partial:** useful implementation exists, but an evidence, review, integration, or pilot requirement remains.
- **Strong:** all technical, content, review, and operational requirements are supported by recorded evidence.

The runtime scorecard in `lib/release-scorecard.ts` is intentionally conservative. It may lower a status when source review, hosted configuration, or sandbox approval is absent; it does not automatically promote a status from a local completion signal.

## Current release truth

- **IRC program decision (2026-07-18):** Coding Developer is the first program pushed toward an internal release candidate. See [IRC_PROGRAM_DECISION.md](IRC_PROGRAM_DECISION.md). Applied AI Operations and IT Support remain active pilots; their Fast/Master catalogs stay off commercial claims.
- **Applied AI Operations:** structurally advanced and assessment-hardened, but still needs full content review, authenticated evidence, source-health automation, and learner-pilot validation.
- **IT Support:** Reality Check, the eight-block 48-hour Sprint, twelve evidence-led labs, and six stateful missions are protected, source-backed, and structurally validated. Do not market the full Master path as complete until human scenario review and remaining track breadth land.
- **Coding Developer:** personal pilot target with a local Docker sandbox. Human credential gates are Coming soon ([BACKLOG_HUMAN_REVIEW.md](BACKLOG_HUMAN_REVIEW.md)); solo practice does not require them.

## Commercial release gate

Commercial release requires every category for every active program to be Strong, plus recorded instructional-design, technical, accessibility, fictional-data, and release approvals. The product remains an internal draft until then.
