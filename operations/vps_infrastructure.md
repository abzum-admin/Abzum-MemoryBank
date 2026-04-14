# VPS Infrastructure — Abzum

**The primary server hosting all Abzum production services.**

*Last updated: 2026-04-14*

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

All Docker Compose projects live under `/docker/`:

```
/docker/
├── personal-assistants/    ← Hermes agent runtime (Tier 1)
│   └── docker-compose.yml
├── paperclip/              ← Paperclip orchestration engine (Tier 1)
│   └── docker-compose.yml
└── cloudflared/            ← Cloudflare tunnel
    └── docker-compose.yml
```

All containers share a single external Docker network named `proxy`.

## Networking

| Resource | Detail |
|----------|--------|
| **Docker network** | `proxy` (external bridge, shared by all containers) |
| **Cloudflare tunnel** | `paperclip.abzum.cloud` → `paperclip` container (port 3100) |
| **Public-facing port** | None open directly; all traffic via Cloudflare tunnel |

## Management Tools

- **Hostinger MCP** — available as MCP tools in Claude Code; use for start/stop/restart/inspect containers without SSH
- **SSH** — for file edits, Docker commands, systemd management, Doppler CLI
- **systemd** — hermes container is managed by `hermes.service` (not directly by Hostinger project management)

## Key System Services

| Service | Type | Purpose |
|---------|------|---------|
| `docker.service` | systemd | Docker daemon |
| `hermes.service` | systemd | Starts hermes container via Doppler at boot |

## Notes

- All agent secrets are managed by Doppler — no `.env` files with plaintext secrets on disk
- The `proxy` network must exist before any Docker Compose project starts (it was created during initial VPS setup)
- Paperclip is healthy and managed entirely by Hostinger; do not stop it without coordination with Felix
