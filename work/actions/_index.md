# Action Items

> **What:** All prioritized action items for Abzum planning
> **Status:** Living — updated as items are added, progressed, or completed

---

## Active Items (In Progress)

| ID | Action | Priority | Phase | Status | Owner | Depends |
|---|---|---|---|---|---|---|
| A01 | Get Vijay to answer 6 blocker questions | P1 | 0 | 🔴 Decision Required | Vijay | — |
| A02 | Confirm Abzum NZ Ltd is registered | P1 | 0 | ⬜ Pending | Vijay | — |
| A03 | Open business bank account | P1 | 0 | ⬜ Pending | Vijay | — |
| A04 | Define monthly operating budget | P1 | 0 | ⬜ Pending | Vijay | — |

---

## Backlog (Future / Pending)

### Phase 0 — Pre-Foundation
| ID | Action | Priority | Status | Owner |
|---|---|---|---|---|
| A05 | Identify first customer | P1 | ⬜ Pending | Vijay |
| A06 | Define what Abzum sells (service definition) | P1 | ⬜ Pending | Vijay |
| A07 | Define pricing model | P1 | ⬜ Pending | Vijay |
| A08 | Set AI tool budget ($30/mo?) | P1 | ⬜ Pending | Vijay |
| A09 | Set infrastructure budget ($150-300/mo?) | P1 | ⬜ Pending | Vijay |

### Phase 1 — Governance
| ID | Action | Priority | Status | Owner |
|---|---|---|---|---|
| A10 | Finalize Access Control Framework | P1 | 🔴 Decision Required | Vijay |
| A11 | Define HITL approval triggers | P1 | 🔴 Decision Required | Vijay |
| A12 | Define L3/L4 data boundaries | P1 | 🔴 Decision Required | Vijay |
| A13 | Approve Customer Comms Plan | P1 | 🔴 Decision Required | Vijay |
| A14 | Draft NDA template | P2 | ⬜ Pending | Felix |
| A15 | Draft privacy policy | P2 | ⬜ Pending | Felix |

