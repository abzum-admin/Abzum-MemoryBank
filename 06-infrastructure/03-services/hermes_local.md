---
id: ops-hermes-local
title: Hermes Local Environment
summary: Local Hermes dev/test environment (A66)
tags: [services, hermes, dev]
updated: 2026-05-09
load_priority: 40
load_lane: reference
status: active
---
# Hermes — Local Development & Testing Environment

> **Machine name:** Hermes
> **Owner:** Vijay (hardware) + Felix (software/agents)
> **Status:** Planning

---

## Hardware

| Component | Spec |
|---|---|
| CPU | AMD Ryzen 5 3600 (6-core, 12-thread) |
| RAM | 32GB DDR4 |
| GPU | NVIDIA RTX 2080 (8GB VRAM) |
| Form factor | Desktop / Workstation |

---

## OS & Software Stack

| Layer | Details |
|---|---|
| Host OS | Windows |
| Dev Environment | WSL2 Ubuntu (to be set up) |
| Local Model Inference | LMStudio — serves Qwen 3.5 9B (or similar) via local REST API |
| Container Runtime | Docker — per-customer isolated build/test environments |
| Model Access | LMStudio local API (localhost or LAN, TBD) |

---

## Purpose

Hermes is Abzum's **GPU-accelerated development and testing environment**.

| Use Case | Description |
|---|---|
| Build & Test | Agents build customer applications in Docker containers on Hermes |
| GPU Workloads | Local model inference for development/testing (Qwen 3.5 9B via LMStudio) |
| Pre-production Validation | Validate changes before deploying to Azure/production |
| CI/CD Integration | GitHub Actions triggers builds/tests on Hermes before merge |

---

## Role in Abzum Stack

```
┌─────────────────────────────────────────────┐
│            Ollama on VPS (Lailani)           │
│     Lightweight CPU tasks, quick queries     │
│         Small models (llama3.2, etc.)        │
└─────────────────────────────────────────────┘
                      +
┌─────────────────────────────────────────────┐
│        Hermes (Local — Vijay's machine)      │
│   GPU-heavy build/test workloads, LMStudio   │
│     Qwen 3.5 9B via local model API         │
│   Docker containers per customer project     │
│     GitHub → review → merge → deploy         │
└─────────────────────────────────────────────┘
                      +
┌─────────────────────────────────────────────┐
│              Azure (Production)              │
│      Azure OpenAI, App Service, Blob, etc.   │
└─────────────────────────────────────────────┘
```

**Rule of thumb:** VPS Ollama for fast/lightweight; Hermes for GPU-accelerated build/test/dev.

---

## Agent Access (TBD)

How agents connect to Hermes — **to be determined**:
- SSH into WSL2 Ubuntu on Vijay's machine?
- LMStudio API via local network?
- OpenClaw node agent on Hermes?
- Direct IP + port forwarding?

**Decision required:** Felix + Vijay to determine access architecture.

---

## CI/CD Pipeline (GitHub-First)

```
Developer/Agent → GitHub PR → Code Review → Merge → 
  → GitHub Actions (Hermes build/test runner) → 
  → Deploy to Azure or customer environment
```

Hermes acts as the **build and test agent** in the GitHub Actions runner chain.

---

## Security Considerations (TBD)

- Who has SSH/API access to Hermes?
- Is Hermes behind a NAT/firewall on Vijay's home network?
- Docker container network isolation per customer
- Secrets management for Hermes (local Key Vault? env vars?)
- Antivirus/endpoint protection on Windows host

**To be defined as part of A66 execution.**

---

## Dependencies

- **A41** — BIMemoryBank Git Sync: Hermes context/scripts synced via GitHub
- **A44** — Agent Logging: All Hermes build/test activity logged centrally
- **A63** — Local Ollama Server: Hermes supplements Ollama on VPS

---

## Action Reference

- **Action A66:** Set Up Hermes Local Development & Testing Environment

---

<!-- backlinks-start -->

## Referenced by

- [Plan Of Action](../../07-research/hermes-hindsight/plan_of_action.md)

<!-- backlinks-end -->
