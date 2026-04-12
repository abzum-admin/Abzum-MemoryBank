# Context Persistence — Abzum
## Memory Stack: Hermes + Hindsight + LLM Wiki + ClickHouse
**Version 2.0 — 2026-04-13**

> **Implementing agent:** Read this entire document before starting any memory-related work. It defines what to store, where to store it, when to store it, and how BI data flows back to improve the system. The Golden Rules at the end are non-negotiable.

---

## 1. Why Context Persistence Is Critical

AI agents are ephemeral — each subagent starts with zero memory of prior sessions. Without deliberate persistence, Abzum would restart from scratch on every task, unable to compound institutional knowledge, client understanding, or performance improvements.

**Memory is the infrastructure that makes an AI company compoundingly smarter over time.**

This document defines:
- What intelligence types agents generate and must capture
- Which tool captures which type and why
- Exact code patterns for pre-task reading and post-task writing
- How ClickHouse analytics feed back to improve agent performance

---

## 2. The Three-Component Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│  HERMES AGENT RUNTIME                                               │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   HINDSIGHT      │  │   LLM WIKI       │  │   CLICKHOUSE     │  │
│  │  (memory provider│  │  (Hermes skill,  │  │  (analytics      │  │
│  │   — 1 of 1 slot) │  │   always active) │  │   hook layer)    │  │
│  │                  │  │                  │  │                  │  │
│  │  hindsight.recall│  │  llm_wiki.query  │  │  emit_signal()   │  │
│  │  hindsight.retain│  │  llm_wiki.ingest │  │  (at 5 capture   │  │
│  │  hindsight.reflect  │  llm_wiki.lint   │  │   moments)       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼─────────────────────┼─────────────────────┼────────────┘
            ▼                     ▼                     ▼
  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
  │  PostgreSQL +    │  │  wiki/ (git)     │  │  ClickHouse OLAP     │
  │  pgvector        │  │  markdown files  │  │  (columnar store)    │
  │                  │  │                  │  │                      │
  │  Episodic memory │  │  Procedural +    │  │  All 9 types as      │
  │  Semantic memory │  │  Semantic SOPs   │  │  structured events   │
  │  Persona/opinion │  │  Entity profiles │  │  + Relational primary│
  │  Behavioral data │  │  Decisions log   │  │  + Temporal primary  │
  └──────────────────┘  └──────────────────┘  │  + Feedback loop     │
                                               └──────────────────────┘
                                                        │
                                               ┌────────▼─────────────┐
                                               │  ANALYSIS AGENT      │
                                               │  (Paperclip Layer 1) │
                                               │  reads weekly/monthly│
                                               │  writes back to      │
                                               │  LLM Wiki + Hindsight│
                                               └──────────────────────┘
```

**One-provider constraint (critical):** Hermes supports exactly ONE external memory provider at a time. Hindsight occupies that slot. LLM Wiki is a Hermes skill (not a provider) and runs alongside Hindsight without consuming the provider slot. ClickHouse is an analytics layer outside Hermes — it receives events via `emit_signal()` hooks, not through the Hermes memory API.

**Built-in files (always active, regardless of provider):**
- `MEMORY.md` — Felix COO long-term curation, reviewed at each heartbeat session
- `USER.md` — Vijay (MD) preferences and working style
- `IDENTITY.md` — Felix Stanley (COO) identity and role
- `AGENTS.md` — Agent instructions for this workspace
- `SOUL.md` — Core values and operating principles

---

## 3. Intelligence Taxonomy — All 9 Types

Every significant agent action generates signals across these 9 intelligence types. The memory stack must capture all 9. This section defines each type, what question it answers, and which tool is primary.

| # | Type | Core Question | Primary Tool | Secondary |
|---|------|---------------|--------------|-----------|
| 1 | **Procedural** | How do we do X step-by-step? | LLM Wiki (procedures/) | — |
| 2 | **Relational** | Who/what connects to whom, and how do those relationships perform? | ClickHouse | LLM Wiki (entities/) |
| 3 | **Episodic** | What happened, when, in what sequence? | Hindsight (Experience ℬ) | ClickHouse (event log) |
| 4 | **Persona** | What are Vijay's preferences, this client's working style, this agent's personality parameters? | Hindsight (Opinion 𝒪 + Obs 𝒮) | — |
| 5 | **Outcome** | What was the result? Did it succeed? What did it cost? | Hindsight (Experience ℬ) | ClickHouse (primary analytics) |
| 6 | **Semantic** | What do we know about this entity as fact? | Hindsight (World 𝒲) | LLM Wiki (entities/) |
| 7 | **Behavioral** | What actions did agents take, in what order, with what tool sequences? | ClickHouse (action events) | Hindsight |
| 8 | **Intent** | What was the agent trying to achieve? What was the original goal? | ClickHouse (task_start events) | — |
| 9 | **Temporal** | How has something changed over time? What are the trends and drifts? | ClickHouse (time-series) | Hindsight (TEMPR temporal filter) |

**Coverage rationale:**
- Hindsight covers 7/9 types richly — it is the primary agent memory
- LLM Wiki covers Procedural (primary) and supplements Semantic and Relational via structured entity pages
- ClickHouse fills the two types Hindsight cannot cover structurally: Relational (graph queries across projects) and Temporal (state diffs, trend detection, drift alerts)
- ClickHouse also provides the analytics view of all 9 types — enabling the BI feedback loop

---

## 4. Component 1: Hindsight (Memory Provider)

**Repository:** https://github.com/vectorize-io/hindsight  
**Licence:** MIT  
**Benchmark:** 91.4% LongMemEval (vs 63.8% Graphiti, 49% Mem0)  
**Infrastructure:** PostgreSQL + pgvector. Docker or Python embedded mode.

### 4.1 What It Is

Hindsight is a structured agent memory system that organises stored facts into four distinct networks, retrieves them via four parallel paths, and reasons about confidence through the CARA system. It occupies Hermes' single external memory provider slot.

### 4.2 Four Memory Networks

Each fact stored in Hindsight is routed to one of four networks based on its nature:

| Network | Symbol | Stores | Intelligence Type | Example |
|---------|--------|--------|-------------------|---------|
| **World** | 𝒲 | Objective, verifiable organisational facts | Semantic | "Client AcmeCo runs PostgreSQL 14.2 on Azure AU East" |
| **Experience** | ℬ | First-person agent actions and their outcomes | Episodic + Outcome | "Coder-01 implemented JWT auth for AcmeCo in session S-042. Tests passed. Deployed 2026-04-10." |
| **Opinion** | 𝒪 | Confidence-scored beliefs about preferences and behaviours | Persona | "Vijay prefers terse bullet-point summaries over prose. Confidence: 0.9" |
| **Observation** | 𝒮 | Preference-neutral entity summaries synthesised from multiple facts | Persona + Semantic | "AcmeCo: fintech startup, 3 active projects, compliance-focused, PostgreSQL-only constraint" |

**Routing rule:** When calling `hindsight.retain()`, include `network` in metadata to direct the fact to the correct network. If omitted, Hindsight infers from content — but explicit routing is more reliable.

### 4.3 TEMPR Retrieval

When `hindsight.recall(query)` is called, four retrieval paths run in parallel and results are fused via Reciprocal Rank Fusion:

1. **Semantic** — HNSW vector index (pgvector) — finds conceptually similar facts even without keyword overlap
2. **Keyword** — BM25 full-text search (GIN index) — finds exact term matches
3. **Graph traversal** — entity/causal/temporal edges — follows relationship chains between stored facts
4. **Temporal filtering** — normalised date ranges — prioritises recent facts, can filter by time window

**Implication for agents:** Recall queries should be descriptive and include entity names, timeframes, and task context. The richer the query, the more retrieval paths activate.

```python
# Good recall query — activates all 4 TEMPR paths
memories = await hindsight.recall(
    "JWT authentication implementation for AcmeCo API, security requirements, "
    "previous decisions on session vs token approach, past 90 days"
)

