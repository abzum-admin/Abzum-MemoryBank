# AI Operations Monitoring Research — Abzum
**Date: 2026-04-01**

---

## 1. Sentry AI — Error Monitoring with AI Features

**What it is:** Error monitoring + performance observability platform with AI-specific capabilities added.

### Seer AI Layer
- Root Cause Analysis — AI-powered auto-triage of errors
- Fix Generation — AI-suggested code fixes
- Error Prediction — proactive detection
- Code Review — AI-assisted review on connected repos

### Agent Monitoring (Team $26/mo, Business $80/mo)
- `Agent monitoring` — tracks AI agent runs, errors, latency
- `MCP monitoring` — monitors MCP server health and activity

### Pricing
| Plan | Price | Key AI Features |
|---|---|---|
| Developer | Free | Basic monitoring |
| Team | $26/mo | Agent monitoring, MCP monitoring, Seer AI |
| Business | $80/mo | 90-day retention, SSO, advanced filters |
| Enterprise | Custom | BAA, HIPAA, SOC2, ISO 27001, data residency |

### Limitations for AI-First Companies
- ❌ No built-in prompt injection detection
- ❌ No token cost monitoring
- ❌ No content safety / harmful output detection
- ❌ Not a full AI agent operations platform

---

## 2. What to Monitor in AI Agent Operations

| Category | What | Tools | Gap |
|---|---|---|---|
| Agent Activity Logs | Full trace: prompts, tool calls, decisions, responses | Azure Foundry Tracing, Sentry, custom OTel | Most platforms give spans but not semantic understanding |
| Prompt Injection Attacks | Detecting malicious instructions in user inputs | Azure AI Content Safety (Prompt Shields) + custom logic | Requires custom detection layered on content safety APIs |
| Model Outputs — Harmful Content | Scanning LLM responses for harmful content | Azure AI Content Safety | Covered by existing tools |
| Token Usage & Costs | Per-agent, per-model token counts + cost estimates | Azure Foundry (built-in) | Cross-model cost aggregation needs custom dashboarding |
| Latency & Performance | Time to first token, total response time, per-tool-call time | Azure Foundry, Application Insights | Covered by existing tools |
| Error Rates & Failures | Agent run failures, tool exec errors, circuit breaker trips | Azure Foundry, Sentry | Covered by existing tools |

---

## 3. Azure AI Foundry — Built-in Monitoring

Most comprehensive built-in AI agent monitoring of any major cloud platform.

### Observability Stack
| Feature | Description |
|---|---|
| **Tracing** | OpenTelemetry-based; captures latency, exceptions, prompt content, retrieval ops. 90-day retention. |
| **Agent Monitoring Dashboard** | Token usage, latency, run success rate, evaluation scores, red teaming results |
| **Application Insights Integration** | All telemetry → Azure Monitor / Log Analytics |
| **Continuous Evaluation** | Runs evaluators on sampled responses; configurable sample rate |
| **Scheduled Evaluations** (preview) | Scheduled evaluation runs against benchmarks |
| **Red Team Scans** (preview) | Automated adversarial testing: data leakage, prohibited actions. Attack Success Rate (ASR) metric |
| **Alerting** (preview) | Configure alerts for latency, token usage, evaluation scores, red team findings |

### AI Red Teaming Agent
- Uses Microsoft's **PyRIT** (Python Risk Identification Tool)
- Automated scanning: Hateful/Unfair, Sexual, Violence, Self-Harm, Illegal activities
- Attack strategy obfuscation (e.g., character flipping to bypass safety filters)
- Generates Attack Success Rate (ASR) scorecards
- Supports "shift left" testing: design → development → pre-deployment → post-deployment

### Content Safety (Built into Foundry)
- Prompt Shields — jailbreak/injection detection
- Groundedness — response-source alignment
- Protected Material — copyrighted content detection
- Task Adherence — detects misaligned tool use by agents

---

## 4. Microsoft Purview — Data Governance for AI

| Capability | Purpose |
|---|---|
| AI use case discovery | Identify where AI models are being used |
| Data governance for AI | Ensure training data, prompts, responses comply with data policies |
| DLP for AI prompts | DLP applied to prompts containing sensitive data (PII, financial, health) |
| Compliance tracking | Monitor AI usage against GDPR, HIPAA, etc. |
| Sensitivity labels | Apply Microsoft Information Protection labels to AI interactions |
| Audit logging | Centralized logging of AI interactions for compliance evidence |

