---
children_hash: 08d2cdb34574cb403022d2d1d166914e729f3558acbe4e060cbb6198676d4f34
compression_ratio: 0.8140293637846656
condensation_order: 1
covers: [crm_build_deploy_approaches.md]
covers_token_total: 613
summary_level: d1
token_count: 499
type: summary
---
<think>
The user wants me to create a structural summary at level d1 (domain level) from the child entries. This is a summarization task - I should not use any tools, just create a concise summary based on the provided content.

Looking at the child entries, there's only one entry: `crm_build_deploy_approaches.md`. I need to create a domain-level summary that:
1. Condenses the content to ~20-30% of input tokens
2. Preserves key facts, architectural decisions, and relationships
3. References entry names for drill-down
4. Outputs clean structured markdown
5. Does NOT wrap in code blocks or XML tags

Let me create a concise structural summary.
</think>

# CRM Delivery Strategy

## Overview

Documented 4 CRM delivery approaches for the crm_delivery strategy domain. Each approach targets different customer segments based on complexity, cost, and timeline requirements.

## Entry Reference

- **crm_build_deploy_approaches.md** — Four delivery approaches with decision tree framework

## Key Architectural Decisions

**Delivery Approaches:**
| Approach | Cost | Timeline | Target Segment |
|----------|------|----------|-----------------|
| Build from Scratch | ~5K AI labour | 2-4 weeks | Enterprise with unique workflows |
| Open-Source CRM (Twenty CRM) | 0-2K | 3 days-3 weeks | SMB requiring minimal customization |
| Extend Platform (Airtable) | 0-1.5K | 1-2 weeks | Lightweight customization needs |
| Serverless CRM (Azure Functions) | ~3K + 0-150/month | 2-3 weeks | Cost-sensitive startups |

**Decision Tree Logic:**
- Unique workflows required → Build from Scratch (Approach A)
- Cost-sensitive startup → Serverless CRM (Approach D)
- Fast deployment with minimal customization → Twenty CRM on Railway (Approach B)

**Default Recommendation:** Twenty CRM on Railway for SMB customers

## Key Relationships

- CRM remote maintenance uses per-customer Key Vault hierarchy with RBAC
- Security architecture enforces that agents can NEVER access raw unfiltered customer data by design