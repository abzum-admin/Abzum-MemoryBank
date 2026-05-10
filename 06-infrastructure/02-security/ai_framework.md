---
id: ops-sec-ai-framework
title: AI Security Framework
summary: MCRA security operations framework adapted for Abzum
tags: [security, ai, mcra]
updated: 2026-05-09
load_priority: 45
load_lane: context
status: active
---
# AI Security & Operations Framework — Abzum
**Version 2.0 — 2026-04-01**

---

## MCRA Overview — Four Phases

Microsoft AI Security Assurance Map (MCRA) organizes AI security into four phases:

| MCRA Phase | Abzum Priority | Key Adaptation |
|---|---|---|
| **Govern** | Define agent authorisation boundaries | No HR → AI agent policy as code |
| **Map** | Maintain complete AI agent inventory | No employees → inventory IS org chart |
| **Measure** | Prompt injection red teaming | No staff training → continuous adversarial testing |
| **Manage** | Automated monitoring + runbooks | No SOC team → all incident response automated |

---

## MCRA × NIST AI RMF Mapping

| NIST AI RMF Function | MCRA Phase | Abzum Focus |
|---|---|---|
| Govern (establish & sustain) | **Govern** | AI security policy, agent authorisation, automated IR |
| Map (stakeholders, context) | **Map** | Agent inventory, data flows, trust boundaries |
| Measure (characterise, evaluate) | **Measure** | Prompt injection testing, behaviour validation, logging |
| Manage (mitigate, operate) | **Manage** | Continuous monitoring, automated runbooks, patching |

---

## Part 1: AI Agent Identity — Microsoft Entra Agent ID

MCRA Govern + Map. Every agent has a tracked identity with documented access.

### What It Is
Announced at Microsoft Ignite 2024 (preview): AI agents get identity objects in Entra ID — distinct from human users or standard service principals.

### Authentication Flow
```
Agent → Entra Managed Identity → Token → Azure resources
         (no API keys, no secrets embedded)
```

### Agent ID vs Service Principals

| | Standard SP | Entra Agent ID |
|---|---|---|
| Designed for | Apps/APIs | Autonomous AI agents |
| Lifecycle | Manual | Agent-aware (task-oriented) |
| Conditional Access | Generic | Agent-specific policies |
| Audit trail | Basic | Enriched with agent context |
| Deprovisioning | Manual | Instant via Entra |

### Recommendations
- [ ] Register all production agents as Entra Agent IDs (preview) or least-privilege SPs
- [ ] Migrate from API-key auth to Entra managed identity for Azure OpenAI
- [ ] Define RBAC roles per agent type: `agent-coder`, `agent-reviewer`, `agent-devops`
- [ ] Conditional Access: agent can only access X from company network range
- [ ] Maintain agent inventory as code (MCRA Map): each agent config = identity + role + access + last review
- [ ] Automated attestations: agents confirm access needs quarterly; COO reviews

---

## Part 2: Guardrails & Content Safety

MCRA Govern + Measure. Layered defense for AI inputs and outputs.

### Guardrail Architecture

```
User Input → [Prompt Shields] → [PII Detection] → [LLM]
                 ↓                    ↓
           Block jailbreak/      Block sensitive
           injection attempts     data from entering
                                      ↓
                               [LLM Processing]
                                      ↓
User Output ← [Content Filter] ← [Groundedness] ← [Output]
                   ↓                   ↓
             Block harmful       Block hallucinations
             outputs            contradict facts
```

### Azure AI Content Safety

| Capability | What it does | MCRA Phase |
|---|---|---|
| **Prompt Shields** | Detects jailbreak/injection in user prompts | Govern + Measure |
| **Groundedness Detection** | Flags outputs that contradict source material | Measure |
| **Protected Material** | Catches copyrighted content in outputs | Manage |
| **Content Analysis** | Sexual, violent, hateful, self-harm detection | Govern + Manage |
| **Task Adherence API** | Detects misaligned agent tool use | Measure + Manage |

### Guardrail Stack Priority

| Layer | Tool | Priority |
|---|---|---|
| Input content filter | Azure AI Content Safety (Prompt Shields) | **Essential** |
| PII detection | Azure Purview DLP + custom regex | **Essential** |
| Output content filter | Azure AI Content Safety | **Essential** |
| Groundedness | Azure Content Safety Groundedness API | **High** |
| Prompt injection (advanced) | Rebuff / NeMo Guardrails | High |
| Topic rails | NVIDIA NeMo Guardrails (Colang) | Medium |

---

## Part 3: DLP for AI Workloads

MCRA Govern. Data handling policies for AI context windows.

### What AI Agents Can Leak
- Via prompts — users accidentally sending PII/regulated data into context windows
- Via outputs — agents inadvertently surfacing data from memory/context
- Via tool calls — agents exfiltrating data through APIs they call
- Via training data — if prompts used for training (never without consent)

### Microsoft Purview DLP for AI

| Scenario | What Purview Does |
|---|---|
| User submits prompt with credit card | Detect, warn/block before reaching LLM |
| Agent output contains PII | Detect and redact before returning to user |
| Agent accesses restricted data source | Detect and block unauthorized retrieval |
| Sensitive data in agent memory | Classify and restrict context inclusion |

### Not Applicable for Abzum
- Endpoint DLP on user devices — irrelevant in no-human-workforce model
- Physical document DLP — purely digital operations

---

## Part 4: AI Operations Monitoring

MCRA Measure + Manage.

### What to Monitor

