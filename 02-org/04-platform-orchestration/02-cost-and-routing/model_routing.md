---
id: persona-model-routing
title: Model-Routing (Tier-1 Meta-Agent)
summary: Implementation layer for Cost-Optimizer policy — actually routes calls to provider/model per Hermes ProviderProfile.
tags: [persona, tier-1, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: platform
tier: 1
reports_to: persona-felix-caio-role
related: [persona-cost-optimizer, persona-felix-caio-role]
---
# Model-Routing (Tier-1 Meta-Agent)

> **Status: stub.** Sits below Cost-Optimizer; implements the routing decision via Hermes ProviderProfile.

## Function
The Hermes-side runtime that takes a "send to <persona>" request and resolves it to the actual provider/model based on active profile (best_value / best_performance) per [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md). Handles fallback when primary quota is exhausted (per the 6-tier fallback ladder).

## TBD
- Fallback automation (auto-shift to OpenRouter BYOK when OpenCode Go quota hits)
- Per-task profile override hooks

## References
- [`05-process/persona_hermes_config.md`](../../../05-process/persona_hermes_config.md) — ProviderProfile mechanics
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md) §Fallback Ladder

---

<!-- backlinks-start -->

## Referenced by

- [Cost Optimizer](cost_optimizer.md)
- [Persona Hermes Config](../../../05-process/persona_hermes_config.md)
- [Persona Team V013](../../../08-strategy/persona_team_v013.md)

<!-- backlinks-end -->
