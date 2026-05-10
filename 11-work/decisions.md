<!-- generated, do not edit — see _tools/gen_work_views.py -->

# Decisions

## Pending

| ID | Decision | Blocks | Urgency | Owner |
|---|---|---|---|---|
| P01 | Who approves L3/L4 actions? (Vijay only, or delegated to Head of Customer Relations?) | Access Control implementation, Agent authority levels, HITL triggers | high | Vijay |
| P02 | First customer - who is it, what are they buying? | Go-to-market, pricing, first project scope, first revenue | high | Vijay |
| P03 | Azure account - who sets it up, who pays? | Infrastructure, Entra ID, Key Vault, all cloud services | high | Vijay |
| P04 | Company email - @abzum.com via what provider? | External comms, CRM integration, brand | high | Vijay |
| P05 | First human hire - when, who, what role? | Customer Comms (need Account Manager), Phase 3 | medium | Vijay |
| P06 | CRM build vs buy - can we delay this? | Customer Comms Phase 2 implementation | medium | Vijay |

## Decided

| ID | Decision | Date | Rationale | Owner |
|---|---|---|---|---|
| D01 | Use OpenClaw as primary AI agent platform | 2026-04-01 | Already configured, flexible, Telegram integration | Felix |
| D02 | Use MiniMax M2.7 as default model (80% of tasks) | 2026-04-01 | Cost-effective for simple tasks | Felix |
| D03 | Use Claude Sonnet for architecture/security/complex work | 2026-04-01 | Reserved for high-value reasoning tasks | Felix |
| D04 | Superpowers TDD workflow as standard process | 2026-04-01 | Evidence-based, reduces hallucinations | Felix |
| D05 | ByteRover as memory/knowledge system | 2026-04-01 | Already installed, context tree structured | Felix |
| D06 | MCRA framework for AI security operations | 2026-04-01 | Comprehensive, Microsoft-backed, AI-agent specific | Felix |
| D07 | Azure as primary cloud provider | 2026-04-01 | AU East region, Entra Agent ID, compliance inheritance | Felix |
| D08 | Weaviate Cloud for vector/RAG (AU region) | 2026-04-01 | Free tier, hybrid search, good AU support | Felix |
| D09 | PostgreSQL (Azure Database) for transactional data | 2026-04-01 | Battle-tested, pgvector for embeddings | Felix |
| D10 | SOC 2 Type I as first compliance certification | 2026-04-01 | Required for enterprise deals, faster than ISO 27001 | Felix |
| D11 | CRM: Build (Next.js + PostgreSQL) over Buy | 2026-04-01 | Native agent integration, full data ownership | Vijay |
| D12 | Gatekeeper comms model - Comms Pipeline Agent | 2026-04-01 | Brand, compliance, and relationship protection | Vijay |
| D13 | Shared Comms Pipeline Agent until 10+ customers | 2026-04-01 | Simplicity before scale | Vijay |
| D14 | Work tree structure in ByteRover for planning | 2026-04-01 | Living document for actions, decisions, blockers | Vijay |
| D15 | Context tree access: Vijay L4, Team L2 | 2026-04-01 | Clearance model from Access Control Framework | Vijay |
| D16 | Replace ByteRover with Hindsight + LLM Wiki + GitHub backup; supersedes D05 | 2026-05-10 | Single-provider clarity, 91.4% LongMemEval coverage, GitHub-native backup, ByteRover already flagged deprecated in agent_orchestration.md but contradicted in 3 other files | Vijay+Felix |
| D17 | Restructure repo into numbered company-shaped tree (00-meta..99-assets) | 2026-05-10 | Function-shaped folders replaced with company-shaped tree mirroring real-org structure; agent-first navigation; click-link mermaid org chart | Vijay+Felix |
| D18 | Drop CRM as anchor product; introduce Abzum InterACT (voice-activated dynamic multi-tenant CRM) as flagship plus Abzum ReQuire (requirements elicitation product) | 2026-05-10 | CRM becomes one of many services. New anchor products are voice-activated, real-time-rendering, multi-tenant CRM (InterACT) plus a productized requirements elicitation tool (ReQuire) | Vijay |
| D19 | All-AI exec layer: Felix repositions to CAIO; CDO + CSCO are new AI agents under Vijay (CEO/Founder, human) | 2026-05-10 | Reflects 95% AI-agent goal at exec level | Vijay |
| D20 | Single client-facing AI persona = Client Engagement Agent (merges BA + Account Manager + Client Comms) | 2026-05-10 | User preference: one AI agent for all client communication, paired with human Delivery Manager; supersedes standalone BA persona | Vijay |
| D21 | Pricing model: Hourly + per-project estimate (drops legacy <=$15K rule) | 2026-05-10 | UC-23 ranges to $50K; rigid cap discouraged high-value engagements | Vijay |
