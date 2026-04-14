# Docker Containers — Abzum VPS

**Inventory of all Docker Compose projects and containers on the production VPS (`abzum.cloud`).**

*Last updated: 2026-04-14*

---

## Active Containers

| Project folder | Container name | Image | Role | Status |
|----------------|---------------|-------|------|--------|
| `/docker/personal-assistants/` | `hermes` | `nousresearch/hermes-agent:latest` | AI agent runtime gateway (Tier 1) | Running — managed by Hostinger Docker Manager |
| `/docker/paperclip/` | `paperclip-1` | `ghcr.io/hostinger/hvps-paperclip:latest` | Orchestration engine (Tier 1) | Healthy — port 3100 |
| `/docker/cloudflared/` | `cloudflared-1` | `cloudflare/cloudflared:latest` | Cloudflare tunnel → `paperclip.abzum.cloud` | Running — no healthcheck (distroless image, no shell) |

All containers are connected to the external Docker network `proxy`.

---

## Hermes (`/docker/personal-assistants/`)

| Property | Value |
|----------|-------|
| **Image** | `nousresearch/hermes-agent:latest` |
| **Command** | `gateway run` |
| **Volume** | `hermes-data:/opt/data` |
| **Network** | `proxy` (external) |
| **Secrets** | Via Doppler-generated `.env` file — see `operations/doppler.md` |
| **Managed by** | Hostinger Docker Manager (native project management) |
| **Restart policy** | `unless-stopped` |

### Starting / stopping Hermes

Use the Hostinger Docker Manager UI, or via Hostinger MCP tools:

```
VPS_startProjectV1  → projectName: personal-assistants
VPS_stopProjectV1   → projectName: personal-assistants
VPS_restartProjectV1 → projectName: personal-assistants
```

Or via SSH:
```bash
cd /docker/personal-assistants && docker compose up -d    # start
cd /docker/personal-assistants && docker compose down     # stop
```

### Updating Hermes

```bash
cd /docker/personal-assistants

# 1. Pull latest image
docker compose pull

# 2. Refresh .env from Doppler (in case secrets changed)
HOME=/root doppler secrets download --format env --no-file > .env

# 3. Recreate container with new image
docker compose up -d
```

> **Note:** `hermes update` (native CLI command) does NOT work with the Docker image. Use `docker compose pull` instead.

### Rotating secrets

```bash
cd /docker/personal-assistants

# Regenerate .env from Doppler with updated values
HOME=/root doppler secrets download --format env --no-file > .env

# Recreate container to pick up new secrets
docker compose up -d
```

---

## Paperclip (`/docker/paperclip/`)

| Property | Value |
|----------|-------|
| **Image** | `ghcr.io/hostinger/hvps-paperclip:latest` |
| **Port** | 3100 (internal only, exposed via Cloudflare tunnel) |
| **Network** | `proxy` (external) |
| **Managed by** | Hostinger VPS project management |
| **Tunnel URL** | `paperclip.abzum.cloud` |

Paperclip is Hostinger's orchestration engine. Do not stop without coordination with Felix (COO).

---

## Cloudflared (`/docker/cloudflared/`)

| Property | Value |
|----------|-------|
| **Image** | `cloudflare/cloudflared:latest` |
| **Purpose** | Cloudflare Zero Trust tunnel routing `paperclip.abzum.cloud` → `paperclip:3100` |
| **Network** | `proxy` (external) |
| **Healthcheck** | None — distroless image has no shell; `CMD-SHELL` healthchecks always fail |
| **Managed by** | Hostinger VPS project management |

The health check was removed from the compose file. `restart: unless-stopped` handles crash recovery.

---

## Shared Infrastructure

| Resource | Detail |
|----------|--------|
| **Docker network `proxy`** | External bridge network shared by all three projects |
| **VPS ID** | `1423236` (use with Hostinger MCP tools) |

---

## References

- `operations/vps_infrastructure.md` — VPS server details and SSH access
- `operations/doppler.md` — Doppler secrets management setup and rotation
- `strategy/two_tier_agent_architecture.md` — Why Tier 1 containers are always-on
