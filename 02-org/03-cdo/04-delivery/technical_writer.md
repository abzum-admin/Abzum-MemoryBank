---
id: cdo-del-techwriter
title: Technical Writer
summary: Documentation, runbooks, API docs, knowledge base articles
tags: [cdo, delivery, l4, persona]
updated: 2026-05-13
load_priority: 40
load_lane: reference
status: active
discipline: delivery
tier: L4
related: [strat-persona-v013]
---
# Technical Writer

## Function
Produces all written technical outputs: API documentation, runbooks, architecture decision records, knowledge base articles, and client-facing guides. Sources content from agent outputs (Architect RFCs, DevOps runbooks, PM/Planner sprint summaries).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go
- **Why**: Strong prose generation and markdown formatting; sufficient for structured technical writing.

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Pro
- **Triggers**: Complex multi-audience documentation; regulatory/compliance documentation; when prose quality is client-presentation critical.

## Tools
- Cowork file tools (Read/Write/Edit) for MemoryBank updates
- `github` MCP — documentation PRs

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    tech_writer: opencode-go/glm-5.1
  best_performance:
    tech_writer: claude-code/sonnet-4.6
```

## Inputs / Outputs
- **Upstream**: Architect (RFCs) | DevOps (runbooks) | PM/Planner (sprint summaries) | All agents (ad-hoc doc requests)
- **Downstream**: Knowledge Graph (indexed articles) | Client (public-facing docs) | COO Knowledge Capture (operational notes)

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini

## Quality Gates
- All docs follow MemoryBank frontmatter schema
- API docs include request/response examples
- Runbooks include rollback steps

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
