# Coding Developer institute workflow setup

The Coding Developer program remains an internal pilot until every item below
is configured, tested, and independently approved. No environment variable or
database migration by itself creates a commercial credential.

## Trusted learner evidence

1. Apply migrations `0001` through `0004` to the production Supabase project.
2. Run cross-user RLS tests with two real test users; learner A must never read
   or write learner B's attempts, GitHub evidence, packets, or drafts.
3. Configure magic-link authentication and active enrollment checks before
   enabling server-owned assessment, sandbox, GitHub, or review actions.

## GitHub App

Create a GitHub App rather than storing learner OAuth tokens. Request only:

- repository metadata: read;
- contents: read/write for a learner-selected repository;
- pull requests: read/write;
- commit statuses/checks: read;
- webhooks for installation, push, pull-request, and pull-request-review.

The App must require a learner-selected installation and repository. It must
not receive organization-wide repository access. Store only installation and
repository metadata in Supabase; the private key remains server-only.

## Reviewer operations

An operator grants a reviewer role through the protected service workflow,
then assigns only eligible evidence packets. Reviewers must record a decision,
rubric evidence, revision request, and note. The first launch should use at
least two qualified reviewers to calibrate a shared sample before approving
learner credentials.

## Source governance

Run the protected revalidation job on a schedule. It identifies overdue or
changed sources, records a review record, and blocks affected content from a
commercial release until a qualified technical/content reviewer resolves it.
