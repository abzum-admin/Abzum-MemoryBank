---
id: persona-secret-team
title: Secret Management Team
summary: Owns Doppler, key rotation, environment isolation. Tier-1 platform team.
tags: [persona, tier-1, platform, secrets, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: platform
tier: 1
reports_to: persona-csco
related: [persona-rbac, persona-provisioning, persona-csco]
---
# Secret Management Team

> **Status: stub.**

## Function
Centralises secrets management via Doppler. Rotates keys per policy, scopes secrets to project containers per RBAC rules, audits access.

## References
- [`06-infrastructure/03-services/doppler.md`](../../../06-infrastructure/03-services/doppler.md)

---

<!-- backlinks-start -->

## Referenced by

- [Csco Chief Security Compliance Officer](../../01-executive/csco_chief_security_compliance_officer.md)
- [Provisioning](../01-orchestration/provisioning.md)
- [Rbac](../03-governance/rbac.md)
- [Doppler](../../../06-infrastructure/03-services/doppler.md)

<!-- backlinks-end -->
