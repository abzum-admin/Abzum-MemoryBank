---
id: strat-orchestration
title: Agent Orchestration
summary: End-to-end orchestration: 3-layer architecture, memory stack, intake-to-delivery flow
tags: [strategy, agents, orchestration]
updated: 2026-05-09
load_priority: 60
load_lane: context
status: active
---
# End-to-End Agent Orchestration — Abzum
**Version 0.1 — 2026-04-13 (design in progress)**

> **Context:** Abzum operates with 95% AI agents as its workforce. This document defines the complete orchestration architecture — how a request enters the system, flows through all layers of agents, and produces a deliverable — and how agents are provisioned, communicate, and learn over time.

---

## Overview: Three-Layer Architecture

Every request flows through three layers plus a persistent memory substrate beneath all of them.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 0: INTAKE                                                │
│  Vijay / Customer → Felix → Intake Agent → Paperclip          │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: PAPERCLIP META-LAYER  (global orchestration)         │
│  11 meta-agents coordinate all work across all projects        │
│  RBAC → Compliance check → Planner → Cost-Optimizer            │
│  → Project Allocator → Provisioning → Memory Manager          │
│  → Router → Strategy → Monitoring/Audit                       │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓  provisioned container + full context
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: PROJECT CONTAINER  (isolated, per-project)           │
│  Architect → Coder(s) → Spec Reviewer → Quality Reviewer       │
│  → Tester → DevOps Agent                                      │
│  [Agent Watcher monitors all agents across this container]     │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓  completion signals + learnings
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: MEMORY & LEARNING  (persistent substrate)            │
│  Hindsight · LLM Wiki · ByteRover · 10-memory/long_term.md                 │
│  Hermes (runtime across all layers)                            │
└─────────────────────────────────────────────────────────────────┘
```

**Communication medium:**
- Within containers: structured handoff documents (markdown files)
- Between layers: structured JSON objects
- All interactions: logged automatically to Hindsight episodic memory

---

## Memory Stack (Layer 3)

> **Full specification:** `05-process/memory_protocol.md` is the authoritative implementation guide — exact code patterns, event schemas, SQL queries, setup instructions, and governance rules. This section is a summary for architectural context only.

The memory stack gives Abzum agents institutional memory that compounds over time. Three components, each with a distinct role:

| Component | Role | Infrastructure | Intelligence Types |
|-----------|------|----------------|--------------------|
| **Hindsight** (Vectorize.io, MIT) | Primary agent memory — episodic, semantic, persona | PostgreSQL + pgvector | 7/9 types |
| **LLM Wiki** (Karpathy, MIT) | Procedural knowledge + architectural decisions | Markdown in git (zero infra) | Procedural primary, Semantic secondary |
| **ClickHouse** (Apache 2.0) | Analytics layer — all 9 types as structured events + BI feedback loop | Docker | All 9 types (analytics view) + Relational + Temporal primary |

**One-provider constraint:** Hermes supports exactly one external memory provider. Hindsight occupies that slot. LLM Wiki is a native Hermes skill (not a provider) and runs alongside Hindsight. ClickHouse receives events via `emit_signal()` hooks outside the Hermes memory API. ByteRover is deprecated — LLM Wiki `wiki/decisions/` replaces it.

### Hindsight — Four Memory Networks

| Network | Stores | Intelligence Type |
|---------|--------|-------------------|
| **World (𝒲)** | Objective org facts | Semantic |
| **Experience (ℬ)** | First-person agent actions + outcomes | Episodic + Outcome |
| **Opinion (𝒪)** | Confidence-scored beliefs (0–1 scale) | Persona |
| **Observation (𝒮)** | Preference-neutral entity summaries | Persona + Semantic |

TEMPR retrieval fuses four parallel paths: Semantic (HNSW pgvector) + Keyword (BM25 GIN) + Graph traversal + Temporal filtering. Benchmark: 91.4% LongMemEval.

### LLM Wiki — Structure

```
wiki/
├── index.md        ← agents read this first (~3,000 tokens)
├── entities/       ← clients, agents, projects, people
├── concepts/       ← frameworks, technologies, patterns
├── procedures/     ← step-by-step SOPs (updated by Analysis Agent)
├── decisions/      ← cross-project architectural decisions (replaces ByteRover)
└── syntheses/      ← saved query-answers as permanent pages
```

### ClickHouse — The 5 Capture Moments

Every agent emits structured signals at 5 moments: `task_start` (Intent) → `each_action` (Behavioral + cost) → `task_end` (Outcome + Relational) → `user_feedback` (Persona) → `periodic` (reflect + lint). These events power the BI feedback loop.

### Mandatory Agent Patterns

```python
# Before every task (pre-task pattern):
memories   = await hindsight.recall(task_description)     # episodic + semantic
procedures = await llm_wiki.query(task_description)       # procedural + decisions
emit_signal("task_start", {...})                           # analytics

