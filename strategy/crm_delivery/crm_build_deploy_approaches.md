---
title: CRM Build/Deploy Approaches
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-04-03T11:06:37.255Z'
updatedAt: '2026-04-03T11:06:37.255Z'
---
## Raw Concept
**Task:**
Document 4 CRM delivery approaches with decision tree

**Changes:**
- Added 4 delivery approaches: Build from Scratch, Open-Source CRM, Extend Platform, Serverless CRM

**Flow:**
Assess requirements -> Evaluate complexity/cost/timeline -> Choose approach via decision tree

**Timestamp:** 2026-04-03

## Narrative
### Structure
4 delivery approaches with cost, timeline, and fit criteria:
- A: Build from Scratch (-5K AI labour, 2-4 wks) → Enterprise with unique workflows
- B: Deploy Open-Source CRM like Twenty CRM (00-2K, 3 days-3 wks) → Fast with minimal customization → Default: Twenty CRM on Railway for SMB
- C: Extend Platform like Airtable (00-1.5K, 1-2 wks)
- D: Serverless CRM with Azure Functions (-3K, 2-3 wks, 0-150/month hosting) → Cost-sensitive startups

Decision tree: unique workflows → A; cost-sensitive startup → D; need fast with minimal customisation → B

### Dependencies
CRM remote maintenance uses per-customer Key Vault hierarchy with RBAC

### Highlights
Default recommendation: Twenty CRM on Railway for SMB. Serverless CRM for cost-sensitive startups. Build from scratch for enterprise with unique workflows.

## Facts
- **crm_approaches**: Four CRM delivery approaches exist: Build from Scratch, Open-Source CRM, Extend Platform, Serverless CRM [project]
- **crm_build_scratch_cost**: Build from Scratch approach costs -5K AI labour and takes 2-4 weeks [project]
- **crm_opensource_cost**: Open-Source CRM (Twenty CRM) costs 00-2K and takes 3 days-3 weeks [project]
- **crm_extend_platform_cost**: Extend Platform (Airtable) costs 00-1.5K and takes 1-2 weeks [project]
- **crm_serverless_cost**: Serverless CRM with Azure Functions costs -3K + 0-150/month hosting and takes 2-3 weeks [project]
- **crm_remote_maintenance**: CRM remote maintenance uses per-customer Key Vault hierarchy with RBAC [project]
- **crm_security_agent_data_access**: Agents can NEVER access raw unfiltered customer data by design [project]
- **crm_default_recommendation**: Default CRM recommendation is Twenty CRM on Railway for SMB customers [project]
- **crm_decision_tree**: Decision tree: unique workflows → Build from Scratch; cost-sensitive startup → Serverless CRM; need fast with minimal customisation → Twenty CRM [convention]
