---
id: work-dyn-provisioning
title: Dynamic Agent Provisioning Plan
summary: Detailed plan for dynamic agent provisioning (A69)
tags: [work, plan, agents]
updated: 2026-05-09
load_priority: 50
load_lane: reference
status: active
---
# Dynamic Agent Provisioning Plan
### Abzum New Zealand Limited
### Version 1.0 — 2026-04-04
### Author: Felix Stanley, COO

---

## 1. Vision for Dynamic Provisioning

### 1.1 What It Means

**Dynamic provisioning** is Abzum's core operational capability: spinning up teams of AI agents for each customer project, assigning them roles and context, managing their work, and scaling them down when the project or phase is complete.

This is fundamentally different from traditional IT services, where project teams are hired (slow, expensive) and then fired when done. Abzum operates like an **agent Kubernetes** — agents are the compute unit, provisioned on demand, scaled to match project requirements exactly.

### 1.2 The Goal: Agent Kubernetes

| Traditional IT "Team" | Abzum "Agent Team" |
|---|---|
| Hired 3-6 months before project starts | Spawned in minutes when project is confirmed |
| Fixed cost regardless of workload | Sized to actual project scope |
| Knowledge walks out the door when they leave | All context stored in BIMemoryBank |
| Hiring/firing is slow and expensive | Spawn/deprovision is near-instant |
| Same team for entire project | Team composition changes per sprint |

The goal: **right agents, right size, right cost, right time** — every time.

### 1.3 Abzum's Competitive Advantage

- **Instant provisioning**: No hiring interviews, no onboarding, no offboarding
- **No fixed costs between projects**: Agents are only "paid" when working
- **Perfect scaling**: Project grows → add agents; project shrinks → release agents
- **Knowledge persistence**: Every agent's work is stored in BIMemoryBank; next agent picks up where the last left off
- **Parallel work**: Multiple specialist agents can work simultaneously on independent tasks
- **No leave, no sick days, no context switching**: Agents work continuously until the task is done

---

## 2. What We Have Today — Inventory

### 2.1 Agent Types Already Defined

The following agent roles are defined across the AI Company Framework, AI Company Master Plan, and agent workflow documents:

**Core Fixed Roles (always available):**
| Role | Model | Primary Use |
|---|---|---|
| **Architect Agent** | Claude Sonnet | System design, SPEC.md, architecture decisions |
| **Coder Agent** | MiniMax (simple) / Claude (complex) | Implementation, TDD cycle, Git commits |
| **Tester Agent** | MiniMax | Test suites, bug reports, validation |
| **Reviewer Agent** | Claude Sonnet | Code quality, security, PR approval |
| **DevOps Agent** | MiniMax (scripts) / Claude (complex infra) | CI/CD, Docker, deployment |

**Meta/Management Roles:**
| Role | Model | Primary Use |
|---|---|---|
| **Felix (COO)** | MiniMax + Claude | Orchestration, coordination, Vijay reporting |
| **Comms Pipeline Agent** | MiniMax | Customer communications, gatekeeper |
| **CRM Agent** | MiniMax | Customer records, project tracking |

**Support/Specialist Roles (planned):**
| Role | Status | Primary Use |
|---|---|---|
| **Security Architect Agent** | Defined in A67 | Security review, architecture alignment |
| **Compliance Analyst** | Defined in A68 | Sprint compliance checks |
| **Scrum Master / PM Agent** | Defined in A68 | Sprint management, Agile process |
| **Coder Manager** | Defined in A67 | Team oversight, final quality gate |
| **Agent Watcher** | Defined in A62 | Real-time monitoring, failure detection |
| **Improvement Agent** | Defined in A46 | Research, generate improvement proposals |
| **Process Maker Agent** | Defined in A48 | Standardized workflow enforcement |
| **BI Agent** | Defined in A47 | Business intelligence signals |

### 2.2 Tasks Directly Related to Agent Provisioning (A41–A68)

