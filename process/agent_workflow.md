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
