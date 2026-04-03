---
children_hash: 05cb5ab55dc8a4b91f8aa4707a022e8e667c70c81a2a39331db5fc278af1a976
compression_ratio: 0.06321922796795339
condensation_order: 2
covers: [ai_agent_capabilities.md, ai_company_framework.md, ai_company_master_plan.md, ai_infrastructure_compliance.md, ai_native_org/_index.md, ai_native_org_structure.md, ai_security_framework.md, crm_delivery/_index.md, superpowers_workflow.md]
covers_token_total: 13730
summary_level: d2
token_count: 868
type: summary
---
<think>
The user wants me to create a structural summary at domain level (d1) from the child entries in the `crm_delivery` domain. Let me analyze the child entries and create a concise summary.

From the context provided:
- **crm_build_deploy_approaches.md** — CRM build and deploy architecture with 4 approaches, decision tree, cost/timeline analysis, security model, and operational considerations.

The summary already shows:
- `covers: [crm_build_deploy_approaches.md]`
- `covers_token_total: 613`
- `token_count: 499`
- `compression_ratio: 0.8140293637846656` (~81% - so 19% compression)


- 
The existing summary covers the four approaches and decision tree logic, so I need to enhance it with the security architecture details, per-customer Key Vault hierarchy with RBAC, and the default recommendation of Twenty CRM on Railway. I'll structure this to be concise while preserving the key architectural decisions and relationships the user highlighted.
</think>

# CRM Delivery Strategy

## Overview

Domain covering CRM delivery approaches and infrastructure for Abzum's multi-tenant SaaS CRM platform. Includes 4 build/deploy strategies, per-customer isolated infrastructure, remote maintenance model, and security-first architecture.

## Entry Reference

- **crm_build_deploy_approaches.md** — Full CRM delivery strategy including 4 approaches, decision tree, infrastructure architecture, and operational model

## Key Architectural Decisions

### Four Delivery Approaches

| Approach | Strategy | Cost | Timeline | Target Segment |
|----------|----------|------|----------|----------------|
| A | Build from Scratch | ~5K AI labor | 2–4 weeks | Enterprise with unique workflows |
| B | Open-Source CRM (Twenty CRM on Railway) | 0–2K | 3 days–3 weeks | SMB, minimal customization |
| C | Extend Platform (Airtable) | 0–1.5K | 1–2 weeks | Lightweight customization |
| D | Serverless CRM (Azure Functions) | ~3K + 0–150/month | 2–3 weeks | Cost-sensitive startups |

**Default Recommendation:** Twenty CRM on Railway for SMB customers (lowest total cost, fastest deployment)

### Decision Logic
- Unique workflows required → **Approach A** (Build from Scratch)
- Cost-sensitive startup with custom needs → **Approach D** (Serverless)
- Fast deployment, minimal customization → **Approach B** (Twenty CRM)
- Prototype / minimal data model → **Approach C** (Airtable)

### Infrastructure Architecture
- **Per-customer isolated Azure resource groups** — each customer owns dedicated infrastructure
- **Remote maintenance via per-customer Key Vault hierarchy** — secrets organized by environment tier (dev/staging/prod), keyed to customer ID with RBAC-enforced access
- **GitOps deployment** — customer configs in `customers/{customer-id}/` repos; changes trigger Argo CD sync

### Security Model (Zero-Trust, Agent-Never-Leak)
- Agents can **never access raw unfiltered customer data** by design
- Read-only service accounts used wherever agents interact with CRM
- DLP + Purview govern what data agents can surface
- PII redaction applied before any agent sees customer data

## Key Relationships

- CRM delivery depends on Azure architecture defined in `infrastructure/azure_architecture.md`
- Per-customer isolation model connects to `customer-isolated-infrastructure-architecture` decisions
- Security enforcement layers connect to `ai_security_framework.md` guardrails
- Delivery approaches factor into broader strategy documented in `ai_company_master_plan.md`