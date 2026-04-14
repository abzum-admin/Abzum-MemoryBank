# Docker Containers — Abzum VPS

**Inventory of all Docker Compose projects and containers on the production VPS (`abzum.cloud`).**

*Last updated: 2026-04-14*

---

## Active Containers

| Project folder | Container name | Image | Role | Status |
|----------------|---------------|-------|------|--------|
| `/docker/personal-assistants/` | `hermes` | `nousresearch/hermes-agent:latest` | AI agent runtime gateway (Tier 1) | Running — managed by `hermes.service` systemd unit |
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
| **Secrets** | Injected at startup via Doppler CLI — see `operations/doppler.md` |
| **Managed by** | `systemd` — `hermes.service` (not Hostinger project management) |
| **Restart policy** | `unless-stopped` |

### Starting / stopping Hermes

```bash
systemctl start hermes    # start (injects Doppler secrets automatically)
systemctl stop hermes     # stop
systemctl restart hermes  # restart (use after config changes or updates)
systemctl status hermes   # check status
```

### Updating Hermes

```bash
cd /docker/personal-assistants
docker compose pull          # pull latest image from Docker Hub
systemctl restart hermes     # restart with new image
```

> **Note:** `hermes update` (native CLI command) does NOT work with the Docker image. Use `docker compose pull` instead.

---

## Paperclip (`/docker/paperclip/`)

| Property | Value |
|----------|-------|
| **Image** | `ghcr.io/hostinger/hvps-paperclip:latest` |
| **Port** | 3100 (internal only, exposed via Cloudflare tunnel) |
| **Network** | `proxy` (external) |
| **Managed by** | Hostinger VPS project management |
| **Tunnel URL** | `paperclip.abzum.cloud` |

Paperclip is Hostinger's orchestration engine. It coordinates project management operations on the VPS. Do not stop this service without coordination with Felix (COO).

---

## Cloudflared (`/docker/cloudflared/`)

| Property | Value |
|----------|-------|
| **Image** | `cloudflare/cloudflared:latest` |
| **Purpose** | Cloudflare Zero Trust tunnel routing `paperclip.abzum.cloud` → `paperclip:3100` |
| **Network** | `proxy` (external) |
| **Healthcheck** | None — distroless image has no shell; `CMD-SHELL` healthchecks fail |
| **Managed by** | Hostinger VPS project management |

### Known issue

The `cloudflare/cloudflared:latest` image is distroless (no shell, no `ps`). Any Docker healthcheck using `CMD-SHELL` or `ps` will always fail. The health check was removed; `restart: unless-stopped` handles crash recovery.

---

## Shared Infrastructure

| Resource | Detail |
|----------|--------|
| **Docker network `proxy`** | External bridge network shared by all three projects |
| **VPS ID** | `1423236` (use with Hostinger MCP tools) |

---

## References

- `operations/vps_infrastructure.md` — VPS server details and SSH access
- `operations/doppler.md` — How secrets are managed for the hermes container
- `strategy/two_tier_agent_architecture.md` — Why Tier 1 containers are always-on
