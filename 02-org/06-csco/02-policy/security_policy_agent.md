---
id: csco-pol-policy
title: Security Policy Agent
summary: Security policy authoring, enforcement monitoring, policy version control
tags: [csco, policy, l3]
updated: 2026-05-13
load_priority: 45
load_lane: reference
status: active
tier: L3
---
# Security Policy Agent

## Function
Writes, maintains, and enforces Abzum's security policy framework. Owns the policy library (acceptable use, data handling, access control, incident response policy, vendor security requirements). Monitors policy compliance across agents and flags deviations to CSCO.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via Z.ai (Claude Code endpoint)
- **Why**: Security policy writing benefits from Z.ai web-search MCP for regulatory reference lookups.

## Escalation Stack — Best Performance
- **Brain**: Claude Opus 4.7 via Claude Pro
- **Triggers**: New regulatory requirement integration; policy framework redesign; complex multi-jurisdiction policy.

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    security_policy: z-ai-anthropic/glm-5.1
  best_performance:
    security_policy: claude-code/opus-4.7
```

## Policy Library (owns)
- Acceptable Use Policy (AUP)
- Data Classification & Handling Policy
- Access Control Policy (reviewed with IAM Agent quarterly)
- Incident Response Policy (reviewed with IR Agent annually)
- Vendor Security Requirements
- AI Agent Governance Policy

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
- Logs: policy version changes, compliance deviations flagged, policy review cycle adherence

## Quality Gates
- All policies reviewed minimum annually
- Policy changes require CSCO approval before publishing
