---
id: work-phases
title: Phases to First Revenue
summary: 5-phase roadmap from foundation to first revenue
tags: [work, plan, phases]
updated: 2026-05-09
load_priority: 60
load_lane: context
status: active
---
# Planning Phases

> **What:** The 5 phases of building Abzum, from planning to first revenue
> **Status:** Updated as phases are completed

---

## Phase 0 — Pre-Foundation 🔴 ACTIVE
**What:** Establish legal entity, finances, and strategic clarity before any work begins.

| Item | Priority | Status | Owner |
|---|---|---|---|
| Confirm Abzum NZ Ltd registered | P1 | ⬜ Pending | Vijay |
| Business bank account | P1 | ⬜ Pending | Vijay |
| Monthly operating budget defined | P1 | ⬜ Pending | Vijay |
| AI tool budget confirmed ($30/mo?) | P1 | ⬜ Pending | Vijay |
| Infrastructure budget confirmed | P1 | ⬜ Pending | Vijay |
| First customer identified | P1 | ⬜ Pending | Vijay |
| What Abzum sells (service definition) | P1 | ⬜ Pending | Vijay |
| Pricing model defined | P1 | ⬜ Pending | Vijay |

**Exit Criteria:** Vijay has answered all 6 blocker questions. Legal entity exists. Bank account open.

---

## Phase 1 — Governance & Policy 🔴 WAITING ON VIJAY
**What:** Establish the rules, policies, and operating principles before client work.

| Item | Priority | Status | Owner |
|---|---|---|---|
| Access Control Framework finalized | P1 | 🔴 Decision Required | Vijay |
| HITL approval triggers defined | P1 | 🔴 Decision Required | Vijay |
| L3/L4 data boundaries defined | P1 | 🔴 Decision Required | Vijay |
| Comms Plan approved | P1 | 🔴 Decision Required | Vijay |
| NDA template drafted | P2 | ⬜ Pending | Felix |
| Privacy policy drafted | P2 | ⬜ Pending | Felix |
| Escalation matrix finalized | P2 | ⬜ Pending | Vijay |

**Depends on:** Phase 0 completion

---

## Phase 2 — Technical Infrastructure 🔴 PARTIAL
**What:** Build the systems that let AI agents operate.

| Item | Priority | Status | Owner |
|---|---|---|---|
| Azure account set up | P1 | ⬜ Pending | Vijay |
| Azure AU East region provisioned | P1 | ⬜ Pending | Vijay |
| @abzum.com email configured | P1 | ⬜ Pending | Vijay |
| OpenClaw production config | P1 | 🔵 In Progress | Felix |
| Secrets management (Key Vault) | P2 | ⬜ Pending | Vijay |
| CI/CD pipeline for agents | P2 | ⬜ Pending | Felix |
| ByteRover cloud sync configured | P2 | ⬜ Pending | Felix |
| Backup infrastructure (GitHub + Azure Blob) | P2 | ⬜ Pending | Vijay |

**Depends on:** Azure account setup

---

## Phase 3 — People & Team 🔴 PENDING
**What:** Define and build the AI agent team and plan human hiring.

| Item | Priority | Status | Owner |
|---|---|---|---|
| 5 core agent roles finalized | P1 | ✅ Done | Felix |
| Agent spawning procedure documented | P1 | ⬜ Pending | Felix |
| Skill matrix per agent finalized | P2 | ✅ Drafted | Felix |
| Superpowers workflow implemented | P2 | ⬜ Pending | Felix |
| First human hire decision | P1 | ⬜ Pending | Vijay |
| Account Manager hiring plan | P2 | ⬜ Pending | Vijay |
| ByteRover context tree finalized | P1 | ✅ Done | Felix |

**Depends on:** Phase 0 (hiring budget)

---

## Phase 4 — Go-To-Market 🔴 PENDING
**What:** Get first customers.

| Item | Priority | Status | Owner |
|---|---|---|---|
| First service offering defined | P1 | ⬜ Pending | Vijay |
| CRM MVP built or deployed | P1 | ⬜ Pending | Vijay decision |
| Comms Pipeline Agent configured | P1 | ⬜ Pending | Felix |
| Pre-approved message templates | P2 | ⬜ Pending | Felix |
| Proposal template created | P2 | ⬜ Pending | Felix |
| First prospect contacted | P1 | ⬜ Pending | Vijay |

**Depends on:** Phase 0 + Phase 2 (email)

---

## Phase 5 — First Project 🔴 PENDING
**What:** Execute first paid work.

| Item | Priority | Status | Owner |
|---|---|---|---|
| First client signed | P1 | ⬜ Pending | Vijay |
| Project scope defined | P1 | ⬜ Pending | Vijay |
| Agent team deployed for project | P1 | ⬜ Pending | Felix |
| Project tracked in CRM | P2 | ⬜ Pending | Felix |
| Quality gate defined | P2 | ⬜ Pending | Vijay |

**Depends on:** Phase 4

---

## Phase Progression

```
Phase 0 (Pre-Foundation)
       ↓ [Vijay answers 6 blocker questions]
Phase 1 (Governance & Policy)
       ↓ [Policies approved]
Phase 2 (Infrastructure)
       ↓ [Cloud + tools ready]
Phase 3 (People & Team)
       ↓ [Agents + hiring plan ready]
Phase 4 (Go-To-Market)
       ↓ [First customer signed]
Phase 5 (First Project)
       ↓ [First revenue generated]
```
