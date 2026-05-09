---
id: persona-interface-designer
title: Interface Designer (UX/UI)
summary: UX/UI for product surfaces — flows, wireframes, hi-fi mockups, design tokens, component spec
tags: [persona, design, tier-2]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: design
tier: 2
related: [strat-persona-v013]
---
# Interface Designer (UX/UI)

## Function
Owns the product surface — user flows, wireframes, hi-fi mockups, design tokens, component spec. Hands off to Junior Coder + Tester. Distinct from Brand Designer (marketing collateral) and the BA's in-call mockup generation (which is rough/throwaway).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via Claude Code (Z.ai endpoint) **or** OpenCode Go
- **Why this fit**: Renders polished React/Tailwind/shadcn via the Anthropic-compatible endpoint at 1/12 the price; works inside the same Claude Code surface humans review designs in.
- **Cost signal**: included in $10 OpenCode Go (or $18 Z.ai Lite).
- **Tools**: Claude Artifacts streaming + shadcn MCP + Excalidraw MCP for wireframes.

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Code ($20/mo Pro) **plus** v0 API ($20/mo Premium)
- **Escalation triggers**: Production-grade React/shadcn output where v0's specific quality matters more than cost; client-facing mockup that will go straight into the build with minimal Coder cleanup; complex interaction states (drag-drop, multi-step wizards).

## Tools / Cowork CLIs
- **shadcn MCP** (`mcp__Shadcn_UI__*`) — components, blocks, themes
- **Figma MCP** (`mcp__plugin_design_figma__*`) — pull existing brand from Figma
- **Excalidraw MCP** — low-fi flow diagrams
- **Claude Artifacts streaming** — hi-fi mockups (BV)
- **v0 API** — production-grade output (BP)
- `frontend-design` skill — codified guidance on distinctive UI

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    interface_designer: opencode-go/glm-5.1     # via Claude Artifacts surface
  best_performance:
    interface_designer: claude-code/sonnet-4.6  # plus v0 API for ceiling output
```

## Inputs / Outputs
- **Upstream**: BA (requirements + rough call-time mockups) | Architect (tech-stack constraints — Tailwind/shadcn/etc.)
- **Downstream**: Junior Coder (component spec + assets) → Tester (golden screenshots for Playwright)

## Quality Gates
- Every screen has: wireframe + hi-fi mockup + interaction states (default / hover / focus / active / disabled / loading / error / empty)
- Design tokens defined (colors, spacing, type) — no magic values
- Accessibility pass: contrast AA, keyboard reachable, focus order
- Responsive breakpoints called out (mobile / tablet / desktop)

## Use Cases
- UC-21 Build a Website
- UC-23 Build a SaaS / Internal Tool
- UC-01 Custom CRM Build (heavy UI)

## References
- [`strategy/persona_team_v013.md`](../../strategy/persona_team_v013.md)
- [`execution/skill_matrix.md`](../../execution/skill_matrix.md) — Tailwind, React rows
