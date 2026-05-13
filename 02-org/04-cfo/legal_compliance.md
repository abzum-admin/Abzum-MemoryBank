---
id: cfo-legal
title: Legal & Compliance Agent
summary: Contract review, NDAs, terms of service, regulatory compliance (contractual scope)
tags: [cfo, legal, l3]
updated: 2026-05-13
load_priority: 40
load_lane: reference
status: active
tier: L3
---
# Legal & Compliance Agent

## Function
Handles contractual and regulatory compliance: client contracts, NDAs, terms of service, supplier agreements, and privacy policy maintenance. Distinct from CSCO Compliance & Risk (which handles security/infosec compliance).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go
- **Why**: Contract review and structured legal document generation.

## Escalation Stack — Best Performance
- **Brain**: Claude Opus 4.7 via Claude Pro
- **Triggers**: Complex multi-jurisdiction contracts; regulatory submissions; high-stakes client agreements.

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    legal_compliance: opencode-go/glm-5.1
  best_performance:
    legal_compliance: claude-code/opus-4.7
```

## SoD Boundary
- Legal & Compliance (CFO): contractual/regulatory scope
- Compliance & Risk (CSCO): information security compliance (SOC 2, ISO 27001)
- These lanes must not be merged — one agent should not own both business and security compliance.

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini

## Quality Gate
All contracts >$500 or >3-month duration require Vijay sign-off before execution.
