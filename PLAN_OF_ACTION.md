# Plan of Action — Abzum
**Last Updated: 2026-05-05**
**Current Status: Phase 0 BLOCKED — awaiting Vijay decisions**

---

## How to Read This

- Every task links to its reference doc
- 🔴 = Blocked / Decision required | 🔵 = In Progress | ⏳ = Waiting on dependency | ⬜ = Ready to start | ✅ = Done
- P1 = Critical path | P2 = Important | P3 = Nice to have
- Owner: **Vijay** = founder decisions/setup | **Felix** = agent execution

---

## ⚠️ Unblock First — 6 Decisions Needed from Vijay

Nothing in Phase 1+ can proceed until these are answered. Record answers in [`work/decisions/decided.md`](work/decisions/decided.md).

| # | Decision | What It Unblocks | Urgency |
|---|---|---|---|
| P01 | Who approves L3/L4 agent actions? | [Access Control](execution/agent_workflow.md), HITL triggers | 🔴 HIGH |
| P02 | First customer — who, what are they buying? | [GTM](company/abzum/top_5_priority_use_cases.md), Phase 4+5 revenue | 🔴 HIGH |
| P03 | Azure account — who sets it up, who pays? | [All infrastructure](operations/azure_architecture.md) | 🔴 HIGH |
| P04 | Company email — @abzum.com via what provider? | [Email setup](operations/email_setup_brevo_cloudflare.md), CRM, external comms | 🔴 HIGH |
| P05 | First human hire — when, who, what role? | [Org structure](strategy/ai_native_org_structure.md), customer comms | 🟡 MEDIUM |
| P06 | CRM build vs buy — can we delay? | [CRM strategy](strategy/crm_delivery/crm_build_deploy_approaches.md), Phase 4 GTM | 🟡 MEDIUM |

→ Full context: [`work/decisions/pending.md`](work/decisions/pending.md)

---

## Phase 0 — Pre-Foundation 🔴 ACTIVE (Blocked)
**Goal:** Legal entity confirmed, finances in order, strategic direction set.

| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A01 | Answer 6 blocker decisions (P01–P06) | Vijay | 🔴 Required | [pending.md](work/decisions/pending.md) |
| A02 | Confirm Abzum NZ Ltd is registered | Vijay | ⬜ Pending | [context.md](company/abzum/context.md) |
| A03 | Open business bank account | Vijay | ⬜ Pending | [context.md](company/abzum/context.md) |
| A04 | Define monthly operating budget | Vijay | ⬜ Pending | [context.md](company/abzum/context.md) |
| A05 | Identify first customer | Vijay | ⬜ Pending | [top_5_priority_use_cases.md](company/abzum/top_5_priority_use_cases.md) |
| A06 | Define what Abzum sells (service definition) | Vijay | ⬜ Pending | [top_5_priority_use_cases.md](company/abzum/top_5_priority_use_cases.md) |
| A07 | Define pricing model | Vijay | ⬜ Pending | [context.md](company/abzum/context.md) |
| A08 | Set AI tool budget (~$30/mo?) | Vijay | ⬜ Pending | — |
| A09 | Set infrastructure budget (~$150-300/mo?) | Vijay | ⬜ Pending | [azure_architecture.md](operations/azure_architecture.md) |

**Exit criteria:** Vijay has answered P01–P06. Company registered. Bank account open. Budget defined.

---

## Phase 1 — Governance & Policy 🔴 Waiting on Phase 0
**Goal:** Rules, policies, and operating principles locked before any client work begins.

| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A10 | Finalise Access Control Framework | Vijay | 🔴 Decision Required | [agent_workflow.md](execution/agent_workflow.md) |
| A11 | Define HITL approval triggers | Vijay | 🔴 Decision Required | [agent_workflow.md](execution/agent_workflow.md) |
| A12 | Define L3/L4 data boundaries | Vijay | 🔴 Decision Required | [ai_security_framework.md](operations/ai_security_framework.md) |
| A13 | Approve Customer Comms Plan | Vijay | 🔴 Decision Required | — |
| A14 | Draft NDA template | Felix | ⬜ Pending | — |
| A15 | Draft privacy policy | Felix | ⬜ Pending | [ai_infrastructure_compliance.md](operations/ai_infrastructure_compliance.md) |
| A45 | Implement Sub-Agent Review Hook / Review Agent | Felix | ⬜ Pending | [agent_workflow.md](execution/agent_workflow.md) |
| A57 | Define Enterprise Org Structure for Abzum | Felix | ⬜ Pending | [ai_native_org_structure.md](strategy/ai_native_org_structure.md) · [ai_native_5_tier_org_model.md](strategy/ai_native_org/ai_native_5_tier_org_model.md) |