| Task | Description | Status | Priority |
|---|---|---|---|
| **A25** | Document agent spawning procedure | ⬜ Pending | P1 |
| **A26** | Finalize skill matrix per agent | ⬜ Pending | P2 |
| **A27** | Implement Superpowers workflow | ⬜ Pending | P2 |
| **A41** | Deploy BIMemoryBank Git Sync Architecture | 🔵 In Progress | P1 |
| **A42** | Deploy Change Management System | ⬜ Pending | P1 |
| **A43** | Deploy CMDB | ⬜ Pending | P1 |
| **A44** | Deploy Agent Logging Architecture | ⬜ Pending | P1 |
| **A45** | Implement Sub-Agent Review Hook | ⬜ Pending | P1 |
| **A46** | Deploy Continuous Improvement System | ⬜ Pending | P1 |
| **A47** | Build Autonomous BI & WorkIQ Intelligence Taxonomy | ⬜ Pending | P1 |
| **A48** | Deploy Process Maker Agent | ⬜ Pending | P1 |
| **A49** | Optimize Agent Team Size Based on Project Scope | ⬜ Pending | P1 |
| **A50** | Project Planning & Management Intake System | ⬜ Pending | P1 |
| **A51** | Reinforced Learning Feedback Cascade System | ⬜ Pending | P1 |
| **A54** | Track Actual Token Usage Per Agent | ⬜ Pending | P1 |
| **A55** | Customer Project Estimation & Job Costing System | ⬜ Pending | P1 |
| **A58** | Build Mission Control — Agent Task Board | ⬜ Pending | P1 |
| **A62** | Deploy Agent Watcher System | ⬜ Pending | P1 |
| **A64** | Bake Scripting Intelligence into Agents | ⬜ Pending | P1 |
| **A66** | Set Up Hermes Local Dev Environment | ⬜ Pending | P1 |
| **A67** | Design Multi-Tier Code Review System | ⬜ Pending | P1 |
| **A68** | Define Agile Scrum Team Structure | ⬜ Pending | P1 |

### 2.3 Decisions Already Made That Enable Provisioning

| Decision | What It Enables |
|---|---|
| **D01** | OpenClaw as primary agent platform — agents are spawned via OpenClaw |
| **D02** | MiniMax default, Claude Sonnet for complex — model routing per agent role |
| **D04** | MCRA framework — security operations integrated into provisioning |
| **D05** | Azure as primary cloud — infrastructure for agent workloads |
| **D07** | Gatekeeper comms model — Comms Pipeline Agent scoping per customer |
| **D09** | BIMemoryBank architecture — context persistence across provisioning cycles |
| **D10** | ByteRover context tree = canonical memory — agent context isolated per project |

### 2.4 What's Missing (Gaps)

| Gap | Impact | Priority |
|---|---|---|
| **No formal agent spawning/despawning procedure** | Cannot reliably provision teams | P1 |
| **No Agent Team Selector** | No systematic way to choose which agents for a project | P1 |
| **No Provisioning Agent / Team Orchestrator** | No automated coordination of provisioning | P1 |
| **CMDB not yet built (A43)** | Cannot track which agents are assigned where | P1 |
| **Agent Watcher not yet built (A62)** | No real-time monitoring of active teams | P1 |
| **No cost dashboard** | Cannot see real-time cost per project/agent | P1 |
| **Skill matrix not finalized (A26)** | Uncertainty about which agent does what | P2 |
| **Hermes not set up (A66)** | No local GPU environment for heavy workloads | P2 |

---

## 3. The Provisioning Model

### 3.1 End-to-End Flow

```
[CUSTOMER ENQUIRY]
        │
        ▼
[PROJECT PLANNING — A50]
  Classify: Epic / Project / Task / Subtask
  Size assessment: Simple / Medium / Complex / Enterprise
        │
        ▼
[DETERMINE AGENT TEAM]
  Fixed roles: always provisioned
  Dynamic roles: selected based on project type + discovery
        │
        ▼
[AGENT TEAM SELECTOR]
  Picks fixed + dynamic agents from available pool
  Matches agents to project context
        │
        ▼
[PROVISIONING AGENT / TEAM ORCHESTRATOR]
  Spawns agents via OpenClaw
  Configures session context (customer, project, tier)
  Assigns ByteRover context tree path
        │
        ▼
[CMDB REGISTRATION — A43]
  Registers all agents to project CI
  Records: agent ID, role, start time, project assignment
        │
        ▼
[AGENT TEAM ACTIVE]
  Sprint/work begins
  Each agent operates in their scoped context
        │
        ▼
[WATCHER — A62]
  Real-time monitoring
  Flags failures, escalates if needed
        │
        ▼
[CODER MANAGER / PM AGENT — A68]
  Oversees team
  Runs Agile process
  Reports to Felix/Vijay
        │
        ▼
[PROJECT COMPLETE]
  Deprovision agents
  CMDB updated (agents released)
  Context archived to BIMemoryBank
```

### 3.2 Agent Pools

**Core Pool (always available):**
These agents are always provisioned and ready. They form the backbone of every project team.

| Agent | Always Available | Reason |
|---|---|---|
| Architect | ✅ | Every project needs design upfront |
| Coder | ✅ | Core implementation work |
| Tester | ✅ | Quality validation |
| Reviewer | ✅ | Pre-deployment quality gate |
| DevOps | ✅ | Deployment capability |
| Watcher | ✅ | Real-time monitoring |
| Coder Manager | ✅ | Team oversight (when team >1 agent) |

