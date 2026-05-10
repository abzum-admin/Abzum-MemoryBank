---
id: res-mcra
title: MCRA AI Security Framework
summary: MCRA security framework research and applicability to Abzum
tags: [research, security, mcra]
updated: 2026-05-09
load_priority: 40
load_lane: reference
status: active
---
# MCRA Framework Research — Abzum
**Date: 2026-04-01**

---

## What Is MCRA?

Microsoft AI Security Assurance Map (MCRA) — structured assurance methodology for AI security. Not a compliance checklist; a framework for assessing, building, and improving AI security posture.

**Key Philosophy:** Security assurance for AI is continuous, integrated into the AI lifecycle, and tied to governance accountability.

---

## Four Core Phases

### Phase 1: GOVERN — Establish Foundations

| Control Area | Description |
|---|---|
| AI Security Governance Structure | Roles, responsibilities, accountability for AI security |
| AI Security Policy | Formal policies covering AI model usage, data handling, access controls |
| Compliance Mapping | Map controls to NIST AI RMF, ISO/IEC 42001, GDPR |
| Risk Appetite Definition | Define acceptable AI risk thresholds; classify AI systems by risk tier |
| Supply Chain Security | Assess third-party AI models, APIs, data providers |
| Incident Response Planning | AI-specific plans: model manipulation, prompt injection, data poisoning |
| Training & Awareness | Ensure AI operators understand AI-specific risks |

### Phase 2: MAP — Inventory & Threat Modeling

| Control Area | Description |
|---|---|
| AI System Inventory | Comprehensive, up-to-date inventory of all AI models, agents, APIs |
| Data Flow Mapping | What data each AI processes, where it comes from/goes, what's retained |
| Trust Boundary Identification | Where AI interacts with external parties, systems, untrusted inputs |
| AI Threat Modeling | Structured threat analysis: adversarial inputs, model theft, data poisoning |
| Asset Classification | AI systems and data assets by sensitivity and business criticality |
| Dependency Mapping | AI dependencies: models, APIs, infrastructure, third-party services |
| Attack Surface Analysis | All points where AI system can be accessed, influenced, exploited |

### Phase 3: MEASURE — Assessment & Testing

| Control Area | Description |
|---|---|
| Red Teaming / Adversarial Testing | Structured adversarial testing: prompt injection, jailbreaking, model extraction |
| Model Security Evaluation | Assess for known vulnerabilities: data leakage, output manipulation |
| Penetration Testing (AI-specific) | AI system infra, APIs, agent communication channels |
| Input/Output Validation Testing | Verify proper sanitization; outputs appropriately filtered |
| Bias & Safety Testing | Harmful outputs, alignment failures, safety risks |
| Logging & Observability Testing | Verify sufficient, tamper-evident logs for audit |
| Business Logic Abuse Testing | Test if agents can be manipulated to perform unintended actions |
| Compliance Auditing | Internal/external audits against AI security standards |

### Phase 4: MANAGE — Monitor & Respond

| Control Area | Description |
|---|---|
| Continuous Monitoring | Ongoing monitoring of AI behavior, anomalies, security signals |
| Incident Detection & Response | Detect AI-specific incidents, triage, contain, recover |
| Model Versioning & Patch Management | Controlled update/retrain/deploy processes with security regression testing |
| Vulnerability Management | Track and remediate AI-specific and traditional vulnerabilities |
| Output & Behavior Monitoring | Monitor AI outputs for anomalies, policy violations, compromise signs |
| Access Review | Regularly audit who/what has access to AI systems |
| Security Regression Testing | Before any AI system change, run security tests |
| Retirement & Decommissioning | Securely retire AI models: data deletion, access revocation |

---

## MCRA × NIST AI RMF Mapping

| NIST AI RMF Function | MCRA Phase | Key Difference |
|---|---|---|
| Govern | Govern | MCRA adds supply chain + training specifics |
| Map | Map | MCRA is more technically oriented (NIST is stakeholder-focused) |
| Measure | Measure | Direct alignment; MCRA adds specific adversarial testing techniques |
| Manage | Manage | Direct alignment |

