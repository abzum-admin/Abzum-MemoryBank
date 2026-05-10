---
id: persona-planner
title: Planner
summary: Decomposes goals into Kanban tasks, sequences them, sets retry budgets; multi-turn dialogue with Architect when scope is fuzzy
tags: [persona, product, tier-1]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: product
tier: 1
related: [strat-orchestration, strat-persona-v013]
---
# Planner

## Function
The Planner takes the BA's requirements doc (or a Triage hand-off for known work) and decomposes it into a sequenced set of Kanban tasks with retry budgets, dependencies, and acceptance criteria. When scope is fuzzy, it runs a multi-turn dialogue with the Architect before locking the plan.

## Default Stack — Best Value
- **Brain**: Qwen 3.5 Plus (thinking) via Qwen Code or OpenCode Go
- **Why this fit**: Cheapest Tier-1 multi-turn pass — cleared the 3-task suite at $0.12.
- **Cost signal**: ~$0.12 per 3-task plan; included if subscribed via OpenCode Go.

## Escalation Stack — Best Performance
- **Brain**: GPT-5.5 via Codex CLI (existing $20 Plus subscription)
- **Escalation triggers**: Plan is "messy multi-part" (>15 sub-tasks, multiple parallel tracks, ambiguous dependencies); OpenAI's flagship handles cross-task synthesis better than Qwen on the planner bench.

## Tools / Cowork CLIs
- Kanban `create` / `link_dependency` / `set_retry_budget` (Hermes v0.13 native)
- Architect handoff via direct kanban `comment` (multi-turn scope dialogue)
- Hindsight recall — pulls similar past plans for retry-budget calibration

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    planner: qwen-code/qwen3.5-plus
  best_performance:
    planner: codex-cli/gpt-5.5
```

## Inputs / Outputs
- **Upstream**: BA (requirements doc) | Triage (known internal work)
- **Downstream**: Architect (when scope dialog needed) → Orchestrator (when plan is locked) → Senior/Junior Coder + Tester + others (via dispatch)

## Quality Gates
- Every task has: `id`, `summary`, `acceptance_criteria`, `dependencies[]`, `retry_budget`, `assigned_persona`
- No circular dependencies
- Retry budget total ≤ project budget envelope from BA
- Plan reviewed by Architect before lock if any task touches >5 files

## Use Cases
- Joins UC-01, UC-02, UC-21–28, UC-05, UC-06, UC-07, UC-09, UC-16, UC-20

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- [`05-process/workflow_superpowers.md`](../../../05-process/workflow_superpowers.md) — gate definitions
- [`05-process/kanban_and_pm.md`](../../../05-process/kanban_and_pm.md)

---

<!-- backlinks-start -->

## Referenced by

- [Client Engagement Agent](client_engagement_agent.md)
- [Project Manager](project_manager.md)
- [Pricing](../../../03-services/pricing.md)
- [Kanban And Pm](../../../05-process/kanban_and_pm.md)
- [Workflow Superpowers](../../../05-process/workflow_superpowers.md)
- [Agent Orchestration](../../../08-strategy/agent_orchestration.md)
- [Persona Team V013](../../../08-strategy/persona_team_v013.md)

<!-- backlinks-end -->
