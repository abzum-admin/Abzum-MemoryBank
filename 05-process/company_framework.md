---
id: exec-company-framework
title: AI Company Framework
summary: Operational framework and superpowers
tags: [execution, framework]
updated: 2026-05-09
load_priority: 50
load_lane: context
status: active
---
# AI Company Framework — Abzum New Zealand Limited
**Version 1.0 — 2026-04-01**

---

## Context

AI agents as primary workforce. Humans (Vijay) as orchestrators/supervisors. Budget: ~$30/month.

---

## 1. Role Definitions

### 🤖 Architect Agent
- **When:** Beginning of every feature/ticket
- **Inputs:** Feature request, existing codebase, current architecture docs
- **Outputs:** `SPEC.md` — structured technical specification, Mermaid diagrams, API contracts, component breakdown, acceptance criteria
- **Model:** Claude Sonnet (complex) / MiniMax (simple spec drafting)
- **Skills:** System design, REST/GraphQL API design, database schema, Mermaid

### 🤖 Coder Agent
- **When:** After Architect completes `SPEC.md`; for bug fixes (can skip Architect if trivial)
- **Inputs:** `SPEC.md`, codebase access, relevant documentation
- **Outputs:** Working code, unit tests, updated `SPEC.md`, Git commit
- **Model:** MiniMax (simple) / Claude Sonnet (complex)
- **Skills:** React, Node.js, TypeScript, Python, Go, Git, ESLint, Prettier
- **Rule:** Never code without `SPEC.md`

### 🤖 Tester Agent
- **When:** After Coder opens a PR; before deployment to staging; after bug fix
- **Inputs:** PR/code changes, `SPEC.md` acceptance criteria, test environment
- **Outputs:** Test suites, bug reports (structured), test coverage reports, pass/fail status
- **Model:** MiniMax only
- **Skills:** Playwright (E2E), Jest/Vitest (unit+integration), Lighthouse, Browserbase

### 🤖 DevOps Agent
- **When:** Project setup; CI/CD failures; deployment requests; before production releases
- **Inputs:** Codebase, Dockerfiles, CI/CD config, environment variables
- **Outputs:** Updated Dockerfile, CI/CD workflows, docker-compose, deployment scripts
- **Model:** MiniMax (scripts) / Claude Sonnet (complex infra)
- **Skills:** Docker, GitHub Actions, Kubernetes (future), AWS/Vercel/Railway, Nginx

### 🤖 Reviewer Agent
- **When:** After Tester approves; before any merge; security-sensitive changes (always)
- **Inputs:** PR diff, test results, `SPEC.md`, security checklist
- **Outputs:** Review comments, security audit notes, merge decision, deployment approval
- **Model:** Claude Sonnet
- **Skills:** Git review, Semgrep, Trivy, ESLint violations

---

## 2. Workflow — Standard Feature Flow

```
[HUMAN: Vijay]
     │
     │  "Build a user dashboard"
     ▼
🤖 ARCHITECT AGENT → SPEC.md + Architecture
     │
     ▼
🤖 CODER AGENT → Implementation + Tests → PR opened
     │
     ▼
🤖 TESTER AGENT → Test results + Bug reports
     │
     ▼
🤖 REVIEWER AGENT → Approved / Changes needed
     │
     ▼
🤖 DEVOPS AGENT → Deployed to staging/prod
     │
     ▼
[HUMAN: Vijay] → Final verification
```

### Human Intervention Triggers

| Trigger | Action |
|---|---|
| Reviewer rejects PR with >5 changes | Vijay reviews Coder's response |
| Security vulnerability found | Vijay notified immediately, deployment blocked |
| CI/CD failure | DevOps attempts fix, escalate after 2 tries |
| Ambiguous feature request | Architect pauses, asks Vijay |
| Budget usage >80% | Pause non-critical, report to Vijay |
| Test coverage <70% | Coder must improve before merge |
| Production outage | Full stop, human-led incident response |

---

## 3. Handoff Protocol

Each agent produces a **structured output file** before completing:

```
handoff/
├── 00-architect/SPEC.md
├── 01-coder/pr-link.md
├── 02-tester/test-report.md
├── 03-reviewer/review-summary.md
└── 04-devops/deploy-log.md
```

Any agent can be re-invoked with full context at any time.

---

## 4. Skill Matrix (Full)

