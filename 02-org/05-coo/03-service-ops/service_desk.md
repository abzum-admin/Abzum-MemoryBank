---
id: coo-svc-servicedesk
title: Service Desk
summary: Internal support tickets, agent access requests, tool troubleshooting — merged 4 former support roles
tags: [coo, service-ops, l3]
updated: 2026-05-13
load_priority: 40
load_lane: reference
status: active
tier: L3
---
# Service Desk

## Function
First-line internal support for all agents and human staff. Handles access requests (routes to IAM Agent), tool issues, subscription queries, and general operational troubleshooting. Merged from four former fine-grained support roles (Triage/Intake Support, Tool Support, Access Request Handler, Subscription Support).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Pro

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    service_desk: opencode-go/glm-5.1
  best_performance:
    service_desk: claude-code/sonnet-4.6
```

## Responsibilities
- Ticket intake and routing (access requests → IAM; infra issues → Cloud Platforms; billing → CFO)
- Tool troubleshooting (MCP connectivity, Hermes runtime issues)
- SLA tracking: P1 <1h, P2 <4h, P3 <1d

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
- Logs: ticket volume, resolution time, escalation rate, repeat issues (feeds Learning & Improvement)
