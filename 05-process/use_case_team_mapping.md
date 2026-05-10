---
id: exec-uc-team-mapping
title: Use Case → Persona Team Mapping
summary: Maps each Abzum use case to the persona team that staffs it — orchestrator reads this to compose project teams
tags: [execution, use-cases, personas, teams]
updated: 2026-05-10
load_priority: 55
load_lane: context
status: active
related: [strat-persona-v013, co-use-cases]
---
# Use Case → Persona Team Mapping

The Orchestrator reads this when staging a project: given a use-case ID, which personas join the team in what order, what's the default lane (BV/BP), what are escalation triggers, and what's the typical delivery window.

**Existing UCs** are sourced from [`11-work/registry.json`](../11-work/registry.json) (UC-01 through UC-20 are already defined). **New UCs** (UC-21+) added 2026-05-10 to capture cases the master plan didn't list separately.

---

## Quick Lookup

| UC | Title | Default Lane | Primary Personas | Delivery Window |
|---|---|---|---|---|
| UC-01 | Custom CRM Build | BV → BP for security-critical | BA → Planner → Architect → Interface → Senior+Junior Coder → Tester → Security → DevOps → Infra | 2–4 weeks |
| UC-02 | CRM Migration | BV | BA → Planner → Senior Coder → Tester → DevOps | 1–3 weeks |
| UC-05 | Customer Onboarding Automation | BV | Triage → BA → Planner → Junior Coder → Tester → DevOps | 1–2 weeks |
| UC-06 | Business Process Automation (Operations) | BV | Triage → BA → Planner → Junior Coder → Tester → DevOps | 1–2 weeks |
| UC-07 | Business Process Automation (Sales) | BV | Triage → BA → Planner → Junior Coder → Tester → DevOps | 1–2 weeks |
| UC-09 | Business Process Automation (Finance) | BV | Triage → BA → Planner → Senior Coder → Tester → Security → DevOps | 2 weeks |
| UC-16 | System Integration | BV | Triage → BA → Architect → Senior Coder → Tester → Security → DevOps | 2–3 weeks |
| UC-20 | AI Chatbot/Assistant | BV | Triage → BA → Planner → Junior Coder → Tester → DevOps | 1–2 weeks |
| UC-21 | Build a Website | BV | Triage → BA → Planner → Architect → Interface → Junior Coder → Tester → DevOps → Infra | 1–3 weeks |
| UC-22 | Build a Research Document | BV | Triage → BA → Planner → Researcher → Tech Writer | 3–10 days |
| UC-23 | Build a SaaS / Internal Tool | BV → BP if cross-service | BA → Planner → Architect → Interface → Senior+Junior Coder → Tester → Security → DevOps → Infra | 2–6 weeks |
| UC-24 | Marketing Campaign / Brand Asset Production | BV | Triage → BA → Brand → Motion → Tech Writer | 1–2 weeks |
| UC-25 | Pitch Deck / Investor Document | BP for board materials | Triage → BA → Brand → Tech Writer | 3–7 days |
| UC-26 | Code/Security Audit on Existing Codebase | BV → BP for high-stakes | Triage → Researcher → Senior Coder → Security → Tech Writer | 1–2 weeks |
| UC-27 | Production Incident Response | BP for severity-1 | Triage → DevOps → Senior Coder → Architect → Tech Writer (postmortem) | hours to days |
| UC-28 | Ongoing Maintenance / On-call | BV | DevOps → Junior Coder → Tester | continuous |
| UC-29 | Explainer / Demo Reel Production | BV | BA → Tech Writer → Brand → Motion | 1–2 weeks |

---

## Detailed Mappings

### UC-21 — Obtain Requirements + Build a Website (NEW)

**Description**: Client wants a marketing site, landing page, or content site. Built on a modern stack (Next.js + Tailwind / shadcn / Vercel) deployed to client domain.

**Default Lane**: BV.

**Persona Sequence**:
1. **Triage** — classify, schedule BA call
2. **Business Analyst** — Meet call, requirements + budget + brand inputs + 2–3 mid-call mockups
3. **Planner** — decompose into Kanban tasks (info architecture, design, build, deploy)
4. **Architect** — only if stack non-trivial (CMS choice, auth, custom backend)
5. **Interface Designer** — wireframes + hi-fi mockups + design tokens
6. **Junior Coder** — implement page-by-page under Senior review
7. **Tester** — unit + Playwright visual diff
8. **DevOps** — Vercel deploy, env vars, preview URLs
9. **Infrastructure Engineer** — DNS / SSL / domain handoff

**Escalation triggers (BV → BP)**: e-commerce / payments → Security to BP; complex CMS → Architect to BP.

**Sample budget**: $3K–$10K depending on scope.

### UC-22 — Obtain Requirements + Build a Research Document (NEW)

**Description**: Client wants a structured research deliverable — competitive analysis, technology evaluation, market scan.

**Default Lane**: BV.

**Persona Sequence**:
1. **Triage** — research-only request, route directly
2. **Business Analyst** — short call (or async brief) to scope research questions, sources, depth
3. **Planner** — break research into question buckets with retry budgets
4. **Researcher** — long-running investigation via Kimi K2.6 Agent Swarm (BV) or Gemini 3.1 Pro (BP)
5. **Tech Writer** — turn raw findings into polished doc with executive summary

**Escalation triggers**: Specialist domain (medical / legal) → BP for Researcher; investor-grade output → BP for Tech Writer.

**Sample budget**: $1K–$5K.

### UC-23 — Obtain Requirements + Build a SaaS / Internal Tool (NEW)

