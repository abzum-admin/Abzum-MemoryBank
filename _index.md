---
children_hash: 10a186c1eb6b6adcb19a1a8be0bed30df8bf1f0697d5406ffd7bfe461b807962
compression_ratio: 0.1899192425508215
condensation_order: 3
covers: [company/_index.md, infrastructure/_index.md, memory/_index.md, process/_index.md, research/_index.md, strategy/_index.md, work/_index.md]
covers_token_total: 3591
summary_level: d3
token_count: 682
type: summary
---
<think>
The user wants me to create a d2 structural summary from the child entries under `work/operations/`. Let me synthesize the key information from the three entries into a concise overview while preserving the structure guidelines.
</think>

# Work Operations — Overview

## Gateway Lifecycle Management

Two procedures govern the OpenClaw gateway:

**gateway_boot_conflict_resolution.md** — BOOT.md conflicts with one-time cron wake-up on restart. Resolution: remove BOOT.md entirely. Restart recovery uses RESTART_WAKE.md + cron only.

**gateway_stop_procedure.md** — Always use `kill -15` (SIGTERM). Never use `kill -9` (SIGKILL) — breaks the cron scheduler, disrupting all scheduled tasks. Find PID via `pgrep -f openclaw`.

**Key Rule:** `kill -15` is mandatory for gateway stops.

## Operations Log (Decisions D01–D11)

| ID | Decision | Resolution |
|---|---|---|
| D01 | Platform Stack | OpenClaw + MiniMax M2.7 (default) / Claude Sonnet (complex), 80/20 cost split |
| D02 | Cloud Provider | Azure AU East Sydney — Entra Agent ID, compliance inheritance |
| D03 | AI Ops Framework | MCRA (Govern/Map/Measure/Manage) |
| D04 | Agent Workflow | Superpowers TDD workflow |
| D05 | Source of Truth | ByteRover context tree as canonical |
| D06 | CRM Strategy | Build (Next.js + PostgreSQL) over Buy for native agent integration |
| D07 | Customer Comms | Gatekeeper model via Comms Pipeline Agent until 10+ customers |
| D08 | MemoryBank Architecture | Adopted BIMemoryBank v2 |
| D09 | Context Organization | ByteRover context tree, single canonical source |
| D10 | CRM Ownership | Vijay owns CRM data; Felix owns processes |
| D11 | Comms Inheritance | Agent-to-agent inherits parent intent |

## Agent Team Actions (A42–A57)

Key systems created:
- **A42:** Change Management System
- **A43:** CMDB — centralized asset registry
- **A44:** Agent Logging Architecture
- **A45:** Sub-Agent Review Hook — mandatory parent review before delivery
- **A46:** Continuous Improvement System
- **A47:** BI & WorkIQ Intelligence Taxonomy — 9-type taxonomy
- **A48:** Process Maker Agent — centralized workflow creation
- **A49:** Agent Team Size Optimization
- **A50:** Project Planning & Management
- **A51:** Reinforced Learning Feedback Cascade
- **A52:** AI Model Internals → Company Logic
- **A53:** Agent Evaluation Methodology
- **A54:** Token Usage Tracking
- **A55:** Project Estimation & Job Costing
- **A56:** Estimation Variance BI Signals
- **A57:** AI-Native Org Structure — 5-tier enterprise model

## Key Relationships

- Logging cross-references: `gateway_stop_procedure.md` → `log.md`
- Gateway lifecycle: boot and stop procedures governing restarts
- Intelligence feedback loop: A47 → A51 → A49 → A50 → A56