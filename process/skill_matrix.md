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
| **Docker** | Basics | — | — | Basics | Full | 🔴 Critical |
| **GitHub Actions** | — | — | — | — | Full | 🔴 Critical |
| **Playwright** | — | Unit | Full | — | — | 🔴 Critical |
| **Jest / Vitest** | — | Full | Full | Review | — | 🔴 Critical |
| **REST API Design** | Full | Full | Test | Review | Proxy | 🔴 Critical |
| **Auth / JWT / OAuth** | Design | Full | Test | Review | — | 🔴 Critical |
| **Linux / Shell** | Basics | Scripts | CI | Review | Full | 🔴 Critical |
| **Vercel / Deployment** | — | — | — | — | Full | 🔴 Critical |
| **PostgreSQL / SQL** | Design | Full | Test | Review | Backup | 🟡 Important |
| **Redis** | Caching | Full | Test | Review | — | 🟡 Important |
| **Prisma / ORM** | Schema | Full | Test | Review | — | 🟡 Important |
| **Tailwind CSS** | Design | Full | Test | Review | — | 🟡 Important |
| **Nginx** | — | — | — | Basics | Full | 🟡 Important |
| **Semgrep / Security** | — | — | — | Full | Scan | 🟡 Important |
| **Browserbase** | — | — | E2E | — | — | 🟡 Important |
| **Mermaid / Diagramming** | Full | Docs | — | — | Docs | 🟡 Important |

---

## Shared Skills Analysis

These skills are needed by multiple roles at different depths:

| Skill | Shared By | Deepest Proficiency |
|---|---|---|
| Git/GitHub | All 5 roles | Reviewer, DevOps |
| TypeScript | Architect, Coder, Tester, Reviewer | Coder |
| Docker | Architect (basics), DevOps (full), Reviewer (basics) | DevOps |
| Playwright | Coder (unit), Tester (full) | Tester |
| REST API | Architect, Coder, Tester, Reviewer | Architect, Coder |
| Linux/Shell | Coder, Tester, Reviewer, DevOps | DevOps |

---

## How to Read This Matrix

- **Architect needs to design with:** System design, API design, database schema, Mermaid diagrams
- **Coder needs to implement:** Full-stack coding, TDD, Git, tests
- **Tester needs to validate:** Playwright (full), Jest/Vitest (full), integration testing
- **Reviewer needs to evaluate:** Security scanning, code quality, test coverage
- **DevOps needs to deploy:** Docker (full), GitHub Actions (full), deployment platforms

---

## Skill Acquisition Priority

When building new skills for the agent team:

1. **Core (first):** Git, TypeScript, TDD (Jest/Playwright), REST API
2. **Critical (second):** Docker, Auth/JWT, GitHub Actions
3. **Important (third):** PostgreSQL, Redis, Security scanning
4. **Nice-to-have:** Mermaid, Nginx, Browserbase

---

*Source: AI_COMPANY_FRAMEWORK.md v1.0*