# Weak recall query — only semantic path likely to activate
memories = await hindsight.recall("auth")
```

### 4.4 CARA Reasoning

CARA parameters (Skepticism, Literalism, Empathy — each 1–5 scale) shape how Hindsight forms and updates Opinion 𝒪 confidence scores. Each Hermes agent profile can set different CARA parameters to tune how the agent interprets user signals.

- **Skepticism 5**: Requires multiple confirming signals before updating confidence score
- **Skepticism 1**: Updates confidence from a single signal
- **Empathy 5**: Heavily weights user emotional signals and communication style preferences
- **Literalism 5**: Stores instructions literally; does not infer implied preferences

### 4.5 Three Operations

```python
# RETAIN — call after every significant task or observation
await hindsight.retain(
    content="[Human-readable fact or summary of what happened]",
    metadata={
        "network": "world | experience | opinion | observation",
        "agent": "agent-id",
        "client": "client-name-or-null",
        "project": "project-id-or-null",
        "task": "task-name",
        "outcome": "success | failure | partial | escalated",
        "confidence": 0.85,            # required for Opinion 𝒪 network
        "entity": "entity-name",       # for World 𝒲 and Observation 𝒮
        "tags": ["jwt", "security", "acmeco"]
    }
)

# RECALL — call before every significant task
memories = await hindsight.recall(
    query="Descriptive query including entity names, task context, timeframes",
    top_k=10,                          # number of results to return
    time_window_days=90                # optional: limit to recent facts
)

# REFLECT — call periodically or after complex multi-session work
synthesis = await hindsight.reflect(
    topic="AcmeCo client relationship and technical preferences",
    depth="deep"                       # synthesises across all 4 networks for this topic
)
# Store the synthesis result back as an Observation:
await hindsight.retain(
    content=synthesis,
    metadata={"network": "observation", "entity": "AcmeCo", "agent": "felix-coo"}
)
```

### 4.6 Hindsight Limitations (Know These)

These are the two structural gaps that ClickHouse fills:

1. **No structured relational queries**: Hindsight cannot answer "Show me all agent-client pairings ranked by success rate." It stores and recalls facts but cannot aggregate across entities in SQL-style queries.

2. **No state before/after snapshots**: Hindsight stores facts, not diffs. It cannot answer "How has Coder-01's performance changed over the last 30 days?" It can recall individual facts that mention performance but cannot compute a trend.

Both gaps are covered by ClickHouse.

### 4.7 Setup Reference

```bash
# Docker deployment (recommended for production)
docker run -d \
  -e POSTGRES_PASSWORD=hindsight_secret \
  -e HINDSIGHT_BANK_ID=abzum-main \
  -p 5432:5432 \
  vectorize/hindsight:latest

# Python embedded (for local dev)
pip install hindsight
from hindsight import HindsightClient
hindsight = HindsightClient(bank_id="abzum-main", mode="embedded")
```

**Shared bank ID across all Hermes profiles:** All Abzum agents must use `bank_id="abzum-main"` so they share institutional memory. An agent that worked on AcmeCo in session 1 leaves memory that the next agent in session 2 can recall.

```yaml
# In every Hermes agent profile (hermes/profiles/<agent>.yaml)
memory:
  provider: hindsight
  config:
    bank_id: "abzum-main"
    host: "${HINDSIGHT_HOST}"
    port: 5432
    password: "${HINDSIGHT_PASSWORD}"
    cara:
      skepticism: 3
      literalism: 3
      empathy: 3
```

---

## 5. Component 2: LLM Wiki (Hermes Skill)

**Pattern:** Karpathy LLM Wiki  
**Licence:** MIT  
**Infrastructure:** Zero — plain markdown files in git  
**Hermes integration:** Native skill (PR #5635) — always active alongside any memory provider

### 5.1 What It Is

LLM Wiki maintains a compiled, contradiction-checked knowledge base of Abzum's procedures, SOPs, domain expertise, entity profiles, and architectural decisions. It is the institutional long-term knowledge store — Hindsight is the episodic memory store. They are complementary, not overlapping.

**Critical distinction:**
- Hindsight stores **what happened** (episodic, dynamic, automatically populated)
- LLM Wiki stores **how to do things** (procedural, curated, human/agent validated)

### 5.2 Directory Structure

```
wiki/
├── index.md              ← AGENTS READ THIS FIRST — master catalog with 1-line descriptions
│                           of every page. ~3,000 tokens. Load to identify which pages to read.
├── overview.md           ← Synthesised cross-source summary of all knowledge
│
├── entities/             ← WHO and WHAT (Semantic + Relational intelligence)
│   ├── clients/
│   │   ├── acmeco.md     ← Client profile: tech stack, preferences, history, contacts
│   │   └── ...
│   ├── agents/
│   │   ├── coder-agent.md   ← Agent capabilities, known strengths, known weaknesses
│   │   └── ...
│   └── projects/
│       └── project-alpha.md ← Project summary, decisions made, lessons learned
│
├── concepts/             ← FRAMEWORKS and TECHNOLOGIES (Semantic intelligence)
│   ├── jwt-vs-sessions.md   ← When to use JWT vs sessions — decision made 2026-03-15
│   ├── tdd-discipline.md
│   └── ...
│
├── procedures/           ← HOW TO DO THINGS (Procedural intelligence — PRIMARY)
│   ├── model_routing.md     ← Which model to use for which task type (updated by Analysis Agent)
│   ├── budget_rules.md      ← Budget allocation rules (updated by Analysis Agent)
│   ├── tdd_cycle.md         ← RED → GREEN → REFACTOR step-by-step
│   ├── gate_workflow.md     ← 6-gate workflow with pass/fail criteria
│   ├── mysql_hardening.md   ← MySQL security hardening SOP
│   └── ...
│
├── decisions/            ← ARCHITECTURAL DECISIONS (replaces ByteRover for cross-project decisions)
│   ├── use-jwt-not-sessions.md    ← Decision + rationale + date + who decided
│   ├── postgres-not-mysql.md
│   └── ...
│
└── syntheses/            ← SAVED QUERY ANSWERS (filed as permanent pages)
    ├── 2026-04-12-acmeco-tech-stack-summary.md
    └── ...

