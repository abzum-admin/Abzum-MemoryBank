---
id: persona-watcher
title: Watcher
summary: Sidecar to Hermes — watches agent trace stream for stalls, hash-repeat loops, anomalous tool patterns, and budget breaches
tags: [persona, orchestration, tier-1]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: orchestration
tier: 1
related: [strat-orchestration, ops-agent-watcher, strat-persona-v013]
---
# Watcher

## Function
The Watcher is a sidecar process that tails the Orchestrator's tool-call stream looking for trouble: stuck loops (hash-fingerprint tool-call repeats), stalls (no progress over N turns), anomalous tool patterns, and budget breaches. It posts structured alerts back to the Orchestrator and escalates per the [`operations/services/agent_watcher.md`](../../operations/services/agent_watcher.md) ladder.

## Default Stack — Best Value
- **Brain**: Gemma 4 E4B via local Ollama ($0)
- **Why this fit**: Native function-calling tokens; runs in 4 GB RAM; no API cost to watch every project around the clock.
- **Cost signal**: $0 — local inference, zero metered API spend.

## Escalation Stack — Best Performance
- **Brain**: Phi-4-mini via local Ollama ($0)
- **Escalation triggers**: Need tighter reasoning chains on anomaly classification (e.g. distinguishing "agent thinking" from "agent looping"); 88.6% GSM8K precision matters when cost of a false-positive alert is high.

## Tools / Cowork CLIs
- Trace stream subscriber (Hermes v0.13 instrumentation hooks)
- Hash-fingerprint detector (in-memory; rolls 200-turn window per task)
- Budget gauge: reads ClickHouse cost events (see `execution/context_persistence.md`)
- Alert publisher → Orchestrator via Kanban `comment` + Hindsight `record_episode`

## Hermes Profile Snippet
```yaml
watcher:
  model: ollama/gemma4-e4b           # both BV and BP profiles
  # swap to ollama/phi-4-mini for BP
  cron_mode: no_agent_watchdog       # Hermes v0.13 cron mode
```

## Inputs / Outputs
- **Upstream**: Hermes trace stream (every persona feeds it)
- **Downstream**: Orchestrator (alerts) → Felix (escalations beyond L2)

## Quality Gates
- False-positive alert rate <5% rolling weekly (tracked in ClickHouse)
- Every alert posted has a `severity`, `evidence`, and `suggested_action`
- Budget breach alerts fire **before** the budget is breached, not after

## Use Cases
- Joins **every** UC alongside the Orchestrator.

## References
- [`operations/services/agent_watcher.md`](../../operations/services/agent_watcher.md) — Watcher service spec + 4-level escalation ladder
- [`strategy/agent_orchestration.md`](../../strategy/agent_orchestration.md)
- [`strategy/persona_team_v013.md`](../../strategy/persona_team_v013.md)
