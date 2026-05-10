---
id: strat-two-tier
title: Two-Tier Agent Architecture
summary: Paperclip global container + per-project containers (A71)
tags: [strategy, agents, architecture]
updated: 2026-05-09
load_priority: 60
load_lane: context
status: active
---
# Two-Tier Agent Architecture — Abzum
**A distributed, multi-agent operating system with global governance and project-level execution.**

*Version 1.0 — 2026-04-14 (rewrite from v0.1 stub, 2026-04-05)*

> This document defines the structural separation between Abzum's global agents and project-scoped agents — why the separation is fundamental, what each tier contains, and the design principles that make the system scalable, secure, and auditable.

---

## Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  TIER 1 — GLOBAL AGENTS CONTAINER                                    │
│  Always-on · Stateful · Cross-project · Policy-enforcing            │
│                                                                      │
│  Hermes runtime · OpenClaw runtime · Paperclip adapter              │
│  Global memory · Global tools · Global routing logic                │
│                                                                      │
│  "The brain of the company"                                         │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │ provision + inject full context
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│  TIER 2 — PROJECT CONTAINER  (one per project, ephemeral)           │
│  Ephemeral · Isolated · Domain-specific · Tool-rich                 │
│                                                                      │
│  Coder · Reviewer · Tester · Documentation · Domain Expert         │
│  Scrum Master · DevOps                                               │
│                                                                      │
│  "The organs of the project"                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Tier 1 — Global Agents Container

### What it contains

| Component | Role |
|-----------|------|
| **Hermes runtime** | Agent execution engine for all global profiles |
| **OpenClaw runtime** | Orchestration and coordination engine |
| **Paperclip adapter** | Company-level employee model and policy enforcement |
| **Global memory** | Hindsight shared bank + LLM Wiki + ClickHouse |
| **Global tools** | Cross-project MCP tools, admin APIs, billing, DNS, Hostinger MCP |
| **Global routing logic** | Classifies and routes incoming work to project containers |

### Meta-Agents in Tier 1

| Agent | Role |
|-------|------|
| Orchestrator | Coordinates all agent activity across all projects |
| Router | Routes requests to the appropriate project container |
| Planner | Strategic project planning and task decomposition |
| Strategy | Long-term direction and cross-project decision-making |
| Compliance | Ensures regulatory and policy adherence before work begins |
| Cost-Optimizer | Manages model selection, token usage, and budget |
| Memory Manager | Coordinates Hindsight and LLM Wiki across all projects |
| Project Allocator | Assigns work to the appropriate project team |
| RBAC | Role-based access control enforcement |
| Provisioning | Manages container spin-up, context injection, and teardown |
| Monitoring/Audit | Centralised logging and audit trail across all containers |

### Properties

- **Always-on** — never torn down between projects
- **Stateful** — holds persistent cross-project memory
- **Cross-project** — full visibility across all active and historical projects
- **Policy-enforcing** — enforces RBAC, compliance, and cost rules before any project work begins
- **Company-level decision makers** — Tier 1 agents represent the company, not any single project

### What Tier 1 holds

- **RBAC policies** — which agent can access which repo, which secrets are injected
- **Company-wide compliance rules** — security posture, data handling, audit requirements
- **Cost optimisation strategies** — model routing rules, budget allocation, free-tier utilisation
- **Provisioning logic** — how project containers are created, configured, and decommissioned
- **Global knowledge** — Hindsight shared bank, LLM Wiki institutional knowledge
- **Multi-project context** — visibility across all active and historical projects
- **Audit logs** — full history of all agent actions across the company
- **Routing heuristics** — how incoming work is classified and assigned

### Why Tier 1 must be centralised

Scattering these agents across project containers causes:

| Loss | Consequence |
|------|-------------|
| **Consistency** | Each project enforces different rules; no single source of truth |
| **Authority** | No agent has company-wide authority; governance collapses |
| **Governance** | Compliance rules applied inconsistently across projects |
| **Observability** | No unified audit trail; impossible to detect cross-project anomalies |
| **Security boundaries** | Secrets and RBAC policies leak across project scopes |

