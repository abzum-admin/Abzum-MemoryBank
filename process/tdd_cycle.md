# TDD Cycle — Abzum
**RED-GREEN-REFACTOR Discipline**

---

## The Iron Law

> **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

For AI agents, this is even more critical than for humans. Without a pre-written test, an agent will confidently write plausible-but-wrong code and pass it to the next stage. TDD forces the AI to **articulate expected behavior** before implementing it.

---

## The Three Phases

### Phase 1: RED — Write Failing Test

Write one minimal test showing what should happen.

**Requirements:**
- Clear, descriptive name describing behavior
- Test real behavior (no mocks unless unavoidable)
- Test exactly one thing
- Test must fail for the right reason

**Example — RED:**
```python
# File: tests/auth/test_oauth_flow.py
def test_oauth_github_returns_user_profile():
    """GitHub OAuth returns user profile with email, name, and avatar_url."""
    result = oauth_login(provider="github", code="test_code_abc123")
    assert result.email == "user@example.com"
    assert result.name == "Test User"
    assert result.avatar_url.startswith("https://avatars.githubusercontent.com/")
```

Run: `pytest tests/auth/test_oauth_flow.py -v` → **Expected: FAIL**

---

### Phase 2: GREEN — Minimal Code

Write the simplest code to pass the test. No YAGNI. No refactoring. No "improvements."

**Rule:** Anything beyond what's needed to pass the test gets deleted.

**Example — GREEN:**
```python
# File: src/auth/oauth.py
def oauth_login(provider: str, code: str):
    return UserProfile(
        email="user@example.com",
        name="Test User",
        avatar_url="https://avatars.githubusercontent.com/u/1/v4.png"
    )
```

Run: `pytest tests/auth/test_oauth_flow.py -v` → **Expected: PASS**

---

### Phase 3: REFACTOR — Clean Up

Only after tests pass. Remove duplication, improve names, extract helpers. **Keep tests green throughout.**

Run tests after every change to ensure nothing broke.

---

### Phase 4: COMMIT

```bash
git add tests/auth/test_oauth_flow.py src/auth/oauth.py
git commit -m "feat(auth): add GitHub OAuth login returning user profile"
```

---

## TDD Anti-Patterns (Never Do These)

| Anti-Pattern | What It Looks Like | Rule |
|---|---|---|
| **Writing code before test** | Agent generates function, then writes test | Delete code. Start over. |
| **Test passes immediately** | Test passes on first run — testing existing behavior | Fix test to expect new behavior |
| **Tests-after** | "I'll verify with tests later" | Not allowed. Test-first is mandatory. |
| **Mock overdose** | Every test is mock-heavy, testing the mock not the code | Use real code in tests unless unavoidable |
| **Large test** | `test_validates_everything_and_the_kitchen_sink` | One behavior per test |
| **No rollback plan** | One monolithic task, no verification steps | Decompose to 2-5 min tasks |

---

## TDD Verification Checklist (Per Task)

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output is pristine (no errors, warnings)
- [ ] Edge cases and error paths are covered
- [ ] Tests use real code, not excessive mocks
- [ ] Commit message follows conventional commits format

---

## Why TDD Matters More for AI Than Humans

| Human | AI Agent |
|---|---|
| Writes tests based on mental model of what code should do | Without TDD, writes plausible code that passes its own flawed mental model |
| Can self-correct during coding | Confidently produces wrong code and moves on |
| Intuition about edge cases | Needs explicit test to articulate edge cases |
| Understands "done" | Needs failing test to define "done" |

**The failing test forces the AI to articulate expected behavior before it commits to an implementation.** It also creates a regression suite that prevents future agents from breaking previous work.

---

## Task Anatomy with TDD

Every task in IMPLEMENTATION_PLAN.md includes TDD steps:

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

*Source: superpowers-ai-company-workflow.md v1.0*
