#!/usr/bin/env bash
# Bootstrap Docker + the Engineer Zero sandbox on a fresh Ubuntu/Debian VPS.
# Run as root (or with sudo) from the repo's sandbox/deploy directory, or after
# cloning the repo to /opt/engineer-zero.
set -euo pipefail

DOMAIN="${SANDBOX_DOMAIN:-sandbox.engineer0.com}"
REPO_ROOT="${REPO_ROOT:-/opt/engineer-zero}"
DEPLOY_DIR="${REPO_ROOT}/sandbox/deploy"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root (or: sudo bash setup-server.sh)" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git ufw

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

systemctl enable --now docker

# Firewall: SSH + HTTP/HTTPS only
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p "$(dirname "$REPO_ROOT")"

if [[ ! -f "$REPO_ROOT/sandbox/server.mjs" ]]; then
  echo "Sandbox code missing at $REPO_ROOT/sandbox."
  echo "From your Mac, either:"
  echo "  git clone https://github.com/Tdocks/Engineer-Zero.git $REPO_ROOT"
  echo "  # or sync from local:"
  echo "  SANDBOX_HOST=root@YOUR.IP ./scripts/deploy-sandbox-hetzner.sh"
  exit 1
fi

cd "$REPO_ROOT/sandbox"
docker build -f Dockerfile.python -t engineer-zero-sandbox-python:local .

cd "$DEPLOY_DIR"
if [[ ! -f .env ]]; then
  TOKEN="$(openssl rand -hex 32)"
  cat > .env <<EOF
SANDBOX_DOMAIN=${DOMAIN}
SANDBOX_TOKEN=${TOKEN}
EOF
  echo "Wrote $DEPLOY_DIR/.env (token generated)."
else
  # shellcheck disable=SC1091
  set -a && source .env && set +a
  TOKEN="${SANDBOX_TOKEN:?SANDBOX_TOKEN missing in .env}"
fi

docker compose pull
docker compose up -d

echo
echo "Sandbox is up."
echo "  Health (local):  curl -s http://127.0.0.1:8787/health"
echo "  Health (public): curl -s https://${DOMAIN}/health"
echo
echo "Set these on Vercel (Production) for engineer-zero:"
echo "  CODING_SANDBOX_PERSONAL=true"
echo "  CODING_SANDBOX_APPROVED=true"
echo "  CODING_SANDBOX_ENDPOINT=https://${DOMAIN}/run"
echo "  CODING_SANDBOX_TOKEN=${TOKEN}"
echo
echo "DNS: create A record ${DOMAIN} → this server's public IPv4 (DNS only / grey cloud)."
