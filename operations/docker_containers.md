# Docker Containers — Abzum VPS

**Inventory of all Docker Compose projects and containers on the production VPS (`abzum.cloud`).**

*Last updated: 2026-04-14*

---

## Active Containers

| Project folder | Container name | Image | Role | Managed by |
|----------------|---------------|-------|------|------------|
| `/docker/personal-assistants/` | `hermes` | `nousresearch/hermes-agent:latest` | AI agent runtime gateway (Tier 1) | `hermes.service` systemd + Doppler |
| `/docker/paperclip/` | `paperclip-1` | `ghcr.io/hostinger/hvps-paperclip:latest` | Orchestration engine (Tier 1) | Hostinger Docker Manager |
| `/docker/cloudflared/` | `cloudflared-1` | `cloudflare/cloudflared:latest` | Cloudflare tunnel → `paperclip.abzum.cloud` | Hostinger Docker Manager |

All containers share the external Docker network `proxy`.

---

## Hermes (`/docker/personal-assistants/`)

| Property | Value |
|----------|-------|
| **Image** | `nousresearch/hermes-agent:latest` |
| **Command** | `gateway run` |
| **Volume** | `hermes-data:/opt/data` |
| **Network** | `proxy` (external) |
| **Secrets** | Injected at startup by Doppler — no `.env` file on disk |
| **Managed by** | `systemd` — `hermes.service` (see `operations/doppler.md`) |
| **Restart policy** | `unless-stopped` (Docker handles reboots after initial start) |

### Start / stop / restart

```bash
systemctl start hermes      # start with Doppler secret injection
systemctl stop hermes       # stop
systemctl restart hermes    # restart — required after any config or secret change
systemctl status hermes     # check status
journalctl -u hermes -n 50  # view logs
```

### View container logs

```bash
docker logs hermes --tail 50
docker logs hermes -f        # live follow
```

### Update to latest image

```bash
cd /docker/personal-assistants
docker compose pull       # pull latest from Docker Hub
systemctl restart hermes  # restart — Doppler re-injects secrets automatically
```

### Verify secrets are live inside the container

```bash
docker exec hermes printenv OPENROUTER_API_KEY | cut -c1-10
docker exec hermes printenv TELEGRAM_BOT_TOKEN | cut -c1-10
```

---

## ⚠️ Hostinger Docker Manager — What NOT to Do for Hermes

The Hostinger Docker Manager UI **must not be used** for the `personal-assistants` project. Any action through the UI breaks the Doppler integration:

| Action | What breaks |
|--------|-------------|
| **"Deploy" button** | Overwrites `docker-compose.yml`; strips Doppler-compatible env var format |
| **Edit env vars in Visual Editor + Deploy** | Writes secrets to plaintext `.env` file; bypasses Doppler |
| **Start/Stop buttons in UI** | Runs plain `docker compose` without Doppler — container starts with empty env vars |

**Use `systemctl` commands over SSH for all hermes operations.**
The Hostinger UI is safe and correct for `paperclip` and `cloudflared`.

---

## Paperclip (`/docker/paperclip/`)

| Property | Value |
|----------|-------|
| **Image** | `ghcr.io/hostinger/hvps-paperclip:latest` |
| **Port** | 3100 (internal, exposed via Cloudflare tunnel) |
| **Network** | `proxy` (external) |
| **Managed by** | Hostinger Docker Manager |
| **Tunnel URL** | `paperclip.abzum.cloud` |

Do not stop without coordination with Felix (COO).

---

## Cloudflared (`/docker/cloudflared/`)

| Property | Value |
|----------|-------|
| **Image** | `cloudflare/cloudflared:latest` |
| **Purpose** | Zero Trust tunnel: `paperclip.abzum.cloud` → `paperclip:3100` |
| **Network** | `proxy` (external) |
| **Healthcheck** | None — distroless image has no shell; `CMD-SHELL` always fails |
| **Managed by** | Hostinger Docker Manager |

`restart: unless-stopped` handles crash recovery. The health check was intentionally removed.

---

## Shared Infrastructure

| Resource | Detail |
|----------|--------|
| **Docker network `proxy`** | External bridge shared by all three projects — must exist before any project starts |
| **VPS ID** | `1423236` (for Hostinger MCP tools) |

---

## References

- `operations/doppler.md` — Full Doppler setup, operations runbook, and Hostinger UI warnings
- `operations/vps_infrastructure.md` — VPS server details and SSH access
- `strategy/two_tier_agent_architecture.md` — Why Tier 1 containers are always-on
