# deploy-service — VPS Deployer for Docker Services

**Reusable script that deploys any Docker Compose service on the VPS, wires it to Doppler for secrets, manages it via systemd, and provisions a public HTTPS route through the shared Cloudflare tunnel with optional Access protection.**

*Last updated: 2026-04-19*

---

## Installation on the VPS (one-time)

```bash
REPO_URL=https://<token>@github.com/vijaytilak/Abzum-MemoryBank-BusinessIntelligence.git \
  bash <(curl -fsSL https://raw.githubusercontent.com/vijaytilak/Abzum-MemoryBank-BusinessIntelligence/main/scripts/install.sh)
```

This clones the repo to `/opt/abzum-deploy/` and symlinks `deploy-service` into `/usr/local/bin/`.

**Update after any git push to main:**

```bash
git -C /opt/abzum-deploy pull
find /opt/abzum-deploy/scripts -type f | xargs sed -i 's/\r//'
```

The `sed` command is required because Windows git adds CRLF line endings that break bash on Linux. `.gitattributes` enforces LF in the repo but the VPS pull still needs the fix until the local Windows git config is updated.

---

## What the script does

### On `deploy` (default)

1. **Preflight** — installs missing deps (`curl`, `jq`, `doppler`), ensures the `proxy` Docker network exists, requires root.
2. **CF credentials** — loads from `/etc/abzum-deploy/config.env` (non-secret IDs) + `/etc/abzum-deploy/cf-token` (API token). Prompts and saves on first run.
3. **Deployment summary** — prints a full table of what will happen and asks for confirmation before touching anything.
4. **Doppler scope** — writes the service token to `/root/.doppler/.doppler.yaml` scoped to `/docker/<instance>/`.
5. **Compose render** — reads secret names via `doppler secrets --json | jq -r 'keys[]'`, substitutes `@@MARKERS@@` in `scripts/templates/hermes.compose.tmpl`, writes `/docker/<instance>/docker-compose.yml`.
6. **Systemd render** — writes `/etc/systemd/system/<instance>.service`.
7. **Pull + start** — `docker compose pull`, then `systemctl enable` + `systemctl restart` (restart is required for oneshot services; `enable --now` is a no-op if the unit is already active).
8. **CF DNS** — upserts a proxied CNAME `<domain> → <tunnel-id>.cfargotunnel.com`.
9. **CF tunnel ingress** — GETs remote-managed tunnel config, splices in `{hostname, service}` before the catch-all rule, PUTs it back.
10. **CF Access** — creates (or updates) a self-hosted Access app for `<domain>`, then sets an "Owners only" allow policy for the supplied email(s).

### On `--remove`

1. Checks what actually exists: systemd unit file, Docker containers, compose directory, CF tunnel ingress route, CF Access app.
2. Shows a **removal summary** with `[WILL REMOVE]` / `not found — skip` for each component.
3. Asks for confirmation.
4. Removes only what exists: CF routes → systemd → compose down -v → rm -rf compose dir.

---

## Usage

**Interactive (prompts for everything missing):**

```bash
deploy-service
```

**Fully flag-driven:**

```bash
deploy-service \
  --instance hermes-felix \
  --domain hermes-felix.abzum.cloud \
  --access-emails vijaykrishnatilak@gmail.com \
  --doppler-token-file /root/.doppler-tokens/hermes-felix.txt \
  --yes
```

**Remove an instance:**

```bash
deploy-service \
  --instance hermes-felix \
  --domain hermes-felix.abzum.cloud \
  --remove
```

**Key defaults:**

| Flag | Default |
|---|---|
| `--template` | `hermes` |
| `--upstream-service` | `<instance>-ui` |
| `--upstream-port` | `9119` |

---

## Cloudflare API token requirements

The script needs one CF API token stored at `/etc/abzum-deploy/cf-token`. Create it at `dash.cloudflare.com → My Profile → API Tokens → Create Custom Token`.

**Two policy rows required:**

| Scope | Permission | Why |
|---|---|---|
| Entire account | **Cloudflare Tunnel: Edit** (listed as "Argo Tunnel (Legacy)" in the UI) | PUT tunnel ingress config |
| Entire account | **Access: Apps and Policies: Edit** | Create/update Access apps and policies |
| Zone: `abzum.cloud` | **DNS: Edit** | Upsert proxied CNAME |
| Zone: `abzum.cloud` | **Zone: Read** | Look up zone ID from hostname |

> The "Cloudflare Tunnel" permission is found under **Cloudflare One / Zero Trust → Argo Tunnel (Legacy)** in the token editor UI.

**Update the token on the VPS:**

```bash
echo -n 'cfat_YOUR_NEW_TOKEN' > /etc/abzum-deploy/cf-token
chmod 600 /etc/abzum-deploy/cf-token
```

---

## Files on the VPS

| Path | Created when | Notes |
|---|---|---|
| `/docker/<instance>/docker-compose.yml` | Every deploy | Rendered from template |
| `/etc/systemd/system/<instance>.service` | Every deploy | `doppler run -- docker compose up -d` |
| `/etc/abzum-deploy/config.env` | First deploy | `CF_ACCOUNT_ID`, `CF_TUNNEL_ID` (644) |
| `/etc/abzum-deploy/cf-token` | First deploy | CF API token (600) |
| `/root/.doppler/.doppler.yaml` | Every deploy | Doppler scope for `/docker/<instance>/` |

---

## Templates

Located at `scripts/templates/`:

| File | Purpose |
|---|---|
| `hermes.compose.tmpl` | Two-service Hermes compose (gateway + dashboard UI) |
| `systemd.service.tmpl` | Oneshot systemd unit with `RemainAfterExit=yes` |

Add new templates as `<name>.compose.tmpl` and deploy with `--template <name>`.

### Key template detail — dashboard `--insecure`

The Hermes dashboard refuses to bind to `0.0.0.0` without `--insecure`. The template includes it because the dashboard is always behind Cloudflare Access (which enforces email auth). Without `--insecure`, `hermes-*-ui` crash-loops immediately.

---

## Deployed instances (as of 2026-04-19)

| Instance | Domain | CF Access | Doppler config |
|---|---|---|---|
| `hermes-felix` | `hermes-felix.abzum.cloud` | vijaykrishnatilak@gmail.com | `hostinger-vps / dev_personal` |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Authentication error` on CF tunnel/Access calls | API token missing `Argo Tunnel: Edit` scope | Recreate token with correct permissions |
| Compose `environment:` block has box-drawing characters | Used `doppler secrets --only-names` (outputs ASCII table) | Script now uses `--json \| jq -r 'keys[]'` — re-render |
| Script errors `unknown option readlink` | CRLF line endings from Windows git | Run `sed -i 's/\r//'` on the scripts |
| `hermes-*-ui` crashes: "Refusing to bind to 0.0.0.0" | Missing `--insecure` flag on dashboard command | Template now includes `--insecure`; re-deploy |
| `systemctl enable --now` no-ops after re-deploy | Oneshot + RemainAfterExit = already "active (exited)" | Script uses `enable` + `restart` separately |
| CF Access bypassed (no login prompt) | Existing Cloudflare Access session in browser | Test in incognito; each app has its own JWT |

---

## References

- `scripts/deploy-service.sh` — main orchestrator
- `scripts/lib/cloudflare.sh` — CF API wrappers
- `scripts/lib/doppler.sh` — Doppler scope + secret listing
- `scripts/lib/preflight.sh` — dependency checks
- `operations/doppler.md` — Doppler setup and operations runbook
- `operations/docker_containers.md` — running containers inventory
