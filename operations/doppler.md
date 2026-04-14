# Doppler — Secrets Management

**How Abzum manages environment variables and API keys for VPS services.**

*Last updated: 2026-04-14*

---

## Overview

Doppler is the secrets manager for Abzum's VPS services. Instead of storing API keys in `.env` files on disk, secrets live in Doppler's vault and are injected into processes at startup via the Doppler CLI.

This means:
- No plaintext secrets on the VPS filesystem
- Rotate a secret in the Doppler dashboard → restart the affected service → done
- All secrets are auditable in one place

---

## Setup on the VPS

**Doppler CLI** is installed on the VPS host (not inside containers):

```bash
# Already installed on abzum.cloud — verify with:
doppler --version
# v3.75.3
```

**Authentication** uses a service token (non-interactive, no user login required):

```bash
# Token is scoped to /docker/personal-assistants — already configured
doppler configure set token <TOKEN> --scope /docker/personal-assistants
```

The scoped config is stored in `/root/.config/doppler/`. When `doppler run` is invoked with `WorkingDirectory=/docker/personal-assistants` (as in the systemd service), it automatically picks up the correct token.

---

## Current Configuration

| Setting | Value |
|---------|-------|
| **Doppler project** | `dev_personal` |
| **Doppler config** | `dev` |
| **Service account** | Service token (read-only access to `dev_personal` project) |
| **Scope** | `/docker/personal-assistants` |

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

## How Secrets Are Injected

The `hermes.service` systemd unit wraps Docker Compose with `doppler run`:

```ini
[Service]
WorkingDirectory=/docker/personal-assistants
Environment=HOME=/root
ExecStart=/usr/bin/doppler run -- /usr/bin/docker compose up -d
```

At startup:
1. systemd calls `doppler run` in `/docker/personal-assistants`
2. Doppler reads the scoped token, fetches secrets from the vault
3. Secrets are injected as environment variables into the `docker compose up -d` process
4. Docker Compose passes `${OPENROUTER_API_KEY}` etc. into the `hermes` container

The container receives the secrets as standard environment variables — no special SDK or Doppler library needed inside the container.

---

## Rotating a Secret

1. Log in to [doppler.com](https://doppler.com) → `dev_personal` project → `dev` config
2. Update the secret value
3. On the VPS: `systemctl restart hermes`

The new value is picked up on the next `doppler run` invocation — no file edits needed.

---

## Adding a New Secret

1. Add the secret in Doppler dashboard (`dev_personal` / `dev` config)
2. Add the variable to `/docker/personal-assistants/docker-compose.yml` under `environment:`
   ```yaml
   NEW_SECRET_NAME: ${NEW_SECRET_NAME}
   ```
3. `systemctl restart hermes`

---

## Verifying Secrets Are Injected

```bash
# List all available secrets (names only)
cd /docker/personal-assistants && doppler secrets --only-names

# Spot-check a value inside the running container
docker exec hermes printenv OPENROUTER_API_KEY | cut -c1-10
```

---

## References

- `operations/docker_containers.md` — hermes container details
- `operations/vps_infrastructure.md` — VPS SSH access and layout
- Doppler docs: https://docs.doppler.com
