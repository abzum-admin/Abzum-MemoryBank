---
id: ops-proc-setup-app
title: Setup App Procedure
summary: Procedure for app setup
tags: [procedures, setup]
updated: 2026-05-09
load_priority: 35
load_lane: reference
status: active
---
# Abzum Setup App — Runbook

**Browser-based operations console for deploying and managing Docker-based modules on the VPS. Replaces the `deploy-service.sh` bash script with a Next.js 15 web application secured by Cloudflare Access.**

*Last updated: 2026-04-19*

---

## Architecture

```
Browser → https://setup.abzum.cloud (CF tunnel + Access + Google SSO)
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│  abzum-setup-app  (Next.js 15, Docker container)        │
│  • Bootstrap wizard (first-run, one-time token)         │
│  • Dashboard — installed modules + health               │
│  • Install wizard — form → summary → SSE progress       │
│  • Service detail — logs, uninstall                     │
│  • Settings — all operator config, no hardcoded values  │
└──────┬───────────┬──────────┬───────────────────────────┘
       ▼           ▼          ▼
   Docker API   CF API    Doppler CLI
  (/var/run/   (fetch)   (child_process)
  docker.sock)
       │
       ▼
  Managed services on host
  /docker/<instance>/docker-compose.yml
  (restart: unless-stopped)

  SQLite: /opt/abzum-setup-app/data/setup.db
  Key:    /etc/abzum-setup-app/secret  (mode 0600)
```

### Host bind mounts

| Mount | Purpose |
|---|---|
| `/opt/abzum-setup-app/data` | SQLite database (installations, audit log, config) |
| `/etc/abzum-setup-app/secret` | 32-byte libsodium encryption key (read-only) |
| `/var/run/docker.sock` | Docker Engine API (compose up/down/logs) |
| `/docker` | Managed service compose directories |
| `/root/.doppler` | Doppler CLI scope config (read-only) |

---

## First-time bootstrap (fresh VPS)

### 1. Run the install script

```bash
curl -fsSL https://raw.githubusercontent.com/vijaytilak/Abzum-MemoryBank-BusinessIntelligence/main/setup-app/scripts/install-setup-app.sh | sudo bash
```

The script:
1. Installs Docker Engine if not present
2. Creates the `proxy` Docker network
3. Creates `/opt/abzum-setup-app/data`, `/etc/abzum-setup-app`, `/docker`
4. Generates a 32-byte encryption key → `/etc/abzum-setup-app/secret` (mode 0600)
5. Generates a one-time bootstrap token (`abzs_...`) and its SHA3-256 hash
6. Writes `/docker/abzum-setup-app/docker-compose.yml`
7. Pulls `ghcr.io/vijaytilak/abzum-setup-app:latest` and starts the container
8. Injects the token hash into SQLite
9. Prints the bootstrap URL and the one-time token

**The bootstrap token is printed once and never stored in plain text. Copy it immediately.**

### 2. Complete the wizard

Navigate to `http://<VPS-IP>:3000/bootstrap` and complete the 5-step wizard:

| Step | What happens |
|---|---|
| 1 Bootstrap token | Verify the one-time token. Invalidated on first use in production. |
| 2 Doppler setup | Enter the Doppler service token for the setup app's own project (holds CF secrets). |
| 3 Secrets validation | Confirm `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `CF_TUNNEL_ID` are present in Doppler. |
| 4 App domain | Enter the setup console domain (e.g. `setup.abzum.cloud`). Provisions DNS CNAME, tunnel ingress, CF Access app + policy, login branding. |
| 5 Ready | Marks bootstrap complete. Redirects to `https://<domain>/dashboard`. |

After step 4, access is via `https://setup.abzum.cloud` (Google SSO via Cloudflare Access). Port 3000 can be firewalled off.

---

## Module installation

### Via the UI

1. Navigate to **Dashboard → Install Module**.
2. Select a module (e.g. Hermes).
3. Fill the install form:
   - **Instance ID** — slug used for container names and `/docker/<id>/` directory
   - **Domain** — public FQDN (pre-filled from Settings → Cloudflare domain suffix)
   - **Doppler project / config** — the module's own Doppler project holding its API keys
   - **Allowed emails** — CF Access allow-list (defaults to Settings → Admin emails)
