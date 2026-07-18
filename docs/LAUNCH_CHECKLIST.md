# Engineer Zero launch checklist

**IRC focus:** Coding Developer is the first program on the internal release candidate path ([IRC_PROGRAM_DECISION.md](IRC_PROGRAM_DECISION.md)). Career-track Fast/Master catalogs stay off commercial marketing until authored.

## Required external configuration

- Create a Supabase project; apply migrations `0001`–`0008` and complete the live RLS table in [TRUST_BOUNDARY_PROOF.md](TRUST_BOUNDARY_PROOF.md) using two learners.
- Enable email magic-link authentication and set allowed redirect URLs.
- Create Stripe one-time products for both career tracks and configure server-only price IDs and webhook signing secret. Coding Developer is not purchasable until a separate price decision.
- Prove verified Stripe webhook enrollment (never treat a checkout redirect alone as enrollment) using [TRUST_BOUNDARY_PROOF.md](TRUST_BOUNDARY_PROOF.md).
- Keep `npm run prove:trust` green in CI.
- Configure a transactional email provider for receipts, certificates, and optional reminders.
- Configure a server-only approved Kyra provider only after rate limits, enrollment validation, audit events, retention policy, and fallback testing are complete.

## Content and safety review

- Complete [CODING_DEVELOPER_HUMAN_REVIEW_PACKET.md](CODING_DEVELOPER_HUMAN_REVIEW_PACKET.md) sign-offs before any Coding Developer credential language.
- Validate every activity has a stable ID, rubric, content version, competency mapping, and evidence requirement.
- Verify every scenario is fictional and contains no proprietary, sensitive, personal, export-controlled, or operationally unsafe information.
- Confirm Production Incident mode never exposes live AI coaching.
- Review all purchase, refund, access-revocation, export, account-deletion, and certificate-verification flows.
