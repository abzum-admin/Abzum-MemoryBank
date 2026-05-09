---
id: exec-handoff
title: Handoff Protocol
summary: Structured handoff formats between agents
tags: [execution, handoff]
updated: 2026-05-09
load_priority: 55
load_lane: context
status: active
---
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
| **Layer 5** | memory/long_term.md + daily logs | COO-level continuity, human context | Permanent |

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