raw/                      ← IMMUTABLE SOURCE DOCUMENTS (never edit these)
    ├── specs/
    ├── research/
    └── reports/
```

### 5.3 Three Operations

```python
# INGEST — add new knowledge to the wiki
await llm_wiki.ingest(
    source=content,                    # string or file path
    category="procedures",             # entities | concepts | procedures | decisions | syntheses
    title="mysql-hardening-sop",       # becomes filename in wiki/<category>/
    tags=["mysql", "security", "sop"]
)
# Ingest automatically:
# - Generates/updates wiki pages from source
# - Propagates changes to related pages (wikilinks)
# - Flags contradictions with existing pages at write time
# - Updates wiki/index.md

# QUERY — retrieve procedural knowledge before a task
wiki_context = await llm_wiki.query(
    query="How do we handle JWT authentication for API endpoints?",
    max_pages=5                        # load top N most relevant pages
)
# Returns: list of relevant page contents ready to inject into agent context

# LINT — detect knowledge base health issues
issues = await llm_wiki.lint()
# Returns: orphan pages, broken wikilinks, content gaps, contradictions
# Run: after every major ingest batch, weekly via Analysis Agent
```

### 5.4 When to Ingest

| Trigger | Category | What Gets Ingested |
|---------|----------|--------------------|
| After every project completion | `procedures/` | Lessons learned as new/updated SOPs |
| After any research session | `concepts/` | Research notes → distilled concept pages |
| After human corrections to agent output | `procedures/` | Correction becomes a procedure update |
| After each client onboarding | `entities/clients/` | Client profile with tech stack, preferences, constraints |
| After any cross-project architectural decision | `decisions/` | Decision + rationale + date + who |
| After Analysis Agent generates optimised routing rules | `procedures/model_routing.md` | Updated routing table |
| After Analysis Agent generates budget insights | `procedures/budget_rules.md` | Updated budget allocation |
| After task with 5+ tool calls (complex task) | `procedures/` | Session transcript → new/updated procedure |

**Practical limit:** ~50–200 source documents before context-window ceiling becomes a constraint. Use Hindsight for high-volume dynamic data; LLM Wiki for stable curated knowledge only.

### 5.5 Agent Query Pattern

```
1. Read wiki/index.md (~3,000 tokens)
2. Identify the 3-5 most relevant pages for this task
3. Load only those pages into context (not the entire wiki)
4. Synthesise answer from loaded pages
5. If the answer is novel and non-obvious: save as wiki/syntheses/YYYY-MM-DD-topic.md
```

### 5.6 Replacing ByteRover

LLM Wiki `wiki/decisions/` completely replaces ByteRover for cross-project architectural decisions:

```bash
# OLD (ByteRover — deprecated, one-provider constraint violated):
brv curate "Use JWT (not sessions) for API auth across all Abzum projects"
brv query "How did we handle multi-tenancy in previous projects?"

# NEW (LLM Wiki):
await llm_wiki.ingest(
    source="Decision: Use JWT (not sessions) for all Abzum API authentication. "
           "Rationale: stateless, scales horizontally, Hindsight Opinion network "
           "shows 100% of our APIs need mobile client support. "
           "Decided: 2026-03-15. Approver: Vijay Tilak.",
    category="decisions",
    title="use-jwt-not-sessions"
)

