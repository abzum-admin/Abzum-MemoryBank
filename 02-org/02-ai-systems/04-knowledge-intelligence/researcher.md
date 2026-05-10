---
id: persona-researcher
title: Researcher
summary: Web/docs/repo synthesis, competitive analysis, library evaluation — long tool-use stamina is the differentiator
tags: [persona, knowledge, tier-2, research]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: knowledge
tier: 2
related: [strat-persona-v013]
---
# Researcher

## Function
The Researcher synthesises web pages, repo code, and library docs into structured findings. Long tool-use stamina (5,000+ tool calls per investigation, browse + fetch + parse) is the differentiator vs the Senior Coder doing ad-hoc research.

## Default Stack — Best Value
- **Brain**: Kimi K2.6 via Kimi CLI or OpenCode Go
- **Why this fit**: Agent Swarm scales to 300 sub-agents and 4,000 tool calls per investigation; BrowseComp 60.2%; the workhorse of long-running research without a per-token panic.
- **Cost signal**: included in OpenCode Go; BrowseComp benchmark shows it actually completes long investigations.

## Escalation Stack — Best Performance
- **Brain**: Gemini 3.1 Pro via Gemini CLI
- **Escalation triggers**: Need 1M context to read whole codebase + multiple library docs in one pass; ARC-AGI-2 77.1% indicates better synthesis on novel problems; native Google Search grounding when sources matter.

## Tools / Cowork CLIs
- **WebSearch** + **WebFetch**
- **`context7` MCP** — library docs (always-current)
- **`pinecone` MCP** — vector search across stored research corpus
- **`enterprise-search` skills** — search across connected sources (Slack, Linear, Drive, etc.)
- **`microsoft_docs_search` MCP** — Microsoft-specific
- **GitHub MCP** (`mcp__github__*`) — repo code search, PR / issue analysis
- **`mcp__plugin_playwright_*`** — for sites that need JS rendering

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    researcher: opencode-go/kimi-k2.6
  best_performance:
    researcher: gemini-cli/gemini-3.1-pro
```

## Inputs / Outputs
- **Upstream**: Triage (research-only request) | Architect (library evaluation question) | BA (competitive intel for client)
- **Downstream**: Tech Writer (raw findings → polished doc) | Architect (library recommendation) | Vijay (board-ready summary)

## Quality Gates
- Every claim has a source URL (no unsourced assertions)
- Sources rated for authority (official docs > vendor blog > random Medium post)
- Findings end with explicit recommendation + tradeoffs, not just a literature dump
- Long investigations checkpoint into Hindsight every 30 min so a crash loses ≤30 min

## Use Cases
- UC-22 Build a Research Document — primary persona
- UC-26 Code/Security Audit (codebase exploration)
- UC-21 Build a Website (competitive review)
- UC-23 Build a SaaS / Internal Tool (library evaluation)

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- [`research/`](../../research/) — research output home

---

<!-- backlinks-start -->

## Referenced by

- [Search Retrieval Agent](search_retrieval_agent.md)
- [Persona Team V013](../../../08-strategy/persona_team_v013.md)

<!-- backlinks-end -->
