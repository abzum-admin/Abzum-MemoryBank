<!-- generated, do not edit — see _tools/gen_work_views.py -->

# Work Registry

Source of truth: `work/registry.json` (149 entries)

## Actions

| ID | Title | Pri | Phase | Status | Owner | Depends |
|---|---|---|---|---|---|---|
| A01 | Get Vijay to answer 6 blocker decisions (P01-P06) | P1 | — | active | Vijay | — |
| A02 | Confirm Abzum NZ Ltd is registered | P1 | — | pending | Vijay | — |
| A03 | Open business bank account | P1 | — | pending | Vijay | — |
| A04 | Define monthly operating budget | P1 | — | pending | Vijay | — |
| A05 | Identify first customer | P1 | — | pending | Vijay | — |
| A06 | Define what Abzum sells (service definition) | P1 | — | pending | Vijay | — |
| A07 | Define pricing model | P1 | — | pending | Vijay | — |
| A08 | Set AI tool budget (~$30/mo?) | P1 | — | pending | Vijay | — |
| A09 | Set infrastructure budget (~$150-300/mo?) | P1 | — | pending | Vijay | — |
| A10 | Finalize Access Control Framework | P1 | 1 | decision_required | Vijay | — |
| A11 | Define HITL approval triggers | P1 | 1 | decision_required | Vijay | — |
| A12 | Define L3/L4 data boundaries | P1 | 1 | decision_required | Vijay | — |
| A13 | Approve Customer Comms Plan | P1 | 1 | decision_required | Vijay | — |
| A14 | Draft NDA template | P2 | 1 | pending | Felix | — |
| A15 | Draft privacy policy | P2 | 1 | pending | Felix | — |
| A16 | Set up Azure account | P1 | 2 | pending | Vijay | — |
| A17 | Configure @abzum.com email | P1 | 2 | pending | Vijay | — |
| A18 | Provision Azure AU East region | P1 | 2 | pending | Vijay | ['A16'] |
| A19 | Configure OpenClaw production settings | P1 | 2 | blocked | Felix | ['B02'] |
| A20 | Set up Azure Key Vault | P2 | 2 | pending | Vijay | ['A16'] |
| A21 | Set up CI/CD for agent deployments | P2 | 2 | pending | Felix | — |
| A22 | Configure ByteRover cloud sync | P2 | 2 | blocked | Felix | ['B02'] |
| A23 | Set up backup (GitHub private repos) | P2 | 2 | pending | Vijay | — |
| A24 | Set up backup (Azure Blob cold storage) | P2 | 2 | pending | Vijay | ['A16'] |
| A25 | Document agent spawning procedure | P1 | 3 | blocked | Felix | ['P01', 'P02', 'P03', 'P04', 'P05', 'P06'] |
| A26 | Finalize skill matrix per agent | P2 | 3 | pending | Felix | — |
| A27 | Implement Superpowers workflow | P2 | 3 | pending | Felix | — |
| A28 | Decide on first human hire | P1 | 3 | pending | Vijay | — |
| A29 | Plan Account Manager hiring | P2 | 3 | pending | Vijay | — |
| A30 | Decide CRM build vs buy | P1 | 4 | decision_required | Vijay | — |
| A31 | Build CRM MVP OR deploy SaaS CRM | P1 | 4 | pending | Vijay | ['A30'] |
| A32 | Configure Comms Pipeline Agent | P1 | 4 | blocked | Felix | ['A30'] |
| A33 | Create pre-approved message templates | P2 | 4 | pending | Felix | — |
| A34 | Create proposal template | P2 | 4 | pending | Felix | — |
| A35 | Contact first prospect | P1 | 4 | pending | Vijay | ['A05'] |
| A36 | Sign first client | P1 | 5 | pending | Vijay | ['A35'] |
| A37 | Define first project scope | P1 | 5 | pending | Vijay | ['A36'] |
| A38 | Deploy agent team for first project | P1 | 5 | pending | Felix | ['A37'] |
| A39 | Track project in CRM | P2 | 5 | pending | Felix | ['A31'] |
| A40 | Define quality gate for deliverable | P2 | 5 | pending | Vijay | — |
| A41 | Deploy BIMemoryBank Git Sync Architecture | P1 | 2 | in_progress | Vijay+Felix | — |
| A42 | Deploy Centralised Change Management System | P1 | 2 | pending | Felix | ['A41'] |
| A43 | Deploy Configuration Management Database (CMDB) | P1 | 2 | pending | Felix | ['A42'] |
| A44 | Design and Deploy Agent Logging Architecture | P1 | 2 | pending | Felix | ['A42', 'A43'] |
| A45 | Implement Sub-Agent Review Hook / Review Agent | P1 | 1 | pending | Felix | — |
| A46 | Deploy Continuous Improvement System (Improvement Agents + Idea Board) | P1 | 3 | pending | Felix | ['A41', 'A43', 'A44'] |
| A47 | Build Autonomous BI & WorkIQ Intelligence Taxonomy | P1 | 3 | pending | Felix | ['A41'] |
| A48 | Deploy Process Maker Agent | P1 | 3 | pending | Felix | ['A46', 'A47', 'A42'] |
| A49 | Optimize Agent Team Size Based on Project Scope (Cost Optimization) | P1 | 3 | pending | Felix | ['A47', 'A43'] |
| A50 | Project Planning & Management Intake System | P1 | 3 | pending | Felix | ['A43', 'A42', 'A49'] |
| A51 | Reinforced Learning Feedback Cascade System | P1 | 3 | pending | Felix | ['A45', 'A46', 'A47', 'A43'] |
| A52 | AI Model Internals -> Company Logic Research & Framework | P1 | 3 | pending | Felix | ['A46', 'A47', 'A48'] |
| A53 | Agent Evaluation Methodology Research | P1 | 3 | pending | Felix | ['A47', 'A51'] |
| A54 | Track Actual Token Usage Per Agent for BI Signals | P1 | 3 | pending | Felix | ['A44', 'A47', 'A51', 'A49'] |
| A55 | Customer Project Estimation & Job Costing System | P1 | 3 | pending | Felix | ['A47', 'A54', 'A43', 'A50'] |
| A56 | Estimation Variance -> BI Signals Pipeline | P1 | 3 | pending | Felix | ['A47', 'A55', 'A49', 'A50', 'A46'] |
| A57 | Define Enterprise Org Structure for Abzum | P1 | 1 | pending | Felix | — |
| A58 | Build Mission Control - Agent Task & Metadata Management System | P1 | 3 | pending | Felix | ['A72'] |
| A59 | Deploy Customer Isolation Architecture | P1 | 3 | pending | Felix | ['A41', 'A42', 'A43', 'A44', 'A47', 'A50', 'A54', 'A55'] |
| A60 | Identify Customer Use Cases for Abzum | P1 | 1 | done | Felix | — |
| A61 | CRM Build & Deploy Capability for Customers | P1 | 3 | pending | Felix | ['A59', 'A41', 'A43', 'A44', 'A50', 'A54', 'A55'] |
| A62 | Deploy Agent Watcher System | P1 | 3 | pending | Felix | ['A44', 'A45', 'A53'] |
| A63 | Set Up Local Ollama Server | P1 | 2 | done | Felix | — |
| A64 | Bake Scripting Intelligence into Agents | P1 | 3 | done | Felix | ['A44', 'A47', 'A54'] |
| A65 | Build Customer Data Compliance Intake System | P1 | 3 | done | Felix | ['A43', 'A50', 'A59', 'A61'] |
| A66 | Set Up Hermes Local Development & Testing Environment | P1 | 2 | pending | Vijay+Felix | ['A41', 'A44'] |
| A67 | Design Multi-Tier Code Review System for Coder Agents | P1 | 3 | pending | Felix | ['A45', 'A47', 'A51'] |
| A68 | Define Agile Scrum Team Structure for AI Agent Projects | P1 | 3 | pending | Felix | ['A67', 'A62', 'A45', 'A50', 'A42', 'A51'] |
| A69 | Implement Dynamic Agent Provisioning System | P1 | 3 | pending | Felix | ['A43', 'A49', 'A50', 'A54', 'A62', 'A67', 'A68', 'A45', 'A51', 'A42'] |
| A70 | Define Hybrid Project Management Methodology for AI Agent Teams | P1 | 3 | pending | Felix | ['A50', 'A62', 'A67', 'A68', 'A47'] |
| A71 | Implement Two-Tier Agent Architecture (Paperclip + Project Containers) | P1 | 2-3 | pending | Felix | ['A41', 'A42', 'A43', 'A49', 'A59', 'A66'] |
| A72 | Research Best Jira / Mission Control Equivalent for AI Agents | P1 | 3 | pending | Felix | ['A43', 'A44', 'A47'] |

