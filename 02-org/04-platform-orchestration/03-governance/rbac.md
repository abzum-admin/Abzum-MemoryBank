---
id: persona-rbac
title: RBAC (Tier-1 Meta-Agent)
summary: Role-based access control enforcement. Decides which persona can access which repo, secret, or tool.
tags: [persona, tier-1, paperclip-11, rbac, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: platform
tier: 1
reports_to: persona-csco
related: [persona-provisioning, persona-secret-team, persona-csco]
---
# RBAC (Tier-1 Meta-Agent)

> **Status: stub.** From the Paperclip-11 set.

## Function
Enforces access control: which persona can read which repo, write which file, call which tool, see which secret. Cooperates with Provisioning at container creation to inject only the permissions the project needs.

## TBD
- Role definitions per persona × project tier
- Default-deny + explicit-allow policy
- Audit hooks

## References
- [`08-strategy/two_tier_architecture.md`](../../../08-strategy/two_tier_architecture.md) §"Security and RBAC"
- [`07-research/mcra-ai-security/mcra_ai_security.md`](../../../07-research/mcra-ai-security/mcra_ai_security.md)

---

<!-- backlinks-start -->

## Referenced by

- [Csco Chief Security Compliance Officer](../../01-executive/csco_chief_security_compliance_officer.md)
- [Provisioning](../01-orchestration/provisioning.md)
- [Compliance Meta](compliance_meta.md)
- [Secret Team](../05-secret-management/secret_team.md)
- [Mcra Ai Security](../../../07-research/mcra-ai-security/mcra_ai_security.md)
- [Two Tier Architecture](../../../08-strategy/two_tier_architecture.md)

<!-- backlinks-end -->
