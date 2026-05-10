<!-- curated 2026-05-10 — DO NOT regenerate via gen_indexes.py -->
---
id: res-memory-architecture
title: Memory Architecture (Design Rationale)
summary: Design rationale for the Hindsight + LLM Wiki + ClickHouse memory stack. Alternatives considered, benchmarks, why-this-not-that. Companion to 06-infrastructure/05-memory-stack.
tags: [research, memory, architecture, design]
updated: 2026-05-10
load_priority: 35
load_lane: reference
status: active
related: [infra-memory-stack-overview, res-hermes-hindsight, res-hermes-summary]
---
# Memory Architecture — Design Rationale

> **Companion to** [`06-infrastructure/05-memory-stack/`](../../06-infrastructure/05-memory-stack/) (implementation) — this folder holds the *why* behind the *what*.

## Why Three Layers

A single-system memory architecture forces tradeoffs:
- A pure vector store (Hindsight alone) handles episodic + semantic well but is bad at procedural / multi-step SOPs
- A pure markdown wiki (LLM Wiki alone) is great for procedures but can't do similarity-based recall
- A pure analytics DB (ClickHouse alone) gives observability but isn't memory

Splitting concerns:

| Need | System | Reason |
|---|---|---|
| "What did we do for client X last quarter?" | Hindsight | Episodic, semantic similarity over events |
| "How do we deploy a Next.js site to Vercel?" | LLM Wiki | Procedural; agents read top-to-bottom; humans edit too |
| "Did model routing change cost / quality this month?" | ClickHouse | Analytics over structured signals |

## Alternatives Considered

| Option | Why considered | Why rejected |
|---|---|---|
| **ByteRover only** (status quo until 2026-05-10) | Already configured, BYOK | Single-provider conflict; backup format opaque; benchmark not published; LLM Wiki pattern emerging in industry |
| **Hindsight only** | 91.4% LongMemEval — best-in-class | Bad at procedural memory; SOPs need human-readable form |
| **LLM Wiki only** | Zero-infra, free git-versioning | No similarity recall on novel queries; can't surface "we hit a similar bug 3 months ago" |
| **Mem0 / LangMem / Graphiti** | Newer entrants | Either single-provider lock-in or unproven at our scale |
| **Roll our own** | Full control | Engineering cost, no benchmarks, distraction from product |

## Benchmarks Considered

- **LongMemEval** — Hindsight's 91.4% is best published result we could verify
- **MS-MARCO / BEIR** — Hindsight's HNSW + BM25 fusion competitive; not the deciding factor
- **Cost per 1M tokens stored** — Hindsight ~$0.05/M (PostgreSQL + Azure); LLM Wiki ~$0 (markdown in git)
- **Recall latency p95** — both <500ms in dev tests

## Open Research Questions

- **Cross-tenant pattern extraction** — how does Memory Manager (Tier-1) safely surface "we saw this same payment-bug across 3 different SMB clients" without leaking tenant data?
- **GDPR right-to-be-forgotten** — clean deletion path across Hindsight networks + LLM Wiki entity pages + ClickHouse analytics for a single client
- **Cold-start retrieval** — first project for a new client domain; no Hindsight history; how does LLM Wiki bootstrap?

## Related

- [`06-infrastructure/05-memory-stack/`](../../06-infrastructure/05-memory-stack/) — implementation
- [`07-research/hermes-hindsight/`](../hermes-hindsight/) — original Hermes + Hindsight integration research
- [`08-strategy/agent_orchestration.md`](../../08-strategy/agent_orchestration.md) §Memory Stack
