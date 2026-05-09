---
id: ops-azure
title: Azure Architecture
summary: Azure deployment design (AU East Sydney)
tags: [infrastructure, azure, cloud]
updated: 2026-05-09
load_priority: 55
load_lane: context
status: active
---
# Azure Architecture — Abzum
**Region: Australia East (Sydney)**

---

## Architecture Overview

```
Azure Front Door + WAF + CDN (Public)
        ↓
Azure App Service / Container Apps (Web + APIs)
        ↓
┌─────────────┬───────────────┬─────────────────┐
│ Azure AI    │ Azure         │ Azure OpenAI     │
│ Search      │ Cosmos DB     │ Service          │
│ ($100+/mo)  │ (Vector DB)   │ ($200-500+/mo)   │
│             │ $50-200/mo    │                 │
└─────────────┴───────────────┴─────────────────┘
```

---

## Monthly Cost Estimate

| Component | Monthly Cost |
|---|---|
| App Service (B1 Linux) × 2 | ~$120 |
| Azure OpenAI (GPT-4o-mini) | ~$200-500 |
| Azure Cosmos DB (1000 RUs, 50GB) | ~$80 |
| Azure AI Search (S1, 1 replica) | ~$150 |
| Azure Functions (consumption) | ~$20 |
| Azure Key Vault | ~$10 |
| Azure Monitor + Application Insights | ~$30 |
| Azure DevOps (5 users) | ~$30 |
| Azure Front Door + WAF | ~$40 |
| Networking (Private Link, VNet) | ~$50 |
| **Total** | **~$530-930/month** |

**Startup eligible:** Could begin at **$150-300/month** using free tiers.
**$200 free credit** for new Azure accounts (12-month trial).

---

## Managed vs Self-Hosted Decision

| Workload | Recommendation | Why |
|---|---|---|
| LLM/AI inference | **Managed (Azure OpenAI)** | Privacy + compliance built-in |
| Web apps / APIs | **App Service / Container Apps** | Less ops burden |
| Vector storage | **Weaviate Cloud or Azure AI Search** | Built-in vector indexing |
| Secrets | **Azure Key Vault** | Non-negotiable |
| Logging/Monitoring | **Azure Monitor + Defender** | Tight Azure integration |

---

## Azure Free Services Available

- **$200 free credit** for new Azure accounts (12-month trial)
- **Azure Free Tier:** 55+ always-free services including:
  - App Service
  - Functions
  - Cosmos DB
  - Azure AI Search
  - PostgreSQL
  - Storage

---

## Why Australia East (Sydney)

1. **Closest to NZ** — low latency for primary market
2. **Full Azure service coverage** — all services available
3. **NZISM-compatible** — meets New Zealand information security standards
4. **Data residency** — AU region for NZ/AU customer data compliance

---

## Key Azure Services

| Service | Purpose | Tier |
|---|---|---|
| Azure App Service | Web apps + APIs | B1 Linux |
| Azure Container Apps | Containerized workloads | Consumption |
| Azure OpenAI Service | GPT-4o-mini, AI inference | Standard |
| Azure Cosmos DB | Vector storage, NoSQL | 1000 RUs |
| Azure AI Search | Vector search, RAG | S1 |
| Azure Functions | Serverless functions | Consumption |
| Azure Key Vault | Secrets, certificates | Standard |
| Azure Front Door | CDN, WAF, load balancing | Standard |
| Azure Private Link | Private connectivity | — |
| Azure Monitor + App Insights | APM, monitoring | — |
| Azure Defender for Cloud | CSPM, threat protection | — |
| Azure DevOps | CI/CD | 5 users |

---

*Source: AI_COMPANY_INFRASTRUCTURE_COMPLIANCE_PLAN.md v1.0*
