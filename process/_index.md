# Process — Overview

Core operational processes for running Abzum's AI agent team.

## Documents

| Document | Summary |
|---|---|
| `agent_workflow.md` | Agent invocation order, mandatory gates, process overview |
| `skill_matrix.md` | Skills × 10 roles matrix with priority levels |
| `tdd_cycle.md` | RED-GREEN-REFACTOR discipline, Iron Law, verification checklist |
| `handoff_protocol.md` | 5-layer context persistence + structured outputs per role |
| `context_persistence.md` | Memory layers, ByteRover usage, file-based context rules |

---

## Process Overview

```
Vijay (Product Owner)
     ↓ [Design approval gate]
Architect Agent → SPEC.md + IMPLEMENTATION_PLAN.md
     ↓ [Vijay approves]
Orchestrator dispatches Coder Agent per task
     ↓ [TDD cycle per task: RED → GREEN → REFACTOR → commit]
Spec Reviewer Agent → SPEC compliance check
     ↓ [APPROVED gate]
Quality Reviewer Agent → Code quality check
     ↓ [APPROVED gate]
DevOps Agent → CI/CD + deployment
     ↓
Felix (COO) → reports to Vijay
```

**Mandatory gates — cannot skip:**
1. Design approved before implementation
2. TDD before any code
3. Spec compliance before quality review
4. Context in files, not memory

---

*Prepared by: Felix Stanley, COO — Abzum New Zealand Limited*
*Date: 2026-04-01*
