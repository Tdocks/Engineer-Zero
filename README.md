# Engineer Zero

Interactive, evidence-based career training for high-trust technical roles.

**Current disposition: internal draft / personal pilot.** Not a commercial credential. Human credential review is [Coming soon](docs/BACKLOG_HUMAN_REVIEW.md).

## Personal pilot (recommended)

Requires Docker Desktop running:

```bash
npm install
cp .env.example .env.local   # includes personal sandbox defaults
npm run sandbox:build
npm run sandbox:start        # terminal 1 — http://127.0.0.1:8787
npm run dev                  # terminal 2 — http://localhost:3000
```

Or one command (starts sandbox then Next):

```bash
npm run dev:personal
```

Open `/programs/coding-developer` → Code Lab → **Run visible tests**. No Supabase, Stripe, or human reviewer required.

## Programs

| Program | Kind | Status |
| --- | --- | --- |
| **Coding Developer** | Shared program (`/programs/coding-developer`) | Personal pilot + local Docker sandbox |
| Applied AI Operations Engineer | Career track (`/learn`) | Active local pilot |
| IT Support Technician | Career track (`/learn`) | Active local pilot |

## Useful commands

```bash
npm test              # Vitest domain + trust + review gates
npm run sandbox:test  # Sandbox validation (+ Docker tests when image exists)
npm run prove:trust
npm run build
```

## Docs

- [sandbox/README.md](sandbox/README.md) — local runner
- [docs/BACKLOG_HUMAN_REVIEW.md](docs/BACKLOG_HUMAN_REVIEW.md) — Coming soon commercial gates
- [docs/CODING_SANDBOX_PROVIDER_CONTRACT.md](docs/CODING_SANDBOX_PROVIDER_CONTRACT.md) — isolation contract
- [docs/PRODUCT_QUALITY_SCORECARD.md](docs/PRODUCT_QUALITY_SCORECARD.md) — release truth

## Stack

Next.js 16, React 19, TypeScript, optional Supabase/Stripe, local Docker sandbox under `sandbox/`, Vitest, Playwright.
