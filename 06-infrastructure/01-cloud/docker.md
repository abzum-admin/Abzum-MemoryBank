---
id: ops-docker
title: Docker Containers
summary: Container patterns for agent deployments
tags: [infrastructure, docker]
updated: 2026-05-09
load_priority: 40
load_lane: reference
status: active
---
# Docker Containers — Abzum VPS

**Inventory of all Docker Compose projects and containers on the production VPS (`abzum.cloud`).**

*Last updated: 2026-04-19*

---

## Active Containers

| Project folder | Container name | Image | Role | Managed by |
|----------------|---------------|-------|------|------------|
| `/docker/abzum-setup-app/` | `abzum-setup-app` | `ghcr.io/vijaytilak/abzum-setup-app:latest` | **Setup Console** — browser UI for installing/managing modules | `docker compose` (self-managed, auto-starts) |
| `/docker/hermes-felix/` | `hermes-felix` | `nousresearch/hermes-agent:latest` | **Hermes — Personal Assistant** gateway (Tier 1) | `abzum-setup-app` boot orchestrator |
| `/docker/hermes-felix/` | `hermes-felix-ui` | `nousresearch/hermes-agent:latest` | **Hermes — Personal Assistant** dashboard UI (Tier 1) | `abzum-setup-app` boot orchestrator |
| `/docker/paperclip/` | `paperclip-1` | `ghcr.io/hostinger/hvps-paperclip:latest` | Orchestration engine (Tier 1) | Hostinger Docker Manager |
| `/docker/cloudflared/` | `cloudflared-1` | `cloudflare/cloudflared:latest` | Cloudflare tunnel daemon (remote-managed) | Hostinger Docker Manager |

All containers share the external Docker network `proxy`.

> **Boot orchestration:** Managed modules (`hermes-felix`, etc.) no longer use systemd oneshot units. On every VPS reboot, the `abzum-setup-app` container starts first (via `restart: unless-stopped`) and its boot orchestrator runs `doppler run -- docker compose up -d` for all registered installations, re-fetching Doppler secrets. See [setup_app.md](../04-procedures/setup_app.md).

---

## Abzum Setup App (`/docker/abzum-setup-app/`)

| Property | Value |
|----------|-------|
| **Image** | `ghcr.io/vijaytilak/abzum-setup-app:latest` |
| **Container** | `abzum-setup-app` |
| **Network** | `proxy` (external) |
| **Port** | `3000:3000` (host-exposed for bootstrap; firewall after setup) |
| **Public URL** | `https://setup.abzum.cloud` (Cloudflare Access + Google SSO) |
| **Data** | `/opt/abzum-setup-app/data/setup.db` (SQLite) |
| **Key** | `/etc/abzum-setup-app/secret` (mode 0600, libsodium secretbox key) |
| **Restart** | `unless-stopped` |

```bash
# View logs
docker logs -f abzum-setup-app

# Restart (also re-runs boot orchestrator for all managed services)
docker restart abzum-setup-app

# Update
cd /docker/abzum-setup-app && docker compose pull && docker compose up -d
```

Full runbook: [setup_app.md](../04-procedures/setup_app.md)

---

## Hermes — Personal Assistant (`/docker/hermes-felix/`)

> **Tag:** This is the Docker setup for **Hermes — Personal Assistant**. The instance name is `hermes-felix`. The compose project runs two services: the gateway and the dashboard UI, both from the same image.
>
> **Managed by:** `abzum-setup-app` boot orchestrator (previously `hermes-felix.service` systemd unit). On VPS reboot the setup app automatically runs `doppler run -- docker compose up -d` for this installation, refreshing Doppler secrets. To install, update, or remove via the UI, see [setup_app.md](../04-procedures/setup_app.md).

| Property | Value |
|----------|-------|
| **Image** | `nousresearch/hermes-agent:latest` (same image for both services) |
| **Instance name** | `hermes-felix` |
| **Services** | `hermes-felix` (gateway) + `hermes-felix-ui` (dashboard) |
| **Commands** | `gateway run` / `dashboard --host 0.0.0.0 --no-open --port 9119 --insecure` |
| **Volume** | `hermes-felix-data:/opt/data` (bind mount `/root/.hermes`) |
| **Network** | `proxy` (external) |
| **Shared memory** | `shm_size: 1g` on the gateway — required for Playwright/Chromium browser tools |
| **Secrets** | Injected by `doppler run --` — no `.env` file on disk |
| **Managed by** | `abzum-setup-app` boot orchestrator (replaces `hermes-felix.service` systemd) |
| **Restart policy** | `unless-stopped` |
| **Public URL** | `https://hermes-felix.abzum.cloud` (Cloudflare Access + Google SSO) |
| **Doppler** | Project `hostinger-vps`, config `dev_personal` |

> **`--insecure` on the dashboard:** The Hermes dashboard refuses to bind to `0.0.0.0` without this flag. It is safe here because Cloudflare Access enforces email authentication in front of the service.

### Start / stop / restart

```bash
# Via setup app UI (preferred)
# Dashboard → hermes-felix card → Restart

# Via CLI (emergency / dev)
cd /docker/hermes-felix
doppler run --project hostinger-vps --config dev_personal -- docker compose up -d
docker compose down   # stop
docker logs -f hermes-felix  # logs
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

- `06-infrastructure/03-services/doppler.md` — Full Doppler setup, operations runbook, and Hostinger UI warnings
- `06-infrastructure/01-cloud/vps.md` — VPS server details and SSH access
- `08-strategy/two_tier_architecture.md` — Why Tier 1 containers are always-on
