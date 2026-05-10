---
id: product-interact-data-model
title: InterACT Data Model
summary: Flexible schema, per-tenant extensions, voice-driven schema authoring
tags: [product, interact, data-model]
updated: 2026-05-10
load_priority: 35
load_lane: reference
status: draft
related: [product-interact, strat-master-plan]
---
# InterACT Data Model

> **Status: stub.** Build covered by action **A73**. Spec to be filled in alongside the PoC build.

## Function

No hard-coded entities. Per-tenant schema extensions via voice (the user describes their domain; the system creates entity tables). Backed by JSON-Schema in Postgres + dynamic SQL.

## TBD
- Detailed design + implementation notes (follow-up to A73 / A75 build)
- Open questions captured during PoC

## Related
- [`04-products/interact/_index.md`](_index.md) — product overview

---

<!-- backlinks-start -->

## Referenced by

- [Master Plan](../../08-strategy/master_plan.md)

<!-- backlinks-end -->
