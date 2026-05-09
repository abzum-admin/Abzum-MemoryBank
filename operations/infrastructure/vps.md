---
id: ops-vps
title: VPS Infrastructure
summary: VPS layout and operational notes
tags: [infrastructure, vps]
updated: 2026-05-09
load_priority: 40
load_lane: reference
status: active
---
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

All Docker Compose projects live under `/docker/`. Projects managed by `abzum-setup-app` are created automatically via the browser UI; others are managed by Hostinger.

```
/docker/
├── abzum-setup-app/        ← Setup console (Next.js) — self-managed
│   └── docker-compose.yml
├── hermes-felix/           ← Hermes agent (Tier 1) — managed by abzum-setup-app
│   └── docker-compose.yml  ←   rendered by abzum-setup-app install wizard
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
| **Tunnel routes** | `setup.abzum.cloud` → `abzum-setup-app:3000`; `hermes-felix.abzum.cloud` → `hermes-felix-ui:9119`; `paperclip.abzum.cloud` → `paperclip:3100` |
| **Public-facing ports** | Port 3000 open during initial bootstrap; firewalled after setup completes |
| **CF Access** | `setup.abzum.cloud`, `hermes-felix.abzum.cloud` protected by Cloudflare Access (Google SSO) |

## Management Tools

- **Abzum Setup App** — `https://setup.abzum.cloud`; primary interface for module installs, health monitoring, uninstalls — see [setup_app.md](../procedures/setup_app.md)
- **Hostinger MCP** — `VPS_*` tools in Claude Code with `virtualMachineId: 1423236`; for start/stop/inspect
- **SSH** — `ssh root@76.13.213.212`; for emergency file edits, Docker commands, Doppler CLI
- **deploy-service** — `/usr/local/bin/deploy-service`; **deprecated** — use setup app UI instead

## Key System Services

| Service | Type | Purpose |
|---------|------|---------|
| `docker.service` | systemd | Docker daemon |
| `abzum-setup-app` | Docker (`restart: unless-stopped`) | Setup console + boot orchestrator for all managed modules |

> `hermes-felix.service` systemd unit is **deprecated**. The setup app's boot orchestrator handles Hermes startup on reboot via `doppler run -- docker compose up -d`.

## Setup app data paths (on VPS)

| Path | Contents |
|------|----------|
| `/opt/abzum-setup-app/data/setup.db` | SQLite database (installations, audit log, config) |
| `/etc/abzum-setup-app/secret` | 32-byte libsodium encryption key (mode 0600) |
| `/docker/abzum-setup-app/docker-compose.yml` | Setup app compose file (written by install script) |

## Notes

- All secrets are managed by Doppler — no `.env` files with plaintext secrets on disk
- The `proxy` network must exist before any Docker Compose project starts
- Paperclip is managed by Hostinger; do not stop it without coordination with Felix
- New module installations are managed via the setup app UI at `https://setup.abzum.cloud`
- `deploy-service.sh` is kept as a reference/emergency fallback but is deprecated for managed modules