### Limitations
- NOT an AI operations monitoring tool — governance/compliance only
- No real-time alerting on AI performance or security
- No token/cost monitoring

---

## 5. AI-Specific SIEM Landscape

**The hard truth:** No major SIEM has deep, turnkey AI agent monitoring as of early 2026.

| Tool/Platform | Type | Coverage |
|---|---|---|
| Microsoft Sentinel | SIEM | AI security analytics with ML anomaly detection; ingests AI telemetry via connectors |
| Splunk AI Security | SIEM add-on | AI-specific security analytics, anomaly detection on AI logs |
| CrowdStrike Charlotte AI | SOC/AI | AI assistant for security analysts; not monitoring AI agents |
| Palo Alto Strata | SOC | AI-driven threat detection; network-level visibility |
| Darktrace | AI SOC | AI-native security platform; some AI-specific coverage emerging |
| Custom (Kafka + SIEM) | Custom stack | Stream AI interaction logs to SIEM for correlation |
| Elastic AI Defense | Security | Emerging AI-specific detection |

---

## 6. Custom Development Gaps

### ✅ Handled by Existing Tools
- Basic error monitoring (Sentry, Azure Monitor)
- Token usage tracking (Azure Foundry built-in)
- Latency/performance metrics (Azure Foundry, Sentry)
- Agent run tracing (Azure Foundry OTel)
- Content safety filtering (Azure AI Content Safety)
- Prompt injection detection at API-level (Azure AI Content Safety)
- Red team scanning (Azure AI Red Teaming Agent, PyRIT)
- RBAC / identity for AI (Microsoft Entra ID)
- Compliance audit logging (Microsoft Purview)

### ⚠️ Needs Custom Development
| Capability | Why | Approach |
|---|---|---|
| Semantic agent activity analysis | Understanding what agent *decided to do*, not just traces | Custom ML on traces |
| Cross-platform cost monitoring | No tool aggregates token costs across Azure, AWS, OpenAI, Anthropic | Custom cost aggregation pipeline |
| Behavioral prompt injection detection | Pattern-based misses novel injections | Custom LLM-as-judge detection |
| Cost anomaly alerting | No platform has built-in spend anomaly alerts | Custom alerting on cost pipelines |
| AI-specific SOC correlation | Correlating AI events with broader security posture | Custom SIEM rules + Sentinel |
| Agent-to-agent communication monitoring | Multi-agent orchestration visibility | Custom OTel instrumentation |
| Dynamic RBAC for AI actions | Enforcing tool access based on agent context | Custom policy engine |
| Compliance dashboard for AI | Regulatory reporting on AI usage | Custom reporting layer |
| Groundedness at scale | Checking LLM responses against knowledge bases | Custom RAG evaluation pipelines |

---

## 7. Recommended Architecture

```
AI AGENT LAYER (Azure Foundry)
        ↓
┌───────────────────────────────────────────────────────┐
│  CONTENT SAFETY          │  OPEN TELEMETRY            │
│  Azure AI Content       │  Traces + Metrics + Logs   │
│  Safety (Prompt        │  (OTLP Export)              │
│  Shields, Harm          │                            │
│  Detection)             │                            │
└───────────┬─────────────┴─────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────┐
│           OBSERVABILITY BACKBONE                     │
│  Azure Monitor / Application Insights               │
│  - Agent traces, metrics, logs                      │
│  - Token usage, latency, success rates               │
│  - Alerting (preview in Foundry)                    │
└─────────────────────┬─────────────────────────────┘
                      │
          ┌───────────┼───────────┬────────────────┐
          ▼           ▼           ▼                ▼
     Cost Monitoring  Security   AI SOC          Compliance
     (Custom         Layer     Layer           Layer
      pipeline +     (Sentinel  (Custom        (Purview
      Grafana)       + custom   detection      + audit
                      SOC rules)  rules)         logs)
```

### Real-Time Alert Priority
1. Cost spikes (>2x baseline) → alert immediately
2. Latency degradation (>2x rolling average)
3. Error rate increases (success rate <95%)
4. Prompt injection detected
5. Harmful content in output
6. Agent tool call anomalies
7. Evaluation score drops

---

*Source: ai-monitoring-research-2026-04-01.md — Felix Stanley, COO*
