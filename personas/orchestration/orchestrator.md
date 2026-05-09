---
id: persona-orchestrator
title: Orchestrator
summary: Hermes core — owns Kanban board, dispatches tasks to specialists, tracks /goal state, stitches results back
tags: [persona, orchestration, tier-1]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: orchestration
tier: 1
related: [strat-orchestration, strat-two-tier, strat-persona-v013]
---
# Orchestrator

## Function
The Orchestrator is the brain of every project — it owns the Hermes v0.13 multi-agent Kanban board, dispatches tasks to specialist personas, tracks `/goal` Ralph-loop state, and stitches results back into the project deliverable. Spawn one per active project.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go ($10/mo unmetered)
- **Why this fit**: Top of Hermes runtime fit (15/15 agentic, 11/15 reasoning). Cheapest credible Hermes orchestrator brain on the market.
- **Cost signal**: Effectively flat — included in the $10/mo OpenCode Go subscription.

## Escalation Stack — Best Performance
- **Brain**: Gemini 3.1 Pro via Vertex pay-go (~$2/$12 per 1M in/out)
- **Escalation triggers**: Multi-week project with >50 active Kanban tasks; long-context cross-task synthesis required (>200K context); the only "all-15s" agentic model — pick when project complexity outweighs cost.

## Tools / Cowork CLIs
- `kanban_*` worker toolset (Hermes v0.13 native): create / claim / progress / complete tasks
- `/goal` command (Ralph loop): run repeatedly until success criteria met
- Watcher persona feed: anomaly alerts, hash-fingerprint repeats, budget breaches
- ProviderProfile dispatch: routes to any other persona's brain via configured profile

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    orchestrator: opencode-go/glm-5.1
  best_performance:
    orchestrator: vertex/gemini-3.1-pro
```

## Inputs / Outputs
- **Upstream**: Triage / Intake (request classification) → BA (requirements doc) → Planner (decomposed Kanban tasks)
- **Downstream**: dispatches to every Tier-2 persona; reports back to Felix / Vijay via task completion + Hindsight episodic log

## Quality Gates
- Every Kanban task has a heartbeat within the configured stall window
- No zombie tasks (stale heartbeat) at end-of-day; auto-reclaim if found
- Watcher signals reviewed at every dispatch decision
- Budget breach alarm acknowledged before continuing

## Use Cases
- Joins **every** UC. The Orchestrator is the spine of project execution.

## References
- [`strategy/agent_orchestration.md`](../../strategy/agent_orchestration.md) — Layer 1 meta-agent context
- [`strategy/two_tier_architecture.md`](../../strategy/two_tier_architecture.md) — Tier 1 role definition
- [`strategy/persona_team_v013.md`](../../strategy/persona_team_v013.md) — Master persona table
- [`execution/persona_hermes_config.md`](../../execution/persona_hermes_config.md) — Hermes config patterns
