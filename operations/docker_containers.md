# Docker Containers — Abzum VPS

**Inventory of all Docker Compose projects and containers on the production VPS (`abzum.cloud`).**

*Last updated: 2026-04-19*

---

## Active Containers

| Project folder | Container name | Image | Role | Managed by |
|----------------|---------------|-------|------|------------|
| `/docker/hermes-felix/` | `hermes-felix` | `nousresearch/hermes-agent:latest` | **Hermes — Personal Assistant** gateway (Tier 1) | `hermes-felix.service` + deploy-service |
| `/docker/hermes-felix/` | `hermes-felix-ui` | `nousresearch/hermes-agent:latest` | **Hermes — Personal Assistant** dashboard UI (Tier 1) | `hermes-felix.service` + deploy-service |
| `/docker/paperclip/` | `paperclip-1` | `ghcr.io/hostinger/hvps-paperclip:latest` | Orchestration engine (Tier 1) | Hostinger Docker Manager |
| `/docker/cloudflared/` | `cloudflared-1` | `cloudflare/cloudflared:latest` | Cloudflare tunnel daemon (remote-managed) | Hostinger Docker Manager |

All containers share the external Docker network `proxy`.

---

## Hermes — Personal Assistant (`/docker/hermes-felix/`)

> **Tag:** This is the Docker setup for **Hermes — Personal Assistant**. The instance name is `hermes-felix`. The compose project runs two services: the gateway and the dashboard UI, both from the same image. The entire lifecycle (deploy, update, remove) is managed by `deploy-service` — see `operations/deploy_service.md`.

| Property | Value |
|----------|-------|
| **Image** | `nousresearch/hermes-agent:latest` (same image for both services) |
| **Instance name** | `hermes-felix` |
| **Services** | `hermes-felix` (gateway) + `hermes-felix-ui` (dashboard) |
| **Commands** | `gateway run` / `dashboard --host 0.0.0.0 --no-open --port 9119 --insecure` |
| **Volume** | Named volume `hermes-felix-data:/opt/data` (shared by both services) |
| **Network** | `proxy` (external) |
| **Shared memory** | `shm_size: 1g` on the gateway — required for Playwright/Chromium browser tools |
| **Secrets** | Injected at startup by Doppler — no `.env` file on disk |
| **Managed by** | `systemd` — `hermes-felix.service` (`doppler run -- docker compose up -d`) |
| **Restart policy** | `unless-stopped` |
| **Public URL** | `https://hermes-felix.abzum.cloud` (behind Cloudflare Access — email login required) |
| **Doppler** | Project `hostinger-vps`, config `dev_personal` |

> **`--insecure` on the dashboard:** The Hermes dashboard refuses to bind to `0.0.0.0` without this flag. It is safe here because Cloudflare Access enforces email authentication in front of the service — users must log in before reaching the dashboard.

### Start / stop / restart

```bash
systemctl start hermes-felix      # start with Doppler secret injection
systemctl stop hermes-felix       # stop
systemctl restart hermes-felix    # restart — required after any config or secret change
systemctl status hermes-felix     # check status
journalctl -u hermes-felix -n 50  # view logs
```

### View container logs

```bash
docker logs hermes-felix --tail 50      # gateway logs
docker logs hermes-felix-ui --tail 50   # dashboard logs
docker logs hermes-felix -f             # live follow
```

### Run hermes commands inside the container

```bash
docker exec -it hermes-felix bash    # opens a shell where hermes is in PATH
hermes --version
```

The compose file sets `PATH=/opt/hermes/.venv/bin:...` so `hermes` is available in any exec session.

### Update to latest image

```bash
deploy-service \
  --instance hermes-felix \
  --domain hermes-felix.abzum.cloud \
  --access-emails vijaykrishnatilak@gmail.com \
  --doppler-token-file /path/to/token \
  --yes
```

The script is idempotent — it stops the old instance, pulls the latest image, and restarts.

### Verify secrets are live inside the container

```bash
docker exec hermes-felix printenv OPENROUTER_API_KEY | cut -c1-10
docker exec hermes-felix printenv TELEGRAM_BOT_TOKEN | cut -c1-10
```

---

## ⚠️ Hostinger Docker Manager — What NOT to Do for Hermes

The Hostinger Docker Manager UI **must not be used** for any `hermes-*` project. Any action through the UI breaks the Doppler integration:

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
