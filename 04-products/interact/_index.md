<!-- curated 2026-05-10 — DO NOT regenerate via gen_indexes.py -->
---
id: product-interact
title: Abzum InterACT
summary: Voice-activated, dynamically-rendered, multi-tenant CRM with parent-child hierarchy. Anchor product.
tags: [product, interact, anchor, voice, dynamic-ui, multi-tenant, crm]
updated: 2026-05-10
load_priority: 60
load_lane: context
status: draft
related: [product-require, persona-client-engagement-agent, res-hermes-space, strat-master-plan]
---
# Abzum InterACT

**Voice-activated dynamic CRM. Multi-tenant. Parent-child hierarchy. Anchor product.**

## Vision

A CRM where the **UI renders dynamically in real-time** based on voice context. The user talks; widgets recompose. No hard-coded entities, no rigid data model — the schema flexes to the tenant's domain. Multi-tenant with parent-child hierarchy supports MSPs, franchises, and aggregator businesses.

Replaces traditional CRM UIs (Salesforce, HubSpot, Twenty) with a voice-first, AI-native surface that adapts to the user's intent moment-to-moment.

## Status

**PoC stage.** Build covered by action **A73** in `11-work/registry.json`.

## Architecture (concept)

```
┌─────────────────────────────────────────────┐
│  CLIENT TENANT INSTANCE                     │
│                                             │
│  Voice surface (in-app)                     │
│  ├─ Pipecat / LiveKit voice runtime         │
│  └─ Brain: Gemini 3.1 Flash Live (BV) /     │
│            Grok voice-think-fast (BP)       │
│                                             │
│  Dynamic UI engine                          │
│  ├─ Hermes plugin                           │
│  ├─ Space Agent JSON-driven widgets         │
│  └─ Real-time recompose from voice context  │
│                                             │
│  Multi-tenant data layer                    │
│  ├─ Tenant-scoped Hindsight namespace       │
│  ├─ Tenant-scoped LLM Wiki branch           │
│  ├─ PostgreSQL + RLS for relational         │
│  └─ Parent-child hierarchy (RBAC enforced)  │
└─────────────────────────────────────────────┘
```

## Detailed Specs (to be filled)

The following per-aspect docs are placeholders for the build phase (A73):

- `product-spec.md` — what InterACT does, target users, differentiation
- `architecture.md` — Hermes + Space Agent dynamic widgets
- `voice-stack.md` — voice runtime details
- `dynamic-ui.md` — JSON widget recompose logic
- `multi-tenancy.md` — parent-child hierarchy + RLS
- `data-model.md` — flexible schema, per-tenant extensions
- `deploy-and-onboard.md` — how Abzum deploys InterACT for a new tenant
- `roadmap.md` — PoC → MVP → multi-tenant GA → marketplace
- `go-to-market.md` — positioning vs Salesforce / HubSpot / Twenty

## Service Form

Deployed per-tenant via UC-30 InterACT Tenant Deployment (in services catalogue).

## Related

- [`07-research/hermes-space-agents/hermes_space_agents.md`](../../07-research/hermes-space-agents/hermes_space_agents.md) — the underlying dynamic-UI architecture
- [`04-products/require/_index.md`](../require/_index.md) — peer product (used during InterACT discovery + tenant onboarding)
- [`02-org/02-ai-systems/02-project-delivery/client_engagement_agent.md`](../../02-org/02-ai-systems/02-project-delivery/client_engagement_agent.md) — CEA shares voice stack with InterACT
