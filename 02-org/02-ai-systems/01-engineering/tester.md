---
id: persona-tester
title: Tester (incl. UI testing)
summary: Generates unit tests, edge cases, and drives Playwright MCP for visual UI regression — needs vision for screenshot diffs
tags: [persona, engineering, tier-2, testing]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: engineering
tier: 2
related: [strat-persona-v013, exec-skill-matrix]
---
# Tester

## Function
The Tester generates unit tests and edge cases, and drives Playwright MCP for visual / UI regression. Needs **vision** to compare rendered screenshots and catch CSS/layout bugs the unit suite misses.

## Default Stack — Best Value
- **Brain**: Kimi K2.6 + Playwright MCP via Kimi CLI or OpenCode Go
- **Why this fit**: Native vision; explicitly trained on "coding-driven UI/UX generation"; 16K cached at $0.15/M makes long screenshot-diff sessions cheap.
- **Cost signal**: ~$0.10 per UI suite run.

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 + Playwright MCP via Claude Code ($20/mo Pro)
- **Escalation triggers**: Anthropic co-developed the Playwright MCP integration; Sonnet 4.6 ships 3 specialized test subagents (Planner, Generator, Healer) since Playwright v1.56 — when the test suite needs healing across many flaky tests, this is the unlock.

## Tools / Cowork CLIs
- **Playwright MCP** (`mcp__plugin_playwright_*`) — full browser automation with vision
- `pytest` / `vitest` / `jest` runners
- `pixelmatch` for screenshot diff thresholds
- Sonnet 4.6 test subagents (BP only): Planner, Generator, Healer

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    tester: opencode-go/kimi-k2.6
  best_performance:
    tester: claude-code/sonnet-4.6
```

## Inputs / Outputs
- **Upstream**: Senior Coder (PR review approved) | Junior Coder (PR with new behaviour)
- **Downstream**: DevOps (PR cleared for merge) | Senior Coder (test failures to triage)

## Quality Gates
- New behaviour has at least one passing unit test that fails without the change
- UI changes have at least one Playwright screenshot diff vs baseline
- Coverage does not drop on the touched files
- Flaky tests quarantined (not deleted) and tracked

## Use Cases
- UC-21, UC-23 (every UI-bearing UC)
- UC-28 Ongoing Maintenance / On-call (regression sweep)
- UC-01 Custom CRM Build

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- [`05-process/skill_matrix.md`](../../../05-process/skill_matrix.md) — Tester column (Playwright critical)
- [`05-process/tdd.md`](../../../05-process/tdd.md)

---

<!-- backlinks-start -->

## Referenced by

- [Skill Matrix](../../../05-process/skill_matrix.md)
- [Tdd](../../../05-process/tdd.md)
- [Persona Team V013](../../../08-strategy/persona_team_v013.md)

<!-- backlinks-end -->