**Dynamic Pool (spawned on demand):**
These agents are spawned when the project specifically requires their capability.

| Agent | Spawn Trigger | Despawn Trigger |
|---|---|---|
| Security Architect | Security-sensitive project | Security review complete |
| Compliance Analyst | Regulated industry, compliance tier | Compliance sign-off complete |
| Data Engineer | ETL/data pipeline project | Data pipeline delivered |
| UX Designer | Frontend-heavy, customer-facing | UI/UX complete |
| Integration Specialist | API integration project | Integration tested |
| BI Analyst | Reporting/dashboard project | Dashboard delivered |
| Improvement Agent | Long-running project (>1 sprint) | Project end |
| Scrum Master | Complex multi-sprint project | Sprint complete |
| PM Agent | Fixed-scope delivery project | Project close |

### 3.3 Team Size by Project Complexity

| Project Type | Example | Fixed Team | Dynamic Additions | Estimated Size |
|---|---|---|---|---|
| **Simple** | Bug fix, small change | Coder + Reviewer | — | 2 agents |
| **Medium** | Single feature, small automation | Architect + Coder + Tester + Reviewer | — | 4 agents |
| **Complex** | Multi-feature project | Architect + Coder + Tester + Reviewer + DevOps | Security Architect, Data Engineer | 5-7 agents |
| **Enterprise** | Full system build | Full fixed team + Coder Manager + PM Agent | Security Architect + Compliance Analyst + specialists per domain | 8-12 agents |

*(Based on A49: Agent Team Size Optimization)*

---

## 4. Agent Types and Roles in Detail

### 4.1 Fixed Roles

**Architect Agent**
- Always spawned at project start (unless trivial change)
- Produces `SPEC.md` and architecture plan
- Model: Claude Sonnet (complex) / MiniMax (simple)
- Scoped to: project context tree

**Coder Agent**
- Core implementation agent
- TDD cycle: RED → GREEN → REFACTOR
- Model: MiniMax (simple) / Claude Sonnet (complex)
- Multiple instances can run in parallel on independent tasks

**Tester Agent**
- Validates coder output
- Writes and runs test suites
- Model: MiniMax only

**Reviewer Agent**
- Pre-merge quality gate
- Security scan, code quality, spec compliance
- Model: Claude Sonnet
- Final approval before deployment

**DevOps Agent**
- CI/CD, Docker, deployment
- Provisioning of infrastructure per customer tier
- Model: MiniMax (scripts) / Claude (complex infra)

**Watcher Agent (A62)**
- Meta-agent: monitors all others in real-time
- 4-level escalation: self-correct → smarter agent → decompose → human escalation
- Always active when team >1 agent

**Coder Manager (A67)**
- Oversees the coder team
- Final quality gate using smarter model (Claude)
- Escalation point for Vijay
- Spawned when team has 2+ coders

### 4.2 Dynamic Roles

**Scrum Master / PM Agent (A68)**
- Chooses between Scrum Master (Agile projects) and PM Agent (fixed-scope)
- Runs sprint ceremonies: planning, standups, demo, retrospective
- Tracks velocity, manages backlogs
- Human oversight at: sprint planning, scope change, new specialist, final delivery

**Security Architect**
- Spawned for: security-sensitive projects, financial data, authentication/authorization
- Security review of architecture and code
- Model: Claude Sonnet (mandatory)

**Compliance Analyst**
- Spawned for: regulated industries (health, finance, government), GDPR, HIPAA, SOC 2
- Reviews work against compliance requirements
- Signs off on compliance gates

**Data Engineer**
- Spawned for: ETL pipelines, data migration, data warehouse projects
- Data modelling, pipeline architecture, data quality

**UX Designer**
- Spawned for: customer-facing frontends, mobile apps, dashboards
- User research synthesis, wireframe-to-spec, design system work

**Integration Specialist**
- Spawned for: API integration projects, webhook configuration, middleware
- API design review, integration testing, error handling

---

## 5. Provisioning Triggers

### 5.1 When We Provision

| Trigger | Team Provisioned | Who Decides |
|---|---|---|
| **New customer project confirmed** | Full team based on project size assessment | Vijay + Felix |
| **New sprint begins** | Sprint team (subset of full team) | PM Agent / Scrum Master |
| **Discovery reveals specialist need** | Dynamic role spawned mid-project | Coder Manager |
| **Project scope expands** | Additional agents provisioned | PM Agent + Vijay approval |
| **Critical failure detected** | Smarter agent spawned (Watcher escalation L2) | Agent Watcher |
| **Large task decomposition** | Sub-agents spawned for decomposed work | Coder Manager |

