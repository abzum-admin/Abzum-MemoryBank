---
id: infra-memory-stack-overview
title: Memory Stack Overview
summary: Three-layer memory stack — Hindsight (episodic+semantic) + LLM Wiki (procedural+decisions) + ClickHouse (analytics) + GitHub (backup). Replaces ByteRover (D16).
tags: [infrastructure, memory, hindsight, llm-wiki, clickhouse]
updated: 2026-05-10
load_priority: 60
load_lane: context
status: active
related: [exec-memory-protocol, strat-orchestration, agent-tooling-inventory]
---
# Memory Stack — Overview

> **2026-05-10 — D16 supersedes D05.** ByteRover is deprecated; Hindsight + LLM Wiki + ClickHouse + GitHub backup form the primary memory stack. Migration in flight under A74.

## The Three Layers

| Layer | System | Stores | License | Hosting |
|---|---|---|---|---|
| **Long-term episodic + semantic** | [Hindsight](hindsight.md) (Vectorize.io) | World / Experience / Opinion / Observation networks | MIT | PostgreSQL + pgvector (Azure or self-host) |
| **Procedural + decisions** | [LLM Wiki](llm_wiki.md) (Karpathy pattern) | `entities/`, `concepts/`, `procedures/`, `decisions/`, `syntheses/` | MIT | Markdown in git (zero infra) |
| **Analytics layer** | [ClickHouse](clickhouse_analytics.md) | Structured signal events (5 capture moments) | Apache 2.0 | Docker on VPS |

Plus: **[GitHub Backup](github_backup.md)** — LLM Wiki and Hindsight snapshots auto-synced to a private repo (replaces the prior ByteRover Git Sync mechanism).

## Why Three Layers?

Each system maps cleanly to a different intelligence type per the Abzum BI/WorkIQ taxonomy (A47):

- **Hindsight** = episodic + semantic + persona memory (91.4% LongMemEval coverage)
- **LLM Wiki** = procedural memory + cross-project architectural decisions
- **ClickHouse** = relational + temporal + outcome analytics layer

One-provider constraint of Hermes is satisfied: Hindsight is the external memory provider; LLM Wiki is a native Hermes skill; ClickHouse receives events via `emit_signal()` hooks outside the memory API.

## Mandatory Agent Patterns

```python
# Before every task (pre-task pattern):
memories   = await hindsight.recall(task_description)     # episodic + semantic
procedures = await llm_wiki.query(task_description)       # procedural + decisions
emit_signal("task_start", {...})                           # analytics

# After every task (post-task hook):
await hindsight.retain(task_result.summary, metadata)
if task_result.tool_call_count >= 5:
    await llm_wiki.ingest(transcript, "procedures")
if task_result.has_architectural_decision:
    await llm_wiki.ingest(decision, "decisions")
emit_signal("task_end", {...})
```

Full protocol: [`05-process/memory_protocol.md`](../../05-process/memory_protocol.md).

## Personas Who Drive It

- [Knowledge Graph Agent](../../02-org/02-ai-systems/04-knowledge-intelligence/knowledge_graph_agent.md) — curates Hindsight + LLM Wiki day-to-day
- [Search & Retrieval Agent](../../02-org/02-ai-systems/04-knowledge-intelligence/search_retrieval_agent.md) — query layer
- [Learning Agent](../../02-org/02-ai-systems/04-knowledge-intelligence/learning_agent.md) — BI feedback loop (ClickHouse → improvements)
- [Memory Manager (Tier-1)](../../02-org/04-platform-orchestration/03-governance/memory_manager.md) — cross-project policy

## Migration from ByteRover (A74)

Active ByteRover content (context tree, daily mining curates) is being migrated to LLM Wiki + Hindsight. Migration log at [`legacy_byterover.md`](legacy_byterover.md). Status: planned; depends on A41.

## Related

- [`07-research/memory-architecture/`](../../07-research/memory-architecture/) — design rationale + benchmarks (research depth)
- [`07-research/hermes-hindsight/`](../../07-research/hermes-hindsight/) — original Hermes + Hindsight research
- [`05-process/memory_protocol.md`](../../05-process/memory_protocol.md) — pre-task / post-task hook spec
- [`08-strategy/agent_orchestration.md`](../../08-strategy/agent_orchestration.md) §Memory Stack

---

<!-- backlinks-start -->

## Referenced by

- [Start Here](../../00-meta/START_HERE.md)
- [Memory Protocol](../../05-process/memory_protocol.md)
- [Clickhouse Analytics](clickhouse_analytics.md)
- [Github Backup](github_backup.md)
- [Hindsight](hindsight.md)
- [Legacy Byterover](legacy_byterover.md)
- [Llm Wiki](llm_wiki.md)
- [Agent Orchestration](../../08-strategy/agent_orchestration.md)
- [Agent Tooling Inventory](../../09-knowledge/agent_tooling_inventory.md)

<!-- backlinks-end -->
