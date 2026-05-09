---
id: exec-capabilities
title: Agent Capabilities
summary: AI agent capability framework
tags: [execution, capabilities]
updated: 2026-05-09
load_priority: 50
load_lane: context
status: active
---
# AI Agent Capabilities Framework — Abzum
**Version 1.0 — 2026-04-01**

---

## 1. Eight Core Capabilities

### 1.1 Planning
Decompose goals into ordered sub-tasks with clear success criteria.

| Basic Agent | Capable Agent |
|---|---|
| Jumps straight to code | Decomposes into 2-5 min tasks with file paths + expected outputs |
| One monolithic task | Creates TASK_TRACKER.md |
| No rollback plan | Includes verification steps + acceptance criteria per task |

**Superpowers discipline:** Brainstorming → Design Approval → Writing Plans → Execute → Review → Finish. Each gate mandatory.

### 1.2 Reasoning
Multi-step logical deduction: chain-of-thought, backtracking, handling contradictions.

- **Capable:** Verifies each step before proceeding. Uses the test as spec.
- **Basic:** Confidently produces plausible-but-wrong output and moves on.
- TDD is enforced chain-of-thought — write tests before code.

### 1.3 Tool Use
Invoke external tools precisely — file ops, shell, APIs, web search, browser.

| Dimension | Basic | Capable |
|---|---|---|
| Precision | Vague | Exact paths, flags, parameters |
| Error recovery | Tool fails → stops | Parses error, tries corrected approach |
| Side-effect awareness | Ignores collateral impact | Verifies working directory, confirms targets |
| Abstraction | Calls tools raw | Wraps patterns into reusable scripts |

### 1.4 Memory
Persist and retrieve information across sessions, tasks, agent instances.

| Layer | Mechanism | Purpose | Lifespan |
|---|---|---|---|
| Layer 1 | Project files (SPEC.md, ARCHITECTURE.md) | Long-term project truth | Permanent |
| Layer 2 | TASK_TRACKER.md | Live task status per feature | Feature lifecycle |
| Layer 3 | Inline dispatch context | Per-task agent input | Task duration |
| Layer 4 | ByteRover context tree | Cross-project patterns + decisions | Permanent |
| Layer 5 | memory/long_term.md + daily logs | COO-level continuity | Permanent |

**Critical rule:** Any context an agent needs must be in a file it can read OR inline in dispatch prompt.

### 1.5 Communication
Produce structured, precise outputs other agents or humans can act on.

- **Capable:** Produces consistent document formats (SPEC.md, REVIEW_*.md, DEPLOYMENT.md)
- **Explicit handoff protocols:** Output contains exactly what the next agent needs
- **Knowing when NOT to speak:** In group chats, respond only when adding value
- **Calibrated confidence:** Says "I don't know" when appropriate

---

## 2. Specialized Skills vs. Generalists

**The Abzum model: Generalist Framework, Specialist Skills**

```
Generalist base (any LLM)
    ↓ + SKILL.md trigger system
Specialized behavior activated on demand
    ↓ + bundled scripts/references
Deep domain capability when needed
```

- Felix = **generalist orchestrator** (MiniMax M2)
- `github` skill makes Felix **temporarily specialized** for GitHub operations
- Skill is NOT the agent — agent is the reasoning engine; skill activates domain-specific behavior

### When to Create a New Skill

| Situation | Action |
|---|---|
| Task is one-shot (simple file edit) | No new skill needed |
| Task recurs with same tool/API | Create or extend skill |
| Task requires specific workflow | Use existing skill |
| Task requires new tool integration | Create new skill with bundled scripts |
| One agent needs company-specific knowledge | Add to references/ in existing skill |

---

## 3. Skill Framework Anatomy

```
SKILL/
├── SKILL.md          (required — YAML frontmatter + markdown body)
├── scripts/          (optional — executable code)
├── references/       (optional — loaded on demand)
└── assets/          (optional — output files, templates)
```

### SKILL.md Anatomy

```yaml
---
name: skill-name
description: "Use when: [exact triggers]. NOT for: [explicit exclusions]."
---

# Body: concise instructions
- Workflow
- Tool usage
- Key patterns
- Reference links
```

### Skill Quality Standards