### 5.2 Provisioning Request Flow

```
Provisioning Need Identified
        │
        ▼
Project Planning (A50) → Team Size Assessment (A49)
        │
        ▼
Agent Team Selector → selects agents from pool
        │
        ▼
CMDB (A43) → checks agent availability
        │
        ▼
Provisioning Agent → spawns/configures agents
        │
        ▼
CMDB → registers agents to project CI
        │
        ▼
Agents receive project context (ByteRover path, customer, tier)
        │
        ▼
Agents begin work
```

---

## 6. Deprovisioning — When We Scale Down

### 6.1 Triggers for Deprovisioning

| Trigger | Action | Who Authorises |
|---|---|---|
| **Story/sprint complete** | Release specialist agents back to pool | PM Agent |
| **Project complete** | Release full team; retain Coder Manager for maintenance | Vijay |
| **Budget threshold exceeded (80%)** | Scale down to minimum viable team | Felix → Vijay |
| **Failure escalation exhausted (L4)** | Replace failing agent with smarter agent | Agent Watcher → Vijay |
| **Customer pauses project** | Release all but Coder Manager (maintenance mode) | Vijay |
| **Scope reduced** | Release excess agents | PM Agent |

### 6.2 Deprovisioning Protocol

```
Deprovisioning Trigger
        │
        ▼
PM Agent / Felix authorises
        │
        ▼
Agent completes current work-in-progress (or hands off)
        │
        ▼
Context archived to BIMemoryBank (handoff complete)
        │
        ▼
CMDB → agent marked "released"
        │
        ▼
Agent session closed (OpenClaw)
        │
        ▼
CMDB updated: project CI shows agent released
        │
        ▼
Agent returns to available pool
```

---

## 7. Cost Management

### 7.1 Cost Framework

| Component | Mechanism | Owner |
|---|---|---|
| **Agent team sizing** | A49: Agent Team Size Optimization — team size based on project complexity | Felix |
| **Token tracking** | A54: Per-agent token usage stored with every BI signal | Felix |
| **Infrastructure cost** | A54: Per-customer infrastructure cost tracked via Azure Cost Management | Felix |
| **Real-time dashboard** | A58: Mission Control task board shows cost per project/agent | Felix |
| **Budget threshold alerts** | A54: 80% budget alert triggers review | Felix → Vijay |
| **Auto-scale down** | Triggered at 80% budget — non-essential agents released | Felix |

### 7.2 Cost Per Agent (Model Routing)

| Role | Default Model | Cost Tier | When to Upgrade |
|---|---|---|---|
| Architect | Claude Sonnet | High | Always for complex projects |
| Coder | MiniMax | Low | Upgrade to Claude for complex tasks |
| Tester | MiniMax | Low | Always MiniMax |
| Reviewer | Claude Sonnet | High | Always |
| DevOps | MiniMax | Low | Upgrade for complex infra |
| Watcher | MiniMax | Low | Meta-agent, uses existing logs |
| Scrum Master | MiniMax | Low | Simple orchestration |
| PM Agent | MiniMax | Low | Simple coordination |
| Security Architect | Claude Sonnet | High | Always |

### 7.3 Project Budget Tiers

| Project Size | Budget Allocation | Team Size | Max Concurrent Agents |
|---|---|---|---|
| **Simple** | Up to $200 tokens | 2 agents | 2 |
| **Medium** | $200–$1,000 tokens | 4 agents | 4 |
| **Complex** | $1,000–$5,000 tokens | 5-7 agents | 6 |
| **Enterprise** | $5,000+ tokens | 8-12 agents | 10 |

*(Based on A49 team sizing rules)*

---

## 8. Infrastructure for Provisioning

### 8.1 Infrastructure Components

| Component | Role in Provisioning | Status |
|---|---|---|
| **VPS (OpenClaw)** | Base orchestration — agents spawn here | ✅ Running |
| **Hermes (A66)** | GPU-accelerated build/test workloads | ⬜ Pending |
| **BIMemoryBank (A41)** | Project context, team memory, session continuity | 🔵 In Progress |
| **CMDB (A43)** | Agent registry — which agents exist, their capabilities, assignments | ⬜ Pending |
| **Change Management (A42)** | Provisioning is a change — tracked, approved, sequenced | ⬜ Pending |
| **Agent Logging (A44)** | All agent activity logged for BI + ops | ⬜ Pending |
| **Agent Watcher (A62)** | Real-time monitoring of active teams | ⬜ Pending |
| **Mission Control (A58)** | Task board + cost dashboard | ⬜ Pending |

