---
children_hash: 83c7af66b72d2510551cc3a16cf1e00bd23e51698221e0aaabd771f3f5cbf461
compression_ratio: 0.8011363636363636
condensation_order: 1
covers: [agent_watcher_system.md, context.md]
covers_token_total: 528
summary_level: d1
token_count: 423
type: summary
---
<think>
The user wants me to create a structural summary from the knowledge entries about the Agent Watcher System. Let me analyze the content and create a condensed summary that preserves key facts, architectural decisions, and relationships.

Key points to preserve:
1. Agent Watcher is a meta-layer AI for monitoring other agents
2. Event-driven architecture with zero-cost monitoring (log/event parsing)
3. 4-level escalation ladder with specific thresholds
4. Loop detection via method signatures
5. Purpose: prevent wasted tokens from looping agents

I need to compress this to ~20-30% while keeping the essential information and references to the child entries for drill-down.
</think>

## Agent Watcher System Overview

A meta-layer AI agent that monitors all other agents during task execution, preventing wasted tokens from looping or stuck agents.

### Architecture

- **Monitoring Approach**: Event-driven architecture using log/event parsing for zero-cost monitoring (no constant inference)
- **Loop Detection**: Method signature tracking distinguishes agent approach changes vs actual looping behavior

### Escalation Ladder

4-level escalation system triggered after repeated failures:

| Level | Action | Threshold |
|-------|--------|-----------|
| L1 | Self-Correct | 3 attempts (prompt agent to reflect) |
| L2 | Smarter Agent | 4 attempts (spawn better model) |
| L3 | Decompose | 6 attempts (break into parallel subtasks) |
| L4 | Human Escalation | 8 attempts (report to Vijay) |

### Key Relationships

- **Drill-down**: See `process/agent_watcher/agent_watcher_system.md` for detailed documentation
- **Related**: `process/agent_workflow` for agent execution patterns