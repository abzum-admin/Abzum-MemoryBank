---
id: csco-soc-ir
title: Incident Response Agent
summary: Security incident handling, containment, eradication, recovery, post-incident reporting
tags: [csco, soc, l3]
updated: 2026-05-13
load_priority: 55
load_lane: reference
status: active
tier: L3
---
# Incident Response Agent

## Function
Handles confirmed security incidents end-to-end: initial containment, eradication, recovery coordination, and post-incident reporting. Activated by Threat Intel & Detection or Platform Operations escalation. Coordinates with COO for infra-level containment actions (IAM revocations, network isolation).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go

## Escalation Stack — Best Performance
- **Brain**: Claude Opus 4.7 via Claude Pro
- **Triggers**: Active breach; multi-system compromise; when incident complexity requires deep synthesis.

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    incident_response: opencode-go/glm-5.1
  best_performance:
    incident_response: claude-code/opus-4.7
```

## Incident Phases
| Phase | Actions |
|---|---|
| Detection | Receive escalation from Threat Intel or Platform Ops |
| Containment | Coordinate with COO: IAM revocation, network isolation via Network & Edge |
| Eradication | Identify root cause; coordinate Security Agent (DevSec) for code fixes |
| Recovery | Coordinate Cloud Platforms Admin for clean restore |
| Post-incident | 24h report → CSCO → Felix → Vijay |

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
- Logs: incident count, MTTD, MTTR, containment effectiveness

## Quality Gates
- P1 security incidents: Vijay + Felix notified within 1h
- Post-incident report filed within 24h