### 8.2 Infrastructure Dependencies for Provisioning

```
VPS (OpenClaw) — always running
        │
        ├── BIMemoryBank (A41) — context tree per project/customer
        │         └── ByteRover Git Sync → GitHub backup
        │
        ├── CMDB (A43) — agent registry
        │         └── Tracks: agent ID, role, capabilities, project assignment
        │
        ├── Agent Logging (A44) — session/decision/tool call logs
        │         └── BI signals stored per A47 taxonomy
        │
        ├── Agent Watcher (A62) — real-time monitoring
        │         └── Escalation ladder: self-correct → smarter → decompose → human
        │
        └── Hermes (A66) — GPU workloads
                  └── Docker containers per customer project
                  └── LMStudio for local model inference
```

### 8.3 Customer Isolation Integration

Provisioning must respect the customer's isolation tier (from A59):

| Tier | Agent Context | Infrastructure |
|---|---|---|
| **Tier 1** | Shared agents, `customer_id` in session | Shared infra |
| **Tier 2** | Shared agents, schema-scoped | Shared infra + per-customer schema |
| **Tier 3** | Dedicated agents per customer | Dedicated Resource Group |
| **Tier 4** | Dedicated agents + regional scope | Dedicated Subscription + region |

---

## 9. The Agent Team Provisioning Pipeline

### 9.1 Full Pipeline

```
[CUSTOMER PROJECT]
        │
        ▼
[PROJECT PLANNING — A50]
  Input: Customer enquiry / feature request
  Output: Project classification (Epic/Project/Task/Subtask)
  Output: Size assessment (Simple/Medium/Complex/Enterprise)
        │
        ▼
[AGENT TEAM SELECTOR]
  Input: Project size + type + customer tier
  Output: List of agents to provision (fixed + dynamic)
  Logic: Based on A49 team sizing rules
        │
        ▼
[PROVISIONING AGENT / TEAM ORCHESTRATOR]
  Input: Agent list + project context
  Output: Agents spawned with correct session context
  Actions:
    - Spawn each agent via OpenClaw
    - Load ByteRover context: project docs, customer history, SPECs
    - Set session variables: customer_id, project_id, isolation_tier
    - Configure credentials: per-customer Key Vault access
        │
        ▼
[CMDB REGISTRATION — A43]
  Input: Each spawned agent
  Output: Agents registered to project CI
  Fields: agent_id, role, model, spawned_at, project_id, customer_id
        │
        ▼
[AGENT TEAM ACTIVE]
  Each agent operates in scoped context
  Coder Manager (A67) oversees coders
  Scrum Master / PM Agent (A68) runs Agile process
        │
        ▼
[WATCHER — A62]
  Real-time monitoring of all agents
  Tracks: attempt counts, token usage, stall signals, error rates
  Escalation ladder when thresholds breached
        │
        ▼
[REVIEW HOOK — A45]
  Parent agent reviews sub-agent output before delivery
  Quality gate before Vijay sees work
        │
        ▼
[PROJECT COMPLETE / PHASE COMPLETE]
        │
        ▼
[DEPROVISIONING]
  Trigger: PM Agent or Felix authorises
  Each agent: completes WIP → archives context → closes session
  CMDB: agents marked "released"
        │
        ▼
[CMDB UPDATED]
  Project CI updated: agents released, project archived
  Context archived to BIMemoryBank (permanent record)
```

### 9.2 Key Integration Points

| From | To | Data Flow |
|---|---|---|
| A50 (Project Planning) | Agent Team Selector | Project size, type, customer tier |
| A49 (Team Sizing) | Agent Team Selector | Team size rules, cost limits |
| Agent Team Selector | Provisioning Agent | Agent list + config |
| Provisioning Agent | CMDB (A43) | Agent registration |
| CMDB (A43) | Agent Watcher (A62) | Active agent list |
| Agent Watcher (A62) | Feedback Cascade (A51) | Performance signals |
| A51 (Feedback) | BI Taxonomy (A47) | Outcome data |
| BI Taxonomy (A47) | Team Sizing (A49) | Cost/size optimisation signals |
| A54 (Token Usage) | Mission Control (A58) | Real-time cost dashboard |

---

## 10. What's Already Defined (from Current Frameworks)

### 10.1 From A67 — Multi-Tier Code Review System
- **Coder Manager** role defined: smarter model (Claude), final quality gate
- Three review tiers: Code quality → Logic & correctness → Architecture alignment
- Escalation to Vijay when Coder Manager cannot resolve

