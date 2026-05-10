---
id: service-interact-deploy
title: Abzum InterACT — Tenant Deployment (UC-30)
summary: Per-tenant deployment of the Abzum InterACT voice-activated dynamic CRM product. Setup fee + monthly hosting.
tags: [service, build, uc-30, interact, deployment]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: draft
related: [product-interact, services-pricing, persona-client-engagement-agent]
---
# UC-30 — Abzum InterACT Tenant Deployment

> **Status: stub.** v1 service. Spec to be filled in alongside the InterACT PoC build (A73). The full product spec is in [`04-products/interact/_index.md`](../../04-products/interact/_index.md).

## What we deliver

- Provisioned InterACT tenant (sub-domain + dedicated Hindsight namespace + LLM Wiki branch + tenant-scoped Postgres schema)
- Initial voice-prompts library configured for the tenant's domain
- Default dashboard widget set + 3-5 custom widgets for tenant's primary entities
- Multi-tenant parent-child setup (if MSP / franchise / aggregator client)
- Onboarding training for tenant admins (recorded video + 1-hour live session)
- 30 days of post-launch hypercare

## Persona Team

Triage → CEA → Planner → Architect → DevOps → Infrastructure Engineer (per [`05-process/use_case_team_mapping.md`](../../05-process/use_case_team_mapping.md))

## Pricing

Setup fee + monthly hosting + per-tenant fee. **Indicative range $5K-$25K setup + $200-$2K/month hosting.**

Full pricing model in [`pricing.md`](../pricing.md).

## TBD
- SLA terms (uptime, response time)
- Data residency options (NZ / AU / EU / US)
- Customisation scope vs out-of-box
- Decommissioning / data export

## Related
- [`04-products/interact/_index.md`](../../04-products/interact/_index.md) — full product spec