## Blockers

| ID | Title | Blocks | Owner | Status |
|---|---|---|---|---|
| B01 | Vijay has not answered 6 blocker decisions (P01-P06) | Phase 0 completion, all downstream phases | Vijay | open |
| B02 | Azure account not set up | Phase 2 infrastructure, Entra ID, Key Vault, all cloud work | Vijay | open |
| B03 | @abzum.com email not configured | External comms, customer-facing communication, CRM | Vijay | open |
| B04 | First customer not identified | Phase 4 (Go-To-Market), Phase 5 (First Project), revenue | Vijay | open |

## Pending Decisions

| ID | Decision | Blocks | Urgency | Owner |
|---|---|---|---|---|
| P01 | Who approves L3/L4 actions? (Vijay only, or delegated to Head of Customer Relations?) | Access Control implementation, Agent authority levels, HITL triggers | high | Vijay |
| P02 | First customer - who is it, what are they buying? | Go-to-market, pricing, first project scope, first revenue | high | Vijay |
| P03 | Azure account - who sets it up, who pays? | Infrastructure, Entra ID, Key Vault, all cloud services | high | Vijay |
| P04 | Company email - @abzum.com via what provider? | External comms, CRM integration, brand | high | Vijay |
| P05 | First human hire - when, who, what role? | Customer Comms (need Account Manager), Phase 3 | medium | Vijay |
| P06 | CRM build vs buy - can we delay this? | Customer Comms Phase 2 implementation | medium | Vijay |

