# AI Company Master Plan — Abzum New Zealand Limited
**Version 1.0 — 2026-04-01**

---

## Executive Summary

Build an AI-first software engineering company using **Paperclip AI** as the orchestration backbone, powered by **Superpowers** workflow principles, with a multi-tier model strategy within a **~$30/month budget**.

---

## 1. The Platform Stack

### Paperclip AI — Control Plane
- **What:** Open-source (MIT) orchestration platform for "zero-human companies"
- **Core concept:** Companies have org charts, budgets, goals — agents are employees
- **Pricing:** Free (MIT) + cost of AI agents connected
- **Superpowers template:** Pre-built 4-agent dev shop (CEO, Lead Engineer, Code Reviewer, Release Engineer)
- **Key insight:** "Paperclip is the control plane for autonomous AI companies" — OpenClaw is an employee, Paperclip is the company

---

## 2. Free API Stack

### OpenRouter Free Tier
- Permanently free models: `deepseek/deepseek-r1`, `qwen/qwen-2.5-coder-72b`, `openrouter/free`
- Trick: Add $10 → 50/day → 1,000/day (free models don't cost credits)

### Nvidia Developer Program
- Free credits on signup at build.nvidia.com
- **StarCoder2-15B** — dedicated code model
- Free downloadable NIM containers: Llama 3.1 8B, Mistral 7B
- No credit card required

### Model Budget Allocation

| Source | Model | Use Case | Cost |
|--------|-------|----------|------|
| Claude (existing) | Claude Sonnet 4 | Architecture, complex reasoning, PR reviews | $20/mo |
| MiniMax (existing) | MiniMax M2.7 | Quick tasks, orchestration, simple code | $10/mo |
| OpenRouter (free) | DeepSeek R1, Qwen Coder | Heavy coding on free tier | FREE |
| OpenRouter (free) | openrouter/free | Auto-select best free model | FREE |
| Nvidia (free credits) | StarCoder2-15B | Code completion, generation | FREE |

**Routing rule:** MiniMax for 80% of work. Claude Sonnet reserved for: architecture, security, complex debugging.

---

## 3. The Workflow (Superpowers-Inspired)

```
Vijay (Product Owner)
  ↓
🧠 Architect Agent → ARCHITECTURE.md + IMPLEMENTATION_PLAN.md
  ↓ (with Vijay approval)
⚡ Orchestrator (Paperclip AI) dispatches tasks
  ↓
👨‍💻 Coder Agent → RED test → GREEN code → REFACTOR → commit
  ↓ (per task)
🔍 Spec Reviewer → verifies spec compliance
  ↓
💎 Quality Reviewer → code quality, best practices
  ↓ (loops if failures)
🚀 DevOps Agent → CI/CD, deployment
  ↓
✅ Felix (COO) → reports to Vijay
```

**Iron Law:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.

---

## 4. Role Definitions

| Role | Model | When | Skills | Output |
|------|-------|------|--------|--------|
| **Architect Agent** | Claude Sonnet | Feature request received | System design, trade-off analysis, API design | ARCHITECTURE.md + IMPLEMENTATION_PLAN.md |
| **Coder Agent** | MiniMax / DeepSeek R1 | Dispatched per task | Language-specific, TDD, Git | Code + tests + commit |
| **Tester Agent** | MiniMax | After Coder completes | Playwright, Jest/Pytest, API testing | Validated code, passing tests |
| **Spec Reviewer** | Claude Sonnet | After Tester approves | Requirements analysis, edge cases | APPROVED.md or REVISION_REQUESTED.md |
| **Quality Reviewer** | Claude Sonnet | After Spec approves | Code quality, security, performance | Quality seal or revision |
| **DevOps Agent** | MiniMax | After all reviews pass | GitHub Actions, Docker, monitoring | Deployed system |
| **Felix (COO)** | MiniMax + Claude | Continuous | Project management, escalation | Reports to Vijay |

---

## 5. Skill Matrix (Core)

| Skill | Architect | Coder | Tester | Reviewer | DevOps |
|-------|-----------|-------|--------|----------|--------|
| System Design | 🔴 Deep | | | 🟡 | |
| TDD | | 🔴 Deep | 🔴 Deep | | |
| Playwright | | 🟡 | 🔴 Deep | | 🟡 |
| Jest/Pytest | | 🔴 Deep | 🔴 Deep | | |
| GitHub Actions | | 🟡 | 🟡 | | 🔴 Deep |
| Docker | | | | | 🔴 Deep |
| Security Review | | 🟡 | | 🔴 Deep | |
| API Design | 🔴 Deep | 🟡 | | | |

🔴 Deep = Required skill   🟡 Surface = Helpful

---

## 6. Testing Tools

| Tool | Cost | Best For |
|------|------|---------|
| **Playwright** | Free | E2E, browser automation |
| **Browserbase** | Free tier (1hr/mo) | Stealth browser for AI |
| **TestSprite** | 150 credits/mo free | AI-native test generation |
| **Jest/Pytest** | Free | Unit tests |
| **GitHub Actions** | Free (2000 min/mo) | CI/CD pipeline |

---

## 7. Budget Optimization Rules

1. MiniMax M2.7 for all simple tasks
2. OpenRouter free models for coding — DeepSeek R1, Qwen Coder
3. Claude Sonnet only for: architecture, security reviews, complex debugging, PR reviews
4. StarCoder2 via Nvidia for code completion (free)
5. Add $10 to OpenRouter → 1,000 requests/day instead of 50
6. TDD prevents waste — tests verify before deploy
7. Batch tasks — group similar tasks to minimize model switches

### Monthly Budget Target
- Claude Sonnet: ~$10-15 of $20 (reserved for high-value)
- MiniMax: ~$8-10 of $10
- OpenRouter free: unlimited
- Nvidia free: unlimited

---

## 8. Phases

### Phase 1: Foundation (This Week)
- [ ] Set up Paperclip AI with OpenClaw adapter
- [ ] Import Superpowers company template
- [ ] Configure OpenRouter free API key
- [ ] Configure Nvidia Developer API key
- [ ] Define first project in Paperclip

### Phase 2: First Feature (Week 2)
- [ ] Run Architect Agent on first feature request
- [ ] Execute TDD cycle with Coder Agent
- [ ] Validate with Tester Agent + Playwright
- [ ] Deploy via DevOps Agent

### Phase 3: Scale (Month 2+)
- [ ] Add more agents as workload increases
- [ ] Tune model routing based on actual usage
- [ ] Build custom skill library

---

*Source: AI_COMPANY_MASTER_PLAN.md v1.0 — Felix Stanley, COO*