| Standard | Requirement |
|---|---|
| Conciseness | SKILL.md body <500 lines |
| Trigger clarity | Description has specific use cases AND exclusions |
| Progressive disclosure | Detailed docs in references/, not SKILL.md body |
| Tool specificity | Exact commands, paths, parameters |
| Error handling | What to do when things go wrong |

---

## 4. Skill Acquisition Patterns

| Pattern | Description |
|---|---|
| **Top-Down (Skill Authoring)** | Human/advanced agent writes new skill from scratch |
| **Bottom-Up (Skill Extraction)** | Agent notices repeated pattern, proposes new skill |
| **Skill Adaptation** | Copy existing skill, replace tool/API references |
| **Progressive Deepening** | Skill starts minimal, grows based on usage |

### Three-Level Loading System

| Level | Content | Always Loaded? | Size |
|---|---|---|---|
| Metadata | name + description (YAML frontmatter) | ✅ Yes | ~100 words |
| SKILL.md body | Instructions, workflow guidance | Only when triggered | <500 lines |
| Bundled resources | scripts/, references/, assets/ | Only when needed | Unlimited |

---

## 5. Skill Verification Levels

| Level | Cost | What |
|---|---|---|
| Static | Cheap | Skill exists, has required fields, proper structure |
| Syntax | Low | Scripts are syntactically valid |
| Unit | Medium | Scripts run with known inputs, expected outputs |
| Integration | Higher | Skill used in realistic task scenario |
| Load testing | Expensive | Concurrent tasks, measure reliability |

---

## 6. Capability Maturity Model (CMM)

Five levels for AI agents and teams:

| Level | Name | Description |
|---|---|---|
| **L1** | Ad Hoc | Single-step tasks, no planning, no memory, imprecise tools |
| **L2** | Prompted Process | Follows explicit process when prompted, basic memory, active skills when triggered |
| **L3** | Structured Execution | Mandatory gates, task trackers, layered memory, self-review before handoff |
| **L4** | Self-Aware | Meta-cognition, knows what it doesn't know, improves processes, authors skills |
| **L5** | Self-Evolving | Continuously improves skills, identifies systemic gaps, cross-project mining |

### Maturity Assessment

| Dimension | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Planning | None | Follows prompts | Mandatory gates | Proactive | Plans for teams |
| Reasoning | Single step | Chain of thought | Evidence-based | Meta-cognitive | Self-correcting |
| Tool Use | Vague | Correct when shown | Precise, audited | Error-recovering | Tool-authoring |
| Memory | None | File persistence | Layered system | Curated learning | Cross-project mining |
| Communication | Free-form | Structured | Protocol-based | Channel-aware | Coaching |
| Skill System | None | Static skills | Active library | Skill authoring | Skill ecosystem |
| Self-Improvement | None | Lesson capture | Process refinement | Skill authoring | Self-evolving |

### How to Level Up

| Level | Bottleneck | How to Advance |
|---|---|---|
| L1→L2 | No process | Add SKILL.md, mandate file-based memory |
| L2→L3 | No gates | Implement Superpowers-style process gates |
| L3→L4 | No reflection | Add meta-cognition checklist (pre-flight, self-review) |
| L4→L5 | No systemic view | Add ByteRover-style cross-project memory, skill authoring culture |

---

## 7. Meta-Cognition

The ability to think about one's own thinking.

**Capable agents:**
1. Check their own output before presenting it
2. Ask: "What could be wrong with this?"
3. Recognize when in unknown territory
4. Seek clarification when ambiguity exists
5. Recognize limits of knowledge

**Evidence over claims:** Don't claim the code works → show the test passing. Don't claim no bugs → show the review checklist complete.

---

## 8. Self-Improvement Patterns

| Pattern | Description |
|---|---|
| **Lesson Capture** | After mistakes/success, write to memory files |
| **Process Refinement** | Repeatedly suboptimal → propose changing the process |
| **Skill Authoring** | Same task 3 times → author a skill |
| **Context Curating** | Cross-project patterns → curate to ByteRover |
| **Skill Improvement** | Failure due to skill inadequacy → update skill |
| **Prompt Self-Improvement** | Improve operational instructions (not identity) |

---

*Source: AI_AGENT_CAPABILITIES_FRAMEWORK.md v1.0 — Felix Stanley, COO*