# Retrieve before any auth-related task:
wiki_context = await llm_wiki.query("API authentication approach, JWT vs sessions")
```

---

## 6. Component 3: ClickHouse (Analytics Layer)

**Project:** ClickHouse (open-source, Apache 2.0)  
**UI:** HyperDX (open-source, MIT) — ClickStack bundle  
**Infrastructure:** Docker container, independent of PostgreSQL/Hindsight  
**Access pattern:** Write via `emit_signal()` at agent hooks; Read via SQL queries in Analysis Agent

### 6.1 Why Direct Agent Hooks (Not Tapping Hindsight)

ClickHouse receives events directly from agent hooks — it does NOT read from Hindsight's PostgreSQL. Reasons:

| Factor | Tap Hindsight PostgreSQL | Direct Agent Hooks |
|--------|------------------------|-------------------|
| Schema control | Hindsight's schema is optimised for recall — unstructured text + metadata blobs | Define exactly the typed columns ClickHouse needs for OLAP queries |
| Capture completeness | Hindsight doesn't store: timing data, token counts, API costs, routing decisions, retry counts, gate pass/fail | Agent hooks emit ALL structured signals at each capture moment |
| Coupling risk | If Hindsight internal schema changes (it's 0.x), BI pipeline breaks | Agent hooks are your own contract — you control both sides |
| Performance isolation | CDC/replication adds read load to the primary memory DB agents depend on | Zero impact on agent memory performance |
| Data freshness | CDC adds seconds-to-minutes latency | Events arrive in real-time |

**Rule:** Hindsight PostgreSQL is strictly agent memory. ClickHouse is strictly analytics. They are independent. The agent writes to both from the same hook, but they never read from each other.

### 6.2 The 5 Capture Moments — Event Schemas

Every agent emits signals at exactly these 5 moments. All schemas below are the required minimum — add fields as needed, never remove required fields.

#### Moment 1: task_start

```python
emit_signal("task_start", {
    # Identity
    "signal_type": "task_start",
    "task_id": "T-2026-0413-001",      # unique task ID, format: T-YYYY-MMDD-NNN
    "agent_id": "coder-01",
    "agent_role": "coder",             # architect | coder | spec_reviewer | quality_reviewer | tester | devops | felix

    # Context
    "project": "project-alpha",
    "client": "AcmeCo",
    "feature": "jwt-authentication",
    "task_type": "feature_implementation",  # see task_type taxonomy below

    # Intent (captures Intelligence Type 8)
    "intent_description": "Implement JWT authentication for /api/users endpoint",
    "acceptance_criteria": "All 6 Playwright tests pass, security review approved",
    "estimated_complexity": "medium",   # low | medium | high | very_high

    # Model selection
    "model": "deepseek/deepseek-r1",
    "model_tier": "free",              # free | paid_low | paid_high

    # Pre-task context loaded
    "hindsight_memories_loaded": 8,    # count of memories recalled
    "wiki_pages_loaded": 3,            # count of wiki pages loaded
    "context_tokens": 12400,           # total context window used at start

    "timestamp": "2026-04-13T10:30:00Z"
})
```

**Task type taxonomy (standardised values):**
```
feature_implementation | bug_fix | security_review | architecture_design |
code_review | test_writing | deployment | documentation | research |
refactoring | client_onboarding | incident_response | escalation_handling
```

#### Moment 2: each_action (every tool call or significant step)

```python
emit_signal("action", {
    "signal_type": "action",
    "task_id": "T-2026-0413-001",      # links back to task_start
    "agent_id": "coder-01",
    "action_sequence": 3,              # monotonic counter within task

    # What happened
    "action_type": "tool_call",        # tool_call | model_inference | agent_handoff | file_read | file_write | test_run
    "tool_name": "write_file",         # specific tool/function name
    "action_description": "Writing JWT middleware to src/middleware/auth.js",

    # Cost (captures Behavioral + Outcome cost data)
    "model": "deepseek/deepseek-r1",
    "tokens_in": 3200,
    "tokens_out": 1100,
    "cost_usd": 0.0,                   # 0.0 for free tier models
    "duration_ms": 4200,

    # Result
    "action_outcome": "success",       # success | failure | retry
    "error_message": null,             # populate on failure

    "timestamp": "2026-04-13T10:30:45Z"
})
```

#### Moment 3: task_end

```python
emit_signal("task_end", {
    "signal_type": "task_end",
    "task_id": "T-2026-0413-001",
    "agent_id": "coder-01",
    "agent_role": "coder",

    # Outcome (captures Intelligence Types 4, 5, 7)
    "outcome": "success",              # success | failure | escalated | partial
    "failure_reason": null,            # populate on failure: test_failure | review_rejection | timeout | escalated
    "escalated_to": null,              # agent_id or "human" if escalated

    # Test results
    "tests_run": 12,
    "tests_passed": 12,
    "tests_failed": 0,
    "test_framework": "jest",

    # Gate results (captures Behavioral quality gates)
    "gate_results": {
        "spec_review": "pass",         # pass | fail | skip
        "quality_review": "pass",
        "security_review": "pass"
    },

    # Cost summary
    "total_tokens_in": 28400,
    "total_tokens_out": 9200,
    "total_cost_usd": 0.0,
    "total_duration_ms": 185000,       # task wall-clock time in ms
    "total_action_count": 14,

    # Retries and escalation (captures Behavioral complexity signals)
    "retry_count": 0,                  # total retries within task
    "model_switches": 0,               # how many times model was changed mid-task
    "context_reloads": 0,              # how many times context was refreshed

    # Collaboration (captures Relational intelligence)
    "collaborating_agents": ["spec-reviewer-01", "quality-reviewer-01"],
    "handoff_count": 2,                # number of times task was handed to another agent

    # Memory written
    "hindsight_facts_retained": 2,     # how many retain() calls were made
    "wiki_pages_updated": 1,           # how many wiki pages were ingested/updated

    # Project / client
    "project": "project-alpha",
    "client": "AcmeCo",
    "feature": "jwt-authentication",
    "task_type": "feature_implementation",

    "timestamp": "2026-04-13T10:33:05Z"
})
```

#### Moment 4: user_feedback

```python
emit_signal("user_feedback", {
    "signal_type": "user_feedback",
    "task_id": "T-2026-0413-001",      # task this feedback relates to
    "agent_id": "felix-coo",           # agent who received feedback
    "feedback_source": "vijay",        # vijay | client | automated_test

    # Feedback content (captures Persona intelligence)
    "sentiment": "positive",           # positive | negative | neutral | correction
    "feedback_category": "output_quality",  # output_quality | communication_style | speed | cost | other
    "feedback_text": "Good implementation but summary was too verbose — keep it to 3 bullets max",

    # Action taken
    "action_taken": "wiki_updated",    # wiki_updated | hindsight_retained | escalated | none
    "preference_extracted": "Vijay prefers maximum 3-bullet summaries for task completions",

    "timestamp": "2026-04-13T10:45:00Z"
})
```

#### Moment 5: periodic (reflect + lint)

```python
emit_signal("periodic_reflect", {
    "signal_type": "periodic_reflect",
    "agent_id": "felix-coo",
    "reflect_type": "weekly_synthesis",  # weekly_synthesis | monthly_client_review | quarterly_strategy

    # Synthesis results
    "topics_reflected": ["AcmeCo client relationship", "Coder-01 performance", "JWT decisions"],
    "new_observations_stored": 3,
    "wiki_lint_issues_found": 2,
    "wiki_lint_issues_resolved": 1,

    # Performance snapshot at time of reflection
    "tasks_this_period": 47,
    "success_rate_this_period": 0.89,
    "total_cost_this_period_usd": 8.40,

    "timestamp": "2026-04-13T00:00:00Z"
})
```

#### State-change events (emit when significant entity state transitions occur)

```python
emit_signal("state_change", {
    "signal_type": "state_change",
    "entity": "project-alpha",
    "entity_type": "project",          # project | feature | client | agent | deployment
    "field": "status",
    "old_value": "in_review",
    "new_value": "deployed",
    "cause": "All 6 gates passed. DevOps agent deployed to staging.",
    "agent_id": "devops-01",
    "task_id": "T-2026-0413-001",
    "timestamp": "2026-04-13T14:00:00Z"
})
```

### 6.3 ClickHouse Setup

```bash
# ClickStack (ClickHouse + HyperDX UI) via Docker
docker compose up -d

# docker-compose.yml
version: '3.8'
services:
  clickhouse:
    image: clickhouse/clickhouse-server:latest
    ports:
      - "8123:8123"    # HTTP interface
      - "9000:9000"    # Native interface
    volumes:
      - clickhouse_data:/var/lib/clickhouse
    environment:
      CLICKHOUSE_DB: abzum_analytics
      CLICKHOUSE_USER: abzum
      CLICKHOUSE_PASSWORD: ${CLICKHOUSE_PASSWORD}

  hyperdx:
    image: hyperdxio/hyperdx:latest
    ports:
      - "8080:8080"
    environment:
      CLICKHOUSE_URL: http://clickhouse:8123
      CLICKHOUSE_USER: abzum
      CLICKHOUSE_PASSWORD: ${CLICKHOUSE_PASSWORD}
    depends_on:
      - clickhouse

volumes:
  clickhouse_data:
```

```sql
-- Create the signals table (all signal types in one table, differentiated by signal_type)
CREATE TABLE abzum_analytics.signals (
    signal_type     LowCardinality(String),
    task_id         String,
    agent_id        LowCardinality(String),
    agent_role      LowCardinality(String),
    project         LowCardinality(String),
    client          LowCardinality(String),
    feature         String,
    task_type       LowCardinality(String),
    outcome         LowCardinality(String),
    model           LowCardinality(String),
    model_tier      LowCardinality(String),
    tokens_in       UInt32,
    tokens_out      UInt32,
    cost_usd        Float32,
    duration_ms     UInt32,
    extra           String,            -- JSON blob for signal-specific fields
    timestamp       DateTime
) ENGINE = MergeTree()
ORDER BY (signal_type, timestamp, agent_id)
PARTITION BY toYYYYMM(timestamp);
```

```python
# emit_signal() implementation — call from every agent hook
from clickhouse_driver import Client as CHClient
import json