### Phase 2 — Infrastructure
| ID | Action | Priority | Status | Owner |
|---|---|---|---|---|
| A16 | Set up Azure account | P1 | ⬜ Pending | Vijay |
| A17 | Configure @abzum.com email | P1 | ⬜ Pending | Vijay |
| A18 | Provision Azure AU East region | P1 | ⬜ Pending | Vijay |
| A19 | Configure OpenClaw production settings | P1 | ⬜ Pending | Felix |
| A20 | Set up Azure Key Vault | P2 | ⬜ Pending | Vijay |
| A21 | Set up CI/CD for agent deployments | P2 | ⬜ Pending | Felix |
| A22 | Configure ByteRover cloud sync | P2 | ⬜ Pending | Felix |
| A23 | Set up backup (GitHub private repos) | P2 | ⬜ Pending | Vijay |
| A24 | Set up backup (Azure Blob cold storage) | P2 | ⬜ Pending | Vijay |
| A41 | Deploy BIMemoryBank Git Sync Architecture | P1 | 2 | 🔵 In Progress | Vijay+Felix | Deploy using `memory/bimemorybank-deployment-guide-2026-04-01.md`. Vijay creates GitHub repo, Felix sets up scripts + GitHub Actions + webhook. |
| A42 | Deploy Centralised Change Management System | P1 | 2 | ⬜ Pending | Felix | Track dependencies for production changes — what changes require what other changes, what blocks what, rollout sequencing, rollback plans. Integrate with BIMemoryBank Git Sync. |
| A43 | Deploy Configuration Management Database (CMDB) | P1 | 2 | ⬜ Pending | Felix | Single source of truth for all IT assets: hardware, software, services, APIs, agents, cloud resources. Tracks relationships and dependencies between CIs. Integrates with Change Management (A42). |
| A44 | Design and Deploy Agent Logging Architecture | P1 | 2 | ⬜ Pending | Felix | Centralised logging for all agent activity: session logs, decision logs, tool call logs, error logs, audit trails. Logs must be queryable, structured, and stored in BIMemoryBank-adjacent store. Used for both operations (debugging, security) and BI (patterns, productivity, decision analysis). Integrate with Change Management (A42) and CMDB (A43). |
| A45 | Implement Sub-Agent Review Hook / Review Agent | P1 | 1 | ⬜ Pending | Felix | Parent agent reviews sub-agent output before delivery. Define review criteria: accuracy, completeness, adherence to spec, code quality, security, handover clarity. Either implement as mandatory parent-agent review step in workflow, or deploy a dedicated Review Agent. Review criteria must be documented in skill/framework. Integrate with Operations Log (O12). |
| A46 | Deploy Continuous Improvement System (Improvement Agents + Idea Board) | P1 | 3 | ⬜ Pending | Felix | Each agent team has an Improvement Agent that researches internet for tools/procedures, generates improvement proposals. All proposals flow to central Improvement Lead Agent (Felix). Lead creates business cases, discusses with Vijay if funding needed, approves or rejects. Idea Board captures all proposals. Integrate with BIMemoryBank (proposals stored), CMDB (A43), Agent Logging (A44). |
| A47 | Build Autonomous BI & WorkIQ Intelligence Taxonomy | P1 | 3 | ⬜ Pending | Felix | Design and build 9-type intelligence taxonomy captured by agents: Procedural, Relational, Episodic, Persona, Outcome, Semantic, Behavioral, Intent, Temporal. Each type: what signals to capture, capture moment, storage format, query patterns, who uses it. Integrate into agent workflow and BIMemoryBank. Foundation for AI-first BI system. Maps to MCRA Govern/Map/Measure/Manage. |
| A48 | Deploy Process Maker Agent | P1 | 3 | ⬜ Pending | Felix | Agent responsible for creating and enforcing centralized processes for each work type. Works with Improvement Agents (A46) to identify process gaps, drafts standardized workflows, mandates adoption across teams. Enforces Superpowers TDD gates, handoff protocols, review steps. Stores processes in BIMemoryBank. Integrates with Improvement Lead Agent, BI Taxonomy (A47), Change Management (A42). |
| A49 | Optimize Agent Team Size Based on Project Scope (Cost Optimization) | P1 | 3 | ⬜ Pending | Felix | Define rules/rubrics for sizing agent teams based on project type, complexity, and budget. Small/simple projects use minimal agents (e.g., Coder only); complex projects use full team (Architect + Coder + Tester + Reviewer + DevOps). Track cost per task type from BI Taxonomy (A47) Outcome data. Continuously reduce agent count where not adding value. Integrates with BIMemoryBank, BI Taxonomy (A47), CMDB (A43). |
| A50 | Project Planning & Management Intake System | P1 | 3 | ⬜ Pending | Felix | Every inbound request (from Vijay, customer, or another agent) is classified: Epic / Project / Task / Subtask. System determines: is it new work or does it belong to an existing project? Existing project identification via CMDB (A43) relationships. Routes to correct team/agent. Integrates with BIMemoryBank (project docs), CMDB (A43), Change Management (A42), agent team size optimization (A49). |
| A51 | Reinforced Learning Feedback Cascade System | P1 | 3 | ⬜ Pending | Felix | When Vijay (or customer) gives feedback on completed work, the parent agent traces which sub-agent(s) did the work and routes feedback to the correct agent(s). Each agent scored per task: quality, accuracy, completeness, communication, timeliness. Scores stored in BI Taxonomy (A47) Outcome data. Low scores trigger Improvement Agent to create improvement proposal. Feedback loops into agent team size optimization (A49) — poorly performing agents get more oversight or replaced. Integrates with BI Taxonomy (A47), Review Hook (A45), Improvement Agents (A46), CMDB (A43). |
| A52 | AI Model Internals → Company Logic Research & Framework | P1 | 3 | ⬜ Pending | Felix | Research how AI models work internally (chain-of-thought reasoning, attention, system 1 vs 2 thinking, MoE routing, RLHF alignment, context windows, token efficiency, self-correction, reflection). Map each mechanism to company/agent-team analogues. Define company logic: how decisions are made (reasoning chain), what gets attention (attention mechanism), when to act fast vs slow (system 1/2), routing to specialists (MoE), alignment (values + feedback), context management. Outputs: framework document + operational principles for all agent teams. Integrates with BI Taxonomy (A47), Improvement Agents (A46), Process Maker (A48). |
| A53 | Agent Evaluation Methodology Research | P1 | 3 | ⬜ Pending | Felix | Research existing agent evaluation frameworks: AgentBench, GAIA, WebArena, Mint Arena, BFCL, SWE-Bench, GPQA, ToolBench, E2B Agent Evaluation. Identify which methodologies apply to Abzum's agent teams. Define Abzum-specific agent evaluation criteria: task completion rate, hallucination rate, tool-use accuracy, context management efficiency, escalation appropriateness, cost per task, time per task. Integrate evaluation results into BI Taxonomy (A47) Outcome data and Feedback Cascade (A51). Output: evaluation framework document + which frameworks to adopt. |
| A54 | Track Actual Token Usage Per Agent for BI Signals | P1 | 3 | ⬜ Pending | Felix | When storing BI signals (A47), capture actual token usage per agent per task: input tokens, output tokens, total tokens, cost in USD (using model pricing). Each BI signal entry includes token metadata. Enables: cost-per-agent analysis, ROI measurement, agent efficiency scoring, budget forecasting, identifying token-heavy agents or tasks. Integrates with BI Taxonomy (A47) Outcome data, Logging Architecture (A44), Feedback Cascade (A51), Agent Team Size Optimization (A49). |
| A55 | Customer Project Estimation & Job Costing System | P1 | 3 | ⬜ Pending | Felix | When a customer brings work: generate effort/cost estimate upfront. Estimate includes: platform/infrastructure cost (Azure, tools), token usage cost (per agent, per task, using model pricing), revision buffer (e.g., 20% of base cost), profit margin, other margins (licensing, compliance). After project completion: calculate actual cost vs estimate. Actual cost = platform fixed costs + token usage (actual) + revisions consumed + overheads. Track variance: estimate vs actual. Use BI Taxonomy (A47) Outcome data for historical cost benchmarks per task type. Integrates with BI Taxonomy (A47), Token Usage (A54), CMDB (A43), Project Planning (A50), Customer Comms (Comms Plan). |
| A56 | Estimation Variance → BI Signals Pipeline | P1 | 3 | ⬜ Pending | Felix | After each project closes, feed variance data to BI Taxonomy (A47) as signals: estimate vs actuals with full metadata (task type, client, agent team used, complexity, revision count, token cost, platform cost, time taken). BI system evaluates: was estimate accurate? Which task types are most underestimated? Agent productivity variance. Signals stored as Outcome data type in BI Taxonomy. Used by: Feedback Cascade (A51), Agent Size Optimization (A49), Project Planning (A50), Improvement Agents (A46). Closes the loop between costing and BI intelligence. |
| A57 | Define Enterprise Org Structure for Abzum | P1 | 1 | ⬜ Pending | Felix | Use `memory/ai-native-org-structure-2026-04-02.md` as reference. Adapt the 5-tier AI-native org framework to Abzum's context: small startup, AI-first, primarily AI agents. Define which tiers/phases apply now vs later. Define human roles per tier (initially Vijay does everything, then hires). Define how Abzum's existing agent teams (DevOps, Comms, Security, etc.) map to agent pools. Include: Customer Comms team (A46/A48), BIMemoryBank ops, Improvement Lead Agent, Process Maker Agent. Reference: `strategy/ai_native_org_structure.md` + full doc `memory/ai-native-org-structure-2026-04-02.md`. Output: `ABZUM_ORG_STRUCTURE.md`. |
| A72 | Research Best Jira / Mission Control Equivalent for AI Agents | P1 | 3 | ⬜ Pending | Felix | Evaluate existing task management and mission-control tools against Abzum's AI agent team requirements. Tools to assess: Linear, Jira, ClickUp, Plane, GitHub Projects, Height, Notion, custom-built. Evaluation criteria: (1) AI-native features — can non-human agents be assignees? (2) API extensibility for automated status updates from agent logs (A44). (3) Token cost / metadata fields per task. (4) Integration with CMDB (A43), BI Taxonomy (A47), Logging (A44), Feedback Cascade (A51). (5) Support for epic/project/task/subtask hierarchy. (6) Cost and self-hostability. (7) Kanban + Scrum hybrid support (A70). Output: decision brief scoring each tool, recommendation on build vs buy vs extend, and input to A58 (Mission Control build decision). Depends on: A43, A44, A47. Informs: A58. |
| A58 | Build Mission Control — Agent Task & Metadata Management System | P1 | 3 | ⬜ Pending | Felix | Build a mission-control-style task board (JIRA-like) for tracking all agent work. Every task has: task metadata (type, epic/project/task/subtask, status, assignee, priority), agent metadata (which agent(s), token usage, time taken, cost), work artifacts (outputs, files created, decisions made). Board tracks: active tasks per agent, task status pipeline (backlog → in-progress → review → done), full audit trail per task. Integrates with: BI Taxonomy (A47), Logging Architecture (A44), Token Usage (A54), Project Planning (A50), Estimation (A55). Built as part of CRM or standalone internal tool. Depends on: A72 (tool research). |
| A59 | Deploy Customer Isolation Architecture | P1 | 3 | ⬜ Pending | Felix | Design and build the infrastructure architecture for customer-specific isolation requirements across four tiers: Logical Separation (Tier 1), Dataset Isolation (Tier 2), Tenant Isolation (Tier 3), and Sovereign Isolation (Tier 4). Scope includes: Azure MCP tenant provisioning workflow, Tier 1 PostgreSQL RLS + Redis namespacing, Tier 2 schema-per-customer pattern, Tier 3 dedicated Resource Group + subscription Bicep templates, Tier 4 regional deployment with Azure Policy region lock, per-tenant credential management via Key Vault hierarchy, ByteRover per-customer context tree isolation, CMDB CI registration for all tenant infrastructure, Change Management integration for provisioning changes, and tenant decommissioning runbook. Depends on: A41 (BIMemoryBank), A42 (Change Management), A43 (CMDB), A44 (Agent Logging), A47 (BI Taxonomy), A50 (Project Planning), A54 (Token Usage), A55 (Estimation). Target: 2026-04-30. |
| A61 | CRM Build & Deploy Capability for Customers | P1 | 3 | ⬜ Pending | Felix | Build and operationalise Abzum's ability to deliver a CRM system to any customer — covering four delivery approaches (build-from-scratch, open-source CRM deployment, extend-existing-platform, and serverless CRM), a defined agent remote-maintenance model with scoped credentials and HITL controls, and a customer-facing delivery workflow from requirements gathering to ongoing support. Scope includes: CRM delivery framework with decision criteria, Twenty CRM deployment playbook (Railway + Azure App Service Docker), serverless CRM reference architecture (Next.js + Azure Functions + PostgreSQL serverless), agent access model with per-customer Key Vault hierarchy and RBAC permission table, CRM migration toolkit (HubSpot, Salesforce, Zoho, Pipedrive), CRM maintenance runbook with SLA targets, CRM estimation templates per delivery approach, customer discovery questionnaire, and CRM customer handover package. Depends on: A59 (Customer Isolation), A41 (BIMemoryBank), A43 (CMDB), A44 (Agent Logging), A50 (Project Planning), A54 (Token Usage), A55 (Estimation). Target: 2026-05-15. |
| A62 | Deploy Agent Watcher System | P1 | 3 | ⬜ Pending | Felix | Full meta-agent that monitors agent teams in real-time, detects failures, intervenes at configurable thresholds (self-correct → smarter agent → decompose → human escalation). Uses free APIs, integrates with A44/A45/A47/A51/A53/A54. Design document at memory/agent-watcher-system-2026-04-03.md. Depends on: A44 (Agent Logging), A45 (Review Hook), A53 (Agent Evaluation). |
| A64 | Bake Scripting Intelligence into Agents | P1 | 3 | ⬜ Pending | Felix | Design and implement script automation for Abzum's AI agents. Agents recognize repetitive tasks (3+ occurrences), write reusable scripts, deploy to shared library, call with minimal inputs. Dramatically reduces token usage per task (~99% savings). Includes: script registry (scripts/registry.json), agent-scripting-skill (SKILL.md), shared library in BIMemoryBank, integration with A44/A47/A49/A54/A45. 5 proof-of-concept scripts to start. Depends on: A44 (Agent Logging), A47 (BI Taxonomy), A54 (Token Usage). Document at memory/agent-scripting-automation-2026-04-03.md. Target: 2026-04-30. |
| A66 | Set Up Hermes Local Development & Testing Environment | P1 | 2 | ⬜ Pending | Vijay (hardware) + Felix (software/agents) | Set up local dev/test machine ("Hermes") with WSL2 Ubuntu, LMStudio, Docker. GPU-accelerated local model inference (Qwen 3.5 9B via LMStudio API). Agents build and test in Docker containers per customer project. GitHub for CI/CD: review → merge → deploy to production (Azure or customer). Integrates with BIMemoryBank Git Sync (A41), Agent Logging (A44), Ollama on VPS (lightweight CPU tasks). Hardware: AMD Ryzen 5 3600, 32GB RAM, NVIDIA RTX 2080. Network access for agents TBD (SSH or local API). |
| A67 | Design Multi-Tier Code Review System for Coder Agents | P1 | 3 | ⬜ Pending | Felix | Design 2-3 review system for all code from coder agents. Review 1: Code quality (style, linting, security). Review 2: Logic & correctness. Review 3: Architecture & objective alignment (Coder Manager with smarter model). Coder Manager role: smarter model (Claude), final quality gate before production, escalation to Vijay. Integrates with A45 (Review Hook), A53 (Agent Evaluation), A47 (BI Taxonomy), A51 (Feedback Cascade). |
| A68 | Define Agile Scrum Team Structure for AI Agent Projects | P1 | 3 | ⬜ Pending | Felix | Define fixed + dynamic team structure per project. Fixed: Scrum Master/Project Manager (define which), Reviewer, Watcher, Tester, Compliance Analyst. Dynamic: specialists added per discovery. Define Scrum Master vs PM difference. Agile workflow per project. Human oversight at sprint planning, scope change, new specialist, final delivery. Integrates with A67, A62, A45, A50, A42, A51. |
| A69 | Implement Dynamic Agent Provisioning System | P1 | 3 | ⬜ Pending | Felix | Build the dynamic provisioning system. Agents provisioned per project based on size/complexity. Fixed + dynamic roles. Agent Team Selector → Provisioning Agent → CMDB registration → Active team → Deprovisioning. Phases: manual (now) → semi-automated → fully automated. Integrates with A43/CMDB, A49, A50, A54, A62, A67, A68, A45, A51, A42. |
| A70 | Define Hybrid Project Management Methodology for AI Agent Teams | P1 | 3 | ⬜ Pending | Felix | Define Kanban as default project management model for AI agent teams. Kanban: continuous flow, WIP limits (max 3 tasks per agent), visual queue (Backlog → In Progress → Review → Done), priority-based pull. Scrum for enterprise projects: weekly planning cycles, automated 4-hour standups, retrospectives logged to BI Taxonomy. Waterfall for regulatory/compliance projects with hard approval gates. Task budget tracking (token cost per task). Integrates with A50 (Project Planning), A62 (Watcher), A67 (Review), A68 (Scrum Team Structure), A47 (BI Taxonomy). | A50, A62, A67, A68, A47 |
| A71 | Implement Two-Tier Agent Architecture (Paperclip + Project Containers) | P1 | 2-3 | ⬜ Pending | Felix | Implement two-tier agent architecture. Tier 1 (Paperclip container): global/meta agents — Orchestrator, Router, Planner, Strategy, Compliance, Cost-optimizer, Memory Manager, Project Allocator, RBAC, Provisioning, Monitoring/Audit. Tier 2 (per-project containers): Coder, Reviewer, Tester, Documentation, Scrum Master, domain-specific agents. Each project = isolated container with project-specific context, secrets (Doppler), tools, and memory. Integrate with: A43 (CMDB), A49 (Agent Size), A59 (Customer Isolation), Hermes (A66), BIMemoryBank (A41), A42 (Change Mgmt). Architecture validated by Vijay as enterprise-grade. | A41, A42, A43, A49, A59, A66 |
| ID | Action | Priority | Status | Owner |
|---|---|---|---|---|
| A25 | Document agent spawning procedure | P1 | ⬜ Pending | Felix |
| A26 | Finalize skill matrix per agent | P2 | ⬜ Pending | Felix |
| A27 | Implement Superpowers workflow | P2 | ⬜ Pending | Felix |
| A28 | Decide on first human hire | P1 | ⬜ Pending | Vijay |
| A29 | Plan Account Manager hiring | P2 | ⬜ Pending | Vijay |

