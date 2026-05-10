---
id: infra-memory-hindsight
title: Hindsight — Long-term Episodic + Semantic Memory
summary: PostgreSQL + pgvector store with 4 networks (World/Experience/Opinion/Observation). 91.4% LongMemEval coverage. MIT.
tags: [infrastructure, memory, hindsight, episodic, semantic]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
related: [infra-memory-stack-overview, infra-memory-llm-wiki, res-hermes-hindsight]
---
# Hindsight

**Long-term episodic + semantic memory.** MIT-licensed, by Vectorize.io.

## Stores

| Network | Purpose | Intelligence Type |
|---|---|---|
| **World (𝒲)** | Objective org facts | Semantic |
| **Experience (ℬ)** | First-person agent actions + outcomes | Episodic + Outcome |
| **Opinion (𝒪)** | Confidence-scored beliefs (0–1 scale) | Persona |
| **Observation (𝒮)** | Preference-neutral entity summaries | Persona + Semantic |

## Retrieval

**TEMPR** fuses four parallel paths:

1. **Semantic** — HNSW index over pgvector embeddings
2. **Keyword** — BM25 over GIN index
3. **Graph** — entity-relationship traversal
4. **Temporal** — recency-weighted filtering

Benchmark: **91.4% on LongMemEval**. Best-in-class for long-running agent memory.

## Infrastructure

- PostgreSQL 16+ with pgvector extension
- Azure Database for PostgreSQL (Flexible Server, AU East) per existing `06-infrastructure/01-cloud/azure.md`
- Per-project tenant namespace isolation

## Implementation

Full implementation guide: [`07-research/hermes-hindsight/implementation_guide.md`](../../07-research/hermes-hindsight/implementation_guide.md).

## Backup

Daily snapshot to GitHub (private repo) per [`github_backup.md`](github_backup.md).

## Quality Gates

- LongMemEval score ≥ 90% on quarterly sample
- Per-tenant retention pruning policy enforced
- Right-to-be-forgotten endpoint working for client data deletion

---

<!-- backlinks-start -->

## Referenced by

- [Github Backup](github_backup.md)
- [Llm Wiki](llm_wiki.md)
- [Overview](overview.md)
- [Implementation Guide](../../07-research/hermes-hindsight/implementation_guide.md)

<!-- backlinks-end -->