_ch = CHClient(
    host=os.getenv("CLICKHOUSE_HOST", "localhost"),
    database="abzum_analytics",
    user="abzum",
    password=os.getenv("CLICKHOUSE_PASSWORD")
)

def emit_signal(signal_type: str, data: dict):
    """Emit a structured analytics signal to ClickHouse. Never blocks agent execution."""
    try:
        # Extract standard fields, put remainder in extra JSON
        standard_fields = {
            "signal_type", "task_id", "agent_id", "agent_role",
            "project", "client", "feature", "task_type", "outcome",
            "model", "model_tier", "tokens_in", "tokens_out",
            "cost_usd", "duration_ms", "timestamp"
        }
        row = {k: data.get(k, "") for k in standard_fields}
        row["signal_type"] = signal_type
        row["extra"] = json.dumps({k: v for k, v in data.items() if k not in standard_fields})

        _ch.execute("INSERT INTO signals VALUES", [row])
    except Exception as e:
        # CRITICAL: analytics failures MUST NOT block agent execution
        logger.warning(f"ClickHouse signal failed (non-fatal): {e}")
```

---

## 7. Mandatory Agent Patterns

These patterns are non-negotiable. Every agent executes them at the start and end of every significant task.

### 7.1 Pre-Task Pattern (before any significant work)

```python
async def before_task_start(task_description: str, task_id: str, agent_config: dict) -> dict:
    """
    Execute before starting any task that involves more than 3 tool calls.
    Returns combined context dict for injection into agent prompt.
    """
    # 1. Emit task_start signal to ClickHouse
    emit_signal("task_start", {
        "task_id": task_id,
        "agent_id": agent_config["agent_id"],
        "agent_role": agent_config["role"],
        "project": agent_config["project"],
        "client": agent_config["client"],
        "intent_description": task_description,
        "model": agent_config["model"],
        "model_tier": agent_config["model_tier"],
        "estimated_complexity": estimate_complexity(task_description),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

    # 2. Recall from Hindsight (episodic + semantic memory)
    memories = await hindsight.recall(
        query=task_description,
        top_k=10,
        time_window_days=90
    )

    # 3. Query LLM Wiki for relevant procedures and decisions
    # First check index.md to identify relevant pages, then load them
    wiki_context = await llm_wiki.query(
        query=task_description,
        max_pages=5
    )

    # 4. Return combined context for injection into agent system prompt
    context = {
        "memories": memories,        # What we've done before
        "procedures": wiki_context,  # How to do this correctly
        "metadata": {
            "memories_count": len(memories),
            "wiki_pages_count": len(wiki_context)
        }
    }

    # 5. Log memory loading stats to ClickHouse
    emit_signal("action", {
        "task_id": task_id,
        "agent_id": agent_config["agent_id"],
        "action_sequence": 0,
        "action_type": "context_load",
        "action_description": f"Loaded {len(memories)} memories and {len(wiki_context)} wiki pages",
        "action_outcome": "success",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

    return context
```

### 7.2 Post-Task Write Hook (after every significant task)

```python
async def on_task_complete(task_result: TaskResult, agent_config: dict):
    """
    Execute after every task completion, regardless of outcome.
    This hook is MANDATORY — skipping it breaks institutional memory.
    """

    # 1. Hindsight: retain the experience (Intelligence Types: Episodic, Outcome)
    await hindsight.retain(
        content=(
            f"Task: {task_result.task_name}\n"
            f"Outcome: {task_result.outcome}\n"
            f"Summary: {task_result.summary}\n"
            f"Key decisions: {task_result.key_decisions}\n"
            f"What worked: {task_result.what_worked}\n"
            f"What failed: {task_result.what_failed}"
        ),
        metadata={
            "network": "experience",
            "agent": agent_config["agent_id"],
            "client": task_result.client,
            "project": task_result.project,
            "task": task_result.task_name,
            "outcome": task_result.outcome,
            "tags": task_result.tags
        }
    )

    # 2. LLM Wiki: if complex task (5+ tool calls), create/update procedure
    if task_result.tool_call_count >= 5:
        await llm_wiki.ingest(
            source=task_result.session_transcript,
            category="procedures",
            title=f"{task_result.task_type}-{task_result.feature}-procedure",
            tags=task_result.tags
        )

    # 3. LLM Wiki: if cross-project architectural decision was made
    if task_result.has_architectural_decision:
        await llm_wiki.ingest(
            source=(
                f"Decision: {task_result.decision_summary}\n"
                f"Rationale: {task_result.decision_rationale}\n"
                f"Decided: {datetime.utcnow().date()}\n"
                f"Approver: {task_result.decision_approver}"
            ),
            category="decisions",
            title=task_result.decision_slug
        )

    # 4. ClickHouse: emit task_end signal (Intelligence Types: Outcome, Behavioral, Relational)
    emit_signal("task_end", {
        "task_id": task_result.task_id,
        "agent_id": agent_config["agent_id"],
        "agent_role": agent_config["role"],
        "outcome": task_result.outcome,
        "failure_reason": task_result.failure_reason,
        "escalated_to": task_result.escalated_to,
        "tests_run": task_result.tests_run,
        "tests_passed": task_result.tests_passed,
        "tests_failed": task_result.tests_failed,
        "gate_results": task_result.gate_results,
        "total_tokens_in": task_result.total_tokens_in,
        "total_tokens_out": task_result.total_tokens_out,
        "total_cost_usd": task_result.total_cost_usd,
        "total_duration_ms": task_result.total_duration_ms,
        "total_action_count": task_result.total_action_count,
        "retry_count": task_result.retry_count,
        "model_switches": task_result.model_switches,
        "collaborating_agents": task_result.collaborating_agents,
        "hindsight_facts_retained": 1 + (1 if task_result.has_architectural_decision else 0),
        "wiki_pages_updated": (1 if task_result.tool_call_count >= 5 else 0) +
                               (1 if task_result.has_architectural_decision else 0),
        "project": task_result.project,
        "client": task_result.client,
        "feature": task_result.feature,
        "task_type": task_result.task_type,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

    # 5. Orchestrator marks task complete in TASK_TRACKER.md
    # (Orchestrator handles this — not the agent's responsibility)
```

---

## 8. Within-Project 5-Layer Context Stack

Within an active project container, the five-layer system is the source of truth for live task state. All five layers must be populated before agent work begins.

| Layer | Mechanism | Purpose | Lifespan |
|-------|-----------|---------|---------|
| **Layer 1** | Project files (SPEC.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md) | Long-term project truth — what we're building and why | Permanent (project lifetime) |
| **Layer 2** | TASK_TRACKER.md | Live task status per feature — what's done, in-progress, blocked | Feature lifecycle |
| **Layer 3** | Inline dispatch context | Per-task agent input — full context injected at subagent launch | Task duration only |
| **Layer 4** | Hindsight recall + LLM Wiki query | Cross-session episodic memory + procedural SOPs | Permanent (organisational) |
| **Layer 5** | ClickHouse analytics + MEMORY.md | Performance trends + COO long-term institutional wisdom | Permanent |

**Rule:** Layers 4 and 5 are read at task_start (pre-task pattern). Layer 3 is constructed from Layers 1, 2, 4, 5 and injected as the agent's system prompt. Subagents never read files mid-task — all context is provided inline.

---

## 9. The BI Feedback Loop — Self-Improvement and Optimisation

### 9.1 Architecture

```
Agents → emit_signal() → ClickHouse
                              │
              ┌───────────────▼──────────────────┐
              │       ANALYSIS AGENT             │
              │  (Paperclip Meta-Layer, Layer 1) │
              │                                  │
              │  Schedule:                       │
              │  • Weekly: routing, perf, cost   │
              │  • Monthly: process, clients     │
              │  • Quarterly: full review        │
              └───────────────┬──────────────────┘
                              │ generates structured insights
              ┌───────────────▼──────────────────────────────────┐
              │              INSIGHT ROUTING                      │
              │                                                   │
              │  Auto-apply (additive only, no deletions):       │
              │  → LLM Wiki: update procedures/model_routing.md  │
              │  → LLM Wiki: update procedures/budget_rules.md   │
              │  → Hindsight: retain as institutional learning   │
              │                                                   │
              │  Human review required:                          │
              │  → Felix COO: agent prompt changes               │
              │  → Vijay: budget reallocations                   │
              │  → Felix: client risk flags                       │
              └───────────────┬──────────────────────────────────┘
                              │ updated procedures in LLM Wiki
              ┌───────────────▼──────────────────┐
              │  AGENTS read updated context     │
              │  at next task_start              │
              │  via pre-task pattern            │
              └───────────────┬──────────────────┘
                              │ improved performance
                              ▼
                      new signals emitted
                              │
                              ▼
                        CLOSED LOOP
```

### 9.2 The 5 Feedback Channels

#### Channel 1: Model Routing Optimisation (weekly)

**Reads:** task_end signals, action signals  
**Writes to:** `wiki/procedures/model_routing.md`  
**Auto-apply:** Yes (within same cost tier)  
**Human review:** If routing shift crosses cost tiers (e.g., free → paid)

```sql
-- Which model delivers best quality-per-dollar per task type?
SELECT
    task_type,
    model,
    COUNT(*)                                                      AS task_count,
    AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END)     AS success_rate,
    AVG(total_cost_usd)                                           AS avg_cost_usd,
    AVG(total_duration_ms) / 1000.0                               AS avg_duration_sec,
    AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END)
        / GREATEST(AVG(total_cost_usd), 0.001)                    AS quality_per_dollar
FROM signals
WHERE signal_type = 'task_end'
  AND timestamp > now() - INTERVAL 7 DAY
GROUP BY task_type, model
HAVING task_count >= 5
ORDER BY task_type, quality_per_dollar DESC;
```

**Output example:**
```
task_type: unit_test_writing
  deepseek-r1 (free):  success=0.92, cost=$0.00, quality_per_dollar=∞   ← USE THIS
  minimax-m2.7 (paid): success=0.88, cost=$0.004, quality_per_dollar=220

task_type: architecture_design
  claude-sonnet (paid): success=0.97, cost=$0.18, quality_per_dollar=5.4  ← USE THIS
  deepseek-r1 (free):   success=0.71, cost=$0.00, quality_per_dollar=∞    ← save money but lower quality
```

**→ Action:** Analysis Agent ingests updated routing table into `wiki/procedures/model_routing.md`. Next agent reads it at task_start via LLM Wiki query → correct model selected.

#### Channel 2: Agent Performance Tuning (weekly)

**Reads:** task_end signals  
**Writes to:** Hindsight Opinion 𝒪 network + Felix escalation if degrading  
**Auto-apply:** Hindsight retain only. Agent prompt changes require Felix review.

```sql
-- Detect agent performance drift vs 4-week baseline
WITH baseline AS (
    SELECT
        agent_id,
        AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END) AS success_rate,
        AVG(retry_count)                                          AS avg_retries
    FROM signals
    WHERE signal_type = 'task_end'
      AND timestamp BETWEEN now() - INTERVAL 35 DAY AND now() - INTERVAL 7 DAY
    GROUP BY agent_id
),
this_week AS (
    SELECT
        agent_id,
        AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END) AS success_rate,
        AVG(retry_count)                                          AS avg_retries,
        COUNT(*)                                                  AS task_count
    FROM signals
    WHERE signal_type = 'task_end'
      AND timestamp > now() - INTERVAL 7 DAY
    GROUP BY agent_id
)
SELECT
    t.agent_id,
    t.task_count,
    t.success_rate                        AS this_week_success,
    b.success_rate                        AS baseline_success,
    t.success_rate - b.success_rate       AS drift,
    t.avg_retries - b.avg_retries         AS retry_drift
FROM this_week t
JOIN baseline b USING (agent_id)
WHERE abs(t.success_rate - b.success_rate) > 0.10    -- flag >10% change
   OR abs(t.avg_retries - b.avg_retries) > 0.5       -- flag >0.5 avg retry increase
ORDER BY drift ASC;
```

**→ Action:**
- Degrading agent (drift < -0.10): Escalate to Felix with data. Felix reviews agent prompt and skills.
- Improving agent (drift > +0.10): Capture what changed as a procedure update. Retain improvement in Hindsight.

#### Channel 3: Process Optimisation (monthly)

**Reads:** task_end signals (gate_results field), action signals  
**Writes to:** `wiki/procedures/gate_workflow.md`, specific SOP pages  
**Auto-apply:** Additive procedure additions. Changes to existing gates require Felix review.

```sql
-- Which gates have the highest rejection rates?
SELECT
    gate_name,
    COUNT(*)                                                          AS total_reviews,
    AVG(CASE WHEN gate_result = 'fail' THEN 1.0 ELSE 0.0 END)        AS rejection_rate,
    AVG(duration_ms)                                                  AS avg_gate_duration_ms
FROM (
    -- Unnest gate_results JSON into rows
    SELECT
        task_id,
        JSONExtractString(extra, 'gate_results') AS gate_json,
        arrayJoin(['spec_review', 'quality_review', 'security_review']) AS gate_name,
        JSONExtractString(JSONExtractString(extra, 'gate_results'), gate_name) AS gate_result,
        duration_ms
    FROM signals
    WHERE signal_type = 'task_end'
      AND timestamp > now() - INTERVAL 30 DAY
) gate_data
GROUP BY gate_name
ORDER BY rejection_rate DESC;

-- What are the most common gate rejection reasons?
SELECT
    JSONExtractString(extra, 'gate_rejection_reason') AS reason,
    COUNT(*)                                           AS occurrences
FROM signals
WHERE signal_type = 'task_end'
  AND outcome = 'failure'
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY reason
ORDER BY occurrences DESC
LIMIT 10;
```

**→ Action:** If Quality Review rejects 40%+ of Coder Agent outputs for "missing error handling," Analysis Agent ingests a new mandatory checklist item into `wiki/procedures/tdd_cycle.md`. Next Coder Agent reads the updated procedure at task_start → error handling becomes standard practice.

#### Channel 4: Cost Optimisation (weekly)

**Reads:** task_end signals, action signals  
**Writes to:** `wiki/procedures/budget_rules.md`  
**Auto-apply:** Yes for routing adjustments within budget. Budget reallocations require Vijay approval.

```sql
-- Weekly cost burn rate by model
SELECT
    model,
    model_tier,
    COUNT(*)           AS task_count,
    SUM(total_cost_usd) AS total_spend_usd,
    AVG(total_cost_usd) AS avg_cost_per_task
FROM signals
WHERE signal_type = 'task_end'
  AND timestamp > now() - INTERVAL 7 DAY
GROUP BY model, model_tier
ORDER BY total_spend_usd DESC;

-- Free tier utilisation check: are we leaving free capacity unused?
SELECT
    model,
    COUNT(*) AS tasks_this_week,
    COUNT(*) / 7.0 AS avg_daily_tasks,
    CASE
        WHEN model LIKE '%deepseek%' THEN 1000
        WHEN model LIKE '%qwen%'    THEN 1000
        ELSE NULL
    END AS daily_free_limit,
    (COUNT(*) / 7.0) / CASE
        WHEN model LIKE '%deepseek%' THEN 1000.0
        WHEN model LIKE '%qwen%'     THEN 1000.0
        ELSE 1.0
    END AS utilisation_pct
FROM signals
WHERE signal_type = 'task_end'
  AND timestamp > now() - INTERVAL 7 DAY
  AND model_tier = 'free'
GROUP BY model
ORDER BY utilisation_pct DESC;
```

**→ Action:** If free-tier utilisation is <20%, the Analysis Agent flags that more tasks should be routed to free models. Updates budget_rules.md with utilisation targets.

#### Channel 5: Client Intelligence (monthly)

**Reads:** task_end signals, user_feedback signals  
**Writes to:** `wiki/entities/clients/<client>.md` + Hindsight Observation 𝒮  
**Auto-apply:** Wiki page updates. Client risk flags escalate to Felix.

```sql
-- Client health dashboard
SELECT
    client,
    COUNT(*)                                                        AS total_tasks,
    AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END)       AS delivery_quality,
    AVG(total_duration_ms) / 1000.0                                 AS avg_delivery_sec,
    COUNT(DISTINCT project)                                         AS active_projects,
    SUM(total_cost_usd)                                             AS total_cost_usd
FROM signals
WHERE signal_type = 'task_end'
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY client
ORDER BY total_tasks DESC;

-- Client quality trend: flag declining delivery quality
WITH monthly AS (
    SELECT
        client,
        toStartOfMonth(timestamp) AS month,
        AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END) AS quality
    FROM signals
    WHERE signal_type = 'task_end'
      AND timestamp > now() - INTERVAL 90 DAY
    GROUP BY client, month
)
SELECT
    client,
    any(quality) FILTER (WHERE month = toStartOfMonth(now()))          AS this_month,
    any(quality) FILTER (WHERE month = toStartOfMonth(now() - INTERVAL 1 MONTH)) AS last_month,
    this_month - last_month                                            AS quality_trend