### 10.2 From A62 — Agent Watcher
- Meta-agent monitoring in real-time
- 4-level escalation ladder defined
- Uses free APIs, minimal cost impact
- Integrates with A44/A45/A47/A51/A53/A54

### 10.3 From A68 — Scrum Team Structure
- **Fixed roles**: Scrum Master OR PM Agent (choice based on project type), Reviewer, Watcher, Tester, Compliance Analyst
- **Dynamic roles**: specialists added per discovery
- Scrum Master vs PM difference defined
- Agile workflow: sprint planning → standups → task assignment → multi-tier review → compliance → demo → retrospective
- Human oversight at: sprint planning, new specialist, scope change, final delivery

### 10.4 From A49 — Agent Sizing
- Team size rules based on project complexity
- Simple = minimal agents, complex = full team
- Cost per task tracked from BI Taxonomy

### 10.5 From A50 — Project Intake
- Classification: Epic / Project / Task / Subtask
- New vs existing project routing
- CMDB integration for project identification

### 10.6 From A45 — Review Hook
- Mandatory parent-agent review before delivery
- Review criteria: accuracy, completeness, spec adherence, code quality, security, handover clarity

### 10.7 From A51 — Feedback Cascade
- Feedback from Vijay routed to specific agent(s)
- Scores per task: quality, accuracy, completeness, communication, timeliness
- Low scores trigger Improvement Agent proposals

### 10.8 From A59 — Customer Isolation
- Agent context scoped per isolation tier
- Per-customer ByteRover context tree
- Credential management via per-customer Key Vault hierarchy

---

## 11. What's Missing / Needs Definition

### 11.1 Critical Gaps (P1)

| Gap | What It Means | How to Solve |
|---|---|---|
| **No Agent Team Selector** | No systematic way to pick agents for a project | Build selection rules based on A49 (team sizing) + project type |
| **No Provisioning Agent / Team Orchestrator** | No automated way to coordinate spawning | Define spawning procedure (A25), build orchestration logic |
| **Agent spawning procedure not documented (A25)** | No formal process for bringing agents up | Document: context loading, session config, credential injection |
| **CMDB not built (A43)** | Cannot track agents in real-time | Build CMDB as first priority — without it, provisioning is blind |
| **No real-time team status** | Cannot see who is working on what | A58 (Mission Control) needed |
| **No cost dashboard** | Cannot see cost per project live | A58 + A54 integration |

### 11.2 Important Gaps (P2)

| Gap | What It Means | How to Solve |
|---|---|---|
| **Skill matrix not finalised (A26)** | Uncertainty about agent capabilities | Finalise skill matrix per role |
| **Scripting not implemented (A64)** | Missing 99% token cost reduction opportunity | Implement scripting registry and agent scripting skill |
| **Hermes not set up (A66)** | No GPU environment for heavy builds | A66 execution |

### 11.3 Pending Decisions That Block Provisioning

| Decision | Blocked By | Impact |
|---|---|---|
| **P01: Who approves L3/L4 actions?** | Access Control not finalised | Agent authority levels undefined |
| **P03: Azure account setup** | Infrastructure not ready | Agent workloads have no home |
| **P04: Email provider** | External comms not ready | Customer comms cannot begin |

---

## 12. Phased Implementation Plan

### Phase 1 — Manual Provisioning (NOW)
**Goal:** Provision agent teams manually. No automation yet.

**What we do:**
- Vijay decides team composition per project
- Felix spawns agents via OpenClaw manually
- BIMemoryBank stores project context manually
- CMDB tracked in spreadsheet (not built yet)
- Cost tracked manually per task

**Who does it:** Felix + Vijay

**Dependencies:** None beyond current state

**When done:** When A43 (CMDB) and A50 (Project Planning) are built

---

### Phase 2 — Semi-Automated Provisioning
**Goal:** Templates for common project types. Systematic but not fully automatic.

**What we do:**
- Build **agent team templates** for common project types:
  - Template: Simple bug fix → Coder + Reviewer
  - Template: Feature build → Architect + Coder + Tester + Reviewer
  - Template: CRM build → Architect + Coder + Tester + Reviewer + DevOps + Security Architect
  - Template: Integration project → Architect + Coder + Tester + Integration Specialist
- CMDB (A43) deployed: agents tracked in database
- Project Planning (A50) deployed: intake system classifies requests
- Agent Watcher (A62) deployed: real-time monitoring active
- Mission Control (A58) deployed: task board + cost visibility

**Who does it:** Felix builds, Vijay approves

