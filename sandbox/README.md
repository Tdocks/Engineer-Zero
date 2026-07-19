# Engineer Zero local coding sandbox

Separately operated runner for the Coding Developer personal pilot. The Next.js
app never executes learner code; it posts a bounded request here.

## Requirements

- Docker Desktop (or Docker Engine) running
- Node 22+ for host-mode start (compose also uses the `node:22` image)

## Quick start

```bash
# From repo root
npm run sandbox:build
npm run sandbox:up
```

Or from this folder:

```bash
docker build -f Dockerfile.python -t engineer-zero-sandbox-python:local .
SANDBOX_TOKEN=dev-local-sandbox-token node server.mjs
```

Health check: `curl http://127.0.0.1:8787/health`

## App wiring

In `.env.local` (see root `.env.example`):

```env
CODING_SANDBOX_PERSONAL=true
CODING_SANDBOX_APPROVED=true
CODING_SANDBOX_ENDPOINT=http://127.0.0.1:8787/run
CODING_SANDBOX_TOKEN=dev-local-sandbox-token
```

Then `npm run dev` and use Coding Developer → Code Lab → Run visible tests.

## Isolation controls

Each run:

- Creates a temporary workspace, bind-mounts it read/write at `/workspace`
- Runs `engineer-zero-sandbox-python:local` with `--network none`
- Drops capabilities, uses non-root uid 10001, memory/CPU/pids limits
- Allows only `python main.py` and `python -m pytest -q`
- Truncates stdout/stderr to 32 KB and kills after ~10s
- Writes audit metadata without source bodies

## Tests

```bash
npm test                 # validation tests (always)
# with image built:
npm run build:image && npm test
```

Docker integration tests skip automatically when the python image is missing.

## Hosted (Hetzner)

Production deploy files live in [`deploy/`](deploy/). See [`deploy/README.md`](deploy/README.md).
