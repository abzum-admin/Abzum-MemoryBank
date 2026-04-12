# Agent Workflow — Abzum
**Version 1.1 — 2026-04-12 (consolidated from superpowers_workflow.md + agent_workflow.md)**

---

## Philosophy

Superpowers (github.com/obra/superpowers) — designed by Jesse Vincent (GitHub, Linear, Keyboardio) for human+AI pair programming. Adapted for AI-first teams.

### Four Core Principles

| Principle | Meaning |
|---|---|
| **Test-Driven Development** | Write tests first, always. No code without a failing test. |
| **Systematic over ad-hoc** | Process beats guessing every time. |
| **Complexity reduction** | YAGNI ruthlessly. Simplicity as primary goal. |
| **Evidence over claims** | Verify before declaring success. |

### Six Mandatory Gates

```
Brainstorming → Design Approval → Writing Plans → Execute (TDD) → Review → Finish
```
**Cannot skip ahead.**

---

## Workflow Sequence

```
Vijay (Product Owner)
     │
     │  Feature request
     ▼
┌─────────────────────────────────────────────────┐
│  🧠 ARCHITECT AGENT                             │
│  Input: Raw feature request                     │
│  Output: ARCHITECTURE.md + IMPLEMENTATION_PLAN  │
│  Gate: Vijay must approve before proceeding     │
└────────────────────┬────────────────────────────┘
                     │ Vijay approves
                     ▼
┌─────────────────────────────────────────────────┐
│  ⚡ ORCHESTRATOR (Paperclip AI / Felix)          │
│  Breaks IMPLEMENTATION_PLAN into tasks          │
│  Creates TASK_TRACKER.md                        │
│  Dispatches Coder Agent per task (sequential)   │
└────────────────────┬────────────────────────────┘
                     │ Per task
                     ▼
┌─────────────────────────────────────────────────┐
│  👨‍💻 CODER AGENT                                │
│  TDD per task: RED → GREEN → REFACTOR → commit  │
│  Full context inline in dispatch prompt         │
└────────┬────────────────────────────────────────┘
         │ Commit done
         ▼
┌─────────────────────────────────────────────────┐
│  🔍 SPEC REVIEWER AGENT (Stage 1)               │
│  Is implementation on spec?                     │
│  Output: APPROVED or REVISION REQUIRED          │
│  Gate: MUST pass before Stage 2                 │
└────────┬────────────────────────────────────────┘
         │ APPROVED
         ▼
┌─────────────────────────────────────────────────┐
│  💎 QUALITY REVIEWER AGENT (Stage 2)            │
│  Is code well-built? (security, perf, style)    │
│  Output: APPROVED or REVISION REQUIRED          │
└────────┬────────────────────────────────────────┘
         │ APPROVED
         ▼
  [Repeat per task until all tasks complete]
         │
         ▼
┌─────────────────────────────────────────────────┐
│  🚀 DEVOPS AGENT                                │
│  CI/CD pipeline, deployment, smoke tests        │
│  Only at milestones/releases                    │
└────────┬────────────────────────────────────────┘
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
1. Vijay           → Submit feature request
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

## TDD Cycle: RED-GREEN-REFACTOR

**Iron Law:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.

### Phase 1: RED — Write Failing Test

```python
# File: tests/auth/test_oauth_flow.py
def test_oauth_github_returns_user_profile():
    """GitHub OAuth returns user profile with email, name, and avatar_url."""
    result = oauth_login(provider="github", code="test_code_abc123")
    assert result.email == "user@example.com"
    assert result.name == "Test User"
    assert result.avatar_url.startswith("https://avatars.githubusercontent.com/")
```

Run: `pytest tests/auth/test_oauth_flow.py -v` → Expected: **FAIL**

### Phase 2: GREEN — Minimal Code

Write the minimum code to make the test pass. Nothing more.

Run: `pytest ...` → Expected: **PASS** — anything extra gets deleted.

### Phase 3: REFACTOR — Clean Up

Only after tests pass. Remove duplication, improve names, extract helpers. Keep tests green.

### Phase 4: COMMIT

```
git add tests/auth/test_oauth_flow.py src/auth/oauth.py
git commit -m "feat(auth): add GitHub OAuth login returning user profile"
```

### TDD Anti-Patterns

| Anti-Pattern | Rule |
|---|---|
| Writing code before test | Delete code. Start over. |
| Test passes immediately | Fix test to expect new behavior |
| Tests-after | Not allowed. Test-first is mandatory. |
| Mock overdose | Use real code in tests unless unavoidable |
| Large test | One behavior per test |

### TDD Verification Checklist

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output is pristine (no errors, warnings)
- [ ] Edge cases and error paths are covered

---

## Task Granularity

**Target:** 2-5 min per task OR one coherent unit of behavior.

| Too Large | Just Right | Too Small |
|---|---|---|
| "Implement authentication" | "Add GitHub OAuth login returning user profile" | "Write 'email' in a variable" |

### Task Anatomy (Superpowers Format)

```markdown
### Task N: [Component Name]

**Files:**
- Create: `src/auth/oauth.py`
- Modify: `src/auth/index.ts:12-18`
- Test: `tests/auth/test_oauth.py`

**Step 1: Write the failing test**
[Complete test code]

