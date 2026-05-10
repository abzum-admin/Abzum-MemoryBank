---
id: infra-github-backup
title: GitHub Backup — Memory Stack
summary: Auto-syncs LLM Wiki + Hindsight snapshots to a private GitHub repo. Replaces the legacy ByteRover Git Sync.
tags: [infrastructure, memory, backup, github]
updated: 2026-05-10
load_priority: 45
load_lane: reference
status: active
related: [infra-memory-hindsight, infra-memory-llm-wiki, infra-memorybank-git-sync]
---
# GitHub Backup

**Backup mechanism for the memory stack.** Replaces the legacy ByteRover Git Sync.

## What's Backed Up

| Source | Mechanism | Cadence |
|---|---|---|
| **LLM Wiki** (`wiki/`) | Direct git commits (it's already markdown in git) | Every change |
| **Hindsight** (PostgreSQL) | Daily `pg_dump` → JSON export → committed | Daily 02:00 NZST |
| **ClickHouse** (analytics) | Weekly Parquet export → committed | Sunday 03:00 NZST |
| **Persona Hermes profiles** (`~/.hermes/config.yaml`) | Versioned in repo | Every config change |

## Repo

Private GitHub repo: **`abzum-admin/abzum-memorybank-vault`** (TBD on naming).

Distinct from this `Abzum-MemoryBank` repo, which is the active source-of-truth for human-readable docs. Vault is for raw memory snapshots.

## Restore Path

1. Clone vault
2. Restore Hindsight: `psql ... < hindsight_dump.json` (custom restore script per [implementation_guide](../../07-research/hermes-hindsight/implementation_guide.md))
3. Restore LLM Wiki: `git clone wiki/`
4. ClickHouse: import Parquet via `clickhouse-client`

## Migration from ByteRover Git Sync

The legacy mechanism documented in [`memorybank_git_sync.md`](../03-services/memorybank_git_sync.md) is being repurposed:

- Old: synced ByteRover context-tree to GitHub
- New: syncs LLM Wiki branches + Hindsight snapshots

A74 covers the migration cutover.

## Quality Gates

- Daily backup completes within 30 min
- Vault repo size growth tracked (alert if >10% week-over-week)
- Quarterly restore drill (restore from vault into staging environment, verify)

---

<!-- backlinks-start -->

## Referenced by

- [Memorybank Git Sync](../03-services/memorybank_git_sync.md)
- [Clickhouse Analytics](clickhouse_analytics.md)
- [Hindsight](hindsight.md)
- [Llm Wiki](llm_wiki.md)
- [Overview](overview.md)
- [Implementation Guide](../../07-research/hermes-hindsight/implementation_guide.md)

<!-- backlinks-end -->