> A company needs a brain. Tier 1 is your brain.

---

## Tier 2 — Project Container

### What it contains

Project containers are provisioned on demand by Tier 1 and contain agents specific to a single project:

| Agent | Role |
|-------|------|
| **Coder** | Feature implementation, bug fixes |
| **Spec Reviewer** | Validates specs before coding begins |
| **Quality Reviewer** | Reviews code against acceptance criteria |
| **Tester** | Writes and executes test suites |
| **Documentation** | Generates and maintains project docs |
| **Domain Expert** | Insurance, e-commerce, fintech, legal — project-specific knowledge |
| **Scrum Master** | Task tracking, blockers, sprint coordination |
| **DevOps** | CI/CD, deployment, environment management |

### Properties

- **Ephemeral** — torn down cleanly when the project completes or is paused
- **Isolated** — no shared memory or filesystem with other projects
- **Domain-specific** — Hermes profiles and LLM Wiki knowledge scoped to this project's domain
- **Tool-rich** — full local MCP toolset injected by Tier 1 at provisioning time
- **Memory-local** — project-scoped Hindsight namespace, local task tracker
- **Project-scoped** — operates entirely within the boundaries set by Tier 1

### Why Tier 2 must be isolated

Project agents need direct access to:

- **Filesystem** — read/write the project codebase
- **Git** — commits, branches, PRs scoped to this repo
- **Test runners** — Jest, pytest, Playwright — in the project's environment
- **Environment variables** — `DATABASE_URL`, `API_KEY` — project-specific
- **Secrets** — per-project credentials, never shared across projects
- **Domain memory** — Hindsight namespace scoped to this project's client
- **Local MCP tools** — project-specific tools injected by Tier 1 at boot

Putting Tier 2 agents in the global container would break:

| Loss | Consequence |
|------|-------------|
| **Isolation** | Project A can read Project B's filesystem and secrets |
| **Reproducibility** | Global state bleeds into every project; no clean slate |
| **Security** | Secrets from different clients co-located; compliance violation |
| **Compliance** | GDPR and data residency requirements become unenforceable |
| **Teardown simplicity** | Can't destroy a project without affecting global state |

> A project needs its own organs. Tier 2 is your body.

---

## Why the Separation Is Fundamental

### 1. Security and RBAC

Tier 1 enforces:
- Which agents can access which repositories
- Which secrets are injected into which containers
- Which tools are allowed per project type
- Audit trail for every permission grant

Project agents operate *under* those rules — they cannot escalate their own privileges.

**Mirrors real companies:** CEO / CTO / Compliance (Tier 1) governs what Developers / Testers / PMs (Tier 2) are permitted to do.

### 2. Scalability

| Tier | Scaling strategy |
|------|-----------------|
| Tier 1 | Horizontal — more routing and planning throughput |
| Tier 2 | Vertical — more compute per project as needed |

Tier 1 stays lean and fast. Tier 2 absorbs the heavy context windows and expensive reasoning — only when a project demands it.

### 3. Isolation and Blast Radius

If a Tier 2 agent corrupts memory, crashes, loops, or misbehaves:

1. The project container is destroyed
2. A fresh container is provisioned from clean state
3. **Tier 1 is completely untouched**

This is exactly how Kubernetes isolates pods. The blast radius of any failure is bounded to one project.

### 4. Cost Optimisation

| Tier | Model strategy |
|------|---------------|
| Tier 1 | Small, fast models — routing, classification, policy checks — low inference cost |
| Tier 2 | Heavy models, high-context windows, expensive reasoning — only when a task demands it |

You don't run a 72B reasoning model for every routing decision. Tier 1 uses cheap inference per call. Tier 2 pays for expensive inference only when necessary.

### 5. Hermes Profile Cleanliness

| Tier 1 profiles | Tier 2 profiles |
|-----------------|-----------------|
| `router` | `coder` |
| `planner` | `reviewer` |
| `compliance` | `tester` |
| `cost-optimizer` | `domain-expert` |
| `provisioning` | `scrum-master` |
| `audit` | `devops` |

