---
id: cdo-ki-watcher
title: Watcher Agent
summary: Lightweight cross-cutting observer — logs agent actions, detects anomalies, feeds self-improvement loop
tags: [cdo, knowledge, l4, orchestration]
updated: 2026-05-13
load_priority: 60
load_lane: reference
status: active
discipline: orchestration
tier: L4
related: [strat-persona-v013]
---
# Watcher Agent

## Function
The Watcher is a lightweight, cross-cutting observer deployed alongside key agents. It logs actions, flags anomalies (hallucination gate, zombie detection), and feeds the self-improvement loop via Learning & Improvement. Zero cost — runs on local models.

## Default Stack — Best Value
- **Brain**: Gemma 4 E4B via Ollama (local, **$0**)
- **Why**: Watcher is always-on; local model eliminates API cost. Cron mode (`no_agent_watchdog`) for heartbeat.

## Escalation Stack — Best Performance
- **Brain**: Phi-4-mini via Ollama (local, **$0**)
- **Both profiles are $0** — Watcher runs locally regardless of subscription tier.

## Hermes Config
```yaml
watcher:
  model: ollama/gemma4-e4b          # BV profile
  # swap to phi-4-mini for BP
  cron_mode: no_agent_watchdog
  heartbeat_interval: 30s
  zombie_timeout: 5m
```

## Deployment
Deployed by Learning & Improvement Agent alongside:
- All L3 agents (always)
- L4 agents during active project sprints
- Felix (CEO) during strategic planning sessions

## What It Logs
- Agent action events (tool calls, decisions)
- Escalation events (BV → BP triggers)
- Hallucination gate triggers
- Zombie detection (agent stall > 5min)
- Model selection rationale

## Inputs / Outputs
- **Produces for**: Learning & Improvement Agent (log stream)
- **Reports anomalies to**: Owning agent's parent (e.g., CDO for CDO-team agents)

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- Hermes v0.13 zombie detection + hallucination gate docs