| Skill | Architect | Coder | Tester | Reviewer | DevOps | Priority |
|---|---|---|---|---|---|---|
| Git / GitHub CLI | ✅ Read | ✅ Full | ✅ Read | ✅ Full | ✅ Full | 🔴 Critical |
| React / Next.js | ✅ Design | ✅ Full | ✅ Read | ✅ Review | — | 🔴 Critical |
| Node.js / Express | ✅ Design | ✅ Full | ✅ Test | ✅ Review | ✅ Scripts | 🔴 Critical |
| TypeScript | ✅ Design | ✅ Full | ✅ Test | ✅ Review | ✅ Types | 🔴 Critical |
| Docker | ✅ Basics | — | — | ✅ Basics | ✅ Full | 🔴 Critical |
| GitHub Actions | — | — | — | — | ✅ Full | 🔴 Critical |
| Playwright | — | ✅ Unit | ✅ Full | — | — | 🔴 Critical |
| Jest / Vitest | — | ✅ Full | ✅ Full | ✅ Review | — | 🔴 Critical |
| PostgreSQL / SQL | ✅ Design | ✅ Full | ✅ Test | ✅ Review | ✅ Backup | 🟡 Important |
| Redis | ✅ Caching | ✅ Full | ✅ Test | ✅ Review | — | 🟡 Important |
| REST API Design | ✅ Full | ✅ Full | ✅ Test | ✅ Review | ✅ Proxy | 🔴 Critical |
| Auth / JWT / OAuth | ✅ Design | ✅ Full | ✅ Test | ✅ Review | — | 🔴 Critical |
| Linux / Shell | ✅ Basics | ✅ Scripts | ✅ CI | ✅ Review | ✅ Full | 🔴 Critical |
| Semgrep / Security | — | — | — | ✅ Full | ✅ Scan | 🟡 Important |
| Browserbase | — | — | ✅ E2E | — | — | 🟡 Important |

---

## 5. Budget Optimization

### Monthly Allocation ($30/mo)

| Item | Budget | Model |
|---|---|---|
| Claude Plan | $20 | Main reasoning |
| MiniMax Plan | $10 | Bulk code generation |

### Model Selection Decision Tree

```
Is this task:
├── Security-sensitive?          → Claude Sonnet
├── Architectural/strategic?     → Claude Sonnet
├── Novel or unprecedented?      → Claude Sonnet
├── Complex debugging (>2 files)? → Claude Sonnet
├── Straightforward CRUD/pattern? → MiniMax
├── Test writing?                 → MiniMax
├── Documentation?                → MiniMax
├── CI/CD/infra script?           → MiniMax
└── Simple bug fix (<10 lines)?   → MiniMax
```

### Token Budget Guidelines

| Task | Max Tokens | Model |
|---|---|---|
| `SPEC.md` writing | 4,000 | Claude Sonnet |
| Feature code (1 file) | 3,000 | MiniMax |
| Feature code (complex, 3+ files) | 6,000 | Claude Sonnet |
| PR review | 5,000 | Claude Sonnet |
| Test suite (1 feature) | 3,000 | MiniMax |
| Docker/infra script | 2,000 | MiniMax |

---

## 6. Quality Gates

| Gate | Requirement | Who Checks |
|---|---|---|
| Code | All tests pass, no ESLint errors | CI |
| Tests | Coverage ≥70% | Tester |
| Security | No hardcoded secrets | Reviewer |
| Spec | Implementation matches SPEC.md | Coder self-check + Reviewer |
| Deploy | Staging passes smoke tests | DevOps |

---

## 7. Quick Reference — Model Selection

| Situation | Model |
|---|---|
| Writing SPEC.md | **Claude Sonnet** |
| Building standard React component | **MiniMax** |
| Building auth system from scratch | **Claude Sonnet** |
| Writing Jest tests | **MiniMax** |
| Writing Playwright E2E tests | **MiniMax** |
| Reviewing PR | **Claude Sonnet** |
| Approving obvious doc fix | **MiniMax** |
| Docker compose update | **MiniMax** |
| Designing database schema | **Claude Sonnet** |
| Security audit | **Claude Sonnet** |
| GitHub Actions YAML | **MiniMax** |

---

*Source: AI_COMPANY_FRAMEWORK.md v1.0 — Felix Stanley, COO*

---

<!-- backlinks-start -->

## Referenced by

- [Plan Of Action](../07-research/hermes-hindsight/plan_of_action.md)

<!-- backlinks-end -->
