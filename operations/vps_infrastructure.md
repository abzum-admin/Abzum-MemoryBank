# VPS Infrastructure — Abzum

**The primary server hosting all Abzum production services.**

*Last updated: 2026-04-19*

---

## Server Details

| Property | Value |
|----------|-------|
| **Provider** | Hostinger |
| **Hostname** | `abzum.cloud` |
| **IP Address** | `76.13.213.212` |
| **Plan** | KVM 2 — 2 vCPUs, 8 GB RAM, 100 GB disk |
| **OS** | Ubuntu 24.04 LTS with Docker pre-installed |
| **Location** | (Hostinger data centre) |

## Access

| Method | Command / Tool |
|--------|----------------|
| **SSH** | `ssh root@76.13.213.212` |
| **Hostinger MCP** | Use `VPS_*` tools with `virtualMachineId: 1423236` |
| **Hostinger Dashboard** | hPanel → VPS → abzum.cloud |

## Docker Project Layout

All Docker Compose projects live under `/docker/`. Projects managed by `deploy-service` are created automatically; others are managed by Hostinger.

```
/docker/
├── hermes-felix/           ← Hermes agent (Tier 1) — managed by deploy-service
│   └── docker-compose.yml  ←   rendered from scripts/templates/hermes.compose.tmpl
├── paperclip/              ← Paperclip orchestration engine (Tier 1)
│   └── docker-compose.yml
└── cloudflared/            ← Cloudflare tunnel daemon
    └── docker-compose.yml
```

All containers share a single external Docker network named `proxy`.

## Networking

| Resource | Detail |
|----------|--------|
| **Docker network** | `proxy` (external bridge, shared by all containers) |
| **Cloudflare tunnel ID** | `37b62a4a-33fa-4a37-9cfe-ebe4dfe8b928` |
| **Tunnel routes** | `hermes-felix.abzum.cloud` → `hermes-felix-ui:9119`; `paperclip.abzum.cloud` → `paperclip:3100` |
| **Public-facing ports** | None open directly — all traffic via Cloudflare tunnel |
| **CF Access** | `hermes-felix.abzum.cloud` protected by Cloudflare Access (email: vijaykrishnatilak@gmail.com) |

## Management Tools

- **Hostinger MCP** — `VPS_*` tools in Claude Code with `virtualMachineId: 1423236`; for start/stop/inspect
- **SSH** — `ssh root@76.13.213.212`; for file edits, Docker commands, systemd, Doppler CLI
- **deploy-service** — `/usr/local/bin/deploy-service`; use for all Hermes instance lifecycle operations

## Key System Services

| Service | Type | Purpose |
|---------|------|---------|
| `docker.service` | systemd | Docker daemon |
| `hermes-felix.service` | systemd oneshot | Starts hermes-felix containers via Doppler at boot |

## Deploy script config (on VPS)

| Path | Contents |
|------|----------|
| `/etc/abzum-deploy/config.env` | `CF_ACCOUNT_ID`, `CF_TUNNEL_ID` (non-secret, 644) |
| `/etc/abzum-deploy/cf-token` | Cloudflare API token (secret, 600) |
| `/opt/abzum-deploy/` | Git clone of this repo — source for deploy-service |

## Notes

- All agent secrets are managed by Doppler — no `.env` files with plaintext secrets on disk
- The `proxy` network must exist before any Docker Compose project starts
- Paperclip is managed by Hostinger; do not stop it without coordination with Felix
- New Hermes instances are deployed via `deploy-service` — see `operations/deploy_service.md`
