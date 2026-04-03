---
children_hash: 089efa3a613daa94b9395f9629a7f31cf821e58a25e4b2a2f36a062a21ba9dd1
compression_ratio: 0.6585557299843015
condensation_order: 2
covers: [agent_scripting/_index.md, agent_watcher/_index.md, agent_workflow.md, context_persistence.md, handoff_protocol.md, skill_matrix.md, tdd_cycle.md]
covers_token_total: 6370
summary_level: d2
token_count: 4195
type: summary
---
<think>
The user wants me to create a structural summary from the knowledge entries about the Agent Watcher System. Let me analyze the content and create a condensed summary that preserves key facts, architectural decisions, and relationships.

Key points to preserve:
1. Agent Watcher is a meta-layer AI for monitoring other agents
2. Event-driven architecture with zero-cost monitoring (log/event parsing)
3. 4-level escalation ladder with specific thresholds
4. Loop detection via method signatures
5. Purpose: prevent wasted tokens from looping agents

I need to compress this to ~20-30% while keeping the essential information and references to the child entries for drill-down.
</think>

## Agent Watcher System Overview

A meta-layer AI agent that monitors all other agents during task execution, preventing wasted tokens from looping or stuck agents.

### Architecture

- **Monitoring Approach**: Event-driven architecture using log/event parsing for zero-cost monitoring (no constant inference)
- **Loop Detection**: Method signature tracking distinguishes agent approach changes vs actual looping behavior

### Escalation Ladder

4-level escalation system triggered after repeated failures:

| Level | Action | Threshold |
|-------|--------|-----------|
| L1 | Self-Correct | 3 attempts (prompt agent to reflect) |
| L2 | Smarter Agent | 4 attempts (spawn better model) |
| L3 | Decompose | 6 attempts (break into parallel subtasks) |
| L4 | Human Escalation | 8 attempts (report to Vijay) |

### Key Relationships

- **Drill-down**: See `process/agent_watcher/agent_watcher_system.md` for detailed documentation
- **Related**: `process/agent_workflow` for agent execution patterns

---

### agent_workflow.md
# Agent Workflow — Abzum
**Mandatory Process Gates**

---

## Complete Workflow Sequence

```
Vijay (Product Owner)
     │
     │  Feature request
     ▼
┌─────────────────────────────────────────────────┐
│  🧠 ARCHITECT AGENT                             │
│  Input: Raw feature request                    │
│  Output: ARCHITECTURE.md + IMPLEMENTATION_PLAN │
│  Gate: Vijay must approve before proceeding      │
└────────────────────┬────────────────────────────┘
                     │ Vijay approves
                     ▼
┌─────────────────────────────────────────────────┐
│  ⚡ ORCHESTRATOR (Paperclip AI / Felix)         │
│  Breaks IMPLEMENTATION_PLAN into tasks          │
│  Creates TASK_TRACKER.md                        │
│  Dispatches Coder Agent per task (sequential)   │
└────────────────────┬────────────────────────────┘
                     │ Per task
                     ▼
┌─────────────────────────────────────────────────┐
│  👨‍💻 CODER AGENT                               │
│  TDD per task: RED → GREEN → REFACTOR → commit  │
│  Full context inline in dispatch prompt         │
└────────┬─────────────────────────── ─────────────┘
         │ Commit done
         ▼
┌─────────────────────────────────────────────────┐
│  🔍 SPEC REVIEWER AGENT (Stage 1)               │
│  Is implementation on spec?                     │
│  Output: APPROVED or REVISION REQUIRED          │
│  Gate: MUST pass before Stage 2                 │
└────────┬─────────────────────────────────────────┘
         │ APPROVED
         ▼
┌─────────────────────────────────────────────────┐
│  💎 QUALITY REVIEWER AGENT (Stage 2)            │
│  Is code well-built? (security, perf, style)   │
│  Output: APPROVED or REVISION REQUIRED          │
└────────┬─────────────────────────────────────────┘
         │ APPROVED
         ▼
  [Repeat per task until all tasks complete]
         │
         ▼
┌─────────────────────────────────────────────────┐
│  🚀 DEVOPS AGENT                                │
│  CI/CD pipeline, deployment, smoke tests         │
│  Only at milestones/releases                    │
└────────┬─────────────────────────────────────────┘
         │
         ▼
         ✅ Felix (COO) → reports to Vijay
```

---

## Mandatory Gates

| Gate | Rule | Who Enforces |
|---|---|---|
| **Design approval** | Vijay must approve ARCHITECTURE.md before implementation | Vijay |
| **TDD before code** | No production code without failing test first | Coder Agent (self-enforced) |
| **Spec → Quality order** | Stage 1 (spec) MUST pass before Stage 2 (quality) | Orchestrator |
| **Context in files** | Any needed context must be in file or inline; never assume agent remembers | Felix (COO) |