FROM monthly
GROUP BY client
HAVING abs(quality_trend) > 0.15    -- flag >15% change month-on-month
ORDER BY quality_trend ASC;
```

**→ Action:** Analysis Agent synthesises client profile → ingests into LLM Wiki `wiki/entities/clients/<client>.md` + stores as Observation in Hindsight. At-risk clients (declining quality) escalate to Felix.

### 9.3 The Analysis Agent

The Analysis Agent is a **Paperclip Meta-Layer agent** (not a project container agent). It runs on a schedule, not in response to specific tasks. It has read access to ClickHouse and write access to LLM Wiki and Hindsight.

```python
class AnalysisAgent:
    """
    Paperclip Meta-Layer agent. Runs on schedule.
    Reads ClickHouse analytics, generates insights, writes back to LLM Wiki + Hindsight.
    """

    SCHEDULE = {
        "weekly":    ["model_routing", "agent_performance", "cost_optimization"],
        "monthly":   ["process_optimization", "client_intelligence"],
        "quarterly": ["full_system_review"]
    }

    async def run(self, analysis_type: str):
        # Pre-task pattern (even Analysis Agent follows it)
        context = await before_task_start(
            task_description=f"Analyse {analysis_type} from ClickHouse data and generate improvement insights",
            task_id=f"ANALYSIS-{analysis_type}-{date.today()}",
            agent_config=self.config
        )

        # Run the analysis
        results = await self.query_clickhouse(QUERIES[analysis_type])
        insights = await self.synthesise(results, context)

        # Route insights based on governance rules
        for insight in insights:
            if insight.auto_apply:
                # Write directly to LLM Wiki
                await llm_wiki.ingest(
                    source=insight.as_procedure(),
                    category=insight.wiki_category,
                    title=insight.wiki_title
                )
                # Retain as institutional learning in Hindsight
                await hindsight.retain(
                    content=insight.summary,
                    metadata={
                        "network": "experience",
                        "agent": "analysis-agent",
                        "type": "bi_learning",
                        "analysis_type": analysis_type,
                        "confidence": insight.confidence
                    }
                )
            else:
                # Escalate to Felix for human review
                await self.escalate_to_felix(insight)

        # Post-task pattern
        await on_task_complete(
            TaskResult(
                task_id=self.current_task_id,
                outcome="success",
                summary=f"Completed {analysis_type} analysis. {len(insights)} insights generated. "
                        f"{sum(1 for i in insights if i.auto_apply)} auto-applied. "
                        f"{sum(1 for i in insights if not i.auto_apply)} escalated to Felix.",
                ...
            ),
            self.config
        )