**Description**: Multi-page application with auth, data persistence, and meaningful business logic. The full Abzum stack engagement.

**Default Lane**: BV; selectively BP for Security and Architect.

**Persona Sequence**:
1. Triage → BA → Planner
2. **Architect** (BP) — RFC for stack, data model, auth boundaries
3. **Infrastructure Engineer** — provision DB, hosting, secrets vault
4. **Interface Designer** — full design system + screen-by-screen mockups
5. **Junior Coder** + **Senior Coder** — TDD implementation, Senior reviews every PR
6. **Tester** — unit + Playwright + edge cases
7. **Security** (BP) — PR-level review on every merge; threat-model the architecture
8. **DevOps** — CI/CD, deploys, runbooks
9. **Tech Writer** — README + admin / user docs

**Sample budget**: $10K–$50K depending on scope.

### UC-24 — Marketing Campaign / Brand Asset Production (NEW)

**Description**: Multi-asset marketing campaign — landing page, social graphics, email templates, video.

**Persona Sequence**: Triage → BA → Brand Designer → Motion Designer → Tech Writer (copy) → Junior Coder (only if interactive landing page).

**Default Lane**: BV.

### UC-25 — Pitch Deck / Investor Document (NEW)

**Description**: Investor-grade deck or board pack.

**Persona Sequence**: Triage → BA → Brand Designer (BP for polish) → Tech Writer (BP for narrative).

**Default Lane**: BP — quality is the deliverable.

### UC-26 — Code/Security Audit on Existing Codebase (NEW)

**Description**: Client provides a codebase; Abzum audits for vulnerabilities, code quality, and architectural risk.

**Persona Sequence**:
1. Triage
2. **Researcher** — codebase exploration, dependency mapping
3. **Senior Coder** — code-quality assessment
4. **Security** (BP) — vuln review, threat model, CVE check, prompt-injection probing if AI features
5. **Tech Writer** — final report

### UC-27 — Production Incident Response (NEW)

**Description**: A production system is broken; response under time pressure.

**Persona Sequence (severity-1, BP)**:
1. **Triage** — page DevOps + Senior Coder
2. **DevOps** (BP) — first responder, contains blast radius, rolls back if needed
3. **Senior Coder** (BP) — root cause
4. **Architect** — only if root cause is structural
5. **Tech Writer** — postmortem within 48h

### UC-28 — Ongoing Maintenance / On-call (NEW)

**Description**: Continuous engagement — keep a deployed system patched, healthy, and feature-current.

**Persona Sequence**: DevOps + Junior Coder + Tester running on an ongoing Kanban board. Senior Coder + Security only when escalated.

**Default Lane**: BV (cost discipline matters when continuous).

### UC-29 — Explainer / Demo Reel Production (NEW)

**Description**: Product demo video, explainer animation, or social short.

**Persona Sequence**: BA → Tech Writer (script) → Brand Designer (key visuals) → Motion Designer (final reel).

---

## How the Orchestrator Uses This Doc

When a project starts, the Orchestrator:

1. Reads the Triage classification → identifies UC-id (or proposes a new one)
2. Looks up the persona sequence for that UC
3. Spawns the personas in order, wiring upstream→downstream handoffs via Kanban
4. Selects BV vs BP per persona based on the escalation triggers above and the project's budget envelope
5. Logs the team composition to Hindsight so future Cost-Optimizer can compare actual cost vs envelope

When the request doesn't match any known UC, Triage routes to BA for full discovery, and a new UC row is added to `11-work/registry.json` after the BA call.

---

## References

- [`08-strategy/persona_team_v013.md`](../08-strategy/persona_team_v013.md) — master persona table
- [`03-services/legacy_top5_priority.md`](../03-services/legacy_top5_priority.md) — strategic use-case priority (top 5)
- [`11-work/registry.json`](../11-work/registry.json) — UC namespace
- [`personas/`](../personas/) — per-persona detail

---

<!-- backlinks-start -->

## Referenced by

- [Now](../01-identity/now.md)
- [ Personas Readme](../02-org/02-ai-systems/_personas_readme.md)
- [Project Allocator](../02-org/04-platform-orchestration/01-orchestration/project_allocator.md)
- [Ai Chatbot](../03-services/01-build/ai_chatbot.md)
- [Crm Build](../03-services/01-build/crm_build.md)
- [Crm Migration](../03-services/01-build/crm_migration.md)
- [Interact Deploy](../03-services/01-build/interact_deploy.md)
- [Require Deploy](../03-services/01-build/require_deploy.md)
- [Saas Internal Tool](../03-services/01-build/saas_internal_tool.md)
- [System Integration](../03-services/01-build/system_integration.md)
- [Website](../03-services/01-build/website.md)
- [Business Process Automation](../03-services/02-automation/business_process_automation.md)
- [Code Security Audit](../03-services/03-audit-advisory/code_security_audit.md)
- [Explainer Demo Reel](../03-services/04-creative-content/explainer_demo_reel.md)
- [Marketing Campaign](../03-services/04-creative-content/marketing_campaign.md)
- [Pitch Deck](../03-services/04-creative-content/pitch_deck.md)
- [Research Document](../03-services/05-research-knowledge/research_document.md)
- [Incident Response](../03-services/06-managed-ongoing/incident_response.md)
- [Maintenance On Call](../03-services/06-managed-ongoing/maintenance_on_call.md)
- [Legacy Top5 Priority](../03-services/legacy_top5_priority.md)
- [Pricing](../03-services/pricing.md)
- [Persona Team V013](../08-strategy/persona_team_v013.md)
- [Agents](../AGENTS.md)

<!-- backlinks-end -->