**Depends on:** Phase 0 completion

---

## Phase 2 — Technical Infrastructure 🔴 Partial (Blocked on Azure)
**Goal:** Cloud, email, agents, and memory infrastructure operational.

### Cloud & Core Infrastructure
| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A16 | Set up Azure account | Vijay | ⬜ Pending | [azure_architecture.md](operations/azure_architecture.md) |
| A17 | Configure @abzum.com email | Vijay | ⬜ Pending | [email_setup_brevo_cloudflare.md](operations/email_setup_brevo_cloudflare.md) |
| A18 | Provision Azure AU East region | Vijay | ⬜ Pending | [azure_architecture.md](operations/azure_architecture.md) |
| A19 | Configure OpenClaw production settings | Felix | ⏳ Blocked (B02) | [hermes_local_environment.md](operations/hermes_local_environment.md) |
| A20 | Set up Azure Key Vault | Vijay | ⬜ Pending | [security_stack.md](operations/security_stack.md) |
| A21 | Set up CI/CD for agent deployments | Felix | ⬜ Pending | [azure_architecture.md](operations/azure_architecture.md) |
| A22 | Configure ByteRover cloud sync | Felix | ⏳ Blocked (B02) | [bimemorybank_git_sync.md](operations/bimemorybank_git_sync.md) |
| A23 | Set up GitHub private repo backups | Vijay | ⬜ Pending | — |
| A24 | Set up Azure Blob cold storage backup | Vijay | ⬜ Pending | [azure_architecture.md](operations/azure_architecture.md) |
| A66 | Set Up Hermes Local Dev & Testing Environment | Vijay+Felix | ⬜ Pending | [hermes_local_environment.md](operations/hermes_local_environment.md) · [ollama_local.md](operations/ollama_local.md) |

### Memory & Change Management Systems
| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A41 | Deploy BIMemoryBank Git Sync Architecture | Vijay+Felix | 🔵 In Progress | [bimemorybank_git_sync.md](operations/bimemorybank_git_sync.md) |
| A42 | Deploy Centralised Change Management System | Felix | ⬜ Pending | [bimemorybank_git_sync.md](operations/bimemorybank_git_sync.md) |
| A43 | Deploy CMDB (Configuration Management Database) | Felix | ⬜ Pending | [azure_architecture.md](operations/azure_architecture.md) · [data_architecture.md](operations/data_architecture.md) |
| A44 | Design and Deploy Agent Logging Architecture | Felix | ⬜ Pending | [agent_workflow.md](execution/agent_workflow.md) · [agent_watcher_system.md](operations/agent_watcher/agent_watcher_system.md) |
| A71 | Implement Two-Tier Agent Architecture (Paperclip + Project Containers) | Felix | ⬜ Pending | [two_tier_agent_architecture.md](strategy/two_tier_agent_architecture.md) |

**Depends on:** Azure account (B02 unblocked)

---

## Phase 3 — Agent Intelligence & Systems 🔴 Pending
**Goal:** BI memory live, agent frameworks operational, continuous improvement running.
*Can begin in parallel with Phase 2 where Azure is not required.*

### BI Memory Architecture (Research Complete 2026-04-12)
| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| — | Feasibility research: Hermes + Hindsight vs BI Memory requirements | Felix | ✅ Done | [README.md](README.md) · [SUMMARY.md](SUMMARY.md) |
| — | Technical reference & architecture | Felix | ✅ Done | [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) |
| — | Implementation guide (4 phases) | Felix | ✅ Done | [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) |
| — | **Hermes × Space Agent integration research & plan** (Hybrid Plugin Bridge A+D) | Felix | ✅ Done | [hermes_space_agent_integration.md](strategy/research/hermes_space_agent_integration.md) |
| — | **Deploy Hermes Phase 1** (quick start, ~1 day) | Felix | ⬜ Next | [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) |
| — | **Episodic memory enhancement** (custom build, ~1-2 wks) | Felix | ⬜ Pending | [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) |
| — | Causal relationship extraction (~1-2 wks) | Felix | ⬜ Pending | [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) |
| A47 | Build Autonomous BI & WorkIQ Intelligence Taxonomy (9 types) | Felix | ⬜ Pending | [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) · [README.md](README.md) |

