# Internal Release Candidate — Program Decision

**Decision date:** 2026-07-18  
**Decision:** Coding Developer is the first program pushed toward an internal release candidate (IRC).

## Why Coding Developer first

| Criterion | Coding Developer | IT Support Sprint | AIO Sprint |
| --- | --- | --- | --- |
| Authored depth of the publishable slice | Four-day path + continuation + simulators | Reality Check + 8-block Sprint + labs/missions | Sprint + Course Runner; Fast/Master uneven |
| Local prototype evidence | Runnable projects under `prototypes/` | Scenario workbenches | Selected prototypes |
| Honest outcome language | Explicitly limits credential claims | Strong for authored slice | Strong thesis; accreditation still blocked |
| Shared leverage | Feeds AIO Foundation and IT scripting imports | Track-specific | Track-specific |
| Remaining commercial blockers | Sandbox, authenticated evidence, source technical approval, human review | Fast/Master authoring + hosted trust | Full authored packages + hosted trust |

Coding Developer is already the strongest local pilot. Finishing its IRC path (authenticated evidence, source technical approval, five human gates) creates reusable trust infrastructure for the career tracks without waiting on Fast/Master catalog authoring.

## Explicitly deferred

- **IT Support** and **Applied AI Operations** remain active local pilots. Their Fast/Master catalogs stay off the marketing and commercial path until authored packages meet the track template content contract.
- No program may advertise a job-readiness or commercial credential while the product disposition remains `internal-draft`.

## Success criteria for Coding Developer IRC

1. Trust boundary proof passes in CI (static RLS + Stripe enrollment invariants).
2. Hosted Supabase migrations `0001`–`0008` applied; two-learner RLS isolation verified and recorded.
3. Stripe checkout + verified webhook enrollment proven in a non-production environment (career-track purchase path; Coding Developer remains non-purchasable until a separate price decision).
4. Human review packet for the Coding Developer publishable surface completed for instructional design, technical SME, accessibility, and fictional data, with a release manager ready to record approvals.
5. Runtime `productReleaseScorecard` has no `blocked` signals attributable to missing hosted configuration for the IRC environment.

## Owner

This decision is recorded for Engineer Zero release planning. Change it only by updating this document and `lib/irc-program.ts` together.
