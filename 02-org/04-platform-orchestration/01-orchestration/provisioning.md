---
id: persona-provisioning
title: Provisioning (Tier-1 Meta-Agent)
summary: Spins up new project containers, injects context + tools + secrets, decommissions on completion.
tags: [persona, tier-1, paperclip-11, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: platform
tier: 1
reports_to: persona-felix-caio-role
related: [persona-rbac, persona-vps-team, persona-secret-team]
---
# Provisioning (Tier-1 Meta-Agent)

> **Status: stub.** From the Paperclip-11 set.

## Function
Creates project containers on demand: Hindsight namespace + LLM Wiki branch + Hermes profile + tool grants + secrets injection from Doppler. Coordinates with RBAC on permissions, VPS Team on substrate, Secret Team on credentials. Tears down cleanly when project completes.

## TBD
- Container template per UC type
- Decommission policy (immediate vs grace period)
- Context injection schema

## References
- [`08-strategy/two_tier_architecture.md`](../../../08-strategy/two_tier_architecture.md) §"Tier 2 Project Container"
- [`06-infrastructure/03-services/doppler.md`](../../../06-infrastructure/03-services/doppler.md)
