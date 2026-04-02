# Infrastructure — Overview

## Documents

| Document | Summary |
|---|---|
| `azure_architecture.md` | Azure Australia East architecture — App Service, Cosmos DB, OpenAI, costs |
| `compliance_roadmap.md` | SOC2, ISO 27001, ISO 42001, GDPR timeline and phases |
| `data_architecture.md` | PostgreSQL, Weaviate, Redis, blob storage — selection rationale |
| `security_stack.md` | Entra, Key Vault, Sentinel, Purview — full security stack |

---

## Key Decisions

| Decision | Value |
|---|---|
| **Cloud provider** | Azure (Australia East Sydney) |
| **AI inference** | Azure OpenAI Service |
| **Vector DB** | Weaviate Cloud (AU region) or Azure AI Search |
| **Primary database** | PostgreSQL (Azure Database for PostgreSQL) |
| **Compliance** | SOC 2 Type I first, then ISO 27001 |
| **Monitoring** | Azure Monitor + Defender for Cloud |

---

## Architecture Summary

```
Azure Front Door + WAF + CDN (Public)
        ↓
Azure App Service / Container Apps
        ↓
┌──────────────┬───────────────┬─────────────────┐
│ Azure AI     │ Azure         │ Azure OpenAI     │
│ Search       │ Cosmos DB     │ Service          │
│ (Vector DB)  │ (Vector DB)   │ (GPT-4o-mini)    │
└──────────────┴───────────────┴─────────────────┘
```

**Monthly cost estimate:** ~$530-930/month (startup-eligible: $150-300/mo with free tiers)

---

*Prepared by: Felix Stanley, COO — Abzum New Zealand Limited*
*Date: 2026-04-01*
