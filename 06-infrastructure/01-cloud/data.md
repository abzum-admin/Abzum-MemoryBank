---
id: ops-data
title: Data Architecture
summary: Data layer and storage design
tags: [infrastructure, data]
updated: 2026-05-09
load_priority: 45
load_lane: context
status: active
---
# Data Architecture — Abzum

---

## Database Stack

| Data Type | Technology | Why |
|---|---|---|
| **Transactional** | PostgreSQL (Azure Database for PostgreSQL) | Battle-tested, pgvector for embeddings |
| **Vector/RAG** | Weaviate Cloud or Azure AI Search (AU region) | Semantic search, knowledge retrieval |
| **Documents/Blob** | Azure Blob Storage (AU region) | S3-compatible, cheap |
| **Analytics** | PostgreSQL + read replica | Sufficient for <10M rows |
| **Caching** | Azure Cache for Redis | Session, temporary data |

---

## Vector DB Comparison

| Service | Free Tier | AU Region | Best For |
|---|---|---|---|
| **Weaviate Cloud** | 3 schemas free | ✅ Yes | Flexible, good AU support, hybrid search |
| **Chroma** | Free (self-hosted) | ✅ (if hosted) | Tight budget |
| **Azure AI Search** | 3 indexes free | ✅ Yes | Already on Azure ecosystem |
| **Pinecone** | 1 project free | ❌ No | Avoid at small scale |

**Recommendation:** Weaviate Cloud (AU region) — starts free, handles hybrid search, good for RAG + agents

---

## Data Residency

| Tier | Region | Notes |
|---|---|---|
| **Primary** | Australia East (Sydney) | Standard customer data |
| **DR** | Australia Southeast (Melbourne) | Cross-region failover |
| **NZ Gov RESTRICTED** | NZ or AU-sovereign regions | Strict data sovereignty |

---

## AI-Specific Data Considerations

### Prompt Injection Security
- Input validation on all user inputs
- Output filtering before triggering actions
- Least-privilege tool access per agent
- Context isolation between users

### Data Retention
| Data Type | Retention |
|---|---|
| Audit logs | Minimum 2 years (AU/NZ statute of limitations) |
| Agent action logs | Never use for training without explicit opt-in |
| Customer data | Right to deletion — full data wipe capability |

---

## Memory Architecture (AI Agents)

| Layer | Technology | Purpose |
|---|---|---|
| **Working** | LLM context + Redis | Current task state |
| **Episodic** | PostgreSQL + pgvector | Past tasks, decisions, outcomes |
| **Semantic** | Weaviate / Azure AI Search | Facts, knowledge, RAG |
| **Procedural** | SKILL.md + 02-org/01-executive/felix-caio/instructions.md | Skills, how-to, workflows |

**ByteRover** (currently deployed): Context tree at `.brv/context-tree/` — LLM-powered query/curate for semantic memory layer.

---

## Backup & Recovery

- **PostgreSQL:** Automated backups with point-in-time recovery
- **Blob Storage:** Geo-redundant storage (GRS) for DR
- **Key Vault:** Soft delete + purge protection enabled
- **Cosmos DB:** 99.999% read availability with multi-region redundancy

---

*Source: AI_COMPANY_INFRASTRUCTURE_COMPLIANCE_PLAN.md v1.0*