| Category | Metrics | Tools |
|---|---|---|
| Agent Activity | Tasks completed, time per task, success rate | Azure AI Foundry Dashboard |
| Token Usage | Input/output tokens per agent, cost per day | Custom pipeline (Grafana) |
| Latency | Time to first token, total response time | Application Insights |
| Errors | Failed tasks, exceptions, timeouts | Azure Monitor |
| Content Safety | Guardrail triggers, blocked inputs/outputs | Azure AI Content Safety logs |
| Security | Injection attempts, unusual access patterns | Microsoft Sentinel |
| Compliance | Data residency, audit log completeness | Microsoft Purview |
| Agent Behaviour Anomaly | Agent acting outside defined parameters | Custom + Sentinel |

### Monitoring Stack

```
Azure AI Foundry (agent platform)
    ↓ Telemetry (OpenTelemetry)
Azure Monitor / Application Insights
    ↓
Microsoft Sentinel (SIEM + SOAR)
    ↓
Azure AI Content Safety (content filtering logs)
    ↓
Microsoft Purview (compliance + DLP logs)
    ↓
Custom Grafana Dashboard (cost + token tracking)
```

### Not Fully Covered by Existing Tools
- Cross-platform token cost aggregation (no platform does this natively)
- Behavioral anomaly detection
- Agent-to-agent communication monitoring
- Dynamic RBAC for tools

---

## Part 5: Defense in Depth

```
Layer 1: Identity
├── Entra Agent ID (every agent has identity)
├── Managed identities (no embedded credentials)
└── RBAC per agent type (least privilege)

Layer 2: Input Safety
├── Azure Content Safety (Prompt Shields)
├── Purview DLP (PII detection)
└── Input sanitization + encoding normalization

Layer 3: Agent Operations
├── Grounded RAG (factual responses)
├── Topic rails (stay on domain)
└── Tool access controls (only needed tools)

Layer 4: Output Safety
├── Azure Content Safety (content filtering)
├── Groundedness detection (no hallucinations)
└── PII redaction before delivery

Layer 5: Monitoring & Response
├── Azure Monitor (observability)
├── Sentinel (security analytics)
├── Purview (compliance audit logs)
└── Incident response playbook
```

---

## Part 6: AI-Specific Incidents

| Incident | Response | MCRA Phase |
|---|---|---|
| Prompt injection detected | Reject input, log payload, alert COO agent | Measure + Manage |
| Harmful output generated | Block delivery, surface safe error, log | Manage |
| Agent accesses unauthorized data | Revoke agent access token, isolate, investigate | Manage |
| Guardrail bypassed | Session reset, notify COO agent, post-mortem | Measure + Manage |
| Agent cost spike | Alert on threshold, throttle agent, review | Manage |
| Model outage | Failover to backup model, notify, document | Manage |
| Agent misbehaviour | Isolate, checkpoint work, alignment test, escalate | Measure + Manage |

---

## Part 7: Human → AI Adaptations

| Traditional (Human-in-loop) | Abzum (Agent Checkpointing) |
|---|---|
| Human reviews/approves AI output | Secondary AI agent validates critical actions |
| Human signs off on data access | Agent → COO agent approves → auto-updates RBAC |
| Human reviews DLP exceptions | Agent files ticket → COO adjudicates → config updated |
| Human incident commander | Automated runbook assumes role; COO agent notified |

### SOC → Automated Runbooks

| Traditional SOC | Abzum (Automated) |
|---|---|
| Human analyst reviews alerts | Sentinel rule → automated triage runbook |
| On-call engineer investigates | Runbook isolates agent, revokes token, notifies COO |
| Human decides containment | Runbook contains automatically via pre-defined playbooks |
| Post-incident review | COO agent runs post-mortem playbook → updates runbooks |
| SOC metrics to management | Automated weekly MCRA posture report to Vijay |

### Security Training → Alignment Testing

| Traditional | Abzum |
|---|---|
| Annual security awareness training | **Prompt injection red teaming** — regular adversarial testing |
| Phishing simulation | **Prompt injection simulation** — test with known adversarial inputs |
| Security policy sign-off | **Agent policy attestation** — agents confirm on config load |

---

## Part 8: Phased Implementation

### Phase 1 — Immediate (Month 1) | MCRA Govern + Map
- [ ] Register all agents in Entra ID; create agent inventory
- [ ] Draft AI Security Policy — authorised actions, checkpointing, prohibitions
- [ ] Set up automated runbook framework
- [ ] Document data flows between agents
- [ ] Enable Azure AI Content Safety on all endpoints
- [ ] Configure Sentinel with basic AI-specific alert rules
- [ ] Establish baseline logging

### Phase 2 — Foundation (Months 2–3) | MCRA Measure + Map
- [ ] Conduct first prompt injection red teaming
- [ ] Run bias and safety testing on agent outputs
- [ ] Configure Purview DLP for PII detection
- [ ] Verify logging and observability
- [ ] Complete dependency mapping
- [ ] Implement least-privilege RBAC for all agents
- [ ] Add agent-to-agent authentication
- [ ] Define Conditional Access policies per agent type

### Phase 3 — Advanced (Months 4–6) | MCRA Manage + Measure
- [ ] Automated weekly MCRA posture report
- [ ] Full AI red teaming with PyRIT
- [ ] Agent-to-agent communication audit
- [ ] Agent checkpointing for critical actions
- [ ] Model/agent update security process
- [ ] Third-party AI dependency security assessment
- [ ] Begin SOC 2 readiness documentation
- [ ] Custom Grafana cost + behaviour dashboard

---

*Source: AI_COMPANY_SECURITY_OPERATIONS_FRAMEWORK.md v2.0 — Felix Stanley, COO*
