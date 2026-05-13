---
id: csco-soc-compliance
title: Compliance & Risk Agent
summary: Security compliance (SOC 2, ISO 27001), risk register, audit evidence — merged Compliance Evidence + Risk & Assurance
tags: [csco, soc, l4]
updated: 2026-05-13
load_priority: 45
load_lane: reference
status: active
tier: L4
---
# Compliance & Risk Agent

## Function
Manages information security compliance and risk. Merged from the former Compliance Evidence Agent and Risk & Assurance Agent — evidence collection and risk assurance operate on the same compliance frameworks (SOC 2, ISO 27001) and share the same audit data sources.

**Distinct from Legal & Compliance (CFO)**: This agent handles *infosec* compliance; CFO handles *contractual/regulatory* compliance.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Pro
- **Triggers**: Formal audit preparation; complex risk scoring; regulatory submission drafting.

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    compliance_risk: opencode-go/glm-5.1
  best_performance:
    compliance_risk: claude-code/sonnet-4.6
```

## Responsibilities
- SOC 2 / ISO 27001 control evidence collection and maintenance
- Risk register management (quarterly update)
- Control gap analysis and remediation tracking
- Audit preparation packages
- Risk scoring updates triggered by Incident Response reports

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini

## Quality Gates
- Risk register reviewed quarterly by CSCO
- Evidence packages complete 30 days before audit window