### Agent Architecture & Workflow
| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A25 | Document agent spawning procedure | Felix | ⬜ Pending | [agent_workflow.md](execution/agent_workflow.md) · [handoff_protocol.md](execution/handoff_protocol.md) |
| A26 | Finalise skill matrix per agent | Felix | ⬜ Pending | [skill_matrix.md](execution/skill_matrix.md) |
| A27 | Implement Superpowers workflow | Felix | ⬜ Pending | [agent_workflow.md](execution/agent_workflow.md) |
| A62 | Deploy Agent Watcher System | Felix | ⬜ Pending | [agent_watcher_system.md](operations/agent_watcher/agent_watcher_system.md) |
| A67 | Design Multi-Tier Code Review System | Felix | ⬜ Pending | [agent_workflow.md](execution/agent_workflow.md) · [tdd_cycle.md](execution/tdd_cycle.md) |
| A68 | Define Agile Scrum Team Structure for AI Agent Projects | Felix | ⬜ Pending | [project_management_methodology.md](execution/project_management_methodology.md) |
| A69 | Implement Dynamic Agent Provisioning System | Felix | ⬜ Pending | [two_tier_agent_architecture.md](strategy/two_tier_agent_architecture.md) · [agent_kubernetes.md](strategy/ai_native_org/agent_kubernetes.md) |
| A70 | Define Hybrid Project Management Methodology | Felix | ⬜ Pending | [project_management_methodology.md](execution/project_management_methodology.md) |

### Intelligence, Learning & Improvement
| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A46 | Deploy Continuous Improvement System (Improvement Agents + Idea Board) | Felix | ⬜ Pending | [ai_company_master_plan.md](strategy/ai_company_master_plan.md) |
| A48 | Deploy Process Maker Agent | Felix | ⬜ Pending | [agent_workflow.md](execution/agent_workflow.md) |
| A49 | Optimise Agent Team Size Based on Project Scope | Felix | ⬜ Pending | [skill_matrix.md](execution/skill_matrix.md) · [ai_agent_capabilities.md](execution/ai_agent_capabilities.md) |
| A50 | Project Planning & Management Intake System | Felix | ⬜ Pending | [project_management_methodology.md](execution/project_management_methodology.md) |
| A51 | Reinforced Learning Feedback Cascade System | Felix | ⬜ Pending | [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) · [agent_workflow.md](execution/agent_workflow.md) |
| A52 | AI Model Internals → Company Logic Research & Framework | Felix | ⬜ Pending | [ai_company_framework.md](execution/ai_company_framework.md) |
| A53 | Agent Evaluation Methodology Research | Felix | ⬜ Pending | [ai_agent_capabilities.md](execution/ai_agent_capabilities.md) |
| A54 | Track Actual Token Usage Per Agent for BI Signals | Felix | ⬜ Pending | [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) |
| A58 | Build Mission Control — Agent Task & Metadata Management | Felix | ⬜ Pending | [project_management_methodology.md](execution/project_management_methodology.md) |
| A64 | Bake Scripting Intelligence into Agents | Felix | ✅ Done | [agent_scripting_intelligence.md](execution/agent_scripting/agent_scripting_intelligence.md) |

### Customer Isolation & Compliance
| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A59 | Deploy Customer Isolation Architecture (4-tier) | Felix | ⬜ Pending | [azure_architecture.md](operations/azure_architecture.md) · [ai_infrastructure_compliance.md](operations/ai_infrastructure_compliance.md) |
| A65 | Build Customer Data Compliance Intake System | Felix | ✅ Done | [ai_infrastructure_compliance.md](operations/ai_infrastructure_compliance.md) · [compliance_roadmap.md](operations/compliance_roadmap.md) |

---

## Phase 4 — Go-To-Market 🔴 Pending
**Goal:** First customer signed, CRM operational, outbound comms running.

| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A28 | Decide first human hire | Vijay | ⬜ Pending | [ai_native_org_structure.md](strategy/ai_native_org_structure.md) |
| A29 | Plan Account Manager hiring | Vijay | ⬜ Pending | [ai_native_org_structure.md](strategy/ai_native_org_structure.md) |
| A30 | Decide CRM build vs buy | Vijay | 🔴 Decision Required | [crm_build_deploy_approaches.md](strategy/crm_delivery/crm_build_deploy_approaches.md) |
| A31 | Build CRM MVP or deploy SaaS CRM | Vijay | ⬜ Pending | [crm_build_deploy_approaches.md](strategy/crm_delivery/crm_build_deploy_approaches.md) |
| A32 | Configure Comms Pipeline Agent | Felix | ⬜ Pending | — |
| A33 | Create pre-approved message templates | Felix | ⬜ Pending | — |
| A34 | Create proposal template | Felix | ⬜ Pending | — |
| A35 | Contact first prospect | Vijay | ⬜ Pending | [top_5_priority_use_cases.md](company/abzum/top_5_priority_use_cases.md) |
| A55 | Customer Project Estimation & Job Costing System | Felix | ⬜ Pending | [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) · [project_management_methodology.md](execution/project_management_methodology.md) |
| A56 | Estimation Variance → BI Signals Pipeline | Felix | ⬜ Pending | [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) |
| A61 | CRM Build & Deploy Capability for Customers | Felix | ⬜ Pending | [crm_build_deploy_approaches.md](strategy/crm_delivery/crm_build_deploy_approaches.md) |