**Step 2: Run test to verify it fails**
Command: `pytest tests/auth/test_oauth.py::test_github_oauth -v`
Expected: FAIL — "AttributeError: module 'auth' has no attribute 'oauth_login'"

**Step 3: Write minimal implementation**
[Complete implementation code]

**Step 4: Run test to verify it passes**
Command: `pytest tests/auth/test_oauth.py::test_github_oauth -v`
Expected: PASS

**Step 5: Commit**
git add tests/auth/test_oauth.py src/auth/oauth.py
git commit -m "feat(auth): add GitHub OAuth login"
```

---

## Role Definitions

### Architect Agent
- **When:** Beginning of every feature/ticket
- **Model:** Claude Sonnet (complex) / MiniMax (simple)
- **Inputs:** Feature request, existing codebase, architecture docs
- **Outputs:** SPEC.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md
- **Process:** Explores context → asks Socratic questions → proposes approaches with trade-offs → iterates → writes plan

### Coder Agent
- **When:** Dispatched by Orchestrator per task
- **Model:** MiniMax (simple) / DeepSeek R1 (complex) / Claude Sonnet
- **Inputs:** Full task text, file paths, SPEC.md reference, STANDARDS.md
- **Process:** RED test → verify FAIL → GREEN code → verify PASS → REFACTOR → commit
- **Rule:** NEVER write code before writing the test

### Tester Agent
- **When:** After feature fully implemented; before deployment
- **Model:** MiniMax
- **Inputs:** Full feature spec, implemented codebase, existing test suite
- **Outputs:** Integration tests, test suite quality report, bug reproduction tests
- **Note:** Coder Agent does TDD (unit tests); Tester does integration + validation

### Spec Reviewer Agent (Stage 1 Review)
- **When:** After Coder completes and commits
- **Model:** Claude Sonnet
- **Inputs:** Task spec, git commit diff, SPEC.md
- **Checks:** Every spec requirement vs implementation; YAGNI violations; under-building
- **Output:** APPROVED or REVISION REQUIRED with specific issues

### Quality Reviewer Agent (Stage 2 Review)
- **When:** ONLY AFTER Spec Reviewer approves ✅
- **Model:** Claude Sonnet
- **Inputs:** Git SHA range, implementation, quality checklist
- **Checks:** Separation of concerns, error handling, type safety, DRY, architecture, security, performance, tests
- **Output:** APPROVED or REVISION REQUIRED by severity

### DevOps Agent
- **When:** After all tasks approved; at milestones/releases
- **Model:** MiniMax (scripts) / Claude Sonnet (complex infra)
- **Inputs:** Final git SHA, deployment target, CI/CD config, secrets policy
- **Process:** Verify tests → build → configure CI → deploy to staging → smoke tests → report
- **Output:** Deployment status report + recommended next action

### Orchestrator (Paperclip AI / Felix)
- **Role:** Central coordinator — process manager, not a coding agent
- **Process:** Read plan → create TASK_TRACKER.md → dispatch Coder per task → route to Spec Reviewer → route to Quality Reviewer → on approval dispatch next task → after all tasks dispatch DevOps → report to Felix
- **Model:** MiniMax (Felix as COO)

---

## Handoff Protocol

See `execution/handoff_protocol.md` for full structured output formats per role and document flow.

See `execution/context_persistence.md` for the five memory layers and ByteRover usage.

---

## Model Routing

| Role | Primary Model | Budget Alternative | Notes |
|---|---|---|---|
| **Architect Agent** | Claude Sonnet | Gemini Flash | Architecture requires deep reasoning |
| **Coder Agent** | Claude Sonnet | OpenRouter: DeepSeek | Use free credits for volume |
| **Spec Reviewer** | Claude Sonnet | MiniMax | Pattern matching on spec vs code |
| **Quality Reviewer** | Claude Sonnet | — | Complex reasoning required |
| **Tester Agent** | Claude Sonnet | MiniMax | Integration test writing |
| **DevOps Agent** | Claude Sonnet | Gemini Flash | Script writing for CI/CD |
| **Orchestrator (Felix)** | MiniMax | — | Coordination, not deep reasoning |

### Routing Decision Tree

```
Is it complex reasoning (architecture, debugging, quality review)?
  → YES: Claude Sonnet
  → NO: Continue

Is it a simple, well-defined code task?
  → YES: OpenRouter DeepSeek (free) or Gemini Flash
  → NO: Continue

Is it reading/understanding a large codebase?
  → YES: Gemini Flash (large context, fast, free)
  → NO: Continue

Is it orchestration or coordination?
  → YES: MiniMax M2 (default, no tracking needed)
  → NO: Default to MiniMax M2
```

---

## The Non-Negotiables

These rules are never skipped regardless of time pressure:

1. **No code without a failing test first** (TDD Iron Law)
2. **Spec compliance review before quality review** (order matters)
3. **Design approved before implementation starts** (no shortcuts)
4. **Context lives in files, not in heads** (persistence over memory)
5. **YAGNI ruthlessly** (don't build what wasn't asked for)
6. **Verification before completion** (run tests, check outputs)

---

*Source: superpowers-ai-company-workflow.md v1.0 + agent_workflow.md — consolidated 2026-04-12*
*Framework: github.com/obra/superpowers (MIT License)*