---

## Agent Invocation Order

```
1. Vijay          → Submit feature request
2. Architect       → Produce SPEC.md + IMPLEMENTATION_PLAN.md (requires Vijay approval)
3. Orchestrator    → Break plan into tasks, create TASK_TRACKER.md
4. Coder Agent     → Per task: RED test → GREEN code → REFACTOR → commit
5. Spec Reviewer   → Per task: verify spec compliance (Stage 1)
6. Quality Reviewer → Per task: verify code quality (Stage 2, only after Stage 1 passes)
7. DevOps          → Milestone/release: CI/CD + deployment
8. Felix (COO)     → Continuous: coordinate, report, manage handoffs
```

**Skippable only:**
- Coder → Tester: for hotfixes, minor changes
- Reviewer → DevOps: can automate on approval
- Architect: for trivial changes (Vijay must approve skip)

---

## Human Intervention Triggers

| Trigger | Action |
|---|---|
| Reviewer rejects PR with >5 changes | Vijay reviews Coder's response |
| Security vulnerability found | Vijay notified immediately, deployment blocked |
| CI/CD pipeline failure | DevOps attempts fix, escalate after 2 tries |
| Ambiguous feature request | Architect pauses, asks Vijay for clarification |
| Budget usage >80% in month | Pause non-critical work, report to Vijay |
| Test coverage <70% | Coder must improve before merge |
| Any production outage | Full stop, human-led incident response |

---

## Model Selection by Step

| Step | Recommended Model |
|---|---|
| Architect (SPEC.md) | Claude Sonnet |
| Coder (simple task) | MiniMax |
| Coder (complex task) | Claude Sonnet / DeepSeek R1 (free) |
| Spec Reviewer | Claude Sonnet |
| Quality Reviewer | Claude Sonnet |
| DevOps (scripts) | MiniMax |
| DevOps (complex infra) | Claude Sonnet |
| Orchestrator (Felix) | MiniMax |

---

*Source: superpowers-ai-company-workflow.md + AI_COMPANY_FRAMEWORK.md*


---

### context_persistence.md
# Context Persistence — Abzum
**Memory Layers + ByteRover Usage**

---

## Why Context Persistence Is Critical

AI agents are ephemeral — each new subagent starts fresh. Memory is the infrastructure that makes continuity possible. **Context persistence is not optional — it's the difference between an agent that builds on prior work and one that starts from scratch every time.**

---

## The Five Memory Layers

| Layer | Mechanism | Purpose | Lifespan | Example |
|---|---|---|---|---|
| **Layer 1** | Project files | Long-term project truth | Permanent | SPEC.md, ARCHITECTURE.md |
| **Layer 2** | TASK_TRACKER.md | Live task status | Feature lifecycle | Task completion tracking |
| **Layer 3** | Inline dispatch context | Per-task agent input | Task duration | Full task text + scene |
| **Layer 4** | ByteRover context tree | Cross-project patterns | Permanent | .brv/context-tree/ |
| **Layer 5** | MEMORY.md + daily logs | COO continuity | Permanent | memory/YYYY-MM-DD.md |

---

## Layer 1: Project Files (Long-Term)

Everything substantive lives in files the next agent can read.

| File | Purpose | Who Writes |
|---|---|---|
| `SPEC.md` | Single source of truth for what to build | Architect Agent |
| `ARCHITECTURE.md` | How it works at high level | Architect Agent |
| `IMPLEMENTATION_PLAN.md` | Exact tasks with code | Architect Agent |
| `docs/STANDARDS.md` | Coding conventions, patterns | Architect + Reviewers |
| `MEMORY.md` | Cross-project context for Felix | Felix writes/reads |

---

## Layer 2: TASK_TRACKER.md (Per Feature)

Live document the Orchestrator updates:

```markdown
# OAuth Implementation — Task Tracker

**Feature:** GitHub OAuth Login
**Plan:** docs/plans/2026-04-01-oauth-plan.md
**Started:** 2026-04-01

## Tasks
- [x] Task 1: OAuth service skeleton — **COMPLETE** (sha: abc123f)
- [x] Task 2: GitHub provider integration — **COMPLETE** (sha: def456a)
- [ ] Task 3: User profile extraction — **IN PROGRESS**
- [ ] Task 4: Session creation and JWT issuance
- [ ] Task 5: Logout endpoint

## Reviews
- [x] Task 1 Spec Review — ✅ Approved
- [x] Task 1 Quality Review — ✅ Approved
- [x] Task 2 Spec Review — ✅ Approved
- [ ] Task 2 Quality Review — Pending
```

