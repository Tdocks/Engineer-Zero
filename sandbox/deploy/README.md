# Hosted sandbox on Hetzner (~$6/mo)

Deploys the Engineer Zero coding runner behind Caddy (auto HTTPS) on a cheap VPS.

## 1. Create the server

1. Sign up at [https://console.hetzner.cloud](https://console.hetzner.cloud)
2. **Add an SSH key** (Security → SSH Keys) — paste your public key (`cat ~/.ssh/id_ed25519.pub`)
3. **Add server**:
   - Location: Ashburn (US) or Falkenstein/Nuremberg (EU)
   - Image: **Ubuntu 24.04**
   - Type: **CX23** (2 vCPU / 4 GB) — cheapest that fits Docker well
   - Networking: public IPv4
   - SSH key: the one you added
4. Create → copy the **IPv4 address**

## 2. Point DNS

In Cloudflare → `engineer0.com` → DNS:

| Type | Name | Content | Proxy |
|------|------|---------|--------|
| A | `sandbox` | *(Hetzner IPv4)* | **DNS only** (grey cloud) |

Wait until `dig +short sandbox.engineer0.com` returns that IP.

## 3. Bootstrap from your Mac

Replace `YOUR.SERVER.IP` with the Hetzner IPv4:

```bash
# 1) Install Docker + firewall once
ssh root@YOUR.SERVER.IP 'curl -fsSL https://get.docker.com | sh && ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable'

# 2) Sync sandbox files, build image, start Caddy + runner
cd "/Users/tylerdockswell/Projects/Engineer Zero"
SANDBOX_HOST=root@YOUR.SERVER.IP SANDBOX_DOMAIN=sandbox.engineer0.com ./scripts/deploy-sandbox-hetzner.sh
```

The deploy script prints `SANDBOX_TOKEN=…` — save it.

## 4. Wire Vercel

In Vercel → `engineer-zero` → Settings → Environment Variables (Production):

| Name | Value |
|------|--------|
| `CODING_SANDBOX_PERSONAL` | `true` |
| `CODING_SANDBOX_APPROVED` | `true` |
| `CODING_SANDBOX_ENDPOINT` | `https://sandbox.engineer0.com/run` |
| `CODING_SANDBOX_TOKEN` | *(token from setup)* |

Redeploy the project after saving.

## 5. Verify

```bash
curl -s https://sandbox.engineer0.com/health
# → {"ok":true,"service":"engineer-zero-sandbox"}

# From your Mac after deploy changes:
SANDBOX_HOST=root@YOUR.SERVER.IP ./scripts/deploy-sandbox-hetzner.sh
```

Then on https://engineer0.com → Coding Developer → Code Lab → **Run visible tests**.

## Updates later

```bash
SANDBOX_HOST=root@YOUR.SERVER.IP ./scripts/deploy-sandbox-hetzner.sh
```

## Notes

- Runner is not public on 8787; only Caddy exposes 443.
- Docker socket stays on the VPS — treat this host as sensitive.
- Grey-cloud DNS (not orange) so Let’s Encrypt / Caddy can issue certs cleanly.
