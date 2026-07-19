#!/usr/bin/env bash
# Push sandbox code to a Hetzner VPS and restart the stack.
# Usage:
#   SANDBOX_HOST=root@YOUR.SERVER.IP ./scripts/deploy-sandbox-hetzner.sh
# Optional:
#   SANDBOX_DOMAIN=sandbox.engineer0.com
#   REMOTE_ROOT=/opt/engineer-zero
set -euo pipefail

HOST="${SANDBOX_HOST:?Set SANDBOX_HOST=engineer0-sandbox (or root@x.x.x.x)}"
REMOTE_ROOT="${REMOTE_ROOT:-/opt/engineer-zero}"
DOMAIN="${SANDBOX_DOMAIN:-sandbox.engineer0.com}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_IDENTITY="${SANDBOX_SSH_IDENTITY:-$HOME/.ssh/engineer0_hetzner}"
SSH=(ssh -i "$SSH_IDENTITY" -o IdentitiesOnly=yes)
RSYNC_SSH="ssh -i ${SSH_IDENTITY} -o IdentitiesOnly=yes"

echo "→ Sync sandbox + deploy files to ${HOST}:${REMOTE_ROOT}"
"${SSH[@]}" "$HOST" "mkdir -p '${REMOTE_ROOT}/sandbox'"
rsync -az --delete -e "$RSYNC_SSH" \
  --exclude node_modules \
  --exclude '.env' \
  --exclude 'deploy/.env' \
  "${ROOT}/sandbox/" "${HOST}:${REMOTE_ROOT}/sandbox/"

echo "→ Build Python image + restart compose"
"${SSH[@]}" "$HOST" bash -s <<EOF
set -euo pipefail
cd '${REMOTE_ROOT}/sandbox'
docker build -f Dockerfile.python -t engineer-zero-sandbox-python:local .
cd deploy
if [[ ! -f .env ]]; then
  TOKEN="\$(openssl rand -hex 32)"
  printf 'SANDBOX_DOMAIN=%s\nSANDBOX_TOKEN=%s\n' '${DOMAIN}' "\$TOKEN" > .env
  echo "Created deploy/.env"
fi
docker compose build sandbox
docker compose up -d --force-recreate
docker compose ps
curl -fsS http://127.0.0.1:8787/health || true
echo
echo "Public: curl -fsS https://${DOMAIN}/health"
grep SANDBOX_TOKEN .env
EOF

echo "Done. Copy SANDBOX_TOKEN into Vercel as CODING_SANDBOX_TOKEN."
