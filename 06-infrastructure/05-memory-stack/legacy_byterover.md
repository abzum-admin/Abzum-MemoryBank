---
id: infra-legacy-byterover
title: Legacy ByteRover (Migration Log)
summary: Deprecated 2026-05-10 (D16). Content preserved here for migration history. Active migration tracked under A74.
tags: [infrastructure, memory, legacy, byterover, deprecated]
updated: 2026-05-10
load_priority: 20
load_lane: reference
status: deprecated
related: [infra-memory-stack-overview, agent-tooling-inventory]
---
# Legacy ByteRover (Migration Log)

> **Status: DEPRECATED 2026-05-10** per decision **D16**. ByteRover is no longer the primary memory system. Migration to Hindsight + LLM Wiki tracked under action **A74**. This page exists for migration history only.

## What ByteRover Was

ByteRover was the persistent memory system for Abzum from 2026-04-01 (D05) to 2026-05-10 (superseded by D16):

- ByteRover CLI v2.5.1 at `/home/node/.openclaw/workspace/node_modules/.bin/brv`
- ByteRover Context Engine plugin at `/home/node/.openclaw/extensions/byterover`
- Daily Knowledge Mining cron at 9 AM NZST
- Connected via BYOK (Gemini, then MiniMax fallback)

## Why It Was Deprecated

1. **Single-provider constraint conflict**: Hermes one-provider rule meant we'd have to choose between ByteRover and Hindsight. Hindsight has 91.4% LongMemEval coverage; ByteRover doesn't publish a comparable benchmark.
2. **Backup was clunky** — ByteRover Git Sync existed but the export format wasn't human-readable.
3. **Decision conflict**: `08-strategy/agent_orchestration.md` already flagged ByteRover deprecated in favour of LLM Wiki, but `agent/tools.md`, `execution/context_persistence.md`, and `operations/services/memorybank_git_sync.md` still treated it as primary. Restructure forced resolution.
4. **Cost transparency**: with ByteRover the BYOK provider's cost was opaque; ClickHouse-based analytics (new memory stack) gives per-call cost visibility.

## Migration Plan (A74)

| Step | Action | Status |
|---|---|---|
| 1 | Export ByteRover context tree to JSON | TBD |
| 2 | Categorise entries → Hindsight networks (World / Experience / Opinion / Observation) OR LLM Wiki sections (entities / concepts / procedures / decisions) | TBD |
| 3 | Bulk import to Hindsight + LLM Wiki | TBD |
| 4 | Decommission ByteRover daily cron | TBD |
| 5 | Stop the BYOK ByteRover provider connection | TBD |
| 6 | Archive `/home/node/.openclaw/workspace/.brv/context-tree/` to vault | TBD |

## What's Preserved

The original ByteRover-related content lives in:

- [`09-knowledge/agent_tooling_inventory.md`](../../09-knowledge/agent_tooling_inventory.md) — has the migration-time annotation; full ByteRover setup notes preserved as legacy section
- This file — migration log
- Git history of pre-2026-05-10 commits — unchanged

## Decisions Affected

- **D05** (2026-04-01) — "ByteRover as memory/knowledge system" — **superseded by D16**
- **D16** (2026-05-10) — Replace ByteRover with Hindsight + LLM Wiki + GitHub backup

## Related

- [`infra-memory-stack-overview`](overview.md) — the new primary stack
- A74 (in `11-work/registry.json`) — migration action

---

<!-- backlinks-start -->

## Referenced by

- [Overview](overview.md)
- [Agent Tooling Inventory](../../09-knowledge/agent_tooling_inventory.md)

<!-- backlinks-end -->
