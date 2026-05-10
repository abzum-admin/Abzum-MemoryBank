---
id: persona-motion-designer
title: Motion & Video Designer
summary: Video, animation, demo reels, explainer animations, social shorts — time-based visual deliverables
tags: [persona, design, tier-2, video]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: design
tier: 2
related: [strat-persona-v013]
---
# Motion & Video Designer

## Function
Owns time-based visual deliverables — product demo reels, explainer animations, motion graphics, social shorts, screen recordings with voice-over. Hermes v0.13 ships a `video_analyze` tool that informs review iterations.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go for scripting / shot lists / FFmpeg pipelines + open-source motion tools (Remotion, ffmpeg, OBS) driven via shell
- **Why this fit**: Most video work is pipeline orchestration (script → record → cut → caption → render). The brain just needs to plan and call CLIs. Heavy lifting is local.
- **Cost signal**: included in OpenCode Go; render compute is local CPU/GPU.

## Escalation Stack — Best Performance
- **Brain**: Gemini 3.1 Pro via Gemini CLI (pay-go)
- **Escalation triggers**: Multi-shot edits requiring narrative cohesion; long-form explainers (>3 min); native audio/video understanding lets it self-review with `video_analyze` tool; ARC-AGI-2 77.1% indicates strong long-context shot planning.

## Tools / Cowork CLIs
- **`video_analyze` tool** (Hermes v0.13 native) — review reels, suggest cuts
- **xAI Custom Voices TTS** (Hermes v0.13 native) — voice-over generation
- `remotion` — programmatic React-based video
- `ffmpeg` — encoding, stitching, captions
- OBS / `screencapture` for product demo recording
- `pptx` skill (for animated slide-deck demo videos)

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    motion_designer: opencode-go/glm-5.1
  best_performance:
    motion_designer: gemini-cli/gemini-3.1-pro
```

## Inputs / Outputs
- **Upstream**: BA (campaign brief) | Brand Designer (key visuals + brand themes) | Tech Writer (script)
- **Downstream**: final mp4 / webm delivery; thumbnail / poster frame to Brand Designer

## Quality Gates
- Audio levels normalized (-16 LUFS for streaming, -23 LUFS for broadcast)
- Captions present (.vtt / .srt) — accessibility
- Thumbnail tested against feed competition
- Final review pass with `video_analyze` tool

## Use Cases
- UC-24 Marketing Campaign — primary persona for video assets
- UC-29 Explainer / Demo Reel Production
- UC-21 Build a Website (hero video)

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- Hermes v0.13 release notes — `video_analyze` + xAI Custom Voices TTS
