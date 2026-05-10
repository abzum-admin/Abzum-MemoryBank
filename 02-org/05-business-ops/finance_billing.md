---
id: persona-finance-billing
title: Finance & Billing
summary: Automated invoicing, payment processing, usage tracking, profitability per project, cost optimisation.
tags: [persona, business-ops, finance, l5, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: business-ops
tier: 1
reports_to: persona-vijay-ceo
related: [persona-cost-optimizer, persona-cdo, persona-client-engagement-agent]
---
# Finance & Billing

> **Status: stub.** Hybrid — currently Vijay (human) handles, will become AI-augmented per the 95% AI-agent goal.

## Function
Automated invoicing per closed engagement, payment chase-up, usage tracking against retainer hours, per-project profitability analysis (cost-per-deliverable using A54 token tracking + A55 estimation variance), cost-optimisation against the BV/BP subscription stacks.

## Capabilities (proposed)
- Generate invoices from Kanban completion events + hour logs
- Track payments received vs sent invoices
- Per-project P&L (revenue minus AI agent costs from ClickHouse)
- Cash-flow forecast (subscriptions due, invoices outgoing)
- Annual financial review prep

## TBD
- Accounting platform (Xero? Custom?)
- NZ GST + IRD reporting integration
- Payment gateway (Stripe + bank transfer?)

## References
- A54 Token usage tracking
- A55 Customer project estimation
- [`02-org/04-platform-orchestration/02-cost-and-routing/cost_optimizer.md`](../04-platform-orchestration/02-cost-and-routing/cost_optimizer.md)

---

<!-- backlinks-start -->

## Referenced by

- [Cdo Chief Delivery Officer](../01-executive/cdo_chief_delivery_officer.md)
- [Pricing](../../03-services/pricing.md)

<!-- backlinks-end -->