## Decided

| ID | Decision | Date | Rationale | Owner |
|---|---|---|---|---|
| D01 | Use OpenClaw as primary AI agent platform | 2026-04-01 | Already configured, flexible, Telegram integration | Felix |
| D02 | Use MiniMax M2.7 as default model (80% of tasks) | 2026-04-01 | Cost-effective for simple tasks | Felix |
| D03 | Use Claude Sonnet for architecture/security/complex work | 2026-04-01 | Reserved for high-value reasoning tasks | Felix |
| D04 | Superpowers TDD workflow as standard process | 2026-04-01 | Evidence-based, reduces hallucinations | Felix |
| D05 | ByteRover as memory/knowledge system | 2026-04-01 | Already installed, context tree structured | Felix |
| D06 | MCRA framework for AI security operations | 2026-04-01 | Comprehensive, Microsoft-backed, AI-agent specific | Felix |
| D07 | Azure as primary cloud provider | 2026-04-01 | AU East region, Entra Agent ID, compliance inheritance | Felix |
| D08 | Weaviate Cloud for vector/RAG (AU region) | 2026-04-01 | Free tier, hybrid search, good AU support | Felix |
| D09 | PostgreSQL (Azure Database) for transactional data | 2026-04-01 | Battle-tested, pgvector for embeddings | Felix |
| D10 | SOC 2 Type I as first compliance certification | 2026-04-01 | Required for enterprise deals, faster than ISO 27001 | Felix |
| D11 | CRM: Build (Next.js + PostgreSQL) over Buy | 2026-04-01 | Native agent integration, full data ownership | Vijay |
| D12 | Gatekeeper comms model - Comms Pipeline Agent | 2026-04-01 | Brand, compliance, and relationship protection | Vijay |
| D13 | Shared Comms Pipeline Agent until 10+ customers | 2026-04-01 | Simplicity before scale | Vijay |
| D14 | Work tree structure in ByteRover for planning | 2026-04-01 | Living document for actions, decisions, blockers | Vijay |
| D15 | Context tree access: Vijay L4, Team L2 | 2026-04-01 | Clearance model from Access Control Framework | Vijay |

## Use Cases

| ID | Use Case | Description |
|---|---|---|
| UC-01 | Custom CRM Build | Anchor product. ~$15K, 2-4 week delivery. Positioning: intelligent business operating system. |
| UC-02 | CRM Migration | Natural urgency due to hard deadlines; customers pay to hit deadlines. |
| UC-05 | Customer Onboarding Automation | Referenced in master plan top 5. |
| UC-06 | Business Process Automation (Operations) | Near-universal SMB pain point. |
| UC-07 | Business Process Automation (Sales) | Subset of BPA family. |
| UC-09 | Business Process Automation (Finance) | Subset of BPA family. |
| UC-16 | System Integration | Addresses data silos across 5-15 SMB tools; API work suits AI agents. |
| UC-20 | AI Chatbot/Assistant | Visible/demoable; lower-cost entry; demonstrates AI-first differentiation. |

## Operations Log