**Dependencies:** A41 (BIMemoryBank), A43 (CMDB), A50 (Project Planning), A62 (Agent Watcher), A58 (Mission Control)

**When done:** When all Phase 2 infrastructure actions are complete

---

### Phase 3 — Fully Automated Provisioning
**Goal:** System spins up team automatically based on project parameters.

**What we do:**
- **Agent Team Selector** built: given project size + type + customer tier → outputs agent team
- **Provisioning Agent / Team Orchestrator** built: automates spawning based on Team Selector output
- Change Management (A42) integrated: provisioning triggers change record automatically
- Cost dashboard live: real-time cost per project/agent
- Auto-scale: when budget hits 80%, system prompts scale-down
- Scripting (A64) live: repetitive tasks handled by scripts, not agent inference

**Who does it:** System runs; humans oversee and approve

**Dependencies:** All Phase 2 complete, A42, A54, A64

**When done:** When A69 (this system) is implemented

---

## 13. Integration Map

Dynamic Provisioning connects to every major system in Abzum:

```
                    ┌─────────────────────────┐
                    │  DYNAMIC PROVISIONING   │
                    │      (THIS PLAN)        │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ A49 Team Sizing │    │ A50 Project     │    │ A43 CMDB        │
│ Rules for:     │    │ Planning        │    │ Agent registry  │
│ - Simple       │    │ - Classification │    │ - Which agents  │
│ - Medium       │    │ - Size          │    │ - Capabilities   │
│ - Complex      │    │ - Routing       │    │ - Assignments   │
│ - Enterprise   │    │                 │    │                 │
└───────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ A54 Token      │    │ A42 Change       │    │ A44 Logging     │
│ Tracking       │    │ Management       │    │ All agent       │
│ - Per agent    │    │ Provisioning =   │    │ activity logged │
│ - Per project  │    │ change → tracked │    │ for BI + ops    │
│ - Budget alerts│    │                 │    │                 │
└───────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ A47 BI Taxonomy│   │ A45 Review Hook │    │ A62 Agent       │
│ Signals:       │    │ Parent reviews  │    │ Watcher         │
│ - Outcome      │    │ sub-agent before│    │ Real-time       │
│ - Behavioral    │    │ delivery        │    │ monitoring +    │
│ - Cost signals  │    │                 │    │ escalation      │
└───────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ A51 Feedback   │    │ A67 Code Review │    │ A68 Scrum Team  │
│ Cascade         │    │ Multi-tier:     │    │ Fixed + dynamic │
│ Scores route to│    │ quality → logic │    │ roles defined   │
│ specific agents│    │ → architecture  │    │ PM / Scrum Mast │
└───────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ A59 Customer Isolation   │
                    │ Tier 1–4 affects:        │
                    │ - Agent context scope   │
                    │ - Infrastructure path   │
                    │ - Credential management  │
                    └─────────────────────────┘
```

---

## 14. Action A69 — Implement Dynamic Agent Provisioning System

| Field | Value |
|---|---|
| **ID** | A69 |
| **Name** | Implement Dynamic Agent Provisioning System |
| **Priority** | P1 |
| **Phase** | 3 |
| **Status** | ⬜ Pending |
| **Owner** | Felix |
| **Target Date** | TBD (after Phase 2 infrastructure complete) |

**Description:**

Build the dynamic provisioning system for Abzum's AI agent teams. Agents are provisioned per project based on size/complexity assessment, with fixed + dynamic roles selected from a defined pool.

**Scope:**

1. **Agent Team Selector** — Build rules-based component that takes project parameters (size, type, customer tier, complexity) and outputs the list of agents to provision. Integrates with A49 (team sizing) and A50 (project planning). Initially manual (Felix decides); becomes automated in Phase 3.

2. **Provisioning Agent / Team Orchestrator** — Define the agent spawning procedure (A25) as a formal process. Document: how to load ByteRover context for a project, how to configure session variables (customer_id, project_id, tier), how to inject per-customer credentials from Key Vault. Implement as a repeatable procedure first; automate in Phase 3.

3. **CMDB Integration (A43)** — Register all spawned agents to the project CI in CMDB. Fields: agent_id, role, model, spawned_at, project_id, customer_id. Update on deprovision: released_at, total_cost. CMDB becomes the source of truth for "who is working on what."

4. **Agent Pools** — Define and document two pools: Core Pool (always available: Architect, Coder, Tester, Reviewer, DevOps, Watcher, Coder Manager) and Dynamic Pool (spawned on demand: Security Architect, Compliance Analyst, Data Engineer, UX Designer, Integration Specialist, BI Analyst, Scrum Master, PM Agent).

