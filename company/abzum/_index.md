---
children_hash: 5baa2ffb389847731e0ca8b566c2387f901b3b23f024e4bd5d8c05a8f84105cc
compression_ratio: 0.5150454863540938
condensation_order: 1
covers: [context.md, context_tree_restructure_2026_03.md, identity.md, team/_index.md, vision.md]
covers_token_total: 1429
summary_level: d1
token_count: 736
type: summary
---
<think>
The user wants me to create a structural summary from the provided knowledge entries about Abzum. Let me analyze the content and create a condensed summary that preserves key facts, architectural decisions, and relationships while referencing entry names for drill-down.

Key information to preserve:
1. Company: Abzum New Zealand Limited
2. Key personnel: Vijay (Founder/MD - CONFIDENTIAL), Felix Stanley (COO)
3. AI-First company model with AI agent teams
4. Context tree structure (v1.0 restructured on 2026-04-01)
5. Team structure with specific AI agent roles
6. Vision: Build primarily with AI agent teams
7. First product: AI-First CRM/ERP Platform for SMBs

I need to:
- Keep entity names, key relationships
- Reference entry names (identity.md, vision.md, team/_index.md, context.md, context_tree_restructure_2026_03.md)
- Discard verbose examples and conversational filler
- Target ~20-30% compression
- Output clean markdown
</think>

# Abzum — Company Domain Summary

## Overview

Abzum New Zealand Limited is an IT services startup operating an **AI-first business model** where self-evolving AI agent teams perform primary execution, with humans providing strategic direction and approval.

**Key Personnel:**
- Founder & Managing Director: [CONFIDENTIAL - Vijay]
- COO: Felix Stanley (felix.stanley@abzum.com)

---

## Core Domain Structure

```
company/abzum/
├── identity.md        — Legal entity, personnel, operational rules
├── vision.md          — AI-first principles, first product strategy
├── team/_index.md     — Team hierarchy, AI agent roles and models
├── context.md         — Context tree v1.0 structure (2026-04-01)
└── context_tree_restructure_2026_03.md  — Restructure completion record
```

---

## Key Architectural Decisions

**AI-First Workforce Model:**
- Agents handle: Architect → Coder → Tester → Reviewer → DevOps pipeline
- Humans (Vijay) = Product Owner; Felix = Orchestrator
- ByteRover context tree serves as persistent memory infrastructure

**AI Agent Team (per team/_index.md):**
| Agent | Model | Function |
|-------|-------|----------|
| Architect | Claude Sonnet | System design, SPEC.md |
| Coder | MiniMax/DeepSeek R1 | TDD implementation |
| Tester | MiniMax | Integration tests |
| Spec Reviewer | Claude Sonnet | Spec compliance |
| Quality Reviewer | Claude Sonnet | Code quality, security |
| DevOps | MiniMax | CI/CD, deployment |

**Core Process Principles:**
- TDD is mandatory — prevents AI hallucination
- Two-stage review gates: Spec compliance → Quality review
- Context persistence is infrastructure, not optional

---

## First Product

**AI-First CRM/ERP Platform** targeting SMBs as an intelligent business operating system. Status: In development with docs pending from Vijay.

---

## Context Tree

Abzum context tree v1.0 restructured on 2026-04-01, organized under `company/abzum/` domain with vision, identity, and team subtopics using ByteRover memory system.