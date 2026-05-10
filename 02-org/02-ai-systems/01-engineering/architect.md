---
id: persona-architect
title: Architect
summary: System design, tech-stack decisions, multi-service architecture, RFC writing — long-horizon reasoning, no urgency
tags: [persona, engineering, tier-2]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: engineering
tier: 2
related: [strat-persona-v013, exec-skill-matrix]
---
# Architect

## Function
The Architect makes the tech-stack and multi-service architecture decisions for a project, writes RFCs, and answers the Planner's scope-clarity questions. Long-horizon reasoning. No urgency. Spawned per project, not per task.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via Claude Code (Z.ai endpoint) **or** via OpenCode Go (free with the $10 sub)
- **Why this fit**: "Opus-level" output at 1/12 the price. High Hermes runtime fit means clean RFC structure.
- **Cost signal**: $10/mo OpenCode Go covers it; Z.ai lite $18/mo if vision/web-search MCPs needed.

## Escalation Stack — Best Performance
- **Brain**: Claude Opus 4.7 via Claude Pro ($20/mo)
- **Escalation triggers**: Multi-service architecture with >3 cross-team integrations; SWE-bench Pro 64.3% leadership matters when long-horizon planning is the bottleneck; security-critical architecture (auth boundaries, multi-tenant isolation).

## Tools / Cowork CLIs
- `excalidraw` MCP (free) — diagrams
- `mermaid` rendering — RFC diagrams in markdown
- `context7` MCP — up-to-date library/framework docs
- `microsoft_docs_search` MCP — Azure architecture patterns
- Cowork CLI: Claude Code via headless `claude -p` for deep multi-file reads

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    architect: opencode-go/glm-5.1            # or z-ai-anthropic/glm-5.1
  best_performance:
    architect: claude-code/opus-4.7
```

## Inputs / Outputs
- **Upstream**: Planner (scope dialogue) | BA (requirements with technical implications)
- **Downstream**: Senior Coder (RFC + tech-stack decisions) → DevOps + Infrastructure Engineer (deployment topology) → Security (review)

## Quality Gates
- RFC follows ADR template (context, decision, consequences, alternatives)
- Mermaid diagram of services + data flow included
- Security boundaries explicitly called out (which agent / service can read what)
- Cost envelope estimated and signed off by Planner

## Use Cases
- UC-21 Build a Website (when stack choice non-trivial)
- UC-23 Build a SaaS / Internal Tool
- UC-01 Custom CRM Build
- UC-16 System Integration
- UC-26 Code/Security Audit (advisory)

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- [`05-process/skill_matrix.md`](../../../05-process/skill_matrix.md) — Architect column
- [`05-process/workflow_superpowers.md`](../../../05-process/workflow_superpowers.md)

---

<!-- backlinks-start -->

## Referenced by

- [Solution Architect](../../03-human-delivery/solution_architect.md)
- [Skill Matrix](../../../05-process/skill_matrix.md)
- [Workflow Superpowers](../../../05-process/workflow_superpowers.md)
- [Persona Team V013](../../../08-strategy/persona_team_v013.md)

<!-- backlinks-end -->
