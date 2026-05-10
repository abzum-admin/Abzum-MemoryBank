---
id: services-pricing
title: Pricing Model
summary: Hourly + per-project estimate model. CEA scopes during discovery, Planner sizes, client agrees not-to-exceed cap.
tags: [services, pricing, gtm]
updated: 2026-05-10
load_priority: 55
load_lane: context
status: active
related: [exec-uc-team-mapping]
---
# Pricing Model

## Approach: Hourly + Per-Project Estimate

Per Decision **D-11** (2026-05-10):

1. **Discovery** — [Client Engagement Agent](../02-org/02-ai-systems/02-project-delivery/client_engagement_agent.md) runs discovery via voice (Gemini 3.1 Flash Live BV / Grok BP) + lives mockups (using [Abzum ReQuire](../04-products/require/_index.md))
2. **Sizing** — [Planner](../02-org/02-ai-systems/02-project-delivery/planner.md) decomposes into Kanban tasks with hour-budgets per task
3. **Estimate produced** — total hours × hourly rate + any third-party costs (hosting, APIs, licenses)
4. **Not-to-exceed cap** — client agrees a cap; CEA confirms in writing
5. **Execution** — agent team delivers; [Project Manager](../02-org/02-ai-systems/02-project-delivery/project_manager.md) tracks burn vs budget
6. **Variance tracking** — fed to A56 Estimation Variance pipeline so future estimates calibrate

## Hourly Rate

**$TBD** — Vijay sets. Will be set after first customer (P02) closes.

> The legacy "≤ $15K rule" from prior `company/use_cases.md` is **dropped** as of 2026-05-10. Some services (UC-23 SaaS, UC-30 InterACT-Deploy, UC-37 Bookkeeping) range higher, and a hard cap discourages high-value engagements.

## Indicative Hour Ranges per Service Tier

Each service `.md` file lists three indicative scope tiers:

| Tier | Indicative Hours | Used For |
|---|---|---|
| **Starter** | 20–60 hours | Template-driven, small-scope, single-deliverable |
| **Standard** | 60–200 hours | Custom, multi-deliverable, single domain |
| **Premium** | 200–600 hours | Full-stack, multi-service, security-heavy |

Larger engagements (>600 hours) are bespoke quotes; CDO + Vijay sign-off.

## Retainer Services

| Service | Retainer Model |
|---|---|
| UC-28 Maintenance / On-call | Monthly retainer with X hours included; overage billed hourly |
| UC-30 InterACT Tenant Deployment | Setup fee + monthly hosting + per-tenant fee |
| UC-31 ReQuire Tenant Deployment | Setup fee + monthly hosting + per-discovery-call fee |
| UC-35 Content at Scale | Monthly retainer with output cap (X articles + Y emails) |
| UC-38 Observability SaaS | Monthly subscription per agent monitored |

## Third-Party Costs Pass-Through

Direct pass-through of infrastructure / API / license costs at cost (no markup):

- Cloud hosting (Vercel / Hostinger / Azure)
- AI provider charges where client-deployed (Gemini / Grok / OpenAI)
- Third-party API subscriptions (Stripe, Recall.ai, etc.)
- Domain registrations
- SSL certificates

These are itemised separately in invoices for transparency.

## Discount / Premium Modifiers

- **First customer discount** — for the first 3 paying clients per service category, 20% discount in exchange for a public case study + testimonial
- **Multi-service bundle** — 10% discount when 3+ services run concurrently for one client
- **Rush surcharge** — +30% for projects with <50% of standard delivery window

## Revenue Recognition

- Fixed-scope projects: revenue recognised on milestone completion (per Kanban gate)
- Retainer services: monthly recognition
- Third-party costs: passed through, not recognised as Abzum revenue

## References

- [`02-org/05-business-ops/finance_billing.md`](../02-org/05-business-ops/finance_billing.md) — invoicing implementation
- [`05-process/use_case_team_mapping.md`](../05-process/use_case_team_mapping.md) — per-UC delivery team
- [`08-strategy/persona_team_v013.md`](../08-strategy/persona_team_v013.md) — BV/BP subscription stacks (Abzum's own cost basis)
- A55 Customer Project Estimation & Job Costing System
- A56 Estimation Variance → BI Signals pipeline

---

<!-- backlinks-start -->

## Referenced by

- [Now](../01-identity/now.md)
- [Positioning](../01-identity/positioning.md)
- [Ai Chatbot](01-build/ai_chatbot.md)
- [Crm Build](01-build/crm_build.md)
- [Crm Migration](01-build/crm_migration.md)
- [Interact Deploy](01-build/interact_deploy.md)
- [Require Deploy](01-build/require_deploy.md)
- [Saas Internal Tool](01-build/saas_internal_tool.md)
- [System Integration](01-build/system_integration.md)
- [Website](01-build/website.md)
- [Business Process Automation](02-automation/business_process_automation.md)
- [Code Security Audit](03-audit-advisory/code_security_audit.md)
- [Explainer Demo Reel](04-creative-content/explainer_demo_reel.md)
- [Marketing Campaign](04-creative-content/marketing_campaign.md)
- [Pitch Deck](04-creative-content/pitch_deck.md)
- [Research Document](05-research-knowledge/research_document.md)
- [Incident Response](06-managed-ongoing/incident_response.md)
- [Maintenance On Call](06-managed-ongoing/maintenance_on_call.md)
- [Master Plan](../08-strategy/master_plan.md)
- [Agents](../AGENTS.md)

<!-- backlinks-end -->
