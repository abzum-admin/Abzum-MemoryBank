# Context Persistence — Abzum
**Memory Stack: Hermes + Hindsight + LLM Wiki**
**Updated: 2026-04-13**

---

## Why Context Persistence Is Critical

AI agents are ephemeral — each new subagent starts fresh. Memory is the infrastructure that makes continuity possible. **Context persistence is not optional — it's the difference between an agent that builds on prior work and one that starts from scratch every time.**

---

## Memory Architecture (Updated)

Abzum uses four complementary memory tools, each owning a distinct memory type. Together they give agents full institutional memory across sessions, projects, and time.

| Tool | Memory Type | What It Answers | Trigger |
|------|-------------|-----------------|---------|
| **Hindsight** | Episodic + Semantic + Client modeling | What happened, what we learned, how this client works | Post-task hook |
| **LLM Wiki** | Procedural + Domain knowledge | How do we do X, SOP for Y | Post-project / post-research |
| **ByteRover** | Cross-project decisions + patterns | What architectural decisions apply everywhere | Post-decision |
| **MEMORY.md** | COO long-term curation | Felix's distilled institutional wisdom | Heartbeat |

### Within a Single Project (5-Layer Stack)

Within an active project container, the five-layer system remains the source of truth for live task state:

| Layer | Mechanism | Purpose | Lifespan |
|-------|-----------|---------|---------|
| **Layer 1** | Project files (SPEC.md, ARCHITECTURE.md) | Long-term project truth | Permanent |
| **Layer 2** | TASK_TRACKER.md | Live task status per feature | Feature lifecycle |
| **Layer 3** | Inline dispatch context | Per-task agent input | Task duration |
| **Layer 4** | Hindsight recall + LLM Wiki query | Cross-session + procedural context | Permanent |
| **Layer 5** | ByteRover + MEMORY.md | Cross-project patterns + COO continuity | Permanent |

---

## Tool 1: Hindsight — Episodic + Semantic Memory

**What it is:** Open-source agent memory (MIT, Vectorize.io). 91.4% on LongMemEval — vs 63.8% for Graphiti, 49% for Mem0.

**Four memory networks:**

| Network | Stores | Example |
|---------|--------|---------|
| **World (𝒲)** | Objective org facts | "Client AcmeCo runs PostgreSQL 14 on Azure" |
| **Experience (ℬ)** | First-person agent actions | "We solved their slow query in session X via index optimisation" |
| **Opinion (𝒪)** | Confidence-scored beliefs (0–1) | "Vijay prefers terse summaries (confidence: 0.9)" |
| **Observation (𝒮)** | Preference-neutral entity summaries | "AcmeCo: fintech, 3 projects, compliance-focused" |

**Retrieval (TEMPR):** Four parallel paths fused via Reciprocal Rank Fusion:
- Semantic (HNSW vector index via pgvector)
- Keyword (BM25 full-text with GIN index)
- Graph traversal (entity/causal/temporal edges)
- Temporal filtering (normalised date ranges)

**Three operations:**
```python
await hindsight.retain(content, metadata)   # after every significant task
await hindsight.recall(query)               # before starting new work
await hindsight.reflect(topic)              # periodic synthesis
```

**Storage:** PostgreSQL + pgvector. Docker deployment or Python embedded.

---

## Tool 2: LLM Wiki — Procedural + Domain Knowledge

**What it is:** A compiled, contradiction-checked markdown knowledge base (Karpathy pattern, MIT). Zero infrastructure — plain markdown in git.

**Structure:**
```
wiki/
├── index.md           ← agent reads this first to find relevant pages
├── overview.md        ← synthesised cross-source summary
├── entities/          ← clients, agents, projects, people
├── concepts/          ← frameworks, technologies, patterns
├── procedures/        ← step-by-step SOPs
└── syntheses/         ← saved query-answers as permanent pages

raw/                   ← immutable source documents
```

**Three operations:**
- **Ingest** — new source → wiki pages generated → contradictions flagged at write time
- **Query** — agent reads `index.md` → loads relevant pages → synthesises in-context → optionally saves answer as synthesis page
- **Lint** — detects orphan pages, broken links, contradictions, gaps

**When to ingest:**
- After every project completion → lessons learned → procedures/
- After research sessions → research notes → concepts/
- After human corrections to agent output → correction → procedure update
- After client onboarding → client profile → entities/

**Agent query pattern:**
```
1. Read wiki/index.md (~3,000 tokens)
2. Identify relevant pages
3. Load only those pages into context
4. Synthesise answer
5. If novel answer: save as wiki/syntheses/YYYY-MM-DD-topic.md
```

---

## Tool 3: ByteRover — Cross-Project Decisions

ByteRover remains the authoritative store for architectural decisions that apply across all projects.

```bash
# After making a cross-project decision
brv curate "Use JWT (not sessions) for API auth across all Abzum projects"

# Before starting any new project/feature
brv query "How did we handle multi-tenancy in previous projects?"

brv status
brv curate view
```

**Rule:** Cross-project patterns belong in ByteRover. Project-specific facts belong in Hindsight. Procedural SOPs belong in LLM Wiki.

**Key paths:**
- Context tree: `/home/node/.openclaw/workspace/.brv/context-tree/`
- brv CLI: `/home/node/.openclaw/workspace/node_modules/.bin/brv`

---

## Tool 4: MEMORY.md — Felix COO Continuity

Felix maintains `MEMORY.md` at the root level: curated long-term wisdom, major decisions, client relationships, and lessons learned — reviewed and updated during heartbeat sessions.

Daily operational logs: `memory/logs/YYYY-MM-DD.md`

---

## Mandatory Agent Patterns

### Pre-Task (before any significant work)
```python
async def before_task_start(task_description):
    memories  = await hindsight.recall(task_description)
    procedures = await llm_wiki.query(task_description)
    patterns  = brv.query(task_description)
    # Combine into inline dispatch context for subagents
```

### Post-Task (after every significant task)
```python
async def on_task_complete(task_result):
    await hindsight.retain(task_result.summary, metadata)

    if task_result.tool_call_count >= 5:
        await llm_wiki.ingest(task_result.session_transcript, "procedures")

    if task_result.has_cross_project_decision:
        brv.curate(task_result.cross_project_decision)
```

---

## Golden Rules

1. **Context in files, not in prompts.** Any context needed must be in a readable file OR inline in dispatch prompt.
2. **Never assume the agent remembers.** Write it down. Every time.
3. **Recall before starting.** Query Hindsight + LLM Wiki + ByteRover before every significant task.
4. **Retain after completing.** Post-task hook is mandatory — not optional.
5. **TASK_TRACKER.md is live.** Update as tasks complete; it's the Orchestrator's source of truth.
6. **Inline for task dispatch.** Provide full context inline; don't make subagents read files mid-task.
7. **Text > Brain.** "Memory is limited — if you want to remember something, WRITE IT TO A FILE."

---

## Full Orchestration Design

See `strategy/agent_orchestration.md` for the complete end-to-end orchestration architecture including all three layers, agent lifecycle, inter-agent communication, and escalation design.

---

*Updated: 2026-04-13 — replaced ByteRover-only stack with Hermes + Hindsight + LLM Wiki*
*Source: strategy/agent_orchestration.md + AI_AGENT_CAPABILITIES_FRAMEWORK.md v1.0*