| ID | Date | Action | Owner | Significance |
|---|---|---|---|---|
| O01 | 2026-04-01 | BIMemoryBank Architecture received | Vijay | Foundation for centralized BI memory bank |
| O02 | 2026-04-01 | BIMemoryBank Deployment Guide received | Vijay | Ready for deployment |
| O03 | 2026-04-01 | BIMemoryBank GitHub repo created | Vijay | Infrastructure in place |
| O04 | 2026-04-01 | BIMemoryBank deployment staged | Felix | Execution begins |
| O05 | 2026-04-01 | Work tree created in ByteRover | Felix | Living planning system operational |
| O06 | 2026-04-01 | Context tree restructured | Felix | ByteRover organized and clean |
| O07 | 2026-04-01 | AI Company Master Plan created | Felix | Core planning document |
| O08 | 2026-04-01 | MCRA Security Framework integrated | Felix | Security foundation |
| O09 | 2026-04-01 | Access Control Framework created | Felix | Governance policy foundation |
| O10 | 2026-04-01 | Customer Comms Plan created | Felix | External comms policy |
| O11 | 2026-04-01 | Backup & Restore Strategy researched | Felix | Data protection plan ($0/mo) |
| O13 | 2026-04-01 | Change Management System task added (A42) | Vijay | Ensures dependencies tracked before production deployments |
| O14 | 2026-04-01 | CMDB task added (A43) | Vijay | Single source of truth for all IT assets |
| O15 | 2026-04-01 | Agent Logging Architecture task added (A44) | Vijay | Centralised logging for all agent activity |
| O16 | 2026-04-01 | Sub-Agent Review Hook task added (A45) | Vijay | Mandatory parent review before delivery |
| O17 | 2026-04-01 | Delegation rule reinforced | Felix | Operational discipline established |
| O18 | 2026-04-01 | Continuous Improvement System task added (A46) | Vijay | R&D/innovation pipeline embedded in agent team structure |
| O19 | 2026-04-01 | BI & WorkIQ Intelligence Taxonomy task added (A47) | Vijay | 9-type intelligence taxonomy. Foundation for AI-first BI. |
| O20 | 2026-04-01 | Process Maker Agent task added (A48) | Vijay | Centralized workflow creation/enforcement |
| O21 | 2026-04-01 | Agent Team Size Optimization task added (A49) | Vijay | Cost-per-task rubrics for agent sizing |
| O22 | 2026-04-01 | Project Planning & Management task added (A50) | Vijay | Epic/Project/Task/Subtask classification |
| O23 | 2026-04-01 | Reinforced Learning Feedback Cascade task added (A51) | Vijay | Human feedback -> agent improvement |
| O24 | 2026-04-01 | AI Model Internals -> Company Logic task added (A52) | Vijay | Map CoT/MoE/RLHF to org operations |
| O25 | 2026-04-01 | Agent Evaluation Methodology task added (A53) | Vijay | AgentBench/GAIA frameworks |
| O26 | 2026-04-02 | Token Usage Tracking task added (A54) | Vijay | Cost-per-agent analysis with USD metrics |
| O27 | 2026-04-02 | Project Estimation & Job Costing task added (A55) | Vijay | Upfront estimates + variance tracking |
| O28 | 2026-04-02 | Estimation Variance BI Signals task added (A56) | Vijay | Closes loop between costing and BI |
| O29 | 2026-04-02 | AI-Native Org Structure framework received + filed | Vijay | Blueprint for 5-tier AI-native model |
| O30 | 2026-04-03 | Mission Control Task Board task added (A58) | Vijay | JIRA-like task board for all agent work |
| O31 | 2026-04-03 | Customer Isolation Infrastructure task added (A59) | Felix | Per-customer tenant provisioning, 4 tiers |
| O32 | 2026-04-03 | Customer Use Cases Research completed (A60) | Felix | 26 use cases across 6 categories. Top 5 selected. |
| O33 | 2026-04-03 | CRM Build & Deploy Architecture defined (A61) | Felix | Four CRM delivery approaches, agent maintenance model |
| O34 | 2026-04-03 | Agent Watcher System designed (A62) | Felix | Meta-agent for real-time monitoring + 4-level escalation |
| O35 | 2026-04-03 | Local Ollama Server set up (A63 done) | Felix | Ollama v0.20.0 on VPS; llama3.2 model |
| O36 | 2026-04-03 | Agent Scripting Intelligence designed (A64) | Felix | ~99% token savings via reusable scripts |
| O37 | 2026-04-03 | Customer Data Compliance Intake System designed (A65) | Felix | GDPR/HIPAA/PCI/SOC2/ISO27001 compliance gate |
| O38 | 2026-04-03 | BIMemoryBank Git Sync set up | Felix | Context tree synced to GitHub |
| O39 | 2026-04-03 | Email setup completed | Vijay | felix@abzum.com via Brevo SMTP + Cloudflare Routing |
| O40 | 2026-04-04 | Hermes Local Dev Environment task added (A66) | Vijay | WSL2 + LMStudio + Docker GPU stack |
| O41 | 2026-04-04 | Multi-Tier Code Review System task added (A67) | Felix | 2-3 review system for coder agents |
| O42 | 2026-04-04 | Agile Scrum Team Structure task added (A68) | Felix | Fixed + dynamic team structure per project |
| O43 | 2026-04-04 | Dynamic Agent Provisioning Plan created (A69) | Felix | Agent Kubernetes vision: right agents/size/cost/time |
| O44 | 2026-04-04 | Hybrid Project Management Methodology defined (A70) | Felix | Kanban default + Scrum for enterprise + Waterfall for compliance |
| O45 | 2026-04-05 | Two-Tier Agent Architecture proposal received (A71) | Vijay | Paperclip global + per-project containers; enterprise-grade |
