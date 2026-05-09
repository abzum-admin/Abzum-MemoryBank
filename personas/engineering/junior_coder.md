---
id: persona-junior-coder
title: Junior Coder
summary: Executes self-contained coding tasks under Senior review — speed × cost matters; mistakes caught upstream
tags: [persona, engineering, tier-2]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: engineering
tier: 2
related: [strat-persona-v013, exec-persona-hermes-config]
---
# Junior Coder

## Function
The Junior Coder picks self-contained Kanban tasks (single-file or tightly-scoped multi-file edits with explicit acceptance criteria), implements with TDD, opens a PR, and hands off to Senior Coder for review. Speed × cost is the optimization target — Senior catches mistakes.

## Default Stack — Best Value
- **Brain**: GLM-5.1 or Kimi K2.5 via OpenCode Go
- **Why this fit**: Both cleared multi-turn at <$0.30 per task. Hermes runtime fit is excellent.
- **Cost signal**: ~$0.20 per task; included in $10/mo OpenCode Go.

## Escalation Stack — Best Performance
- **Brain**: GPT-5.5 in Codex CLI (already paid via $20 Plus)
- **Escalation triggers**: Single-turn bench shows 0 repairs needed (best precision); when the task is well-specified but tricky in detail (subtle algorithm, perf-sensitive loop).

## Pattern B Cowork — Documented Example

The Junior Coder is the canonical example of **Pattern B (CLI-as-Tool)** documented in [`execution/persona_hermes_config.md`](../../execution/persona_hermes_config.md). On the BV stack, the Hermes profile runs on a cheap GLM-5.1 brain whose job is to:

1. Read the Kanban task and acceptance criteria
2. Frame it for the specialist CLI agent
3. Shell out: `codex exec --model gpt-5.5 "implement: <framed task>"`
4. Verify the CLI's output (compile, run tests, sanity-check diff)
5. Open the PR via `gh` and post status to Kanban

In this pattern Codex CLI is the **tool**, and the Hermes Junior is the orchestrator that picks when to use it. Heartbeat shim required so Hermes' watchdog doesn't flag the long-running CLI as a stall — see open question in `persona_hermes_config.md`.

## Tools / Cowork CLIs
- `gh` CLI — PR creation, status posting
- Native `Read` / `Edit` / `Write` tools
- `pytest` / `vitest` / `jest` test runners
- **Pattern B cowork CLIs**:
  - `codex exec --model gpt-5.5 "..."` — tricky single-turn implementation
  - `claude -p "..."` — refactor with deep context
  - `aider` — quick local edits when network is slow

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    junior_coder:
      model: opencode-go/glm-5.1
      cowork_tools:
        - name: codex_cli
          command: codex exec --model gpt-5.5 "{task}"
          when: complex_implementation
        - name: claude_code
          command: claude -p "{task}"
          when: refactor_with_context
  best_performance:
    junior_coder: codex-cli/gpt-5.5     # Pattern A — model is engine
```

## Inputs / Outputs
- **Upstream**: Planner (Kanban task with acceptance criteria) | Senior Coder (review comments to address)
- **Downstream**: Senior Coder (PR ready for review)

## Quality Gates
- TDD: failing test written before implementation
- All acceptance criteria met before opening PR
- `pytest` / `vitest` green locally before push
- PR description references the Kanban task ID

## Use Cases
- UC-21, UC-23 (every coding-heavy UC)
- UC-28 Ongoing Maintenance / On-call
- UC-01 Custom CRM Build (bulk implementation)

## References
- [`strategy/persona_team_v013.md`](../../strategy/persona_team_v013.md)
- [`execution/persona_hermes_config.md`](../../execution/persona_hermes_config.md) — Pattern B canonical example
- [`execution/tdd.md`](../../execution/tdd.md)
- [`execution/skill_matrix.md`](../../execution/skill_matrix.md) — Coder column