**Additional MCRA additions NOT in NIST AI RMF:**
- Controls for AI agents (autonomous action, tool use, multi-agent)
- Agent permission management (least-privilege for AI actors)
- Agent-to-agent communication security
- Human-in-the-loop checkpointing for autonomous agents
- Agent audit trails and decision logging

---

## Controls: Apply vs. Don't Apply for AI-First

### ✅ HIGHLY RELEVANT — Must Implement

| Phase | Critical Controls |
|---|---|
| **Govern** | AI Security Governance, Incident Response Planning (automated), AI Security Policy, Training/Awareness replaced by alignment verification |
| **Map** | AI System Inventory, Data Flow Mapping, Trust Boundary Identification, Dependency Mapping |
| **Measure** | Red Teaming (prompt injection), Business Logic Abuse Testing, I/O Validation Testing, Logging & Observability Testing |
| **Manage** | Continuous Monitoring, Agent Behavior Monitoring, Output & Behavior Monitoring, Incident Detection & Response (automated) |

### ⚠️ PARTIALLY APPLICABLE — Adapt for AI-First

| Control | AI-First Adaptation |
|---|---|
| Human-in-the-loop checkpointing | Replace with "agent checkpoint review" — secondary agent validates critical actions |
| Training & Awareness | Replace with agent instruction security, prompt integrity checks, regular alignment testing |
| Compliance Auditing | Map AI-agent actions to SOC 2, ISO 27001 controls; document satisfaction method |
| Incident Response Planning | Automated escalation paths; AI-driven detection → automated containment → alerting |
| Supply Chain Security | Govern AI APIs/providers aggressively with SLA requirements and fallback plans |
| Access Review | Automated attestation — agents confirm their own access needs; COO audits |

### ❌ LESS RELEVANT — Lower Priority

| Control | Why Less Relevant |
|---|---|
| Security Awareness Training for Employees | No employees; invest in agent instruction security + alignment |
| Physical Security | Purely software/AI operations |
| HR-related security controls | No human employees |
| Phishing & Social Engineering awareness | Not applicable to AI agents (watch for prompt injection instead) |
| Traditional endpoint security | All operations are agent-run in cloud |
| MFA for human users | Replace with API key management, agent auth, service-to-service auth |
| Human-staffed SOC | Replace with automated monitoring + runbooks executed by AI |

---

## Priority Implementation

### Immediate (Month 1)
1. Create AI Agent Inventory — list every agent, purpose, access, action boundaries
2. Define Agent Authorization Boundaries — permitted actions, checkpoint requirements, prohibitions
3. Set Up Centralized Logging — all agent actions logged in tamper-evident log
4. Implement Input Validation & Guardrails — sanitization between agent communication channels
5. Create Incident Response Playbook (Automated) — detection → containment → alerting when agent acts outside parameters

### Short-term (Months 2-3)
6. Conduct Prompt Injection Red Teaming
7. Implement Least-Privilege Access for Agents
8. Add Agent-to-Agent Authentication
9. Establish Fallback Procedures for External API Failures
10. Set Up Behavior Monitoring

### Medium-term (Months 4-6)
11. Map Data Flows Between Agents
12. Implement Agent Checkpointing / Secondary Review for critical actions
13. Build Model/Agent Update Security Process
14. Assess Third-Party AI Dependencies
15. Document for Compliance (NIST AI RMF / SOC 2 / ISO 42001)

---

## Key Insight for Abzum

> **MANAGE phase is most operationally demanding for a no-human-workforce company.**
> There are no humans to catch issues reactively. Monitoring + automated response = entire safety net.
> Invest heavily in observability, anomaly detection, and automated runbooks.

---

*Source: mcra-research-2026-04-01.md — Felix Stanley, COO*

---

<!-- backlinks-start -->

## Referenced by

- [Csco Chief Security Compliance Officer](../../02-org/01-executive/csco_chief_security_compliance_officer.md)
- [Security](../../02-org/02-ai-systems/01-engineering/security.md)
- [Rbac](../../02-org/04-platform-orchestration/03-governance/rbac.md)

<!-- backlinks-end -->
