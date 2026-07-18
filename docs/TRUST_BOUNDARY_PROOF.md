# Trust boundary proof — Supabase RLS + Stripe enrollment

This document is the operator checklist for proving hosted learner isolation and verified enrollment. Static invariants are enforced in CI via `npm run prove:trust` (`lib/trust-boundary.ts`). Live steps below require a configured project and must be recorded before any credential language.

## Static proof (CI)

Run:

```bash
npm run prove:trust
npm test
```

Required outcomes:

- All SQL migrations `0001`–`0008` present
- RLS enabled on learner-owned tables
- Shared governance demotes assessment/progress/submission/project/interview tables to owner-read
- `content_release_reviews` is not learner-writable
- Coding Developer is not a Stripe purchasable track
- Checkout enrollment requires user id + session id + purchasable track metadata
- Empty env keeps commerce gated (`commerceConfiguration === false`)

## Live Supabase RLS proof (two learners)

1. Create a Supabase project and apply migrations `0001` through `0008` in order.
2. Enable email magic-link auth; set redirect URLs to the app origin + `/learn`.
3. Create learner A and learner B (two distinct auth users).
4. Using the service role, insert an enrollment and a `course_attempts` / `coding_attempts` row for learner A only.
5. Authenticate as learner B with the anon key + user JWT:
   - `select` on A’s enrollment / attempts must return zero rows
   - `insert`/`update` on `assessment_attempts`, `progress_records`, `submissions`, `project_case_studies`, `interview_sessions`, and `content_release_reviews` must fail
6. Authenticate as learner A:
   - owner-read rows are visible
   - mutations to evidence tables still fail from the browser client (server routes own writes)
7. Record date, project ref, and reviewer initials below.

| Check | Pass? | Date | Initials | Notes |
| --- | --- | --- | --- | --- |
| Migrations applied 0001–0008 | | | | |
| Learner B cannot read Learner A enrollment | | | | |
| Learner B cannot read Learner A coding/course attempts | | | | |
| Browser client cannot write demoted evidence tables | | | | |
| Release reviews not insertable by learners | | | | |

## Live Stripe enrollment proof

1. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, both track price IDs, and `APP_URL`.
2. Point a Stripe CLI or dashboard webhook at `/api/stripe/webhook`.
3. Sign in as a test user and start checkout for IT Support or Applied AI Operations.
4. Confirm:
   - Cancelled checkout creates **no** enrollment
   - Browser redirect to `?checkout=success` alone creates **no** enrollment
   - Only a signature-verified `checkout.session.completed` (or async success) upserts `enrollments` with `status = active` and the session id
   - Replaying the same event is idempotent (`stripe_events` duplicate short-circuit)
   - A refund path sets enrollment `status = refunded`
5. Confirm Coding Developer cannot be checked out (`isPurchasableTrack("coding-developer") === false`).

| Check | Pass? | Date | Initials | Notes |
| --- | --- | --- | --- | --- |
| Checkout 503 when env incomplete | | | | |
| Cancelled session → no enrollment | | | | |
| Redirect-only success → no enrollment | | | | |
| Verified webhook → active enrollment | | | | |
| Duplicate event idempotent | | | | |
| Refund → refunded status | | | | |
| Coding Developer not purchasable | | | | |

## Credential language gate

Do not claim commercial readiness, certificates, or job credentials until:

1. Static proof is green in CI
2. Live RLS and Stripe tables above are filled
3. Coding Developer human review packet sign-offs are recorded ([CODING_DEVELOPER_HUMAN_REVIEW_PACKET.md](CODING_DEVELOPER_HUMAN_REVIEW_PACKET.md))
4. Runtime `productReleaseScorecard` disposition is no longer blocked by missing hosted configuration