Profiles stay clean, predictable, and role-aligned. No single Hermes profile attempts to be both a company-level router and a project-level coder.

### 6. OpenClaw Integration

OpenClaw thrives when:
- **Global agents handle orchestration** — what needs to be done, by whom, under what rules
- **Project agents handle execution** — actually doing the work

This architecture matches OpenClaw's design philosophy: strict separation of coordination from execution.

### 7. Paperclip Company Model

Paperclip expects:
- A **stable set of employees** who represent the company and hold institutional authority (Tier 1)
- **Project-specific workers** assigned to active work who can be swapped in and out (Tier 2)

This architecture is a direct implementation of Paperclip's intended usage model.

---

## Infrastructure Mapping (Current VPS State)

```
abzum.cloud  (76.13.213.212 — KVM 2, Ubuntu 24.04, 8GB RAM)
│
├── /docker/paperclip/            ← Tier 1 (always-on)
│   └── docker-compose.yml        Paperclip orchestration engine (port 3100)
│
├── /docker/personal-assistants/  ← Tier 1 (always-on)
│   └── docker-compose.yml        Hermes agent runtime (nousresearch/hermes-agent)
│
├── /docker/cloudflared/          ← Infrastructure (tunnel — not an agent tier)
│   └── docker-compose.yml        Cloudflare tunnel → paperclip.abzum.cloud
│
└── /docker/projects/             ← Tier 2 (ephemeral, provisioned per project)
    ├── project-alpha/
    └── project-beta/
```

**Current Tier 1 status:** Paperclip (healthy, up 8 days) + Hermes (running, up 5 days).

---

## Decision Record

| Question | Decision | Rationale |
|----------|----------|-----------|
| Should global agents be stateless? | No — stateful | Hold company-wide context that must persist across projects |
| Can project agents call Tier 1 directly? | Via structured request only | Prevents privilege escalation; all Tier 1 access is mediated |
| How long does Tier 2 live? | Project duration only | Destroyed on completion; no residual state |
| Can Tier 2 have its own Hindsight namespace? | Yes — project-scoped | Isolated from global bank; Tier 1 syncs relevant learnings up |
| Who provisions Tier 2? | Tier 1 Provisioning Agent | Tier 1 injects full context, secrets, and tools at container boot |
| Where does secrets management live? | Tier 1 (injected at provision time) | Per-project credentials injected by Tier 1; Tier 2 never holds master secrets |

---

## References

- `08-strategy/persona_team_v013.md` — 17-persona project team detail (Tier 1 + Tier 2 personas with model + tool mappings)
- `05-process/persona_hermes_config.md` — Hermes ProviderProfile patterns
- `05-process/use_case_team_mapping.md` — UC → persona team mapping
- `personas/` — per-persona files
- `08-strategy/agent_orchestration.md` — End-to-end orchestration with all layers
- `05-process/memory_protocol.md` — Memory stack: Hindsight + LLM Wiki + ClickHouse
- `05-process/workflow_superpowers.md` — 6-gate Superpowers workflow within Tier 2 containers
- `06-infrastructure/03-services/agent_watcher.md` — Agent monitoring and 4-level escalation

---

*Owner: Felix Stanley (COO)*
*Version 1.0 — 2026-04-14*
*Supersedes: v0.1 stub (2026-04-05)*

---

<!-- backlinks-start -->

## Referenced by

- [ Personas Readme](../02-org/02-ai-systems/_personas_readme.md)
- [Orchestrator](../02-org/04-platform-orchestration/01-orchestration/orchestrator.md)
- [Provisioning](../02-org/04-platform-orchestration/01-orchestration/provisioning.md)
- [Rbac](../02-org/04-platform-orchestration/03-governance/rbac.md)
- [Vps Team](../02-org/04-platform-orchestration/04-vps-orchestration/vps_team.md)
- [Plan Of Action](../07-research/hermes-hindsight/plan_of_action.md)
- [Persona Team V013](persona_team_v013.md)

<!-- backlinks-end -->
