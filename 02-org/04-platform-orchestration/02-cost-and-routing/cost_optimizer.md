---
id: persona-cost-optimizer
title: Cost-Optimizer (Tier-1 Meta-Agent)
summary: Manages model selection, token budget, free-tier utilisation across all projects.
tags: [persona, tier-1, paperclip-11, cost, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: platform
tier: 1
reports_to: persona-felix-caio-role
related: [persona-model-routing, persona-learning-agent, persona-project-allocator]
---
# Cost-Optimizer (Tier-1 Meta-Agent)

> **Status: stub.** From the Paperclip-11 set.

## Function
Sets model-selection policy across the org: when to use BV stack vs BP stack, when to escalate, when to prefer free tier vs paid. Tracks burn rate per project, alerts when projects approach budget cap, optimises across the OpenCode Go / Claude Pro / Codex CLI / pay-go portfolio.

## TBD
- Specific routing rules (when does Junior Coder escalate to Codex CLI?)
- Budget alarm thresholds
- Free-tier utilisation policy

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md) — BV / BP subscription stacks
- [`05-process/persona_hermes_config.md`](../../../05-process/persona_hermes_config.md)