---

## Layer 3: Inline Dispatch Context (Per Task)

When the Orchestrator dispatches a Coder subagent, it provides **full inline context** — not a file path.

```json
{
  "task": "Task 3: User profile extraction",
  "files": {
    "create": "src/auth/profile.ts",
    "test": "tests/auth/test_profile.ts"
  },
  "scene": "OAuth service exists at src/auth/oauth.ts. This task adds profile extraction.",
  "spec_ref": "SPEC.md → User Authentication → OAuth Providers → GitHub",
  "standards_ref": "docs/STANDARDS.md → TypeScript Conventions"
}
```

**Rule:** The subagent should never have to read a file to understand what to do.

---

## Layer 4: ByteRover Context Tree

For cross-project patterns, decisions, and architectural rules, use ByteRover.

**Key paths:**
- Context tree: `/home/node/.openclaw/workspace/.brv/context-tree/`
- brv CLI: `/home/node/.openclaw/workspace/node_modules/.bin/brv`

**Commands:**

```bash
# Curate a decision (after making it)
cd /home/node/.openclaw/workspace && ./node_modules/.bin/brv curate "Use JWT (not sessions) for API authentication across all projects"

# Query before starting new work
cd /home/node/.openclaw/workspace && ./node_modules/.bin/brv query "How did we handle auth in previous projects?"

# Status
cd /home/node/.openclaw/workspace && ./node_modules/.bin/brv status

# View curate history
cd /home/node/.openclaw/workspace && ./node_modules/.bin/brv curate view
```

### ByteRover Best Practices
- **Query before starting** new projects or features
- **Curate after significant decisions** — document the why, not just the what
- **Cross-project patterns** belong in ByteRover, not in project-specific files
- **Context tree files** are dense, agent-consumable summaries — write for scanning

---

## Layer 5: Felix/COO Memory (Human-AI Boundary)

Felix maintains MEMORY.md and daily logs so context is preserved:

| File | Purpose | Lifespan |
|---|---|---|
| `MEMORY.md` | Long-term: company decisions, client context, preferences | Permanent |
| `memory/YYYY-MM-DD.md` | Daily: what was built, blockers, decisions | Permanent |

---

## Golden Rules for Context

1. **Context in files, not in prompts.** Any context needed must be in a readable file OR inline in dispatch prompt.
2. **Never assume the agent remembers.** "The agent should know from last time" is not acceptable.
3. **Query ByteRover before starting.** "How did we handle X in previous projects?"
4. **Curate after decisions.** Document cross-project patterns when they're made.
5. **TASK_TRACKER.md is live.** Update it as tasks complete; it's the Orchestrator's source of truth.
6. **Inline for task dispatch.** Provide full task context inline; don't make agents read files mid-task.

---

## Text > Brain

> "Memory is limited — if you want to remember something, WRITE IT TO A FILE."

This is the single most important operational discipline for AI agent teams. Insights that aren't written down don't survive session restarts.

---

*Source: AI_AGENT_CAPABILITIES_FRAMEWORK.md v1.0 + AGENTS.md*


---

### handoff_protocol.md
# Handoff Protocol — Abzum
**Structured Agent Handoffs + Context Rules**

---

## Why Handoff Protocol Matters

AI agents are ephemeral — each new subagent starts fresh. When one agent finishes and another starts, the output must contain exactly what the next agent needs. Without structured handoffs, agents lose context and waste time or produce wrong output.

---

## The Five-Layer Context System

| Layer | Mechanism | Purpose | Lifespan |
|---|---|---|---|
| **Layer 1** | Project files (SPEC.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md) | Long-term project truth | Permanent |
| **Layer 2** | TASK_TRACKER.md | Live task status per feature | Feature lifecycle |
| **Layer 3** | Inline dispatch context | Per-task agent input | Task duration |
| **Layer 4** | ByteRover context tree | Cross-project patterns + decisions | Permanent |
| **Layer 5** | MEMORY.md + daily logs | COO-level continuity, human context | Permanent |

---

## Document Flow

```
Vijay's Request
        ↓
ARCHITECTURE.md          ← Architect output (design)
        ↓
IMPLEMENTATION_PLAN.md   ← Architect output (tasks)
        ↓
TASK_TRACKER.md          ← Orchestrator output (live progress)
        ↓
├──► Coder Agent output per task:
│         ├── tests/x.test.ts   (test code)
│         ├── src/x.ts          (implementation)
│         └── git commit        (conventional commit)
│
├──► Spec Reviewer output:
│         └── REVIEW_SPEC.md    (compliance report)
│
├──► Quality Reviewer output:
│         └── REVIEW_QUALITY.md (quality report)
│
└──► DevOps Agent output:
          └── DEPLOYMENT.md      (status + options)
```