# After every task (post-task hook):
await hindsight.retain(task_result.summary, metadata)     # episodic retention
if task_result.tool_call_count >= 5:
    await llm_wiki.ingest(transcript, "procedures")       # complex task → SOP
if task_result.has_architectural_decision:
    await llm_wiki.ingest(decision, "decisions")          # cross-project decision
emit_signal("task_end", {...})                             # analytics + relational
```

### BI Feedback Loop (Self-Improvement)

The Analysis Agent (Paperclip Meta-Layer) runs weekly/monthly queries on ClickHouse and writes improvements back into LLM Wiki and Hindsight:

1. **Model Routing** — Which model delivers best quality/cost per task type → updates `wiki/procedures/model_routing.md`
2. **Agent Performance** — Drift detection (>10% success rate change) → Felix escalation or procedure update
3. **Process Optimisation** — Gate rejection patterns → updated workflow SOPs
4. **Cost Optimisation** — Free tier utilisation + burn rate → updated `wiki/procedures/budget_rules.md`
5. **Client Intelligence** — Delivery quality trends → updated client entity pages + at-risk escalation

The loop closes: agents generate signals → ClickHouse stores → Analysis Agent queries → LLM Wiki/Hindsight updated → agents read updated context at next task_start → improved performance → new signals.

---

## Design In Progress

The following sections are being designed. This document will be updated as each section is confirmed.

### Pending Sections

- **Section 2: Intake & Request Classification** — How work enters the system (Vijay request, customer ticket, automated trigger), how it's classified and routed to Paperclip
- **Section 3: Paperclip Meta-Layer** — Detailed 11-agent design, how RBAC/Compliance/Planner/Cost-Optimizer coordinate, message formats between meta-agents
- **Section 4: Project Container Provisioning** — How containers are spun up, what context they receive at boot, how they're decommissioned
- **Section 5: Intra-Container Agent Workflow** — Detailed flow within a project container (Architect → Coder → Reviewers → DevOps), including the 6 mandatory gates
- **Section 6: Inter-Agent Communication** — Exact message formats, sync vs async, how Agent Watcher integrates
- **Section 7: Escalation & Human Oversight** — Full escalation matrix from L1 self-correct to L4 human intervention, HITL decision points
- **Section 8: Agent Lifecycle** — Spawn, active, idle, decommission states; Agent Watcher 4-level escalation ladder
- **Section 9: Security & Governance** — RBAC per agent type, Entra Agent IDs, prompt injection defences, audit trail

---

## References

- `08-strategy/persona_team_v013.md` — 17-persona project team, Hermes v0.13 ProviderProfile config, BV/BP subscription stacks, BA voice runtime
- `05-process/persona_hermes_config.md` — Pattern A (Model-as-Engine) vs Pattern B (CLI-as-Tool cowork) persona hosting
- `05-process/use_case_team_mapping.md` — Which personas join which UCs
- `personas/` — per-persona files
- `08-strategy/two_tier_architecture.md` — Paperclip + project container design
- `08-strategy/ai_native_5_tier_model.md` — 5-tier human org model
- `05-process/workflow_superpowers.md` — Workflow gates, TDD cycle, role definitions
- `05-process/memory_protocol.md` — Updated memory stack (this design)
- `05-process/handoff.md` — Structured handoff formats
- `06-infrastructure/03-services/agent_watcher.md` — Agent monitoring + escalation
- [Hindsight GitHub](https://github.com/vectorize-io/hindsight) — MIT, 91.4% LongMemEval
- [LLM Wiki pattern](https://github.com/SamurAIGPT/llm-wiki-agent) — Karpathy, MIT

---

*Owner: Felix Stanley (COO) — updated 2026-04-13*
