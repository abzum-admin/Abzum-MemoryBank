---
id: ops-sec-compliance
title: AI Infrastructure Compliance
summary: Compliance planning and roadmap for AI infra
tags: [security, compliance]
updated: 2026-05-09
load_priority: 40
load_lane: reference
status: active
---
# Infrastructure & Compliance Plan — Abzum
**Version 1.0 — 2026-04-01**

---

## Part 1: Infrastructure — Azure

### Recommended Architecture

**Region: Australia East (Sydney)** — closest to NZ, full Azure coverage, NZISM-compatible

```
Azure Front Door + WAF + CDN (Public)
        ↓
Azure App Service / Container Apps (Web + APIs)
        ↓
┌─────────────┬──────────────┬───────────────┐
│  Azure AI   │   Azure      │  Azure OpenAI │
│  Search     │  Cosmos DB   │  Service      │
│  ($100+/mo) │  (Vector DB) │  ($200-500+/mo│
└─────────────┴──────────────┴───────────────┘
```

### Monthly Cost Estimate

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

### Managed vs Self-Hosted

| Workload | Recommendation | Why |
|---|---|---|
| LLM/AI inference | **Managed (Azure OpenAI)** | Privacy + compliance |
| Web apps / APIs | **App Service / Container Apps** | Less ops burden |
| Vector storage | **Weaviate Cloud or Azure AI Search** | Built-in vector indexing |
| Secrets | **Azure Key Vault** | Non-negotiable |
| Logging/Monitoring | **Azure Monitor + Defender** | Tight Azure integration |

---

## Part 2: Compliance Roadmap

### Certification Priority

| Certification | Timeline | Cost | When |
|---|---|---|---|
| **SOC 2 Type I** | 6-10 months | $30-50K audit | As early as possible |
| **ISO 27001** | 10-18 months | $30-80K | Required for enterprise deals |
| **SOC 2 Type II** | 18-24 months | $30-80K audit | Before US/enterprise expansion |
| **ISO 42001** | 24-36 months | $30-100K | As AI regulation tightens |
| **GDPR** | Run in parallel | $10-50K | If targeting EU customers |

### Phase 1 — Foundational (Months 1-6)
- [ ] Choose Azure (inherits ISO 27001, SOC2 certifications)
- [ ] Implement MFA, SSO, endpoint protection
- [ ] Set up Azure Security Center / Defender for Cloud
- [ ] Draft: Information Security Policy, Incident Response Plan, Data Classification
- [ ] Enable audit logging for all AI agent activities

### Phase 2 — SOC 2 Type I (Months 6-10)
- [ ] Engage SOC 2 auditor (get 3 quotes)
- [ ] Implement 5 Trust Service Criteria controls
- [ ] Pass SOC 2 Type I audit

### Phase 3 — ISO 27001 (Months 10-18)
- [ ] Complete ISMS documentation
- [ ] Internal audit → Stage 1 + Stage 2 external audit

### Phase 4 — SOC 2 Type II (Months 18-24)
- [ ] Maintain controls with evidence collection
- [ ] 6-month observation period → Type II audit

### GDPR (Parallel from Day 1)
- [ ] Appoint EU representative if targeting EU customers
- [ ] Draft DPA, implement data retention policies
- [ ] Right to erasure implementation

---

## Part 3: Data Architecture

### Database Stack

| Data Type | Technology | Why |
|---|---|---|
| **Transactional** | PostgreSQL (Azure Database for PostgreSQL) | Battle-tested, pgvector for embeddings |
| **Vector/RAG** | Azure AI Search or Weaviate Cloud (AU region) | Semantic search, knowledge retrieval |
| **Documents/Blob** | Azure Blob Storage (AU region) | S3-compatible, cheap |
| **Analytics** | PostgreSQL + read replica | Sufficient for <10M rows |
| **Caching** | Azure Cache for Redis | Session, temporary data |

### Vector DB Comparison

| Service | Free Tier | AU Region | Best For |
|---|---|---|---|
| **Weaviate Cloud** | 3 schemas free | ✅ Yes | Flexible, good AU support |
| **Chroma** | Free (self-hosted) | ✅ (if hosted) | Tight budget |
| **Azure AI Search** | 3 indexes free | ✅ Yes | Already on Azure |
| **Pinecone** | 1 project free | ❌ No | Avoid at small scale |

**Recommendation:** Weaviate Cloud (AU region) — starts free, handles hybrid search, good for RAG + agents

### Data Residency
- **Primary:** Australia East (Sydney) / Southeast Asia (Singapore)
- **DR:** Australia Southeast (Melbourne) or cross-provider
- **NZ Government data:** RESTRICTED must remain in NZ — Azure Australia regions

---

## Part 4: Security Stack

### Identity & Access
- **Microsoft Entra ID** — SSO, MFA, conditional access
  - Free tier available
  - P1 (~$6/user/month): security groups, conditional access
  - P2 (~$12/user/month): risk-based conditional access

### Secrets Management
- **Azure Key Vault** — API keys, certificates, connection strings
  - Standard: ~$0.03/10k operations
  - Premium (HSM-backed): ~$0.50/10k operations

### Network Security
- **Private Link** — No public internet exposure for Azure services
- **NSGs** — Network Security Groups for traffic control
- **Azure Firewall / WAF** — Web application firewall, DDoS protection

### Monitoring & SIEM
- **Azure Monitor + Application Insights** — APM, performance
- **Microsoft Defender for Cloud** — CSPM + threat protection (~$15/node/month)
- **Microsoft Sentinel** — SIEM + SOAR (~$4/GB ingested)

---

## Part 5: Key Decisions Summary

| Decision | Recommendation |
|---|---|
| Cloud provider | **Azure** (Australia East Sydney) |
| AI inference | **Azure OpenAI Service** (privacy + compliance) |
| Vector DB | **Weaviate Cloud** (AU region) or **Azure AI Search** |
| Primary database | **PostgreSQL** (Azure Database for PostgreSQL) |
| Compliance focus | **SOC 2 Type I first**, then ISO 27001 |
| Secrets | **Azure Key Vault** — always |
| Monitoring | **Azure Monitor + Defender for Cloud** |

---

*Source: AI_COMPANY_INFRASTRUCTURE_COMPLIANCE_PLAN.md v1.0 — Felix Stanley, COO*

---

<!-- backlinks-start -->

## Referenced by

- [Compliance Meta](../../02-org/04-platform-orchestration/03-governance/compliance_meta.md)
- [Legal Compliance](../../02-org/05-business-ops/legal_compliance.md)
- [Plan Of Action](../../07-research/hermes-hindsight/plan_of_action.md)

<!-- backlinks-end -->
