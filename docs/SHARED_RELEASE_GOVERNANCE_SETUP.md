# Shared release governance setup

Engineer Zero is an internal release candidate until qualified people have
reviewed the actual published content and the hosted controls have been
configured. This implementation records those decisions; it does not create
qualified reviewers or grant approval automatically.

## Apply the schema

Apply migrations `0001` through `0005` in order. Migration `0005` makes the
older learner-data tables read-only to browser clients and adds an immutable
release-review log. Test with two learner users and one reviewer user before
enabling any hosted claim.

## Grant reviewer roles deliberately

An operator adds an active `platform_reviewer_roles` record only after
confirming relevant qualifications. The permitted roles map to the five
release gates:

- `instructional_reviewer` → instructional design
- `technical_reviewer` → role and technical accuracy
- `accessibility_reviewer` → keyboard, contrast, reading, and assistive-technology review
- `fictional_data_reviewer` → sanitized-scenario review
- `release_manager` → final version approval

The protected `POST /api/internal/content-release-review` route checks both an
authenticated reviewer and their active role. It accepts only an item and
content version present in the server-only course registry. Browser drafts,
learner records, and UI state cannot approve content.

## Source health

The weekly `course-source-health` job records source reachability and
revalidation status for every AIO and IT lesson, lab, and mission claim. It
can flag overdue or inaccessible material, but it only writes
`author_verified`, `overdue`, or `needs_attention`; a qualified technical
review is still required before a commercial release claim.

## What still blocks release

The review record is one release input, not a release switch. Commercial
release still requires current source records, learner-pilot results,
accessibility validation, Supabase RLS verification, and the separate Stripe,
sandbox, GitHub App, and reviewer-operation approvals documented elsewhere.
