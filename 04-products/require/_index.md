<!-- curated 2026-05-10 — DO NOT regenerate via gen_indexes.py -->
---
id: product-require
title: Abzum ReQuire
summary: Requirements elicitation product. Productizes CEA voice + mockup runtime. Used internally and sold to clients.
tags: [product, require, requirements, voice, discovery]
updated: 2026-05-10
load_priority: 60
load_lane: context
status: draft
related: [product-interact, persona-client-engagement-agent, persona-planner, strat-master-plan]
---
# Abzum ReQuire

**Requirements elicitation product. Voice + live mockups + structured output.**

## Vision

Productize what the [Client Engagement Agent](../../02-org/02-ai-systems/02-project-delivery/client_engagement_agent.md) already does day-to-day — discovery calls with clients, voice-driven, with live mockups generated mid-conversation, output as a structured requirements doc fed to the Planner.

Two deployment modes:

1. **Internal-use** — Abzum's own teams use ReQuire to scope every project they deliver. The CEA persona is the agent of record; the human Delivery Manager partners on trust-critical sign-offs.
2. **Hosted client mode** (v2) — sold to clients who want self-service discovery for **their** customers' projects.

## Status

**v1 (internal-use mode)**. Build covered by action **A75**. **80% of the runtime already exists** in the CEA voice stack — productization = wrapping with a UI + tenant boundary + deploy automation.

Sequencing: ReQuire v1 ships **before** InterACT PoC.

## Service Form

Deployed per-tenant via UC-31 ReQuire Tenant Deployment (in services catalogue).

## Related

- [`02-org/02-ai-systems/02-project-delivery/client_engagement_agent.md`](../../02-org/02-ai-systems/02-project-delivery/client_engagement_agent.md) — primary user persona
- [`04-products/interact/_index.md`](../interact/_index.md) — peer product
- [`08-strategy/persona_team_v013.md`](../../08-strategy/persona_team_v013.md) — voice runtime decision (Gemini/Grok)
