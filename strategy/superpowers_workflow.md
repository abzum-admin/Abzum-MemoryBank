# Superpowers-Inspired AI Workflow — Abzum
**Version 1.0 — 2026-04-01**

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

## 1. Workflow Sequence (AI-First Adaptation)

```
Vijay: "I want a user authentication system with OAuth"
        ↓
🧠 Architect Agent: Socratic design dialogue → ARCHITECTURE.md
        ↓ Vijay approves
📋 Architect Agent: Writes IMPLEMENTATION_PLAN.md
        ↓ (bite-sized tasks, 2-5 min each)
⚡ Orchestrator (Paperclip AI): Dispatches Coder Agents per task
        ↓ (each task: RED → GREEN → REFACTOR → Commit)
🔍 Spec Reviewer Agent: Is implementation on spec?
        ↓
💎 Quality Reviewer Agent: Is code well-built?
        ↓ (two-stage review, spec BEFORE quality)
🚀 DevOps Agent: Deployment, CI/CD, monitoring
        ↓
✅ Felix (COO): Reports to Vijay
```

---

## 2. TDD Cycle: RED-GREEN-REFACTOR

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

```python
# File: src/auth/oauth.py
def oauth_login(provider: str, code: str):
    return UserProfile(
        email="user@example.com",
        name="Test User",
        avatar_url="https://avatars.githubusercontent.com/u/1/v4.png"
    )
```

Run: `pytest ...` → Expected: **PASS** — anything else deleted.

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

## 3. Task Granularity

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

## 4. Role Definitions

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

## 5. Handoff Protocol

### Document Flow

```
Vijay's Request
        ↓
ARCHITECTURE.md          ← Architect Agent output (design)
        ↓
IMPLEMENTATION_PLAN.md   ← Architect Agent output (tasks)
        ↓
TASK_TRACKER.md          ← Orchestrator output (live progress)
        ↓
├──► Coder Agent output per task:
│         ├── tests/x.test.ts   (test code)
│         ├── src/x.ts           (implementation)
│         └── git commit         (conventional commit)
│
├──► Spec Reviewer output:
│         └── REVIEW_SPEC.md     (compliance report)
│
├──► Quality Reviewer output:
│         └── REVIEW_QUALITY.md (quality report)
│
└──► DevOps Agent output:
          └── DEPLOYMENT.md      (status + options)
```

### File Naming Conventions

| Document | Format |
|---|---|
| Architecture/Design | `docs/designs/YYYY-MM-DD-feature-design.md` |
| Implementation Plan | `docs/plans/YYYY-MM-DD-feature-plan.md` |
| Task Tracker | `TASK_TRACKER.md` (project root) |
| Spec Review | `REVIEWS/YYYY-MM-DD-task-N-spec.md` |
| Quality Review | `REVIEWS/YYYY-MM-DD-task-N-quality.md` |
| Deployment Report | `DEPLOYMENTS/YYYY-MM-DD-feature.md` |

### Structured Handoff Contents

**Architect → Coder (via Orchestrator):**
```
TASK TEXT: [Full text of task from IMPLEMENTATION_PLAN.md]
SCENE SETTING: [What's already built, what this task adds]
FILES:
- Create: [exact path]
- Modify: [exact path:line range]
- Test: [exact test path]
CONTEXT:
- SPEC.md: [location]
- ARCHITECTURE.md: [location]
- STANDARDS.md: [location]
```

**Coder → Spec Reviewer:**
```
COMMIT SHA: [git SHA]
FILES CHANGED: [list]
TASK: [which task from the plan]
WHAT WAS DONE: [plain text summary]
TESTS: [list of tests added/modified, all passing?]
```

**Spec Reviewer → Quality Reviewer:**
```
VERDICT: APPROVED / REVISION REQUIRED
REVIEW FILE: REVIEWS/YYYY-MM-DD-task-N-spec.md
IF REVISION REQUIRED:
  - Issue 1: [description, file:line]
  - Issue 2: [description, file:line]
```

**Quality Reviewer → Orchestrator:**
```
VERDICT: APPROVED / REVISION REQUIRED
REVIEW FILE: REVIEWS/YYYY-MM-DD-task-N-quality.md
STRENGTHS: [list]
ISSUES: [by severity]
```

---

## 6. Context Persistence (Critical for AI Agents)

AI agents are ephemeral — each new subagent starts fresh. Context persistence is the most critical infrastructure problem.

### Layered Context Strategy

| Layer | Mechanism | Purpose | Lifespan |
|---|---|---|---|
| **Layer 1** | Project files (SPEC.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md) | Long-term project truth | Permanent |
| **Layer 2** | TASK_TRACKER.md | Live task status per feature | Feature lifecycle |
| **Layer 3** | Inline dispatch context | Per-task agent input | Task duration |
| **Layer 4** | ByteRover context tree | Cross-project patterns + decisions | Permanent |
| **Layer 5** | MEMORY.md + daily logs | COO-level continuity | Permanent |

### Golden Rule
**Any context an agent needs must be in:**
1. A **file** the agent is told to read (for cross-task context)
2. **Inline** in the dispatch prompt (for immediate task context)

Context in a previous conversation or "the usual place" is **not acceptable**.

---

## 7. Model Routing

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

## 8. The Non-Negotiables

These rules are never skipped regardless of time pressure:

1. **No code without a failing test first** (TDD Iron Law)
2. **Spec compliance review before quality review** (order matters)
3. **Design approved before implementation starts** (no shortcuts)
4. **Context lives in files, not in heads** (persistence over memory)
5. **YAGNI ruthlessly** (don't build what wasn't asked for)
6. **Verification before completion** (run tests, check outputs)

---

*Source: superpowers-ai-company-workflow.md v1.0 — Felix Stanley, COO*
*Framework: github.com/obra/superpowers (MIT License)*
