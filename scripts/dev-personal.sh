#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.local ]]; then
  echo "Creating .env.local from .env.example (personal sandbox defaults)…"
  cp .env.example .env.local
fi

echo "Building sandbox Python image…"
docker build -f sandbox/Dockerfile.python -t engineer-zero-sandbox-python:local sandbox

if ! curl -sf "http://127.0.0.1:8787/health" >/dev/null 2>&1; then
  echo "Starting sandbox runner on http://127.0.0.1:8787 …"
  (
    cd sandbox
    SANDBOX_TOKEN="${SANDBOX_TOKEN:-dev-local-sandbox-token}" \
    SANDBOX_PORT=8787 \
    SANDBOX_BIND=127.0.0.1 \
    SANDBOX_PYTHON_IMAGE=engineer-zero-sandbox-python:local \
      node server.mjs
  ) &
  SANDBOX_PID=$!
  echo "$SANDBOX_PID" > /tmp/engineer-zero-sandbox.pid
  for _ in $(seq 1 30); do
    if curl -sf "http://127.0.0.1:8787/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done
  if ! curl -sf "http://127.0.0.1:8787/health" >/dev/null 2>&1; then
    echo "Sandbox failed to become healthy. Is Docker Desktop running?"
    exit 1
  fi
  echo "Sandbox ready (pid $SANDBOX_PID)."
else
  echo "Sandbox already healthy on :8787."
fi

echo "Starting Next.js personal pilot…"
npm run dev
