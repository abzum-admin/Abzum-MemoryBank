---
id: infra-memory-clickhouse
title: ClickHouse Analytics
summary: Analytics layer capturing structured signals at 5 moments. Powers BI feedback loop. Apache 2.0.
tags: [infrastructure, memory, clickhouse, analytics, bi]
updated: 2026-05-10
load_priority: 45
load_lane: reference
status: active
related: [infra-memory-stack-overview, persona-learning-agent, persona-monitoring-audit]
---
# ClickHouse Analytics

**Analytics layer of the memory stack.** Apache 2.0. Self-hosted on VPS via Docker.

## The 5 Capture Moments

Every agent emits structured signals at:

1. **`task_start`** — intent + persona + brain + context
2. **`each_action`** — tool calls + token cost (BV/BP cost basis)
3. **`task_end`** — outcome + duration + handoff
4. **`user_feedback`** — persona signal from human review
5. **`periodic`** — reflect + lint, every 15 min during long tasks

## Schema (high-level)

```sql
CREATE TABLE agent_signals (
  ts DateTime64(3),
  signal_type Enum('task_start','each_action','task_end','user_feedback','periodic'),
  project_id String,
  persona_id String,
  task_id String,
  tool_call_count UInt32,
  token_cost_usd Decimal(10,6),
  duration_ms UInt32,
  outcome Enum('success','retry','fail','escalate'),
  metadata JSON
) ENGINE = MergeTree
ORDER BY (project_id, ts);
```

Full schema: [`07-research/hermes-hindsight/technical_reference.md`](../../07-research/hermes-hindsight/technical_reference.md).

## BI Feedback Loop

Drives the [Learning Agent](../../02-org/02-ai-systems/04-knowledge-intelligence/learning_agent.md):

1. **Model Routing analysis** — best brain per persona × UC type
2. **Drift detection** — agent success rate change >10% triggers alert
3. **Process optimisation** — gate-rejection patterns
4. **Cost optimisation** — burn rate, free-tier utilisation
5. **Client intelligence** — delivery quality trends per client

## Hosting

Docker on the existing Hostinger VPS (`abzum.cloud`). Per-project tenant filtering via the `project_id` column.

## Backup

Weekly Parquet export to GitHub vault per [`github_backup.md`](github_backup.md).

## Quality Gates

- Signal capture rate ≥99% (compare emitted vs received)
- Query latency p95 <500ms on dashboards
- Storage growth tracked + alerted at 80% disk

---

<!-- backlinks-start -->

## Referenced by

- [Overview](overview.md)
- [Technical Reference](../../07-research/hermes-hindsight/technical_reference.md)

<!-- backlinks-end -->
