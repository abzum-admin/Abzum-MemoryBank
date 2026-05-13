---
id: csco-soc-threat
title: Threat Intel & Detection Agent
summary: Threat intelligence feeds, anomaly detection, security event correlation — merged Threat Intel + Detection
tags: [csco, soc, l3]
updated: 2026-05-13
load_priority: 55
load_lane: reference
status: active
tier: L3
---
# Threat Intel & Detection Agent

## Function
Manages threat intelligence feeds, correlates security events from Platform Operations alerts, and performs anomaly detection across Abzum's attack surface. Merged from the former Threat Intelligence Agent and Detection Agent — these roles share the same data sources and analysis loop. Reports to CSCO.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via Z.ai (Claude Code endpoint, with web-search MCP for threat feeds)

## Escalation Stack — Best Performance
- **Brain**: Claude Opus 4.7 via Claude Pro
- **Triggers**: Active incident correlation; zero-day advisory analysis; multi-source threat synthesis.

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    threat_intel: z-ai-anthropic/glm-5.1   # web-search MCP for CVE/threat feeds
  best_performance:
    threat_intel: claude-code/opus-4.7
```

## Tools
- Z.ai web-search MCP — real-time CVE, threat advisory lookups
- Platform Operations alert feed (consumes)
- `github` MCP — security advisory monitoring for Abzum repos

## Responsibilities
- Threat feed ingestion and triage (CVE, CISA KEV, vendor advisories)
- Security event correlation from Platform Operations
- Threat briefing to CSCO (weekly)
- Escalation to Incident Response for confirmed threats
- IOC (indicator of compromise) list maintenance

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
- Logs: threat feed ingestion volume, confirmed threats, false positive rate, escalation events

## Quality Gates
- CVSS ≥7.0 advisories triaged within 4h
- Confirmed active threats escalated to Incident Response immediately
