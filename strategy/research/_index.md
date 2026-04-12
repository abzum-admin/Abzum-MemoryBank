# Research — Overview

## Documents

| Document | Summary |
|---|---|
| `mcra_ai_security.md` | MCRA framework deep dive — Govern/Map/Measure/Manage, controls applicability for AI-first companies |
| `ai_monitoring_research.md` | AI ops monitoring — Azure Foundry, Sentinel, Purview, Sentry, custom dev gaps |
| `product_watchlist.md` | Competitive landscape — 10+ AI agent products tracked |

---

## Key Research Findings

### AI Security (MCRA)
- MCRA maps to NIST AI RMF: Govern/Map/Measure/Manage
- For AI-first (no-human-workforce): MANAGE is most operationally demanding
- No human SOC → must invest heavily in observability, anomaly detection, automated runbooks
- Critical controls: Entra Agent ID, Prompt Shields, automated runbooks, layered memory

### AI Monitoring
- Azure Foundry has most built-in AI agent monitoring of any major cloud
- No major SIEM has deep turnkey AI agent monitoring as of early 2026
- Cross-platform token cost aggregation requires custom development
- Semantic agent activity analysis requires custom ML, not just traces

### Products Tracked
- Paperclip AI, Superpowers, Vercel AI Agent Browser, Kilo CLI, Arcade.dev
- Agent ecosystem products: Hermes Agent, Airweave, InTheWorldOfAI
- GStack, Agency Agents

---

*Prepared by: Felix Stanley, COO — Abzum New Zealand Limited*
*Date: 2026-04-01*
