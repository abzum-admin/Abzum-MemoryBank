---
id: persona-vijay-ceo
title: Vijay Tilak — CEO & Founder
summary: Human CEO/Founder. Vision, strategy, partnerships, final approvals on trust-critical decisions. Top of org chart.
tags: [persona, executive, exec, ceo, human, vijay]
updated: 2026-05-10
load_priority: 70
load_lane: context
status: active
discipline: executive
tier: 0
manages: [persona-felix-caio-role, persona-cdo, persona-csco]
related: [user-vijay, persona-felix-caio-role]
---
# Vijay Tilak — CEO & Founder

> **Note**: this is the public-facing role page. Personal profile is private at [`12-private/vijay.md`](../../12-private/vijay.md) (load_lane: private).

## Function
Vijay is the human CEO and Founder of Abzum. As the top of the org chart, his job is intentionally minimal: set direction and approve what AI agents cannot. The rest of the company runs on AI agents under his governance.

## Capabilities (what only Vijay does)
- **Vision and strategy direction** — what does Abzum become; what's the next anchor product / service category
- **Partnership decisions** — major partnerships, customer relationships, vendor relationships at exec level
- **Trust-critical sign-offs** — contract signing, large financial commitments, pivots
- **Founder-level legal exposure** — anything where Abzum NZ Ltd is the named party
- **Hiring decisions** — when Abzum brings on humans (rare; first hire still pending per A28)
- **L4 approvals** — the highest-clearance approvals per the access-control framework

## When to Call This Persona
- ✅ Use when: P##-class decision is open (P01 / P02 / P03 etc.) and unblocks downstream work
- ✅ Use when: contract / NDA needs final signature
- ✅ Use when: a client engagement >$10K total is being signed
- ✅ Use when: a pivot or strategy change is being proposed (e.g. dropping a service category)
- ❌ DO NOT use for: routine project decisions (Felix CAIO + project Orchestrator handle)
- ❌ DO NOT use for: technical architecture sign-off (delegated to Felix CAIO + Architect persona)
- ❌ DO NOT use for: client comms drafting (Client Engagement Agent + Delivery Manager handle)

## Direct Reports
- [Felix Stanley — CAIO](felix-caio/role.md) — agent architecture + orchestration
- [CDO — Chief Delivery Officer](cdo_chief_delivery_officer.md) — predictable project shipping
- [CSCO — Chief Security & Compliance Officer](csco_chief_security_compliance_officer.md) — data + AI compliance

## Co-work / Partners
- **[Delivery Manager (human)](../03-human-delivery/delivery_manager.md)** — when first human hire happens, owns client relationship handoff from Vijay
- **[Security Lead (human)](../03-human-delivery/security_lead.md)** — security-sensitive sign-off
- **[Solution Architect (human)](../03-human-delivery/solution_architect.md)** — validates AI-generated architecture with clients

## Decision Authority Matrix
| Domain | Vijay (CEO) | Felix (CAIO) | CDO | CSCO |
|---|---|---|---|---|
| Vision / pivots | ✅ Owner | Advise | Advise | Advise |
| Contracts / NDAs | ✅ Sign | — | Recommend | Review |
| Hires (human) | ✅ Decide | Recommend | Recommend | Review |
| Agent architecture | Approve | ✅ Owner | — | Review |
| Project delivery | — | Approve | ✅ Owner | — |
| Security / compliance | Approve | Review | — | ✅ Owner |
| Client engagement >$10K | ✅ Sign | — | Recommend | — |

## References
- [`12-private/vijay.md`](../../12-private/vijay.md) — full personal profile (private)
- [`08-strategy/master_plan.md`](../../08-strategy/master_plan.md) — strategic direction Vijay sets
- [`08-strategy/ai_native_5_tier_model.md`](../../08-strategy/ai_native_5_tier_model.md) — clearance / authority model

---

<!-- backlinks-start -->

## Referenced by

- [Cdo Chief Delivery Officer](cdo_chief_delivery_officer.md)
- [Csco Chief Security Compliance Officer](csco_chief_security_compliance_officer.md)
- [Identity](felix-caio/identity.md)
- [Legal Compliance](../05-business-ops/legal_compliance.md)
- [Ai Native 5 Tier Model](../../08-strategy/ai_native_5_tier_model.md)
- [Master Plan](../../08-strategy/master_plan.md)
- [Vijay](../../12-private/vijay.md)

<!-- backlinks-end -->
