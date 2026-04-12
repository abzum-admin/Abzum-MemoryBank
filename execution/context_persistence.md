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
