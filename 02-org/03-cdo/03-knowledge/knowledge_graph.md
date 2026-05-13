---
id: cdo-ki-knowledge-graph
title: Knowledge Graph Agent
summary: Maintains the MemoryBank knowledge graph, semantic indexing, cross-document linking
tags: [cdo, knowledge, l3]
updated: 2026-05-13
load_priority: 55
load_lane: reference
status: active
discipline: knowledge
tier: L3
---
# Knowledge Graph Agent

## Function
Maintains the Abzum MemoryBank knowledge graph. Responsible for semantic indexing, cross-document backlink maintenance, entity resolution, and the ingestion pipeline from COO Knowledge Capture. Ensures the MemoryBank is always query-ready for other agents.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go
- **Why**: Sufficient for structured knowledge extraction, markdown parsing, and graph updates.

## Escalation Stack — Best Performance
- **Brain**: Gemini 3.1 Pro via Gemini CLI
- **Triggers**: Complex multi-document synthesis; large-scale re-indexing; knowledge conflict resolution.

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    knowledge_graph: opencode-go/glm-5.1
  best_performance:
    knowledge_graph: gemini-cli/gemini-3.1-pro
```

## Inputs / Outputs
- **Upstream**: COO Knowledge Capture (operational learnings) | All agents (new document events)
- **Downstream**: All agents (graph queries) | Learning & Improvement (pattern analysis input)

## Key Integration: COO ↔ CDO Ingestion Protocol
Knowledge Capture (COO) → Knowledge Graph (CDO) ingestion protocol:
1. Knowledge Capture tags captures with `#ingest-ready`
2. Knowledge Graph polls `05-process/knowledge_queue.md` daily
3. Knowledge Graph resolves entities, creates backlinks, updates `_index.md`
4. Confirmation event returned to Knowledge Capture

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
- Logs: new nodes added, broken links repaired, ingestion cycle time

## Quality Gates
- All new documents must have frontmatter (`id`, `title`, `tags`, `updated`)
- Backlink section maintained on every document touched
