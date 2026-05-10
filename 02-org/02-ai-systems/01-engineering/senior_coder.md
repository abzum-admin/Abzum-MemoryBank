---
id: persona-senior-coder
title: Senior Coder
summary: Reviews Junior PRs, plans refactors, owns tricky edits and multi-file changes — final code-quality gate
tags: [persona, engineering, tier-2]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: engineering
tier: 2
related: [strat-persona-v013, exec-skill-matrix]
---
# Senior Coder

## Function
The Senior Coder reviews every PR from the Junior Coder, plans cross-cutting refactors, and personally owns tricky multi-file edits the Junior shouldn't attempt. It is the **final code-quality gate** before Tester runs the suite.

## Default Stack — Best Value
- **Brain**: Grok 4.3 via OpenRouter pay-go
- **Why this fit**: Clean 3/3 single-turn + Tier-1 multi-turn at $0.13–0.30 per task. Best-in-class price/performance for code review without subscription lock-in.
- **Cost signal**: ~$0.20 per PR review.

## Escalation Stack — Best Performance
- **Brain**: Claude Opus 4.7 via Claude Code ($20/mo Pro)
- **Escalation triggers**: PR touches >5 files; refactor crosses service boundaries; SWE-bench Verified 87.6% advantage matters for tricky concurrency / state-management bugs; 1M-context multi-file reads needed.

## Tools / Cowork CLIs
- `gh` CLI — PR comments, reviews, file fetches
- Native multi-file `Read` / `Edit` tools
- **Pattern B cowork**: `claude -p "review this PR"` headless when running on the BV brain but a tricky PR needs Opus-grade review (one-shot escalation without switching the persona)
- `semgrep` MCP — static analysis on flagged patterns

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    senior_coder: openrouter/x-ai/grok-4.3
  best_performance:
    senior_coder: claude-code/opus-4.7
```

## Inputs / Outputs
- **Upstream**: Junior Coder (PR ready for review) | Architect (refactor plan)
- **Downstream**: Tester (PR passes review) | Junior Coder (review comments to address)

## Quality Gates
- Every PR review has: bug list, style notes, test-coverage assessment, merge verdict
- Reviews block merge if test coverage drops or critical comments unresolved
- TDD discipline enforced: refused PRs without tests for new behaviour
- Pattern B escalation logged in Hindsight when used (so we calibrate when it pays off)

## Use Cases
- UC-21, UC-23 (every coding-heavy UC)
- UC-26 Code/Security Audit (lead reviewer)
- UC-27 Production Incident Response (root-cause analysis)
- UC-01 Custom CRM Build

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- [`05-process/skill_matrix.md`](../../../05-process/skill_matrix.md) — Coder + Reviewer columns
- [`05-process/tdd.md`](../../../05-process/tdd.md)
- [`05-process/persona_hermes_config.md`](../../../05-process/persona_hermes_config.md) — Pattern B cowork

---

<!-- backlinks-start -->

## Referenced by

- [Principal Engineer](../../03-human-delivery/principal_engineer.md)
- [Persona Hermes Config](../../../05-process/persona_hermes_config.md)
- [Skill Matrix](../../../05-process/skill_matrix.md)
- [Tdd](../../../05-process/tdd.md)
- [Persona Team V013](../../../08-strategy/persona_team_v013.md)

<!-- backlinks-end -->
