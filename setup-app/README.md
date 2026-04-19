# abzum-setup-app

Browser UI that deploys and manages Abzum infrastructure modules on a VPS. Replaces [`scripts/deploy-service.sh`](../scripts/deploy-service.sh) with a Next.js web app at `setup.abzum.cloud`.

> **Status:** scaffold (Step 1 of 16). Not yet functional. See the full build plan in [`operations/setup_app.md`](../operations/setup_app.md) once it lands (Step 16), or the design doc alongside.

## Modules (planned)

| ID | Status | Source of truth |
|---|---|---|
| `hermes` | In progress (Step 3) | Port of `scripts/templates/hermes.compose.tmpl` |
| `cloudflared` | Not started | Existing container at `/docker/cloudflared` |
| `paperclip` | Not started | Existing container |
| `multica` | Future | multica.ai |

## Local development

```bash
cd setup-app
npm install
npm run dev       # Next.js on http://localhost:3000
npm run typecheck
npm run lint
npm run test
```

**Requirements for local dev:**
- Node 22+
- Docker Desktop (for the compose exec layer)
- A Doppler service token (for the Doppler exec layer)
- A Cloudflare API token with the scopes listed in [`operations/deploy_service.md`](../operations/deploy_service.md)

## Production deployment

On a fresh VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/vijaytilak/Abzum-MemoryBank-BusinessIntelligence/main/setup-app/scripts/install-setup-app.sh | sudo bash
```

See the runbook in [`operations/setup_app.md`](../operations/setup_app.md).

## Architecture

- **Next.js 15 App Router** with server actions for mutations
- **SSE** for streaming install/uninstall progress
- **SQLite + Drizzle** for installation state and audit log
- **libsodium** for at-rest secret encryption
- **dockerode** for Docker Engine API (via `/var/run/docker.sock`)
- **child_process** for Doppler CLI
- **CF Access JWT** for auth post-bootstrap; one-time bootstrap token for first-run

See [`lib/`](./lib) for the layered implementation: `db/`, `crypto/`, `docker/`, `cloudflare/`, `doppler/`, `jobs/`, `auth/`, `boot-orchestrator.ts`.

## Directory layout

```
setup-app/
├── app/                          # Next.js App Router
│   ├── (public)/bootstrap/       # first-run wizard (Step 9)
│   ├── (protected)/
│   │   ├── dashboard/            # installations list (Step 10)
│   │   ├── install/[module]/     # install form + progress (Step 11)
│   │   ├── services/[id]/        # detail + uninstall (Step 12)
│   │   └── settings/             # CF config, admin email
│   └── api/
│       ├── jobs/[id]/events/     # SSE progress stream (Step 7)
│       └── health/               # liveness probe
├── modules/                      # ModuleDef registry (Step 3)
│   ├── index.ts
│   └── hermes.ts
├── lib/
│   ├── db/                       # Drizzle schema + migrations (Step 2)
│   ├── cloudflare/               # TS port of lib/cloudflare.sh (Step 5)
│   ├── doppler/                  # TS port of lib/doppler.sh  (Step 6)
│   ├── docker/                   # dockerode wrapper (Step 4)
│   ├── auth/                     # CF Access JWT + bootstrap token (Step 13)
│   ├── boot-orchestrator.ts      # startup secret-refresh sweep (Step 8)
│   ├── jobs.ts                   # in-proc job runner + SSE pub/sub (Step 7)
│   └── crypto.ts                 # libsodium helpers (Step 2)
├── components/ui/                # shadcn/ui base components
├── scripts/install-setup-app.sh  # one-liner bootstrap (Step 15)
├── Dockerfile                    # production image (Step 14)
├── docker-compose.yml            # self-hosting compose (Step 14)
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```
