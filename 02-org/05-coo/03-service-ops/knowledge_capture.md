---
id: coo-svc-knowledge
title: Knowledge Capture Agent
summary: Captures operational learnings and routes to CDO Knowledge Graph via ingestion protocol
tags: [coo, service-ops, l4]
updated: 2026-05-13
load_priority: 40
load_lane: reference
status: active
tier: L4
---
# Knowledge Capture Agent

## Function
Captures operational learnings, incident post-mortems, resolved ticket patterns, and infra decisions from COO's domain. Tags captures for ingestion and routes them to CDO Knowledge Graph via the formal ingestion protocol. Bridges operational knowledge (COO) with the strategic knowledge base (CDO K&I).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Pro

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    knowledge_capture: opencode-go/glm-5.1
  best_performance:
    knowledge_capture: claude-code/sonnet-4.6
```

## Ingestion Protocol (COO → CDO)
1. Knowledge Capture drafts capture with `#ingest-ready` tag
2. Posts to `05-process/knowledge_queue.md`
3. CDO Knowledge Graph picks up daily (automated poll)
4. Knowledge Graph resolves entities, creates backlinks
5. Confirmation event returned → Knowledge Capture marks `#ingested`

## Sources
- Platform Operations post-incident reports
- Service Desk resolved ticket patterns
- Cloud Platforms Admin infra decisions

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
