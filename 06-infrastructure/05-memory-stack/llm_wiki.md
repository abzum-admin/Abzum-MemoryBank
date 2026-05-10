---
id: infra-memory-llm-wiki
title: LLM Wiki — Procedural Memory + Decisions
summary: Markdown-in-git wiki for SOPs, architectural decisions, entity pages. Karpathy pattern. Zero infrastructure.
tags: [infrastructure, memory, llm-wiki, procedural]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
related: [infra-memory-stack-overview, infra-memory-hindsight, infra-github-backup]
---
# LLM Wiki

**Procedural memory + cross-project decisions.** Karpathy "LLM wiki agent" pattern. MIT.

## Structure

```
wiki/
├── index.md         ← agents read this first (~3,000 tokens)
├── entities/        ← clients, agents, projects, people
├── concepts/        ← frameworks, technologies, patterns
├── procedures/      ← step-by-step SOPs
├── decisions/       ← cross-project architectural decisions (replaces ByteRover-as-decision-store)
└── syntheses/       ← saved query-answers as permanent pages
```

## Why Markdown In Git

- Zero infrastructure cost
- Free version control + diff history
- Human-readable; agents and humans share the same source
- Trivial backup (git remote)
- Existing tooling (GitHub Actions, link checkers, etc.) just works

## Agent Hooks

```python
# Auto-curate after long tasks:
if task_result.tool_call_count >= 5:
    await llm_wiki.ingest(transcript, "procedures")
if task_result.has_architectural_decision:
    await llm_wiki.ingest(decision, "decisions")
```

Driven by:
- [Knowledge Graph Agent](../../02-org/02-ai-systems/04-knowledge-intelligence/knowledge_graph_agent.md) — curates pages
- [Learning Agent](../../02-org/02-ai-systems/04-knowledge-intelligence/learning_agent.md) — promotes patterns from raw transcripts

## Backup

Auto-synced to GitHub via [`github_backup.md`](github_backup.md).

## Quality Gates

- Page lifecycle: every page has a `last_curated` date
- No orphan pages (every page linked from `index.md` or another page)
- Decisions in `decisions/` reference the originating Hindsight episode

---

<!-- backlinks-start -->

## Referenced by

- [Github Backup](github_backup.md)
- [Hindsight](hindsight.md)
- [Overview](overview.md)

<!-- backlinks-end -->