```

### 9.4 Governance Model

Not all feedback is auto-applied. Human oversight is required for changes that could break agent behaviour or alter budget.

| Feedback Type | Auto-Apply? | Human Review Required | Threshold |
|---------------|-------------|----------------------|-----------|
| Model routing shifts (same tier) | ✅ Yes | — | Quality change >5% |
| Model routing shifts (crosses cost tiers) | ❌ No | Felix → Vijay approval | Any cross-tier shift |
| Agent procedure additions (new checklist item) | ✅ Yes (additive only) | — | New addition |
| Agent prompt modifications | ❌ No | Felix review | Any prompt change |
| Budget allocation changes | ❌ No | Vijay approval | Any amount |
| Client risk flag | ❌ No | Felix + Vijay notification | Quality drop >15% |
| New SOP page added to LLM Wiki | ✅ Yes | — | Any new page |
| Existing SOP page modified | ❌ No | Felix review | Substantive change |

---

## 10. Tool Selection Rationale

### 10.1 Why Not ByteRover?

ByteRover was the original cross-project decision store (brv CLI). It is removed for one reason: the Hermes one-provider constraint. Hermes supports exactly one external memory provider. Hindsight occupies that slot because it covers 7/9 intelligence types. ByteRover as a second provider is not possible.

LLM Wiki `wiki/decisions/` fully replaces ByteRover's function: cross-project architectural decisions stored as curated markdown pages with rationale, date, and approver. Zero functionality lost.

### 10.2 Why Not Honcho?

Honcho (user/session modelling) would conflict with Hindsight's Opinion 𝒪 and Observation 𝒮 networks, which already handle persona and user modelling. Adding Honcho would require displacing Hindsight (losing 7/9 type coverage) or violating the one-provider constraint. Not worth the trade-off.

### 10.3 Why Not Graphiti?

Graphiti (knowledge graph) covers relational intelligence better than Hindsight, but displacing Hindsight (91.4% LongMemEval vs Graphiti 63.8%) to gain relational graph queries is a poor trade. ClickHouse's relational queries via SQL aggregate over the `collaborating_agents` field cover the relational intelligence need without sacrificing episodic and persona coverage.

### 10.4 The One-Provider Constraint Summary

```
HERMES MEMORY SLOTS:
┌─────────────────────────────────────────────────────┐
│  External provider (1 slot only):  HINDSIGHT ✅     │
│  Built-in skills:                  LLM WIKI ✅      │
│  Built-in files:                   MEMORY.md ✅     │
│                                    USER.md ✅       │
│  External analytics (not a slot):  CLICKHOUSE ✅    │
└─────────────────────────────────────────────────────┘

