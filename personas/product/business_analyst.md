---
id: persona-business-analyst
title: Business Analyst (Realtime Voice + Mockup)
summary: Joins client Meet calls, talks in real time, generates UI mockups live, captures budget and scope, produces requirements doc
tags: [persona, product, voice, ba]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: product
tier: 1
related: [strat-persona-v013, exec-persona-hermes-config]
---
# Business Analyst — Realtime Voice + Mockup

## Function
The BA joins Google Meet (or Zoom / Teams) calls with clients, conducts a real-time discovery conversation — listening, asking probing questions, generating UI mockups live during the call, capturing budget and scope — and produces a structured requirements document handed to the Planner. **Critical separation**: the BA runtime lives outside Hermes (Pipecat or LiveKit Agents) because Hermes' xAI Custom Voices TTS is a one-way speaker; client conversations require a bidirectional realtime model.

## Default Stack — Best Value
- **Brain**: Gemini 3.1 Flash Live via AI Studio dev tier (free) / Vertex prod
- **Why this fit**: $0.018/min audio (cheapest by 3–15×); 90.8% ComplexFuncBench Audio (the relevant benchmark for tool calling mid-conversation); 90+ language support matches NZ/AU SMB plus international clients; 960 ms TTFA; native end-to-end audio (no intermediate text transcription).
- **Cost signal**: ~$0.018/min audio in/out + Recall.ai $0.50/hr Meet bot. A 60-min call ≈ $1.59 total.

## Escalation Stack — Best Performance
- **Brain**: Grok `voice-think-fast-1.0` (xAI Voice Agent API)
- **Escalation triggers**: High-stakes discovery calls — enterprise prospect, complex multi-product scope, calls that require precise mid-conversation data entry (CRM updates, calendar holds, ticket creation), or calls where the BA must drive 5+ tools concurrently.
- **Why Grok over gpt-realtime**: $0.05/min vs ~$0.30/min (6× cheaper); xAI explicitly tunes this model for "high-stakes scenarios that demand precise data entry and high-volume tool calling" — that is the BA job description. OpenAI-Realtime API compatible, so Pipecat / LiveKit code drops in unchanged. **gpt-realtime is fallback only.**
- **Cost signal**: ~$0.05/min + Recall.ai $0.50/hr. A 60-min call ≈ $3.50.
- **Caveat**: Grok has a **30-min hard session cap**. The BA runtime must implement session rollover (Pipecat session boundary + Recall.ai bot context handoff) for longer calls. Open implementation question — see `execution/persona_hermes_config.md`.

## Tools / Cowork CLIs
- **Recall.ai Meet/Zoom/Teams bot** — Output Media enabled so the bot can speak, not just listen ($0.50/hr meeting + $0.15/hr transcription)
- **Mockup generator (best value)**: Claude Artifacts streaming via Anthropic-compatible endpoint (free with Claude Pro on BP stack; route through OpenCode Go's GLM-5.1 on BV). Excalidraw MCP for low-fi diagrams during early discovery.
- **Mockup generator (best performance)**: v0 API ($20/mo Premium) for production-grade React/shadcn output — only when v0's specific output quality matters
- **Calendar MCP** (`707da64f-*`) — schedule follow-ups during the call
- **Kanban `create`** — at end-of-call, lands a structured task with the requirements doc as body

## Hermes Profile Snippet
```yaml
# BA brain runs OUTSIDE Hermes (Pipecat/LiveKit). Hermes profile is for the
# post-call requirements-doc handoff agent only.
profiles:
  best_value:
    ba_brain: gemini-live/gemini-3.1-flash-live   # in Pipecat config, not Hermes
    ba_handoff: opencode-go/glm-5.1               # Hermes profile for kanban_create
  best_performance:
    ba_brain: xai/grok-voice-think-fast-1.0       # in Pipecat config
    ba_handoff: claude-code/sonnet-4.6
```

## BA Runtime Architecture (separate from Hermes)
```
┌─────────────────────────────────────────────────────────────┐
│  BA AGENT RUNTIME (Pipecat or LiveKit Agents)               │
│                                                              │
│  Recall.ai bot ──audio──► Realtime brain (Gemini/Grok)      │
│         ▲                       │                            │
│         │                       │ tool calls                 │
│         │ screen-share          ▼                            │
│         │                  Mockup generator                  │
│         │                  (Artifacts / v0 / Excalidraw)     │
│         │                                                    │
│         └────────────────► Final requirements doc            │
│                            + mockup URLs                     │
│                            + budget/scope                    │
└──────────────────────────────────┬──────────────────────────┘
                                   │ MCP tool call
                                   ▼
                          HERMES ORCHESTRATOR
                          kanban_create(...)
```

## Inputs / Outputs
- **Upstream**: Triage / Intake (client engagement classified, calendar invite scheduled)
- **Downstream**: Planner (structured requirements doc + budget + scope + mockup URLs)

## Quality Gates
- Requirements doc has: problem statement, success criteria, scope, non-goals, budget envelope, stakeholders, deadline, mockup links, risks
- Audio quality acceptable (no >2 dropouts per 10 min); flagged in Watcher feed if degraded
- Mockup count appropriate to scope (≥1 per major surface)
- For Grok runtime: session rollover succeeded if call >25 min (no context loss to client)

## Use Cases
- UC-21 Build a Website (client requirements gathering)
- UC-22 Build a Research Document
- UC-23 Build a SaaS / Internal Tool
- UC-24 Marketing Campaign Brief
- UC-25 Pitch Deck Brief
- UC-01 Custom CRM Build (existing — kicks off here)
- UC-02 CRM Migration

## References
- [`strategy/persona_team_v013.md`](../../strategy/persona_team_v013.md) — full BA voice comparison
- [`execution/persona_hermes_config.md`](../../execution/persona_hermes_config.md) — session rollover open question
- Gemini 3.1 Flash Live: <https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-3-1-flash-live/>
- Grok Voice Agent API: <https://x.ai/news/grok-voice-agent-api>
- Recall.ai: <https://www.recall.ai/>
