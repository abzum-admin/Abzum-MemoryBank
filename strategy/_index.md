# Strategy — Overview

Strategic documents governing Abzum's AI-first company model.

## Documents

| Document | Version | Summary |
|---|---|---|
| `ai_company_master_plan.md` | v1.0 | Business model, platform stack (Paperclip AI), free API stack, budget allocation |
| `ai_company_framework.md` | v1.0 | Role definitions (6 roles), workflow sequence, skill matrix, budget optimization |
| `ai_agent_capabilities.md` | v1.0 | 8 capability domains, skill framework, Capability Maturity Model (5 levels) |
| `ai_security_framework.md` | v2.0 | AI security ops with MCRA — Govern/Map/Measure/Manage, Entra Agent ID, guardrails |
| `ai_infrastructure_compliance.md` | v1.0 | Azure architecture, compliance roadmap (SOC2, ISO 27001, ISO 42001, GDPR) |
| `superpowers_workflow.md` | v1.0 | Full Superpowers TDD workflow — 6 gates, RED-GREEN-REFACTOR, handoff protocol |

---

## Key Strategic Decisions

| Decision | Value |
|---|---|
| **Orchestration platform** | Paperclip AI (MIT, free) + OpenClaw subagent spawning |
| **Cloud** | Azure (Australia East / Sydney) |
| **AI inference** | Azure OpenAI (privacy + compliance) |
| **Vector DB** | Weaviate Cloud (AU region) or Azure AI Search |
| **Primary database** | PostgreSQL (Azure Database for PostgreSQL) |
| **Monthly AI budget** | ~$30/month (Claude $20 + MiniMax $10) + free APIs |

---

## Model Routing

| Use Case | Model |
|---|---|
| Architecture, complex reasoning | Claude Sonnet |
| Quick tasks, orchestration | MiniMax M2.7 |
| Heavy coding (free tier) | DeepSeek R1, Qwen Coder via OpenRouter |
| Code completion (free) | StarCoder2-15B via Nvidia |

---

*Prepared by: Felix Stanley, COO — Abzum New Zealand Limited*
*Date: 2026-04-01*