**Depends on:** Phase 0 (P04 email) + Phase 2 (email configured)

---

## Phase 5 — First Project 🔴 Pending
**Goal:** First paid engagement delivered. First revenue.

| ID | Task | Owner | Status | Reference Doc |
|---|---|---|---|---|
| A36 | Sign first client | Vijay | ⬜ Pending | [top_5_priority_use_cases.md](company/abzum/top_5_priority_use_cases.md) |
| A37 | Define first project scope | Vijay | ⬜ Pending | [project_management_methodology.md](execution/project_management_methodology.md) |
| A38 | Deploy agent team for first project | Felix | ⬜ Pending | [agent_workflow.md](execution/agent_workflow.md) · [handoff_protocol.md](execution/handoff_protocol.md) |
| A39 | Track project in CRM | Felix | ⬜ Pending | — |
| A40 | Define quality gate for deliverable | Vijay | ⬜ Pending | [agent_workflow.md](execution/agent_workflow.md) · [tdd_cycle.md](execution/tdd_cycle.md) |

**Depends on:** Phase 4

---

## ✅ Completed Work

| ID | Task | Completed | Reference Doc |
|---|---|---|---|
| A60 | Identify Customer Use Cases for Abzum | 2026-04-03 | [top_5_priority_use_cases.md](company/abzum/top_5_priority_use_cases.md) |
| A63 | Set Up Local Ollama Server | 2026-04-03 | [ollama_local.md](operations/ollama_local.md) |
| A64 | Bake Scripting Intelligence into Agents | 2026-04-03 | [agent_scripting_intelligence.md](execution/agent_scripting/agent_scripting_intelligence.md) |
| A65 | Build Customer Data Compliance Intake System | 2026-04-03 | [ai_infrastructure_compliance.md](operations/ai_infrastructure_compliance.md) |
| — | BI Memory Architecture Research (Hermes + Hindsight) | 2026-04-12 | [README.md](README.md) · [SUMMARY.md](SUMMARY.md) · [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) · [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) |
| — | Hermes × Space Agent Integration Research & Plan (Hybrid Plugin Bridge A+D) | 2026-05-05 | [hermes_space_agent_integration.md](strategy/research/hermes_space_agent_integration.md) |

---

## Dependency Chain

```
B01: Vijay answers P01–P06
         ↓
Phase 0 complete: company registered, bank open, budget set
         ↓
  ┌──────┴──────┐
  B02           B04
  Azure         First customer identified
  account       ↓
  ↓             Phase 4 (GTM) → Phase 5 (Revenue)
  B03 Email
  ↓
Phase 1: Governance (A10–A15, A45, A57)
         ↓
Phase 2: Infrastructure (A16–A24, A41–A44, A66, A71)
         ↓  [Phase 3 can run in parallel]
Phase 3: Intelligence (BI Memory + Agent Systems)
         ↓
Phase 4: Go-To-Market (A28–A35, A55–A56, A61)
         ↓
Phase 5: First Project → First Revenue (A36–A40)
```

---

## Quick Navigation

| Want to... | Go to |
|---|---|
| See what to do right now | [NOW.md](NOW.md) |
| Answer the 6 blocking decisions | [work/decisions/pending.md](work/decisions/pending.md) |
| See full action backlog (A01–A71+) | [work/actions/_index.md](work/actions/_index.md) |
| See what's actively in progress | [work/actions/active.md](work/actions/active.md) |
| See all active blockers | [work/blockers/_index.md](work/blockers/_index.md) |
| See phase-by-phase detail | [work/plan/phases.md](work/plan/phases.md) |
| Implement BI Memory (Hermes) | [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) |
| Plan Hermes + Space Agent integration | [strategy/research/hermes_space_agent_integration.md](strategy/research/hermes_space_agent_integration.md) |
| Understand agent workflow | [execution/agent_workflow.md](execution/agent_workflow.md) |
| Company strategy overview | [strategy/ai_company_master_plan.md](strategy/ai_company_master_plan.md) |
| Full repo map | [MASTER_INDEX.md](MASTER_INDEX.md) |
