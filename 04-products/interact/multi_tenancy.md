---
id: product-interact-multi-tenancy
title: InterACT Multi-tenancy
summary: Parent-child tenant hierarchy, RLS, tenant-scoped memory namespaces
tags: [product, interact, multi-tenancy]
updated: 2026-05-10
load_priority: 35
load_lane: reference
status: draft
related: [product-interact, strat-master-plan]
---
# InterACT Multi-tenancy

> **Status: stub.** Build covered by action **A73**. Spec to be filled in alongside the PoC build.

## Function

Each tenant has isolated Hindsight namespace + LLM Wiki branch + Postgres RLS scope. Parent tenants can read child tenants under explicit RBAC. Supports MSPs, franchises, aggregators.

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
