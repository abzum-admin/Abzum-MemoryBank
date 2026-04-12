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
│  Hindsight · LLM Wiki · ByteRover · MEMORY.md                 │
│  Hermes (runtime across all layers)                            │
└─────────────────────────────────────────────────────────────────┘
```

**Communication medium:**
- Within containers: structured handoff documents (markdown files)
- Between layers: structured JSON objects
- All interactions: logged automatically to Hindsight episodic memory

---

## Memory Stack (Layer 3)

The memory stack gives Abzum agents institutional memory that compounds over time. It uses three complementary tools, each owning a distinct memory type.

### Tool Selection

| Tool | Memory Type | What It Answers | Open Source |
|------|-------------|-----------------|-------------|
| **Hindsight** (Vectorize.io) | Episodic + Semantic + User/Client modeling | What happened, what we learned, how this client works | ✅ MIT |
| **LLM Wiki** (Karpathy pattern) | Procedural + Domain knowledge | How do we do X, what is our SOP for Y | ✅ MIT |
| **ByteRover** | Cross-project patterns | What decisions have we made that apply everywhere | ✅ MIT |
| **MEMORY.md** | COO long-term curation | Felix's distilled institutional wisdom | N/A (file) |

### Hindsight — Episodic + Semantic Memory

Hindsight (MIT, 91.4% on LongMemEval — vs 63.8% for Graphiti, 49% for Mem0) manages all dynamic agent memory through four networks:

| Network | Stores | Example |
|---------|--------|---------|
| **World (𝒲)** | Objective org facts | "Client AcmeCo runs PostgreSQL 14 on Azure" |
| **Experience (ℬ)** | First-person agent actions | "We solved their slow query in session X via index optimisation" |
| **Opinion (𝒪)** | Confidence-scored beliefs | "Vijay prefers terse summaries (0.9 confidence)" |
| **Observation (𝒮)** | Preference-neutral entity summaries | "AcmeCo: fintech, 3 projects, focus on compliance" |

**TEMPR retrieval** (four parallel paths fused via Reciprocal Rank Fusion):
- Semantic — HNSW vector index (pgvector)
- Keyword — BM25 full-text (GIN index)
- Graph traversal — entity/causal/temporal edges
- Temporal filtering — normalised date ranges

**CARA reasoning** — agent disposition parameters (Skepticism, Literalism, Empathy, 1–5 scale) shape how opinions are formed and confidence scores updated.

**Three operations:**
```python
await hindsight.retain(content, metadata)   # after every significant task
await hindsight.recall(query)               # before starting new work
await hindsight.reflect(topic)              # periodic synthesis
```

**Storage:** PostgreSQL + pgvector. Docker deployment or Python embedded mode.

### LLM Wiki — Procedural + Domain Knowledge

LLM Wiki (Karpathy, MIT) maintains a compiled, contradiction-checked knowledge base of Abzum's procedures, SOPs, and domain expertise. Zero infrastructure — plain markdown in git.

```
wiki/
├── index.md              ← master catalog (agent reads this first)
├── overview.md           ← synthesised summary
├── entities/             ← clients, agents, projects, people
├── concepts/             ← frameworks, technologies, patterns
├── procedures/           ← step-by-step SOPs (MySQL hardening, CRM setup, etc.)
└── syntheses/            ← saved query-answers filed as permanent pages

