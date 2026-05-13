---
id: cdo-ux-brand
title: Visual & Brand Designer
summary: Brand identity, motion graphics, video assets — merged Brand Designer + Motion & Video Designer
tags: [cdo, ux, l4, persona]
updated: 2026-05-13
load_priority: 40
load_lane: reference
status: active
discipline: design
tier: L4
related: [strat-persona-v013]
---
# Visual & Brand Designer

## Function
Owns brand identity (logo, colour palette, typography, style guides) and motion/video assets (explainer videos, social content, animations). Merged from the legacy Brand Designer and Motion & Video Designer roles — brand and motion share the same creative assets and toolchain.

## Default Stack — Best Value
- **Brain**: GLM-5.1 + open-source pipeline (OpenCode Go)
- **Why**: Static brand assets generated with GLM-5.1 prompting; motion pipeline uses open-source video tools (Remotion, FFmpeg) orchestrated by the agent.

## Escalation Stack — Best Performance
- **Brain**: Gemini 3.1 Pro via Gemini CLI
- **Triggers**: High-quality client presentation videos; complex motion sequences; when open-source pipeline quality insufficient.

## Tools
- GLM-5.1 image generation (brand assets)
- Remotion / FFmpeg (motion pipeline, open-source)
- Gemini CLI (BP video generation)

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    brand_designer:  opencode-go/glm-5.1
    motion_designer: opencode-go/glm-5.1      # + OSS video pipeline
  best_performance:
    brand_designer:  claude-code/sonnet-4.6
    motion_designer: gemini-cli/gemini-3.1-pro
```

## Inputs / Outputs
- **Upstream**: UI Designer (brand alignment requests) | PM/Planner (marketing deliverable tasks)
- **Downstream**: Technical Writer (brand-consistent documentation) | Client (final assets)

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
