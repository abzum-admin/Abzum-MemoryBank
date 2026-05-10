---
id: knowledge-glossary
title: Glossary — Abzum Internal Terminology
summary: Defines internal terms (Tier-1, Pattern A/B, BV/BP, CEA, InterACT, ReQuire, etc.) referenced across the memory bank.
tags: [knowledge, reference, glossary]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
related: [conventions, knowledge-id-namespaces]
---
# Glossary

Internal terms used across the memory bank. Look here when an acronym or capitalised term shows up in a doc you don't have full context for.

## Architecture / Tiers

| Term | Definition |
|---|---|
| **Tier 1** | Always-on global agents (orchestration, governance, cost, memory). Includes the 11 Paperclip meta-agents + Orchestrator + Watcher. Lives in [`02-org/04-platform-orchestration/`](../02-org/04-platform-orchestration/) |
| **Tier 2** | Project-scoped agents (engineering, design, project-delivery, knowledge personas). Spawned per project, torn down on completion. Lives in [`02-org/02-ai-systems/`](../02-org/02-ai-systems/) |
| **Tier 3** | Human delivery layer — trust-critical sign-offs only. Stubs in [`02-org/03-human-delivery/`](../02-org/03-human-delivery/) |
| **Layer 0** | Intake / triage layer (first contact). Currently the [Triage / Intake](../02-org/02-ai-systems/02-project-delivery/triage_intake.md) persona |
| **Paperclip-11** | The 11 global meta-agents specified in [`08-strategy/agent_orchestration.md`](../08-strategy/agent_orchestration.md): RBAC, Compliance, Planner-meta, Cost-Optimizer, Project Allocator, Provisioning, Memory Manager, Router, Strategy-meta, Monitoring/Audit, plus Orchestrator |

## Personas / Roles

| Term | Definition |
|---|---|
| **CAIO** | Chief AI Officer — Felix Stanley's repositioned title (was COO until 2026-05-10 D19) |
| **CDO** | Chief Delivery Officer — AI exec ensuring predictable project delivery; new role per D19 |
| **CSCO** | Chief Security & Compliance Officer — AI exec for data governance + AI compliance; new role per D19 |
| **CEA** | Client Engagement Agent — single client-facing AI persona merging BA + Account Manager + Client Comms (D20) |
| **BA** | Business Analyst — **DEPRECATED 2026-05-10**, scope absorbed into CEA |
| **PM** | Project Manager Agent — ongoing execution tracking; distinct from Planner (upfront task decomposition) |

## Subscription Stacks / Brain Selection

| Term | Definition |
|---|---|
| **BV** | Best Value — $40/mo subscription stack (OpenCode Go + ChatGPT Plus + Chutes Pro + local Ollama). Default brain choice. |
| **BP** | Best Performance — $50/mo stack (Claude Pro + ChatGPT Plus + OpenCode Go). Escalation brain choice. |
| **Pattern A** | Model-as-Engine — the LLM IS the persona's brain. Most personas. |
| **Pattern B** | CLI-as-Tool / Cowork — a cheap brain dispatches actual work to a specialist CLI agent (Codex CLI, Claude Code, Aider). Junior Coder's canonical pattern. |

## Products

| Term | Definition |
|---|---|
| **Abzum InterACT** | Voice-activated, dynamically-rendered, multi-tenant CRM. Anchor product. Builds on Hermes + Space Agent dynamic widget pattern. |
| **Abzum ReQuire** | Productized requirements elicitation tool. Productizes the CEA voice + mockup runtime. Sequencing: ships before InterACT. |

## Memory Stack

| Term | Definition |
|---|---|
| **Hindsight** | Long-term episodic + semantic memory (PostgreSQL + pgvector). 4 networks: World / Experience / Opinion / Observation. 91.4% LongMemEval coverage. MIT (Vectorize.io). |
| **LLM Wiki** | Procedural memory + cross-project decisions. Markdown in git. Karpathy pattern. |
| **TEMPR** | Hindsight's fused-retrieval mechanism: Semantic (HNSW) + Keyword (BM25) + Graph + Temporal. |
| **ByteRover** | Previous primary memory system. **DEPRECATED 2026-05-10** (D16). Migration tracked under A74. |

## Voice Stack

| Term | Definition |
|---|---|
| **Pipecat** | Voice agent framework used by the CEA / ReQuire runtime |
| **LiveKit Agents** | Alternative voice runtime |
| **Recall.ai** | Meet/Zoom/Teams bot infrastructure with Output Media (bot can speak) |
| **Gemini 3.1 Flash Live** | Google realtime voice model. $0.018/min. Best Value choice. |
| **Grok voice-think-fast-1.0** | xAI realtime voice model. $0.05/min. Best Performance choice (tuned for high-stakes multi-step tool calling). |
| **gpt-realtime** | OpenAI realtime voice. ~$0.30/min. Fallback only. |

## Workflow

| Term | Definition |
|---|---|
| **Superpowers** | Anthropic's TDD-style 6-gate workflow used by Abzum personas. See [`05-process/workflow_superpowers.md`](../05-process/workflow_superpowers.md). |
| **Kanban (Hermes v0.13)** | Multi-agent durable Kanban board with heartbeat / zombie detection / reclaim / retries. The dispatch substrate the Orchestrator uses. |
| **`/goal` Ralph loop** | Hermes v0.13 command running a goal repeatedly until success criteria met. |
| **ProviderProfile** | Hermes v0.13 ABC for plugging in any OpenAI/Anthropic/Codex-compatible inference provider. |

## ID Namespaces

See [`id_namespaces.md`](id_namespaces.md) for the canonical reference. Quick form:

| Prefix | Meaning |
|---|---|
| `A##` | Action |
| `B##` | Blocker |
| `D##` | Decided Decision |
| `P##` | Pending Decision |
| `UC-##` | Use Case |
| `O##` | Operations Log Entry |

## Status Values (frontmatter)

| Status | Meaning |
|---|---|
| `active` | Live, in-use, depend on it |
| `draft` | Stub or work-in-progress; capabilities listed are *proposed* |
| `future` | Position exists in org chart but role is vacant (e.g. future hire) |
| `deprecated` | Superseded; do not depend on for new work |
| `archived` | Historical; preserved for migration / audit context |

## Load Lanes (frontmatter)

| Lane | Behaviour |
|---|---|
| `context` | Loaded by default in agent context |
| `summary` | High-level overview; loaded for navigation |
| `reference` | Loaded on demand when topic relevant |
| `private` | CONFIDENTIAL — only loaded with explicit user consent |

---

<!-- backlinks-start -->

## Referenced by

- [Conventions](../00-meta/CONVENTIONS.md)
- [Workflow Superpowers](../05-process/workflow_superpowers.md)
- [Agent Orchestration](../08-strategy/agent_orchestration.md)
- [Id Namespaces](id_namespaces.md)
- [Agents](../AGENTS.md)

<!-- backlinks-end -->
