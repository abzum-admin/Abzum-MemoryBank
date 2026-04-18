# Docker Containers — Abzum VPS

**Inventory of all Docker Compose projects and containers on the production VPS (`abzum.cloud`).**

*Last updated: 2026-04-14*

---

## Active Containers

| Project folder | Container name | Image | Role | Managed by |
|----------------|---------------|-------|------|------------|
| `/docker/personal-assistants/` | `hermes` | `nousresearch/hermes-agent:latest` | **Hermes — Personal Assistant** gateway (Tier 1) | `hermes.service` systemd + Doppler |
| `/docker/personal-assistants/` | `hermes-dashboard` | `nousresearch/hermes-agent:latest` | **Hermes — Personal Assistant** dashboard UI (Tier 1) | `hermes.service` systemd + Doppler |
| `/docker/paperclip/` | `paperclip-1` | `ghcr.io/hostinger/hvps-paperclip:latest` | Orchestration engine (Tier 1) | Hostinger Docker Manager |
| `/docker/cloudflared/` | `cloudflared-1` | `cloudflare/cloudflared:latest` | Cloudflare tunnel → `paperclip.abzum.cloud` | Hostinger Docker Manager |

All containers share the external Docker network `proxy`.

---

## Hermes — Personal Assistant (`/docker/personal-assistants/`)

> **Tag:** This is the Docker setup for **Hermes — Personal Assistant**. The compose project runs two services: the `hermes` gateway and the optional `hermes-dashboard` UI, both built from the same image.

| Property | Value |
|----------|-------|
| **Image** | `nousresearch/hermes-agent:latest` (same image for both services) |
| **Services** | `hermes` (gateway) + `hermes-dashboard` (UI) |
| **Commands** | `gateway run` / `dashboard --host 0.0.0.0` |
| **Published ports** | `8642` (gateway API), `9119` (dashboard UI) |
| **Volume** | Bind mount `/root/.hermes:/opt/data` (shared by both services) |
| **Network** | `proxy` (external) |
| **Shared memory** | `shm_size: 1g` on the gateway — required for Playwright/Chromium browser tools |
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
docker logs hermes -f                  # live follow (gateway)
docker logs hermes-dashboard --tail 50 # dashboard logs
```

### Access URLs (on the VPS)

- Gateway API: `http://localhost:8642`
- Dashboard UI: `http://localhost:9119` (reads gateway state via `GATEWAY_HEALTH_URL=http://hermes:8642` on the `proxy` network)

### Run hermes commands inside the container

```bash
docker exec -it hermes bash    # opens a shell where hermes is in PATH
hermes --version               # works directly
```

The compose file sets `PATH=/opt/hermes/.venv/bin:...` so `hermes` is available in any exec session, not just the gateway process.

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
