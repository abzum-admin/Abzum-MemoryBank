---
id: persona-brand-designer
title: Brand Designer (Visual Communications)
summary: Posters, slide decks, marketing collateral, social graphics, pitch decks — non-product visual surfaces
tags: [persona, design, tier-2, brand]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: design
tier: 2
related: [strat-persona-v013]
---
# Brand Designer (Visual Communications)

## Function
Owns non-product visual surfaces — posters, slide decks, marketing collateral, social graphics, pitch decks, one-pagers. Distinct from Interface Designer (product UI) and Motion Designer (video / animation).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go ($10/mo)
- **Why this fit**: Strong on layout-heavy template work; the `pptx` and `docx` skills handle deck/document generation deterministically; cost lets us iterate.
- **Cost signal**: included in OpenCode Go.

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Code ($20/mo Pro)
- **Escalation triggers**: Investor pitch deck or board materials where polish matters; the `theme-factory` skill paired with Sonnet's typographic taste lifts output noticeably; multi-asset campaign needing brand consistency across formats.

## Tools / Cowork CLIs
- **`pptx` skill** — programmatic PowerPoint generation
- **`docx` skill** — Word docs for one-pagers, briefs
- **`pdf` skill** — final delivery
- **Figma MCP** — pull brand assets, push exports
- **`theme-factory` skill** — apply consistent themes across assets
- **`web-artifacts-builder` skill** — interactive HTML pitch decks
- shadcn MCP for HTML-based pitch surfaces

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    brand_designer: opencode-go/glm-5.1
  best_performance:
    brand_designer: claude-code/sonnet-4.6
```

## Inputs / Outputs
- **Upstream**: BA (campaign brief / pitch context) | Vijay (direct brief for board / investor materials)
- **Downstream**: Tech Writer (copy review) → final delivery (PDF / pptx / web)

## Quality Gates
- Brand consistency check: colors / fonts / logo placement match brand guide
- Accessibility: PDF text-selectable; alt text on images
- Final delivered in: editable source (pptx/figma) + flat export (pdf/png)
- File naming follows `co-` brand prefix convention (see `company/team/`)

## Use Cases
- UC-24 Marketing Campaign / Brand Asset Production
- UC-25 Pitch Deck / Investor Document — primary persona
- UC-21 Build a Website (when brand assets needed)

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- [`assets/`](../../assets/) — existing brand assets (logos, etc.)