raw/                      ← immutable source documents (reports, research, specs)
```

**Three operations:**
- **Ingest** — add new source → LLM generates/updates wiki pages → propagates to related pages → flags contradictions at write time
- **Query** — agent reads `index.md` → loads relevant pages → synthesises in-context → optionally saves answer as new synthesis page
- **Lint** — detects orphan pages, broken links, content gaps, contradictions

**When to ingest:**
- After every project completion (lessons learned → procedures)
- After research sessions (research notes → concepts)
- After human corrections to agent outputs (correction → procedure update)
- After each client onboarding (client profile → entities)

**Practical limit:** ~50–200 source documents before context-window ceiling. Use ByteRover/Hindsight for high-volume dynamic data; LLM Wiki for stable curated knowledge.

### ByteRover — Cross-Project Patterns

ByteRover remains the authoritative store for architectural decisions and patterns that apply across all projects.

```bash
brv curate "Use JWT (not sessions) for API auth across all Abzum projects"
brv query "How did we handle multi-tenancy in previous projects?"
brv status
```

**Rule:** Cross-project patterns belong in ByteRover. Project-specific facts belong in Hindsight. Procedural SOPs belong in LLM Wiki.

### MEMORY.md — Felix COO Continuity

Felix maintains `MEMORY.md` at the root level: curated long-term wisdom, major decisions, client relationships, and lessons learned — reviewed and updated during heartbeat sessions.

Daily operational logs live in `memory/logs/YYYY-MM-DD.md`.

### Post-Task Write Hook (mandatory for all agents)

Every agent executes this at task completion:

```python
async def on_task_complete(task_result):
    # 1. Hindsight: retain the experience
    await hindsight.retain(
        content=task_result.summary,
        metadata={
            "agent": agent_id,
            "client": task_result.client,
            "project": task_result.project,
            "task": task_result.task_name,
            "outcome": task_result.outcome
        }
    )

    # 2. LLM Wiki: if complex task (5+ tool calls), create/update procedure
    if task_result.tool_call_count >= 5:
        await llm_wiki.ingest(
            source=task_result.session_transcript,
            category="procedures"
        )

    # 3. ByteRover: if cross-project decision was made
    if task_result.has_cross_project_decision:
        brv.curate(task_result.cross_project_decision)

    # 4. TASK_TRACKER.md: mark task complete (Orchestrator handles this)
```

### Pre-Task Read Pattern (mandatory for all agents)

Every agent executes this before starting work:

```python
async def before_task_start(task_description):
    # 1. Recall from Hindsight
    memories = await hindsight.recall(task_description)

    # 2. Query LLM Wiki for relevant procedures
    wiki_context = await llm_wiki.query(task_description)

    # 3. Query ByteRover for cross-project patterns
    patterns = brv.query(task_description)

    # 4. Return combined context for inline dispatch
    return {
        "memories": memories,
        "procedures": wiki_context,
        "patterns": patterns
    }
```

### Memory Layer Comparison

| Capability | Hindsight | LLM Wiki | ByteRover | MEMORY.md |
|------------|-----------|----------|-----------|-----------|
| Episodic (what happened) | ✅ Primary | ❌ | ❌ | ✅ curated |
| Semantic (org facts) | ✅ World 𝒲 | ✅ entities/ | ❌ | ✅ curated |
| Procedural (how-to) | ❌ | ✅ Primary | 🟡 patterns | ❌ |
| User/client modeling | ✅ Opinion 𝒪 + Obs 𝒮 | ❌ | ❌ | ✅ curated |
| Cross-project decisions | ❌ | ❌ | ✅ Primary | ✅ curated |
| Temporal reasoning | ✅ TEMPR | ❌ | ❌ | ❌ |
| Infrastructure needed | PostgreSQL + pgvector | None (markdown) | ByteRover CLI | None (file) |
| Write trigger | Post-task hook | Post-project / post-research | Post-decision | Heartbeat |

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

- `strategy/two_tier_agent_architecture.md` — Paperclip + project container design
- `strategy/ai_native_org/ai_native_5_tier_org_model.md` — 5-tier human org model
- `execution/agent_workflow.md` — Workflow gates, TDD cycle, role definitions
- `execution/context_persistence.md` — Updated memory stack (this design)
- `execution/handoff_protocol.md` — Structured handoff formats
- `operations/agent_watcher/agent_watcher_system.md` — Agent monitoring + escalation
- [Hindsight GitHub](https://github.com/vectorize-io/hindsight) — MIT, 91.4% LongMemEval
- [LLM Wiki pattern](https://github.com/SamurAIGPT/llm-wiki-agent) — Karpathy, MIT

---

*Owner: Felix Stanley (COO) — updated 2026-04-13*
