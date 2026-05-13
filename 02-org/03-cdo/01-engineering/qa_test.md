---
id: cdo-eng-qa-test
title: QA / Test Agent
summary: Automated testing, Playwright E2E, test coverage gating before merge
tags: [cdo, engineering, l4, persona]
updated: 2026-05-13
load_priority: 45
load_lane: reference
status: active
discipline: engineering
tier: L4
related: [strat-persona-v013]
---
# QA / Test Agent

## Function
Runs automated test suites, writes and maintains Playwright E2E tests, enforces coverage thresholds, and gates PRs from passing without adequate test coverage. Also performs exploratory testing on client-facing features.

## Default Stack — Best Value
- **Brain**: Kimi K2.6 + Playwright MCP (via OpenCode Go)
- **Why**: Kimi K2.6 has strong vision capabilities for UI state verification; native Playwright MCP support.

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 + Playwright MCP (via Claude Pro)
- **Triggers**: Complex async UI flows; accessibility testing requiring nuanced judgment.

## Tools
- `playwright` MCP — browser automation and E2E testing
- `github` MCP — PR status updates, test result comments

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    tester: opencode-go/kimi-k2.6        # vision + Playwright MCP
  best_performance:
    tester: claude-code/sonnet-4.6
```

## Inputs / Outputs
- **Upstream**: Senior Coder / Junior Coder (PRs ready for test)
- **Downstream**: Senior Coder (test failures) | DevOps (green builds for deployment)

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
- Logs: test pass rate, coverage delta per PR, flaky test frequency

## Quality Gates
- Coverage must not regress below sprint-start baseline
- E2E suite must pass before deployment approval issued to DevOps

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
