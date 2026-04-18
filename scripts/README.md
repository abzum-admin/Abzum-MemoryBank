# deploy-service — VPS deployer for docker services behind the Cloudflare tunnel

A reusable deployer that drops a Docker Compose project under `/docker/<instance>/`,
wires it to Doppler for secret injection, starts it under systemd, and adds a
routing rule to the existing remote-managed Cloudflare tunnel so the service is
reachable at a public `https://<subdomain>`.

Ships with a `hermes` template ([templates/hermes.compose.tmpl](templates/hermes.compose.tmpl))
that deploys the official two-service Hermes setup (gateway + dashboard UI) —
see [operations/doppler.md](../operations/doppler.md).

## Prerequisites (one-time, per VPS)

1. **Doppler CLI** — the script installs it automatically if missing.
2. **Cloudflare tunnel** — must already exist and be running on the VPS as the
   `cloudflared` container (remote-managed / token-based). The script only
   *adds routes* to it; it does not create tunnels.
3. **Cloudflare API token** with these scopes (create at
   <https://dash.cloudflare.com/profile/api-tokens>):
   - Account → Cloudflare Tunnel → **Edit**
   - Account → Access: Apps and Policies → **Edit**
   - Zone → DNS → **Edit** (on the zones you'll publish subdomains under)
   - Zone → Zone → **Read**
4. **Cloudflare IDs**:
   - Account ID (Cloudflare dashboard → any domain → right sidebar)
   - Tunnel ID (Zero Trust → Networks → Tunnels → click the tunnel)

The script prompts for these on first run and caches them:
- `/etc/abzum-deploy/config.env` (non-secret IDs, 644)
- `/etc/abzum-deploy/cf-token`   (API token, 600)

## Install on the VPS

```bash
REPO_URL=https://github.com/<org>/<repo>.git \
  bash <(curl -fsSL https://raw.githubusercontent.com/<org>/<repo>/main/scripts/install.sh)
```

This clones the repo to `/opt/abzum-deploy` and symlinks
`/usr/local/bin/deploy-service → /opt/abzum-deploy/scripts/deploy-service.sh`.

Re-running `install.sh` updates the checkout to the latest `main`.

## Usage

Interactive (prompts for everything):

```bash
deploy-service
```

Fully flag-driven:

```bash
deploy-service \
  --template hermes \
  --instance hermes \
  --domain hermes.abzum.com \
  --doppler-token-file /root/.doppler-tokens/hermes.txt
```

Defaults:
- `--template hermes`
- `--upstream-service <instance>-ui`
- `--upstream-port 9119`

## What happens on deploy

1. **Preflight** — install missing deps (`curl`, `jq`, `doppler`), ensure the
   `proxy` docker network exists, require root.
2. **Cloudflare config** — load cached IDs + token, or prompt + save.
3. **Prompt for instance name, domain, Doppler token** (unless passed as flags).
4. **Detect existing** — if a container with that name is already running,
   ask: *replace / skip-docker / cancel*.
5. **Scope Doppler token** to `/docker/<instance>/` so `doppler run` works
   without any flags from that directory.
6. **Render compose** — substitute `@@INSTANCE@@` etc. in
   [templates/hermes.compose.tmpl](templates/hermes.compose.tmpl). The `environment:`
   passthrough list is **auto-generated** from `doppler secrets --only-names` —
   you don't maintain the var list in two places.
7. **Render systemd unit** at `/etc/systemd/system/<instance>.service` —
   runs `doppler run -- docker compose up -d`.
8. **Pull image + start** — `docker compose pull`, `systemctl enable --now`.
9. **Cloudflare DNS** — upsert a proxied CNAME
   `<domain> → <tunnel-id>.cfargotunnel.com`.
10. **Cloudflare tunnel config** — GET the tunnel's remote-managed config, insert
    an ingress rule `{hostname: <domain>, service: http://<upstream>:<port>}`
    before the catch-all `http_status:404`, and PUT it back.
11. **Cloudflare Access** — create (or update) a self-hosted Access application
    for `<domain>`, then upsert an "Owners only" allow policy for the supplied
    email(s). Users hitting the dashboard must authenticate with Cloudflare first.
    Skip with `--access-emails none`.

## Deploying a second Hermes instance

```bash
deploy-service \
  --instance hermes-felix \
  --domain hermes-felix.abzum.com
# prompts for Doppler service token (scoped to a different Doppler config for Felix)
```

The second instance:
- Runs as containers `hermes-felix` + `hermes-felix-ui`
- Uses a separate docker volume `hermes-felix-data`
- Has its own `hermes-felix.service` systemd unit
- Has its own Doppler scope at `/docker/hermes-felix/`
- Is reachable at `https://hermes-felix.abzum.com`

Container names and the docker volume are namespaced by `--instance`, so
nothing collides with the original `hermes`.

## Removing an instance

```bash
deploy-service --instance hermes-felix --domain hermes-felix.abzum.com --remove
```

Stops + disables the systemd unit, removes the compose project and volumes,
and deletes the tunnel ingress rule. Does *not* delete the DNS CNAME
(harmless to leave; re-deploying re-uses it).

## Files this script touches

| Path | Created when | Notes |
|---|---|---|
| `/docker/<instance>/docker-compose.yml` | Every deploy | Rendered from template |
| `/etc/systemd/system/<instance>.service` | Every deploy | Starts via `doppler run` |
| `/etc/abzum-deploy/config.env` | First deploy | `CF_ACCOUNT_ID`, `CF_TUNNEL_ID` (644) |
| `/etc/abzum-deploy/cf-token` | First deploy | Cloudflare API token (600) |
| `/root/.doppler/.doppler.yaml` | Every deploy | Doppler scope records |
| Cloudflare DNS zone | Every deploy | Proxied CNAME to `.cfargotunnel.com` |
| Cloudflare tunnel config (remote) | Every deploy | Ingress rule upsert via API |

Nothing else on the VPS is modified — in particular the `cloudflared` container
and its token are left untouched.

## Troubleshooting

- **`doppler: token is invalid`** — the service token is either expired or
  scoped to the wrong project. Create a new service token in Doppler and re-run.
- **`Cloudflare API error while …` → `Authentication error`** — API token
  missing a scope. Recreate with the three scopes above.
- **`No Cloudflare zone found for <host>`** — the zone isn't in this Cloudflare
  account, or the API token doesn't have Zone:Read on it.
- **Container starts but `https://<domain>` returns 502 for the first minute** —
  normal. Remote-managed tunnel config propagates in ~30s.

## Limitations

- HTTP upstreams only (no TCP/SSH ingress in this version).
- Assumes exactly one Cloudflare tunnel on the VPS.
- Templates are hermes-specific for now; add more at `templates/<name>.compose.tmpl`
  and call `deploy-service --template <name>`.
