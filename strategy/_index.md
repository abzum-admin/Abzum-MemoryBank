---
children_hash: 87f651d00cd420a2f9a4c2f11850ea98878f72dbb777e76e0a5f0e1bf6474fc8
compression_ratio: 0.06351138479163683
condensation_order: 2
covers: [ai_agent_capabilities.md, ai_company_framework.md, ai_company_master_plan.md, ai_infrastructure_compliance.md, ai_native_org/_index.md, ai_native_org_structure.md, ai_security_framework.md, crm_delivery/_index.md, superpowers_workflow.md]
covers_token_total: 13966
summary_level: d2
token_count: 887
type: summary
---
<think>
The user wants me to create a structural summary from the provided child entries about the AI-native organization strategy. I need to condense the information while preserving key facts, relationships, and architectural decisions.

Let me analyze the entries:

1. **ai_native_5_tier_org_model.md** - 5-tier human structure for 95% AI workforce. Tiers: T1 (3-8), T2 (25-45), T3 (15-25), T4 (20-40), T5 (10-20). Total 80-150 humans. 9 AI agent pools. 26 departments dissolved.

2. **ai_native_org_structure.md** - Reference framework for AI-native enterprise org structure. Includes tier structure with human counts, framework elements, design principles.

3. **ai_security_framework.md** - AI Security & Operations Framework v2.0 covering MCRA phases, Entra Agent ID, Guardrails, DLP, monitoring, defense in depth, phased implementation.

4. **crm_delivery/_index.md** - Summary of CRM delivery approaches (4 approaches).

5. **crm_build_deploy_approaches.md** - Four delivery approaches with decision tree framework.

6. **superpowers_workflow.md** - AI-first workflow based on Superpowers, including TDD cycle, role definitions, model routing, handoff protocol.

Key themes:
- AI-native organizational structure (5 tiers, 80-150 humans)
- Agent Kubernetes model (agents as fundamental execution unit)
- Security framework (MCRA phases, defense in depth)
- Superpowers workflow (TDD, roles, model routing)
- CRM delivery strategy

Let me create a concise structural summary at d1 level.
</think>

# AI-Native Organization Strategy

Abzum operates as an **agent Kubernetes** — agents replace containers as the fundamental compute unit. The organization targets 95% AI workforce with only 80-150 humans across a 5-tier hierarchy.

## Organizational Structure

**5-Tier Human Hierarchy:**
- **T1 Strategic Command** (3-8): Sets objectives
- **T2 AI Platform** (25-45): Executes 95% of operations — **critical single point of failure**
- **T3 AI Governance** (15-25): Sets limits, compliance
- **T4 Human Interface** (20-40): Legal standing, trust
- **T5 Corporate Nucleus** (10-20): Fiduciary duty

**Human-only functions:** legal accountability, fiduciary duty, relationship equity, regulatory standing.

## Agent Architecture

9 autonomous AI pools: Engineering, Infrastructure, Security, Data, Support, Marketing, Finance, HR, Legal. Traditional 26 departments dissolved.

## Security Framework

MCRA-based (Govern → Map → Measure → Manage) with Microsoft Entra Agent ID for agent identity, Azure Content Safety guardrails (Prompt Shields, Groundedness), Purview DLP for context windows, layered defense architecture, automated SOC runbooks replacing human analysts, and prompt injection red teaming replacing traditional security training.

## Development Workflow

Superpowers-inspired TDD cycle (RED → GREEN → REFACTOR) with mandatory gates: Brainstorming → Design Approval → Writing Plans → Execute → Review → Finish. Six roles: Architect, Coder, Tester, Spec Reviewer, Quality Reviewer, DevOps. Model routing by task complexity.

## CRM Delivery Strategy

Four approaches: Build from Scratch (~$5K), Twenty CRM on Railway (~$0-2K, default for SMB), Extend Platform/Airtable (~$0-1.5K), Serverless/Azure Functions (~$3K + usage).

## Entry Reference

- `ai_native_5_tier_org_model.md` — Tier breakdown, agent pools
- `ai_security_framework.md` — MCRA phases, defense layers, implementation roadmap
- `superpowers_workflow.md` — TDD cycle, roles, model routing
- `crm_build_deploy_approaches.md` — Delivery approaches and decision tree