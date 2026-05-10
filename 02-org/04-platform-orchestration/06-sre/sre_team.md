---
id: persona-sre-team
title: SRE Team
summary: Site Reliability Engineering — uptime, logs, metrics, incident response. Tier-1 platform team.
tags: [persona, tier-1, platform, sre, draft]
updated: 2026-05-10
load_priority: 30
load_lane: reference
status: draft
discipline: platform
tier: 1
reports_to: persona-felix-caio-role
related: [persona-devops, persona-monitoring-audit, persona-watcher]
---
# SRE Team

> **Status: stub.** Distinct from DevOps (which is per-project Tier-2 release engineering); SRE is Tier-1 cross-project reliability.

## Function
Owns the production reliability story across all deployed Abzum projects: uptime monitoring, log aggregation, metrics + alerts, incident response coordination. Partners with Watcher (agent-side anomalies) and Monitoring/Audit (signal capture).

## TBD
- Specific tooling (Grafana? Datadog? Self-hosted?)
- On-call rotation when humans join
- SLO definitions per service tier

## References
- [`06-infrastructure/03-services/agent_watcher.md`](../../../06-infrastructure/03-services/agent_watcher.md)
- [`02-org/04-platform-orchestration/01-orchestration/monitoring_audit.md`](../01-orchestration/monitoring_audit.md)

---

<!-- backlinks-start -->

## Referenced by

- [Monitoring Audit](../01-orchestration/monitoring_audit.md)
- [Watcher](../01-orchestration/watcher.md)
- [Vps Team](../04-vps-orchestration/vps_team.md)
- [Agent Watcher](../../../06-infrastructure/03-services/agent_watcher.md)

<!-- backlinks-end -->
