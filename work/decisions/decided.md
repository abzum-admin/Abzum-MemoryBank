# Decisions Made

> **What:** Record of all decisions made for Abzum
> **Updated:** As decisions are finalized

---

## Decisions Made

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
| D12 | Gatekeeper comms model — Comms Pipeline Agent | 2026-04-01 | Brand, compliance, and relationship protection | Vijay |
| D13 | Shared Comms Pipeline Agent until 10+ customers | 2026-04-01 | Simplicity before scale | Vijay |
| D14 | Work tree structure in ByteRover for planning | 2026-04-01 | Living document for actions, decisions, blockers | Vijay |
| D15 | Context tree access: Vijay L4, Team L2 | 2026-04-01 | Clearance model from Access Control Framework | Vijay |

---

## Decision Pending (see: `work/decisions/pending.md`)

---

## Decision Criteria Used

When making a decision, consider:
1. **Does this enable or block first revenue?** → Priority
2. **Does this reduce risk (legal, financial, security)?** → Must-do
3. **Does this leverage existing investment?** → Prefer
4. **Can this be reversed later?** → Prefer reversible for uncertain items
5. **Does this align with AI-first principles?** → Core criterion