CANNOT ADD:
  ByteRover  ❌  (would require second provider slot)
  Honcho     ❌  (would displace Hindsight)
  Graphiti   ❌  (lower benchmark, would displace Hindsight)
  Mem0       ❌  (lowest benchmark at 49%)
```

---

## 11. Complete Coverage Matrix — All 9 Intelligence Types

| Type | Hindsight | LLM Wiki | ClickHouse | Coverage Status |
|------|-----------|----------|------------|-----------------|
| **1. Procedural** | — | ✅ Primary (procedures/) | — | **Strong** |
| **2. Relational** | 🟡 Fuzzy recall | 🟡 Entity summaries (entities/) | ✅ Primary (graph queries, collaboration analytics) | **Strong** (ClickHouse fills gap) |
| **3. Episodic** | ✅ Primary (Experience ℬ) | — | 🟡 Event log (supporting) | **Strong** |
| **4. Persona** | ✅ Primary (Opinion 𝒪 + Obs 𝒮) | — | 🟡 user_feedback events | **Strong** |
| **5. Outcome** | ✅ Experience ℬ | — | ✅ Primary analytics (task_end signals) | **Strong** |
| **6. Semantic** | ✅ Primary (World 𝒲) | ✅ entities/, concepts/ | — | **Strong** |
| **7. Behavioral** | 🟡 Partial (action summaries) | — | ✅ Primary (action signals) | **Strong** |
| **8. Intent** | 🟡 Embedded in experience | — | ✅ task_start signals | **Adequate** |
| **9. Temporal** | 🟡 TEMPR temporal filter | — | ✅ Primary (time-series, drift detection, state_change events) | **Strong** (ClickHouse fills gap) |

**Result: 9/9 types covered.**

---

## 12. Golden Rules

These rules are non-negotiable for all agents, at all times.

1. **Context in files, not in prompts alone.** Any context needed must be in a readable file OR inline in dispatch prompt — never rely on the agent "knowing" something from prior turns.

2. **Recall before starting.** Run the pre-task pattern (Hindsight recall + LLM Wiki query) before every task that involves more than 3 tool calls. No exceptions.

3. **Retain after completing.** Post-task write hook is mandatory — not optional. An agent that doesn't retain its experience is a dead end in the knowledge graph.

4. **Emit before and after.** `emit_signal("task_start")` fires first. `emit_signal("task_end")` fires last. Analytics failures (ClickHouse unavailable) must NEVER block agent execution — log and continue.

5. **Write decisions to LLM Wiki, not Hindsight alone.** Hindsight is for episodic "what happened." Architectural decisions belong in `wiki/decisions/` where they are curated, contradiction-checked, and readable by any future agent without a recall query.

6. **Never write to Hindsight for Vijay preferences without high confidence.** Opinion 𝒪 facts with confidence < 0.7 should not be stored — they create misleading recall results. Observe first, retain when confidence is earned.

7. **TASK_TRACKER.md is live truth.** The Orchestrator updates it as tasks complete. Agents read it at task_start to understand current project state. Never trust stale context from a prior session without checking TASK_TRACKER.md first.

8. **Subagents receive all context inline.** Don't make subagents read files mid-task. Construct the full context (Layer 1–5) and inject it at dispatch time. Mid-task file reads signal a context provisioning failure.

9. **Text > Brain.** "Memory is limited — if you want to remember something, WRITE IT TO A FILE." (via Hindsight.retain, LLM Wiki.ingest, or MEMORY.md). In-context knowledge evaporates at session end.

10. **The loop closes.** Analytics without action is waste. Every ClickHouse query run by the Analysis Agent must produce either an auto-applied update or a Felix escalation. Insights that are computed but not acted on should not be computed.

---

## 13. References

- `strategy/agent_orchestration.md` — End-to-end orchestration: 3-layer architecture, agent lifecycle, intake-to-delivery flow
- `execution/agent_workflow.md` — Workflow gates, TDD cycle, role definitions, model routing
- `execution/handoff_protocol.md` — Structured handoff formats between agents
- `operations/agent_watcher/agent_watcher_system.md` — Agent monitoring and 4-level escalation
- [Hindsight GitHub](https://github.com/vectorize-io/hindsight) — MIT licence, 91.4% LongMemEval
- [LLM Wiki pattern](https://github.com/SamurAIGPT/llm-wiki-agent) — Karpathy, MIT
- [ClickHouse](https://clickhouse.com) — Open-source columnar OLAP
- [HyperDX](https://hyperdx.io) — Open-source observability UI for ClickHouse

---

*Owner: Felix Stanley (COO)*
*Version 2.0 — 2026-04-13 — full rewrite: Hermes + Hindsight + LLM Wiki + ClickHouse + BI feedback loop*
*Supersedes: v1.x ByteRover-only stack (deprecated)*
