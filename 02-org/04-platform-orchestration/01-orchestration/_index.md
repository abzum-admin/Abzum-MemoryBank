# generated, do not edit — see _tools/gen_indexes.py

# 01-Orchestration

## Documents

| File | Title | Summary |
|---|---|---|
| `monitoring_audit.md` | Monitoring/Audit (Tier-1 Meta-Agent) | Centralised logging + audit trail across all containers. Source of truth for "what happened". |
| `orchestrator.md` | Orchestrator | Hermes core — owns Kanban board, dispatches tasks to specialists, tracks /goal state, stitches results back |
| `project_allocator.md` | Project Allocator (Tier-1 Meta-Agent) | Assigns work to the appropriate project team — picks personas based on UC and capacity. |
| `provisioning.md` | Provisioning (Tier-1 Meta-Agent) | Spins up new project containers, injects context + tools + secrets, decommissions on completion. |
| `router.md` | Router (Tier-1 Meta-Agent) | Classifies incoming work and routes to the appropriate project container or persona team. |
| `strategy_meta.md` | Strategy-Meta (Tier-1 Meta-Agent) | Long-term direction at the platform layer; cross-project decisions; advises Felix CAIO on agent architecture evolution. |
| `watcher.md` | Watcher | Sidecar to Hermes — watches agent trace stream for stalls, hash-repeat loops, anomalous tool patterns, and budget breaches |

