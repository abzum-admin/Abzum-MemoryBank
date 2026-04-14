# Doppler — Secrets Management

**How Abzum manages environment variables and API keys for VPS services.**

*Last updated: 2026-04-14*

---

## Overview

Doppler is the secrets manager for Abzum's VPS services. The Doppler CLI is installed on the VPS host and injects secrets directly into the `hermes` container at startup via `doppler run -- docker compose up -d`. **Secrets never touch the filesystem** — no `.env` files on disk.

This is Doppler's official recommended method for Docker Compose deployments with pre-built images.

---

## How It Works

```
Doppler vault
     │
     │  doppler run --
     ▼
systemd hermes.service
     │
     │  docker compose up -d (secrets in shell env)
     ▼
hermes container
(6 env vars injected, no .env file)
```

1. On boot, `hermes.service` (systemd) calls `doppler run -- docker compose up -d`
2. Doppler fetches secrets from the vault and injects them as shell environment variables
3. Docker Compose passes only the 6 explicitly listed vars into the container
4. The container sees them as standard env vars — no Doppler SDK needed inside

---

## Setup on the VPS

**Doppler CLI** v3.75.3 is installed on the VPS host (not inside the container):

```bash
doppler --version   # verify
```

**Service token** is scoped to `/docker/personal-assistants` so `doppler run` auto-authenticates from that directory:

```bash
# Already configured — to re-configure if needed:
HOME=/root doppler configure set token <SERVICE_TOKEN> --scope /docker/personal-assistants
```

Config stored in `/root/.doppler/.doppler.yaml`. The `HOME=/root` prefix is required in non-interactive contexts (scripts, systemd) — Doppler derives the config path from `$HOME`.

---

## Current Configuration

| Setting | Value |
|---------|-------|
| **Doppler project** | `dev_personal` |
| **Doppler config** | `dev` |
| **Authentication** | Service token (read-only, scoped to `/docker/personal-assistants`) |

### Secrets managed (6)

| Secret name | Used by |
|-------------|---------|
| `OPENROUTER_API_KEY` | Hermes — LLM routing via OpenRouter |
| `MINIMAX_API_KEY` | Hermes — MiniMax model access |
| `TELEGRAM_BOT_TOKEN` | Hermes gateway — Telegram messaging |
| `TELEGRAM_ALLOWED_USERS` | Hermes gateway — user allowlist |
| `TAVILY_API_KEY` | Hermes — Tavily search tool |
| `BRAVE_SEARCH_API_KEY` | Hermes — Brave search tool |

---

## Systemd Service

`/etc/systemd/system/hermes.service` — the authoritative way to start/stop/restart hermes:

```ini
[Unit]
Description=Hermes Agent (secrets via Doppler)
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/docker/personal-assistants
Environment=HOME=/root
ExecStart=/usr/bin/doppler run -- /usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose -f /docker/personal-assistants/docker-compose.yml down

[Install]
WantedBy=multi-user.target
```

> `Environment=HOME=/root` is required because systemd does not set `$HOME` by default, and the Doppler CLI needs it to find its config at `/root/.config/doppler/`.

---

## Behaviour on VPS Reboot

On reboot, hermes comes back correctly without any manual intervention:

1. Docker daemon starts → sees `hermes` container with `restart: unless-stopped` → restores it using **env vars stored in the container config** (set by the last `doppler run -- docker compose up -d`)
2. `hermes.service` (systemd, enabled) runs → calls `doppler run -- docker compose up -d` → container already running → no-op

Both paths result in a correctly running container with valid secrets. The only scenario requiring action after a reboot is if **secrets were rotated in Doppler between the last container start and the reboot** — in that case, run `systemctl restart hermes` once after the VPS comes back up to fetch the new values.

---

## Day-to-Day Operations

### Start / stop / restart

```bash
systemctl start hermes      # start (Doppler injects secrets)
systemctl stop hermes       # stop
systemctl restart hermes    # restart — use after any secret or config change
systemctl status hermes     # check status
journalctl -u hermes -n 50  # view systemd logs
```

### View container logs

```bash
docker logs hermes --tail 50
docker logs hermes -f        # follow live
```

### Verify secrets are injected correctly

```bash
# Check all 6 vars are present inside the container
docker exec hermes printenv OPENROUTER_API_KEY | cut -c1-10
docker exec hermes printenv TELEGRAM_BOT_TOKEN | cut -c1-10
docker exec hermes printenv TAVILY_API_KEY | cut -c1-10

# List secrets available in Doppler (names only)
cd /docker/personal-assistants && HOME=/root doppler secrets --only-names
```

### Update the hermes image

```bash
cd /docker/personal-assistants
docker compose pull           # pull latest image
systemctl restart hermes      # restart with new image (Doppler re-injects secrets)
```

### Rotate a secret

1. Update the value in the [Doppler dashboard](https://doppler.com) → `dev_personal` → `dev`
2. On the VPS: `systemctl restart hermes`

Doppler fetches the new value on the next `doppler run` invocation — no file edits needed anywhere.

### Add a new secret

1. Add the secret in Doppler dashboard (`dev_personal` / `dev` config)
2. Edit `/docker/personal-assistants/docker-compose.yml` — add the name to the `environment:` list:
   ```yaml
   environment:
     - EXISTING_SECRET
     - NEW_SECRET_NAME     # add here
   ```
3. `systemctl restart hermes`

---

## docker-compose.yml Reference

The compose file uses bare env var names (no values). Docker Compose reads them from the shell environment that `doppler run` provides:

```yaml
services:
  hermes:
    image: nousresearch/hermes-agent:latest
    container_name: hermes
    restart: unless-stopped
    command: gateway run
    environment:
      - OPENROUTER_API_KEY
      - MINIMAX_API_KEY
      - TELEGRAM_BOT_TOKEN
      - TELEGRAM_ALLOWED_USERS
      - TAVILY_API_KEY
      - BRAVE_SEARCH_API_KEY
    volumes:
      - hermes-data:/opt/data
    networks:
      - proxy

volumes:
  hermes-data:

networks:
  proxy:
    external: true
```

---

## ⚠️ Hostinger Docker Manager UI — What NOT to Do

The Hostinger Docker Manager UI (`hPanel → VPS → Docker Manager`) **must not be used** to manage the `personal-assistants` project. It is incompatible with the Doppler integration.

| Action | Why it breaks things |
|--------|---------------------|
| **Click "Deploy"** | Overwrites `docker-compose.yml` on the server with whatever the UI generates; strips Doppler-compatible config |
| **Edit env vars in the Visual Editor** | Hostinger writes these to a `.env` file on disk — bypasses Doppler entirely, secrets stored in plaintext |
| **Click "Deploy" with the yaml editor** | Even with the correct YAML, if the Environment section is empty, `${VAR}` resolves to empty strings and the container starts with no API keys |
| **Use the Start/Stop buttons** | These run plain `docker compose up/down` without Doppler — container starts with empty env vars |

**Use `systemctl` commands over SSH instead** (see Day-to-Day Operations above). The Hostinger UI is safe to use for `paperclip` and `cloudflared` which are managed natively by Hostinger.

---

## References

- `operations/docker_containers.md` — container inventory and update runbook
- `operations/vps_infrastructure.md` — VPS SSH access and layout
- Doppler official Docker Compose docs: https://docs.doppler.com/docs/docker-compose
