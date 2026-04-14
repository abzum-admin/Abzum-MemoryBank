# Doppler — Secrets Management

**How Abzum manages environment variables and API keys for VPS services.**

*Last updated: 2026-04-14*

---

## Overview

Doppler is the secrets manager for Abzum's VPS services. The Doppler CLI is installed on the VPS host and used to generate a `.env` file before each container start. This is Doppler's official pattern for Docker Compose deployments — secrets live in Doppler's vault and are written to a fresh `.env` file on demand, which Docker Compose reads normally.

Hostinger's Docker Manager continues to manage the container lifecycle (start, stop, restart) — Doppler only provides the secrets file.

---

## Setup on the VPS

**Doppler CLI** v3.75.3 is installed on the VPS host (not inside containers):

```bash
# Verify installation
doppler --version
```

**Authentication** uses a service token scoped to the project directory (non-interactive, no user login required):

```bash
# Already configured — token scoped to /docker/personal-assistants
HOME=/root doppler configure set token <TOKEN> --scope /docker/personal-assistants
```

Config is stored in `/root/.config/doppler/`. The `HOME=/root` prefix is required when running outside an interactive shell (e.g., scripts).

---

## Current Configuration

| Setting | Value |
|---------|-------|
| **Doppler project** | `dev_personal` |
| **Doppler config** | `dev` |
| **Service account** | Service token (read-only) |
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

## How Secrets Are Injected (Official Pattern)

Doppler's official Docker Compose integration uses `doppler secrets download` to generate the `.env` file, which Docker Compose reads automatically at startup.

```bash
cd /docker/personal-assistants

# Step 1: Generate .env from Doppler vault
HOME=/root doppler secrets download --format env --no-file > .env

# Step 2: Start the container (Hostinger Docker Manager or directly)
docker compose up -d
```

Docker Compose reads `.env` from the project directory and passes the mapped variables into the container. The container receives them as standard environment variables — no Doppler SDK needed inside the container.

---

## Rotating a Secret

1. Log in to [doppler.com](https://doppler.com) → `dev_personal` project → `dev` config
2. Update the secret value
3. On the VPS — regenerate `.env` and recreate the container:

```bash
cd /docker/personal-assistants
HOME=/root doppler secrets download --format env --no-file > .env
docker compose up -d
```

---

## Adding a New Secret

1. Add the secret in Doppler dashboard (`dev_personal` / `dev` config)
2. Add the variable to `/docker/personal-assistants/docker-compose.yml` under `environment:`:
   ```yaml
   NEW_SECRET_NAME: ${NEW_SECRET_NAME}
   ```
3. Regenerate `.env` and restart:
   ```bash
   cd /docker/personal-assistants
   HOME=/root doppler secrets download --format env --no-file > .env
   docker compose up -d
   ```

---

## Verifying Secrets Are Injected

```bash
# List all secrets available in Doppler (names only)
cd /docker/personal-assistants && HOME=/root doppler secrets --only-names

# Spot-check a value inside the running container
docker exec hermes printenv OPENROUTER_API_KEY | cut -c1-10
```

---

## References

- `operations/docker_containers.md` — hermes container details and update runbook
- `operations/vps_infrastructure.md` — VPS SSH access and layout
- Doppler Docker Compose docs: https://docs.doppler.com/docs/docker-compose
