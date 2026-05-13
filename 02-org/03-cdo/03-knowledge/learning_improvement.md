---
id: cdo-ki-learning
title: Learning & Improvement Agent
summary: Analyses Watcher logs, identifies skill gaps, updates agent context — the self-improvement loop engine
tags: [cdo, knowledge, l3]
updated: 2026-05-13
load_priority: 55
load_lane: reference
status: active
discipline: knowledge
tier: L3
---
# Learning & Improvement Agent

## Function
Drives the Abzum self-improvement loop. Consumes Watcher logs, identifies recurring failure patterns, proposes context/skill updates for affected agents, and triggers re-training or prompt updates. Also deploys Watcher instances to new agents when CDO approves expansion.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go
- **Why**: Pattern recognition across structured Watcher logs; sufficient for skill gap analysis.

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Pro
- **Triggers**: Deep causal analysis of multi-agent failure chains; systemic improvement proposals requiring nuanced judgment.

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    learning_improvement: opencode-go/glm-5.1
  best_performance:
    learning_improvement: claude-code/sonnet-4.6
```

## Self-Improvement Loop
```
Agent acts
  → Watcher logs (BV: Gemma 4 E4B / BP: Phi-4-mini)
    → Knowledge Graph aggregates patterns
      → Learning & Improvement analyses gaps
        → Skills / context files updated
          → Agent improves on next spawn
```

## Inputs / Outputs
- **Upstream**: All Watcher instances (log events) | Knowledge Graph (aggregated patterns)
- **Downstream**: All agents (context/skill updates) | CDO (improvement proposals)

## Responsibilities
- Weekly Watcher log review cycle
- Skill gap identification and priority ranking
- Agent context file update proposals (CDO approval required for structural changes)
- Watcher deployment to new agents

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini (recursive — Watcher watches L&I)
