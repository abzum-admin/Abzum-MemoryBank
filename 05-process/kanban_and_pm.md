---
id: exec-pm
title: Project Management Methodology
summary: Project tracking and estimation (A70)
tags: [execution, pm]
updated: 2026-05-09
load_priority: 45
load_lane: context
status: active
---
# Project Management Methodology for AI Agent Teams

> **Status:** Defined — 2026-04-04
> **Owner:** Felix
> **Action:** A70

---

## Overview

Abzum uses a **hybrid project management model** tailored for AI agent teams. The right model is selected based on project type. The core principle: **AI agents shift priority instantly** — no sprint ceremony overhead needed.

---

## The Three Models

### 1. Kanban — Default Model

**Use for:** All standard work — internal projects, feature development, operational tasks.

**How it works:**
- **Continuous flow** — no sprints, no fixed iterations
- **WIP limits** — max 3 tasks per agent at any time
- **Visual queue** — Backlog → In Progress → Review → Done
- **Priority pull** — agents pull the highest-priority available task when free
- **Task budget tracking** — token cost estimated per task (via A54), tracked against budget

**Why Kanban for AI agents:**
- Agents don't need daily standups to know what to do — they check the queue
- WIP limits prevent context overload and token bloat
- Instant priority shifting — no sprint scope locks
- Continuous delivery matches how agents actually work

---

### 2. Scrum — Enterprise / Fixed-Scope Projects

**Use for:** Enterprise clients, fixed-price contracts, projects requiring structured cadence.

**How it works:**
- **Weekly planning cycles** (not daily sprints)
- **Automated standups every 4 hours** — agents report status to a PM/Scrum Master agent
- **Sprint backlog** — fixed scope per week
- **Retrospectives** — logged to BI Taxonomy (A47) after each project milestone
- **Human oversight** — at sprint planning, scope change, new specialist addition, final delivery

**Scrum Master vs PM distinction (from A68):**
- Scrum Master for Agile-focused enterprise projects
- Project Manager for fixed-scope/fixed-price projects

---

### 3. Waterfall — Regulatory / Compliance Projects

**Use for:** Projects with hard regulatory gates, compliance mandates, or fixed approval chains.

**How it works:**
- **Sequential phases** with hard gates
- **Approval required before each phase advances** (human HITL)
- **Documented audit trail** at every gate
- **No scope changes mid-phase** — change requires formal change request
- Examples: SOC2 compliance work, HIPAA implementations, NZ Privacy Act assessments

---

## Decision Table: Which Model?

| Project Type | Model | Planning Cycle | Standups | Retros | Scope Lock |
|---|---|---|---|---|---|
| Internal / operational tasks | **Kanban** | Continuous | None needed | None | Flexible |
| Standard customer project | **Kanban** | Continuous | None needed | Per milestone | Flexible |
| Enterprise / fixed-price | **Scrum** | Weekly | 4-hour automated | Per milestone | Locked per sprint |
| Regulatory / compliance | **Waterfall** | Sequential gates | Per phase | Per phase | Locked per phase |

---

## Integration with Existing Tasks

| System | Integration Point |
|---|---|
| **A47 — BI Taxonomy** | Retrospectives logged as Outcome data; task cost data feeds BI signals |
| **A50 — Project Planning** | PM Intake classifies project type → selects correct management model |
| **A62 — Agent Watcher** | Monitors WIP compliance, flags overload, tracks task completion rates |
| **A67 — Code Review** | Review queue is part of Kanban flow (Review column) |
| **A68 — Scrum Team Structure** | Defines the Scrum roles and cadence for enterprise projects |
| **A54 — Token Usage** | Task budget tracking per Kanban task; cost-per-agent visibility |

---

## Key Decisions from Vijay + Felix Discussion (2026-04-04)

1. **Kanban is the default** — continuous flow, WIP limits, agents pull as free
2. **Weekly planning cycle** (not daily sprints) — enough cadence for humans, not burdensome for agents
3. **Automated 4-hour standups** — lightweight check-ins, not daily ceremonies
4. **Retrospectives after each milestone** — logged to BI Taxonomy (A47), not just verbal
5. **AI agents shift priority instantly** — no sprint ceremony needed to reprioritise
6. **Task budget tracking** — every task has a token cost estimate, tracked against budget

---

<!-- backlinks-start -->

## Referenced by

- [Planner](../02-org/02-ai-systems/02-project-delivery/planner.md)
- [Project Manager](../02-org/02-ai-systems/02-project-delivery/project_manager.md)
- [Plan Of Action](../07-research/hermes-hindsight/plan_of_action.md)

<!-- backlinks-end -->
