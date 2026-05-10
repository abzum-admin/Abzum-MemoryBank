---
id: persona-vps-team
title: VPS Orchestration Team
summary: Manages Hostinger VPS clusters, networking, backups. Operational counterpart to Infrastructure Engineer (Tier-2).
tags: [persona, tier-1, platform, vps, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: platform
tier: 1
reports_to: persona-felix-caio-role
related: [persona-infrastructure-engineer, persona-provisioning, persona-sre-team]
---
# VPS Orchestration Team

> **Status: stub.** Tier-1 team-level role; partners with Tier-2 Infrastructure Engineer persona.

## Function
Owns the substrate Abzum runs on: Hostinger VPS cluster (currently abzum.cloud KVM 2 + future expansion), DNS via Cloudflare, network policies, backups. Provisions per-project containers on request from Provisioning meta-agent.

## References
- [`06-infrastructure/01-cloud/vps.md`](../../../06-infrastructure/01-cloud/vps.md)
- [`08-strategy/two_tier_architecture.md`](../../../08-strategy/two_tier_architecture.md) §"Infrastructure Mapping"

---

<!-- backlinks-start -->

## Referenced by

- [Provisioning](../01-orchestration/provisioning.md)
- [Vps](../../../06-infrastructure/01-cloud/vps.md)
- [Two Tier Architecture](../../../08-strategy/two_tier_architecture.md)

<!-- backlinks-end -->