4. Click **Review deployment plan** — shows a summary of everything that will be provisioned.
5. Click **Deploy** — redirected to the SSE progress page showing each step in real time.

### Install steps

| Step | What happens |
|---|---|
| Pre-flight checks | Runs module's `preInstallChecks` (format validation, etc.) |
| Doppler validation | Verifies required secrets are present in the module's Doppler config |
| Render compose | Generates `docker-compose.yml` and writes it to `/docker/<id>/` |
| Image pull | `docker compose pull` |
| Compose up | `doppler run -- docker compose up -d` (secrets injected at runtime) |
| DNS | CF CNAME record: `<domain>` → tunnel |
| Tunnel ingress | CF tunnel ingress: `<domain>` → `<id>-ui:<port>` |
| Access app | CF Access application for `<domain>` |
| Access policy | Email allow-list added to the Access app |
| Login branding | CF login page branded with app name |
| Verify | `containerHealthFromState` check |

On success: installation row written to SQLite, audit log entry added, public URL shown.

---

## Module uninstall

1. Navigate to **Dashboard → [service card]** → **Service detail** page.
2. Click **Uninstall** in the danger zone.
3. Review the removal summary (lists every resource that will be deleted).
4. Optionally check **Also delete Docker volume** (permanent data loss).
5. Click **Confirm Uninstall** — redirected to uninstall progress page.

Uninstall steps mirror install in reverse:
- Remove CF Access app
- Remove CF tunnel ingress
- Remove DNS CNAME
- `docker compose down`
- Remove `/docker/<id>/` from disk
- Delete installation row from SQLite + audit log entry

---

## Boot orchestration (replaces systemd)

On every container start, the setup app's instrumentation hook (`instrumentation.ts`) runs the boot orchestrator:

1. Reads all `installations` rows with `status = 'running'` from SQLite.
2. Topologically sorts by `dependencies`.
3. For each: `doppler run -- docker compose -f /docker/<id>/docker-compose.yml up -d`

This re-fetches Doppler secrets on every container restart, replacing the old `hermes.service` systemd oneshot unit. **Secrets are always fresh after a reboot.**

---

## Settings

All operator-configurable values live in **Settings → Configuration** (no hardcoded defaults in code):

| Section | Key | Purpose |
|---|---|---|
| Application | Console name | Shown in sidebar and CF login branding |
| Application | Console domain | Public URL of this setup app |
| Application | Admin emails | CF Access allow-list for all modules |
| Cloudflare | Default domain suffix | Pre-fills install form domain field (e.g. `.abzum.cloud`) |
| Cloudflare | Auth domain | `*.cloudflareaccess.com` — auto-populated after first CF Access app |
| Doppler | Setup project / config | The setup app's own Doppler project |
| Doppler | Default module project template | Pre-fills install form (supports `{module_id}` token) |
| Doppler | Default module config | Pre-fills install form |
| Module defaults | Upstream port | Default container port for tunnel routing (9119) |

---

## Database

SQLite at `/opt/abzum-setup-app/data/setup.db`.

### Tables

| Table | Purpose |
|---|---|
| `installations` | One row per deployed module instance |
| `cloudflare_config` | Single row: accountId, tunnelId, authDomain |
| `doppler_service_tokens` | Encrypted Doppler tokens (scope = "setup" or instance ID) |
| `audit_log` | Append-only log of every mutating operation |
| `setup_config` | Key-value store for bootstrap flags and settings |

Secrets in `doppler_service_tokens.token_enc` are encrypted with XSalsa20-Poly1305 (libsodium secretbox). Key is at `/etc/abzum-setup-app/secret`.

### Inspect

```bash
# On the VPS host:
sqlite3 /opt/abzum-setup-app/data/setup.db ".tables"
sqlite3 /opt/abzum-setup-app/data/setup.db "SELECT id, module_id, domain, status FROM installations;"
sqlite3 /opt/abzum-setup-app/data/setup.db "SELECT action, status, created_at FROM audit_log ORDER BY created_at DESC LIMIT 20;"

# Or from inside the container:
docker exec -it abzum-setup-app sqlite3 /opt/abzum-setup-app/data/setup.db ".tables"
```