5. **Provisioning Pipeline** — Document the end-to-end flow: Customer Enquiry → Project Planning (A50) → Team Size Assessment (A49) → Agent Team Selector → Provisioning Agent → CMDB Registration → Active Team → Watcher (A62) → Coder Manager / PM (A68) → Review (A45) → Deprovisioning → CMDB Updated → Context Archived.

6. **Deprovisioning Protocol** — Define triggers (story/sprint complete, project complete, budget threshold, scope reduction) and the formal protocol: complete WIP → archive context → close session → update CMDB → release to pool.

7. **Cost Management Integration** — Connect provisioning decisions to A54 (Token Usage) and A58 (Mission Control). Every provisioning decision shows projected cost. Real-time dashboard shows actual vs projected.

8. **Phase 1 Execution** — Run manual provisioning for the first customer project(s). Use real experience to refine templates, procedures, and thresholds. Feed learnings back into A49, A50, and this action.

9. **Phase 2 Execution** — Build agent team templates for common project types. Implement Agent Team Selector as semi-automated (templates selected manually, agents spawned automatically). Integrate with CMDB and Project Planning.

10. **Phase 3 Execution** — Fully automate Agent Team Selector based on project parameters. Implement auto-scale (budget threshold → release agents). Integrate with Change Management (A42) for provisioning as a formal change type.

**Dependencies:**
- A41 (BIMemoryBank Git Sync) — context tree for project memory
- A42 (Change Management) — provisioning tracked as change
- A43 (CMDB) — agent registry
- A44 (Agent Logging) — activity logging
- A45 (Review Hook) — quality gate
- A49 (Team Sizing) — size rules
- A50 (Project Planning) — intake system
- A51 (Feedback Cascade) — performance signals
- A54 (Token Usage) — cost tracking
- A58 (Mission Control) — task board + dashboard
- A62 (Agent Watcher) — monitoring
- A67 (Code Review) — quality gates
- A68 (Scrum Team Structure) — roles
- A59 (Customer Isolation) — tier-based scoping

**Key Metrics:**
- Time to provision a team (target: <30 minutes)
- Accuracy of team selection (low re-provision rate)
- Cost vs estimate variance (target: <20%)
- Agent utilization (target: >80% productive time)

---

## 15. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Agent context not loading correctly on spawn | Agents work without full context, lower quality | Medium | BIMemoryBank must be reliable (A41); test context loading |
| Wrong agents selected for project | Wasted cost, rework | Medium | Build team templates with clear criteria; Vijay reviews |
| CMDB not updated on deprovision | Agent appears active but isn't | Low | Make CMDB update part of deprovisioning protocol (mandatory step) |
| Budget overrun from runaway agents | Cost exceeds estimate | Medium | Agent Watcher (A62) + 80% threshold alert; auto-scale trigger |
| Agent credential leakage across customers | Security breach | Low | Per-customer Key Vault hierarchy (A59); session context enforced |
| Over-provisioning (too many agents) | Wasted cost | Medium | Team sizing rules (A49) + PM Agent oversight |

---

## 16. Next Steps

### Immediate (This Week)
1. **A25 — Document agent spawning procedure**: Define exactly how to spawn an agent with full project context
2. **A43 — Deploy CMDB**: Without this, we can't track agent assignments
3. **A50 — Project Planning intake**: Without this, we can't systematically assess project size

### Short-Term (This Month)
4. **A62 — Agent Watcher**: Real-time monitoring of active teams
5. **A67 — Multi-tier code review**: Quality gates built into provisioning pipeline
6. **A68 — Scrum team structure**: Formalize fixed + dynamic roles

### Medium-Term
7. **A58 — Mission Control**: Task board + cost dashboard
8. **A54 — Token tracking**: Per-agent, per-project cost visibility
9. **A49 — Team sizing rules**: Formal rules for team composition

### Long-Term
10. **Phase 3 automation**: Agent Team Selector automated, auto-scale enabled
11. **A42 — Change Management**: Provisioning integrated as formal change type

---

*Document version: 1.0*
*Created: 2026-04-04*
*Author: Felix Stanley, COO — Abzum New Zealand Limited*
*Status: Active — Framework for dynamic agent provisioning*
*Related documents:*
- `AI_COMPANY_FRAMEWORK.md` — Agent role definitions
- `AI_COMPANY_MASTER_PLAN.md` — Platform and model strategy
- `agent_workflow.md` — Mandatory workflow gates
- `customer-isolated-infrastructure-architecture-2026-04-03.md` — Isolation tiers
- `agent-watcher-system-2026-04-03.md` — Monitoring system
- `.brv/context-tree/work/actions.md` — All action items (A01–A68)
