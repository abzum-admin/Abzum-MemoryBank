---
id: cdo-ux-ui
title: UI Designer
summary: Interface design, wireframes, React component mockups, client-facing UI artifacts
tags: [cdo, ux, l3, persona]
updated: 2026-05-13
load_priority: 45
load_lane: reference
status: active
discipline: design
tier: L3
related: [strat-persona-v013]
---
# UI Designer

## Function
Creates wireframes, component mockups, and client-facing UI prototypes. Works from Client Engagement requirements and Architect component specs. Outputs React/Tailwind artifacts for client preview and handoff to Senior Coder.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via Claude Artifacts surface
- **Why**: Claude Artifacts streaming produces React + Tailwind + shadcn mockups inline; avoids v0 Premium cost.

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 + v0 API (Claude Pro)
- **Triggers**: High-fidelity production-ready component spec; complex interactive prototypes.

## Tools
- Claude Artifacts (inline React/Tailwind rendering)
- `excalidraw` MCP (free) — low-fidelity wireframes
- v0 API (BP only) — production component generation

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    interface_designer: opencode-go/glm-5.1   # Claude Artifacts surface
  best_performance:
    interface_designer: claude-code/sonnet-4.6
```

## Inputs / Outputs
- **Upstream**: Client Engagement (requirements + mockup requests) | Architect (component spec)
- **Downstream**: Senior Coder (design handoff) | Visual & Brand Designer (brand alignment)

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
- Logs: mockup iteration count, client approval rate, handoff-to-code delta

## Quality Gates
- Client sign-off on mockup before handoff to Senior Coder
- Brand consistency check with Visual & Brand Designer

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
