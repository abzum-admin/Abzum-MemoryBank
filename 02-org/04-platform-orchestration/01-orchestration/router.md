---
id: persona-router
title: Router (Tier-1 Meta-Agent)
summary: Classifies incoming work and routes to the appropriate project container or persona team.
tags: [persona, tier-1, paperclip-11, routing, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: platform
tier: 1
reports_to: persona-felix-caio-role
related: [persona-orchestrator, persona-triage-intake, persona-project-allocator]
---
# Router (Tier-1 Meta-Agent)

> **Status: stub.** From the Paperclip-11 meta-agent set documented in [`08-strategy/agent_orchestration.md`](../../../08-strategy/agent_orchestration.md). Needs full persona file via dedicated session.

## Function
Routes incoming requests to the appropriate project container after Triage classifies them. Matches request type → existing project container OR signals Provisioning to create a new one.

## TBD
- Routing heuristics (UC type → container template)
- New-container threshold (when does Router trigger Provisioning)
- Default Stack BV/BP brain
- Hermes Profile snippet

## References
- [`08-strategy/agent_orchestration.md`](../../../08-strategy/agent_orchestration.md) — Paperclip Meta-Layer §11 meta-agents