---

## Container management

```bash
# View logs
docker logs -f abzum-setup-app

# Restart (also re-runs boot orchestrator, refreshing all module secrets)
docker restart abzum-setup-app

# Update to latest image
cd /docker/abzum-setup-app
docker compose pull
docker compose up -d

# Tail with timestamps
docker logs --timestamps --tail 100 abzum-setup-app
```

---

## Secrets management

The setup app itself does NOT use Doppler for its own startup. Its one secret is the encryption key at `/etc/abzum-setup-app/secret`.

Managed modules get their secrets via `doppler run --` injected at container start time. The Doppler CLI auth token for each module is stored encrypted in SQLite.

### Rotate the setup app's Doppler service token

1. Generate a new service token in the Doppler dashboard.
2. In the setup app, navigate to **Settings → Doppler** and update the token.
   (The bootstrap wizard page also has a "Re-configure Doppler" link.)

### Rotate the encryption key (destructive)

```bash
# WARNING: rotating the key invalidates all encrypted tokens in the DB.
# You must re-enter all Doppler service tokens after rotating.

# 1. Stop the setup app
docker stop abzum-setup-app

# 2. Generate a new key
openssl rand -base64 32 | tr -d '\n' > /etc/abzum-setup-app/secret.new
chmod 600 /etc/abzum-setup-app/secret.new

# 3. Replace the key
mv /etc/abzum-setup-app/secret.new /etc/abzum-setup-app/secret

# 4. Clear encrypted tokens from DB
sqlite3 /opt/abzum-setup-app/data/setup.db \
  "DELETE FROM doppler_service_tokens;"

# 5. Restart and re-enter tokens via the UI
docker start abzum-setup-app
```

---

## Troubleshooting

### Setup app won't start

```bash
docker logs abzum-setup-app
# Common causes:
# - /etc/abzum-setup-app/secret missing or wrong length
# - /var/run/docker.sock not mounted (docker.sock permission error)
# - Port 3000 already in use
```

### Bootstrap wizard loops / can't proceed

```bash
# Check DB state
docker exec abzum-setup-app sqlite3 /opt/abzum-setup-app/data/setup.db \
  "SELECT key, value FROM setup_config;"

# Reset bootstrap state (re-run wizard from step 1)
docker exec abzum-setup-app sqlite3 /opt/abzum-setup-app/data/setup.db \
  "DELETE FROM setup_config WHERE key LIKE 'bootstrap_%';"
docker restart abzum-setup-app
```

### Managed service containers not starting after VPS reboot

The boot orchestrator runs on setup-app startup. If a managed service fails:

```bash
# Check orchestrator logs
docker logs abzum-setup-app | grep orchestrator

# Manually bring up a service (from the VPS host)
cd /docker/<instance-id>
doppler run -- docker compose up -d

# Or via the setup app UI: Dashboard → service card → Restart
```

### CF Access JWT rejected (401 on protected routes)

```bash
# Verify auth domain is configured
docker exec abzum-setup-app sqlite3 /opt/abzum-setup-app/data/setup.db \
  "SELECT auth_domain FROM cloudflare_config LIMIT 1;"

# Check container env
docker exec abzum-setup-app printenv CF_AUTH_DOMAIN
```

---

## Relationship to deploy-service.sh

| Concern | deploy-service.sh | setup-app |
|---|---|---|
| Transport | SSH + bash | Browser (HTTPS) |
| Auth | SSH key | CF Access + Google SSO |
| Secret injection | Doppler CLI (systemd) | Doppler CLI (boot orchestrator) |
| State | None (stateless bash) | SQLite (full audit trail) |
| Progress | Terminal output | SSE stream in browser |
| Status | `hermes.service` systemctl | Docker container health |

`deploy-service.sh` is kept as a reference/fallback. It is deprecated for any service managed by the setup app.

---

<!-- backlinks-start -->

## Referenced by

- [Docker](../01-cloud/docker.md)
- [Vps](../01-cloud/vps.md)

<!-- backlinks-end -->
