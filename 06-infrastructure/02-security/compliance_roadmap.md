---
id: ops-sec-compliance-roadmap
title: Compliance Roadmap
summary: Compliance implementation phases
tags: [security, compliance, roadmap]
updated: 2026-05-09
load_priority: 40
load_lane: reference
status: active
---
# Compliance Roadmap — Abzum
**SOC2, ISO 27001, ISO 42001, GDPR**

---

## Certification Priority

| Certification | Timeline | Cost | When |
|---|---|---|---|
| **SOC 2 Type I** | 6-10 months | $30-50K audit | As early as possible |
| **ISO 27001** | 10-18 months | $30-80K | Required for enterprise deals |
| **SOC 2 Type II** | 18-24 months | $30-80K audit | Before US/enterprise expansion |
| **ISO 42001** | 24-36 months | $30-100K | As AI regulation tightens |
| **GDPR** | Run in parallel | $10-50K program | If targeting EU customers |

---

## Phase 1 — Foundational (Months 1-6)

- [ ] Choose Azure (inherits ISO 27001, SOC2 certifications)
- [ ] Implement MFA, SSO, endpoint protection
- [ ] Set up Azure Security Center / Defender for Cloud
- [ ] Draft: Information Security Policy, Incident Response Plan, Data Classification
- [ ] Enable audit logging for all AI agent activities

**Azure provides:** ISO 27001 certified infrastructure, SOC 2 certified services

---

## Phase 2 — SOC 2 Type I (Months 6-10)

- [ ] Engage SOC 2 auditor (get 3 quotes)
- [ ] Implement 5 Trust Service Criteria controls:
  - Security
  - Availability
  - Processing Integrity
  - Confidentiality
  - Privacy
- [ ] Pass SOC 2 Type I audit

---

## Phase 3 — ISO 27001 (Months 10-18)

- [ ] Complete ISMS (Information Security Management System) documentation
- [ ] Conduct internal audit
- [ ] Stage 1 external audit
- [ ] Stage 2 external audit

---

## Phase 4 — SOC 2 Type II (Months 18-24)

- [ ] Maintain controls with evidence collection
- [ ] 6-month observation period
- [ ] SOC 2 Type II audit

---

## GDPR (Parallel from Day 1)

- [ ] Appoint EU representative if targeting EU customers
- [ ] Draft DPA (Data Processing Agreement)
- [ ] Implement data retention policies
- [ ] Implement right to erasure capability

---

## AI-Specific Compliance (ISO 42001)

ISO/IEC 42001 is the AI Management System standard — becoming relevant as AI regulation tightens.

| Control Area | Description |
|---|---|
| AI Governance | Clear accountability for AI systems |
| AI Risk Assessment | Systematic AI risk identification and mitigation |
| AI Lifecycle | Controls over AI development, deployment, operation, decommissioning |
| Data Quality | Training and input data quality management |
| AI Transparency | Explainability and documentation requirements |

---

## NZ/AU Privacy Compliance

- **Privacy Act 2020 (NZ)** — 13 Information Privacy Principles
- **Privacy Act 1988 (AU)** — Australian Privacy Principles
- **Notifiable Data Breaches scheme (AU)** — mandatory breach notification
- **NZISM** — New Zealand Information Security Manual (government requirements)

---

## Data Residency Requirements

| Data Type | Region | Notes |
|---|---|---|
| General customer data | Australia East (Sydney) | Primary |
| DR/backup | Australia Southeast (Melbourne) | Failover |
| NZ Government RESTRICTED | NZ or AU-sovereign regions | Strict requirements |
| EU personal data (GDPR) | EU regions if targeting EU | DPA required |

---

*Source: AI_COMPANY_INFRASTRUCTURE_COMPLIANCE_PLAN.md v1.0*

---

<!-- backlinks-start -->

## Referenced by

- [Compliance Meta](../../02-org/04-platform-orchestration/03-governance/compliance_meta.md)
- [Plan Of Action](../../07-research/hermes-hindsight/plan_of_action.md)

<!-- backlinks-end -->