---

## Structured Outputs Per Role

### Architect → Orchestrator/Coder

```
TASK TEXT: [Full text of task from IMPLEMENTATION_PLAN.md]
SCENE SETTING: [What's already built, what this task adds, where it fits]
FILES:
- Create: [exact path]
- Modify: [exact path:line range]
- Test: [exact test path]
CONTEXT:
- SPEC.md: [location]
- ARCHITECTURE.md: [location]
- STANDARDS.md: [location]
```

### Coder → Spec Reviewer

```
COMMIT SHA: [git SHA]
FILES CHANGED: [list]
TASK: [which task from the plan]
WHAT WAS DONE: [plain text summary]
TESTS: [list of tests added/modified, all passing?]
```

### Spec Reviewer → Quality Reviewer

```
VERDICT: APPROVED / REVISION REQUIRED
REVIEW FILE: REVIEWS/YYYY-MM-DD-task-N-spec.md
IF REVISION REQUIRED:
  - Issue 1: [description, file:line]
  - Issue 2: [description, file:line]
```

### Quality Reviewer → Orchestrator

```
VERDICT: APPROVED / REVISION REQUIRED
REVIEW FILE: REVIEWS/YYYY-MM-DD-task-N-quality.md
STRENGTHS: [list]
ISSUES: [by severity: Critical / Important / Minor]
```

### Orchestrator → DevOps

```
REPO: [git remote URL]
BRANCH: [branch name]
SHA RANGE: [base..head]
TEST RESULTS: [summary — all passing?]
FEATURE SUMMARY: [plain text of what was built]
DEPLOY TARGET: [where it goes]
```

---

## File Naming Conventions

| Document | Format | Example |
|---|---|---|
| Architecture/Design | `docs/designs/YYYY-MM-DD-feature-design.md` | `docs/designs/2026-04-01-oauth-design.md` |
| Implementation Plan | `docs/plans/YYYY-MM-DD-feature-plan.md` | `docs/plans/2026-04-01-oauth-plan.md` |
| Task Tracker | `TASK_TRACKER.md` | Project root |
| Spec Review | `REVIEWS/YYYY-MM-DD-task-N-spec.md` | `REVIEWS/2026-04-01-auth-task-1-spec.md` |
| Quality Review | `REVIEWS/YYYY-MM-DD-task-N-quality.md` | `REVIEWS/2026-04-01-auth-task-1-quality.md` |
| Deployment Report | `DEPLOYMENTS/YYYY-MM-DD-feature.md` | `DEPLOYMENTS/2026-04-01-oauth.md` |

---

## Handoff Directory Structure

```
handoff/
├── 00-architect/
│   └── SPEC.md
├── 01-coder/
│   └── pr-link.md
├── 02-tester/
│   └── test-report.md
├── 03-reviewer/
│   └── review-summary.md
└── 04-devops/
    └── deploy-log.md
```

Any agent can be re-invoked with full context at any time from this structure.

---

## Golden Rules

1. **Context in files, not in heads.** Any context an agent needs must be in a file it can read OR inline in dispatch prompt.
2. **Structured outputs.** Each agent produces a consistent document format that the next agent can parse.
3. **Inline for immediacy.** When dispatching a Coder for a specific task, provide full context inline — don't make the agent read files.
4. **Files for permanence.** SPEC.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md live in files permanently — not inline.
5. **ByteRover for cross-project knowledge.** Patterns and decisions that apply across projects get curated to ByteRover.

---

*Source: superpowers-ai-company-workflow.md v1.0*


---

### skill_matrix.md
# Skill Matrix — Abzum
**Skills × Roles**

---

## Priority Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 **Deep** | Required skill — must be proficient |
| 🟡 **Surface** | Helpful — working knowledge sufficient |
| — | Not required |

---

## Full Skill × Role Matrix

| Skill | Architect | Coder | Tester | Reviewer | DevOps | Priority |
|---|---|---|---|---|---|---|
| **Git / GitHub CLI** | Read | Full | Read | Full | Full | 🔴 Critical |
| **React / Next.js** | Design | Full | Read | Review | — | 🔴 Critical |
| **Node.js / Express** | Design | Full | Test | Review | Scripts | 🔴 Critical |
| **TypeScript** | Design | Full | Test | Review | Types | 🔴 Critical |
| **Docker** | Basics | — | —