### Phase 4 — Go-To-Market
| ID | Action | Priority | Status | Owner |
|---|---|---|---|---|
| A30 | Decide CRM build vs buy | P1 | 🔴 Decision Required | Vijay |
| A31 | Build CRM MVP OR deploy SaaS CRM | P1 | ⬜ Pending | Vijay |
| A32 | Configure Comms Pipeline Agent | P1 | ⬜ Pending | Felix |
| A33 | Create pre-approved message templates | P2 | ⬜ Pending | Felix |
| A34 | Create proposal template | P2 | ⬜ Pending | Felix |
| A35 | Contact first prospect | P1 | ⬜ Pending | Vijay |

### Phase 5 — First Project
| ID | Action | Priority | Status | Owner |
|---|---|---|---|---|
| A36 | Sign first client | P1 | ⬜ Pending | Vijay |
| A37 | Define first project scope | P1 | ⬜ Pending | Vijay |
| A38 | Deploy agent team for first project | P1 | ⬜ Pending | Felix |
| A39 | Track project in CRM | P2 | ⬜ Pending | Felix |
| A40 | Define quality gate for deliverable | P2 | ⬜ Pending | Vijay |

---

## Completed Items

| ID | Action | Completed | Owner |
|---|---|---|---|
| A00 | Create AI Company Master Plan | 2026-04-01 | Felix |
| A00 | Integrate MCRA into Security Framework | 2026-04-01 | Felix |
| A00 | Create Access Control Framework | 2026-04-01 | Felix |
| A00 | Research backup & restore strategy | 2026-04-01 | Felix |
| A00 | Create Customer Comms Plan | 2026-04-01 | Felix |
| A00 | Restructure ByteRover context tree | 2026-04-01 | Felix |
| A00 | Create work tree in context tree | 2026-04-01 | Felix |
| A60 | Identify Customer Use Cases for Abzum | 2026-04-03 | Felix |
| A63 | Set Up Local Ollama Server | 2026-04-03 | Felix |
| A64 | Bake Scripting Intelligence into Agents | 2026-04-03 | Felix |
| A65 | Build Customer Data Compliance Intake System | 2026-04-03 | Felix |

---

## How to Add an Item

When adding a new action item:
1. Assign next sequential ID (A41, A42, etc.)
2. Tag with Priority: P1 (critical), P2 (important), P3 (nice to have)
3. Tag with Phase: 0, 1, 2, 3, 4, or 5
4. Tag with Status: `⬜ Pending`, `🔵 In Progress`, `🔴 Decision Required`, `✅ Done`
5. Note any dependencies (what must be done first)
6. Assign Owner: `Vijay` or `Felix`

## How to Update an Item

- When a decision is made: move to `decided.md`
- When work starts: move from `backlog.md` to `active.md`, update status to `🔵 In Progress`
- When work completes: mark `✅ Done` with date
- When a blocker is hit: move to `work/blockers/_index.md`
