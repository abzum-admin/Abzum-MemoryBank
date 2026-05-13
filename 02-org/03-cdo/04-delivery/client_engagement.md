---
id: cdo-del-client
title: Client Engagement Agent
summary: Discovery calls, requirements gathering, mockup presentation — voice-first BA runtime
tags: [cdo, delivery, l3, persona, voice]
updated: 2026-05-13
load_priority: 50
load_lane: reference
status: active
discipline: delivery
tier: L3
related: [strat-persona-v013]
---
# Client Engagement Agent

## Function
The client-facing discovery and requirements agent. Runs live discovery calls with clients (voice-first), produces requirements documents, budget/scope estimates, and mockup previews. Only agent running outside Hermes — on a dedicated Pipecat/LiveKit runtime.

## Default Stack — Best Value
- **Brain**: Gemini 3.1 Flash Live ($0.018/min) via Pipecat
- **Why**: 90.8% ComplexFuncBench Audio; 2.8× cheaper than Grok voice; 90+ language support for NZ/AU/international clients.
- **Meeting bot**: Recall.ai ($0.50/hr + $0.15/hr transcription)

## Escalation Stack — Best Performance
- **Brain**: Grok `voice-think-fast-1.0` ($0.05/min) via Pipecat
- **Triggers**: High-stakes contract negotiations; complex multi-step data entry calls; when Gemini Flash quality insufficient.
- **Note**: 30-min session cap requires rollover logic for longer calls.

## Runtime Architecture
```
Recall.ai Meet bot ──audio──► Realtime brain (Gemini Flash Live / Grok voice)
                                    │ tool calls
                                    ▼
                              Mockup generator (Claude Artifacts BV / v0 API BP)
                                    │
                                    ▼
                           Requirements doc + mockup URLs
                                    │ MCP tool call
                                    ▼
                           HERMES ORCHESTRATOR (kanban_create)
```

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    ba_brain:   gemini-live/gemini-3.1-flash-live   # Pipecat config
    ba_handoff: opencode-go/glm-5.1
  best_performance:
    ba_brain:   xai/grok-voice-think-fast-1.0       # Pipecat config
    ba_handoff: claude-code/sonnet-4.6
```

## Inputs / Outputs
- **Upstream**: Client (discovery call) | PM/Planner (scope clarification requests)
- **Downstream**: PM/Planner (requirements doc, Hermes kanban_create) | UI Designer (mockup requests)

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
- Logs: call duration, tool-call volume, requirements doc completeness score, client satisfaction signal

## Quality Gates
- Requirements doc includes: scope, out-of-scope, budget estimate, timeline, mockup URLs
- Client sign-off captured before PM/Planner sprint creation

## Cost Estimate
- 60-min discovery call ≈ $1.59 total (BV: Gemini Flash + Recall.ai)

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
