---
id: ops-sec-stack
title: Security Stack
summary: Security tools and implementation
tags: [security, stack]
updated: 2026-05-09
load_priority: 45
load_lane: context
status: active
---
# Security Stack — Abzum
**Identity, Secrets, Monitoring, Compliance**

---

## Identity & Access Management

### Microsoft Entra ID (Azure AD)

| Feature | Tier | Cost |
|---|---|---|
| Core features (SSO, MFA, conditional access) | Free | $0 |
| Security groups, conditional access | P1 | ~$6/user/month |
| Risk-based conditional access, identity protection | P2 | ~$12/user/month |

**For AI agents:** Register agents as Entra identities (Agent ID preview or service principals) with RBAC roles per agent type.

---

## Secrets Management

### Azure Key Vault

| SKU | Price | Use Case |
|---|---|---|
| Standard | ~$0.03/10k operations | API keys, connection strings |
| Premium (HSM-backed) | ~$0.50/10k operations | High-security keys, certificates |

**Always use Key Vault** — never embed secrets in code or config files.

---

## Network Security

| Component | Purpose |
|---|---|
| **Private Link** | No public internet exposure for Azure services |
| **NSGs** | Network Security Groups for traffic control |
| **Azure Firewall / WAF** | Web application firewall, DDoS protection |
| **Azure Front Door** | Global load balancing, CDN, SSL termination |

---

## Monitoring & SIEM

| Tool | Purpose | Cost |
|---|---|---|
| **Azure Monitor + Application Insights** | APM, performance monitoring | ~$30/mo |
| **Microsoft Defender for Cloud** | CSPM + threat protection | ~$15/node/month |
| **Microsoft Sentinel** | SIEM + SOAR | ~$4/GB ingested |

### Monitoring Stack

```
AI Agent Layer (Azure Foundry)
        ↓ Telemetry (OpenTelemetry)
Azure Monitor / Application Insights
        ↓
Microsoft Sentinel (SIEM + SOAR)
        ↓
Azure AI Content Safety (content filtering logs)
        ↓
Microsoft Purview (compliance + DLP logs)
        ↓
Custom Grafana (cost + token tracking)
```

---

## AI-Specific Security

### Guardrail Stack

| Layer | Tool | Priority |
|---|---|---|
| Input content filter | Azure AI Content Safety (Prompt Shields) | Essential |
| PII detection | Azure Purview DLP + custom regex | Essential |
| Output content filter | Azure AI Content Safety | Essential |
| Groundedness detection | Azure Content Safety Groundedness API | High |
| Prompt injection (advanced) | Rebuff / NeMo Guardrails | High |
| Topic rails | NVIDIA NeMo Guardrails (Colang) | Medium |

### Content Safety Capabilities (Azure AI Content Safety)

| Capability | What it does |
|---|---|
| Prompt Shields | Detects jailbreak/injection in user prompts |
| Groundedness Detection | Flags outputs that contradict source material |
| Protected Material | Catches copyrighted content in outputs |
| Content Analysis | Sexual, violent, hateful, self-harm detection |
| Task Adherence API | Detects misaligned agent tool use |

---

## Compliance Logging

| Log Type | Retention | Storage |
|---|---|---|
| Agent action logs | 2+ years | Azure Monitor / App Insights |
| Audit logs | 2+ years | Azure Blob Storage (immutable) |
| Security events | 2+ years | Microsoft Sentinel |
| Compliance reports | 7 years | Microsoft Purview |

---

## Defense in Depth Summary

```
Layer 1: Identity
├── Entra Agent ID (every agent has identity)
├── Managed identities (no embedded credentials)
└── RBAC per agent type (least privilege)

Layer 2: Input Safety
├── Azure Content Safety (Prompt Shields)
├── Purview DLP (PII detection)
└── Input sanitization

Layer 3: Agent Operations
├── Grounded RAG (factual responses)
├── Topic rails (stay on domain)
└── Tool access controls (only needed tools)

Layer 4: Output Safety
├── Azure Content Safety (content filtering)
├── Groundedness detection
└── PII redaction before delivery

Layer 5: Monitoring & Response
├── Azure Monitor + Sentinel
├── Purview compliance logs
└── Incident response playbook
```

---

*Source: AI_COMPANY_INFRASTRUCTURE_COMPLIANCE_PLAN.md + AI_COMPANY_SECURITY_OPERATIONS_FRAMEWORK.md v2.0*

---

<!-- backlinks-start -->

## Referenced by

- [Plan Of Action](../../07-research/hermes-hindsight/plan_of_action.md)

<!-- backlinks-end -->
