# Engineer Zero launch checklist

## Required external configuration

- Create a Supabase project; apply `supabase/migrations/0001_engineer_zero_commercial.sql` and test RLS using two users.
- Enable email magic-link authentication and set allowed redirect URLs.
- Create Stripe one-time products for both tracks and configure server-only price IDs and webhook signing secret.
- Add verified Stripe webhook handling before treating any checkout redirect as an enrollment.
- Configure a transactional email provider for receipts, certificates, and optional reminders.
- Configure a server-only approved Kyra provider only after rate limits, enrollment validation, audit events, retention policy, and fallback testing are complete.

## Content and safety review

- Validate every activity has a stable ID, rubric, content version, competency mapping, and evidence requirement.
- Verify every scenario is fictional and contains no proprietary, sensitive, personal, export-controlled, or operationally unsafe information.
- Confirm Production Incident mode never exposes live AI coaching.
- Review all purchase, refund, access-revocation, export, account-deletion, and certificate-verification flows.
