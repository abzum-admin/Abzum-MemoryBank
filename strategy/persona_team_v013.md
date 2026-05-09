---
id: strat-persona-v013
title: Persona Team — Hermes v0.13
summary: 17-persona project team, two subscription stacks (BV $40 / BP $50), BA voice runtime, ProviderProfile toggle
tags: [strategy, agents, personas, hermes, models]
updated: 2026-05-10
load_priority: 60
load_lane: context
status: active
related: [strat-orchestration, strat-two-tier, exec-persona-hermes-config, exec-uc-team-mapping]
---
# Persona Team — Hermes v0.13

**Hermes v0.13 (released 2026-05-07, "The Tenacity Release") confirmation:** multi-agent Kanban (heartbeat, zombie detection, reclaim, retries, hallucination gate), `/goal` command (Ralph loop), Cron `no_agent_watchdog` mode, `video_analyze` tool, xAI Custom Voices TTS, **ProviderProfile** ABC for pluggable providers, Checkpoints v2. Everything we need; no reason to switch to OpenClaw for orchestration. (OpenClaw stays a personal mobile-bot gateway; Hermes' worker/orchestrator Kanban is better suited to a structured dev team.)

This document lands the active persona team that the Orchestrator stages per project, the two subscription stacks, the BA voice runtime architecture (separate from Hermes), the fallback ladder, and the `ProviderProfile` toggle config.

---

## 1. Master Persona Table — 17 Personas

| # | Discipline | Persona | Best Value (default) | Best Performance (escalate) |
|---|---|---|---|---|
| 1 | Orchestration | [Orchestrator](../personas/orchestration/orchestrator.md) | GLM-5.1 via OpenCode Go ($10/mo) | Gemini 3.1 Pro via Vertex pay-go |
| 2 | Orchestration | [Watcher](../personas/orchestration/watcher.md) | Gemma 4 E4B (local, $0) | Phi-4-mini (local, $0) |
| 3 | Product | [Triage / Intake](../personas/product/triage_intake.md) | GLM-5.1 via OpenCode Go | Claude Sonnet 4.6 via Claude Code |
| 4 | Product | [Business Analyst](../personas/product/business_analyst.md) | **Gemini 3.1 Flash Live** ($0.018/min) | **Grok `voice-think-fast-1.0`** ($0.05/min) |
| 5 | Product | [Planner](../personas/product/planner.md) | Qwen 3.5 Plus (thinking) | GPT-5.5 via Codex CLI |
| 6 | Engineering | [Architect](../personas/engineering/architect.md) | GLM-5.1 in Claude Code (Z.ai) | Claude Opus 4.7 via Claude Pro |
| 7 | Engineering | [Senior Coder](../personas/engineering/senior_coder.md) | Grok 4.3 via OpenRouter | Claude Opus 4.7 via Claude Code |
| 8 | Engineering | [Junior Coder](../personas/engineering/junior_coder.md) | GLM-5.1 / Kimi K2.5 via OpenCode Go | GPT-5.5 in Codex CLI |
| 9 | Engineering | [Tester](../personas/engineering/tester.md) | Kimi K2.6 + Playwright MCP | Claude Sonnet 4.6 + Playwright MCP |
| 10 | Engineering | [Security](../personas/engineering/security.md) | GLM-5.1 in Claude Code (Z.ai) | Claude Opus 4.7 via Claude Code |
| 11 | Engineering | [DevOps / Release Engineer](../personas/engineering/devops.md) | GLM-5.1 via OpenCode Go | GPT-5.5 via Codex CLI |
| 12 | Engineering | [Infrastructure Engineer](../personas/engineering/infrastructure_engineer.md) | GLM-5.1 via OpenCode Go | Claude Opus 4.7 via Claude Code |
| 13 | Design | [Interface Designer](../personas/design/interface_designer.md) | GLM-5.1 (Claude Artifacts surface) | Claude Sonnet 4.6 + v0 API |
| 14 | Design | [Brand Designer](../personas/design/brand_designer.md) | GLM-5.1 via OpenCode Go | Claude Sonnet 4.6 via Claude Code |
| 15 | Design | [Motion & Video Designer](../personas/design/motion_designer.md) | GLM-5.1 + open-source pipeline | Gemini 3.1 Pro via Gemini CLI |
| 16 | Knowledge | [Researcher](../personas/knowledge/researcher.md) | Kimi K2.6 via Kimi CLI / OpenCode Go | Gemini 3.1 Pro via Gemini CLI |
| 17 | Knowledge | [Tech Writer](../personas/knowledge/tech_writer.md) | GLM-5.1 via OpenCode Go | Claude Sonnet 4.6 via Claude Code |

**Tier mapping**: Orchestration personas are Tier 1 (per [`two_tier_architecture.md`](two_tier_architecture.md)); Product/Engineering/Design/Knowledge personas are Tier 2 spawned per project. The 11 Paperclip meta-agents (RBAC, Compliance, Provisioning, etc.) live alongside Orchestrator/Watcher in Tier 1 and are separately documented in [`agent_orchestration.md`](agent_orchestration.md).

---

## 2. BA Voice Runtime — Decision

The BA persona is the only one whose brain runs **outside Hermes**. xAI Custom Voices TTS in Hermes is a one-way speaker; client conversations need a bidirectional realtime model with native VAD and tool-use mid-conversation. Three candidates evaluated:

| Attribute | Gemini 3.1 Flash Live | Grok `voice-think-fast-1.0` | gpt-realtime |
|---|---|---|---|
| Released | 2026-03-26 | 2026-04 | 2025 (existing) |
| Audio cost | **$0.018/min** | $0.05/min | ~$0.30/min |
| TTFA / TTFT | 960 ms | <1000 ms | ~800 ms |
| ComplexFuncBench Audio | **90.8%** | tuned for "high-stakes multi-step tool use, precise data entry" | similar tier |
| Native MCP + custom tools | Yes | **Yes (MCP first-class)** | Yes |
| API surface | Google native | **OpenAI-Realtime compatible** | OpenAI native |
| Languages | 90+ | English-strong, growing | 60+ |
| Max session | longer | **30 min hard cap** | longer |

**Decisions**:
- **Best Value (BA)** → **Gemini 3.1 Flash Live**. 2.8× cheaper than Grok, 6× cheaper than gpt-realtime; 90.8% ComplexFuncBench Audio is the relevant benchmark; 90+ language coverage matches NZ/AU SMB + international clients. A 60-min discovery call ≈ $1.59 total (with Recall.ai bot).
- **Best Performance (BA)** → **Grok `voice-think-fast-1.0`**. Tuned exactly for the BA job (high-stakes, multi-step, precise data entry, high tool-call volume). At $0.05/min it beats gpt-realtime on **both** axes. OpenAI-Realtime-compatible API drops into existing Pipecat/LiveKit code.
- **gpt-realtime → fallback only**. Its only edge is OpenAI ecosystem stickiness, which Pipecat/LiveKit abstracts away.
- **Open implementation question**: Grok's 30-min session cap requires session rollover for longer calls. Documented in [`personas/product/business_analyst.md`](../personas/product/business_analyst.md) and [`exec-persona-hermes-config`](../execution/persona_hermes_config.md).

### BA Runtime Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  BA AGENT RUNTIME (Pipecat or LiveKit Agents)               │
│                                                              │
│  Recall.ai Meet bot ──audio──► Realtime brain               │
│  (Output Media on)              (Gemini 3.1 Flash Live OR   │
│   $0.50/hr meeting               Grok voice-think-fast-1.0) │
│   $0.15/hr transcription         │                          │
│         ▲                        │ tool calls               │
│         │ screen-share           ▼                          │
│         │                  Mockup generator                 │
│         │                  • Claude Artifacts (BV)          │
│         │                  • v0 API (BP)                    │
│         │                  • Excalidraw MCP (free)          │
│         │                                                   │
│         └──────────────► Final requirements doc             │
│                          + mockup URLs                      │
│                          + budget/scope                     │
└──────────────────────────────────┬──────────────────────────┘
                                   │ MCP tool call
                                   ▼
                         HERMES ORCHESTRATOR
                         kanban_create(...)
```

---

## 3. Subscription Stacks

### Best Value Stack — $40/mo total ($20 incremental over existing ChatGPT Plus)

| Subscription | Cost | What it unlocks |
|---|---|---|
| ChatGPT Plus (existing) | $20 | Codex CLI + GPT-5.5 for BP escalations |
| **OpenCode Go** | **$10** | The single biggest unlock. GLM-5.1, GLM-5, Kimi K2.5/K2.6, MiMo-V2.5-Pro, Qwen 3.5/3.6 Plus, MiniMax M2.5/M2.7, DeepSeek V4 Pro/Flash. **One sub → 80% of the team's models.** |
| Chutes Pro | $10 | 2,000 req/day fallback aggregator (GLM-4.7, DeepSeek V3.2, Kimi K2, MiniMax M2, gpt-oss-120b). Insurance against OpenCode Go quota hits. |
| OpenCode Zen (free) | $0 | MiniMax M2.5 free tier (data may train — non-confidential only) |
| Local Watcher | $0 | Gemma 4 E4B via Ollama |
| Recall.ai | pay-go | $0.50/hr Meet bot when BA in a call |
| Gemini Live API | pay-go | Free tier in AI Studio for dev; Vertex ~$0.018/min for prod |
| **Total fixed** | **$40/mo** | + ~$10–25 BA call usage when active |

### Best Performance Stack — $50/mo total ($30 incremental)

| Subscription | Cost | What it unlocks |
|---|---|---|
| ChatGPT Plus (existing) | $20 | Codex CLI for Senior/Junior Coder ceiling, Planner |
| Claude Pro | $20 | Claude Code with Sonnet 4.6 default + limited Opus 4.7 → Architect, Senior Coder, Security, Tester (incl. Playwright MCP), Tech Writer. **Also unlocks Claude Artifacts via API** for streaming UI mockups — replaces v0 Premium for most BA mockup work. |
| OpenCode Go | $10 | Keep — gives GLM-5.1 for Orchestrator (Claude Pro doesn't cover it) + Kimi K2.6 for Researcher BP |
| Local Watcher | $0 | Phi-4-mini via Ollama |
| Recall.ai | pay-go | $0.50/hr Meet |
| xAI Voice / OpenAI Realtime | pay-go | $0.05/min (Grok) — budget ~$15-30/mo for moderate BA use |
| **Total fixed** | **$50/mo** | + ~$15-40 BA call/voice usage when active |

> **Note on Claude Pro $20**: Anthropic ran a small split test in late April 2026 removing Claude Code from Pro for ~2% of new signups. Existing Pro subs unaffected; public pricing page still lists Claude Code under Pro. If the test rolls out broader, swap in **Z.ai Coding Plan Lite ($18/mo)** which gives GLM-5.1 inside Claude Code via the Anthropic-compatible endpoint at the same dollar cost.

---

## 4. Fallback Ladder (when primary stack hits a quota)

When a paid quota dries up, route in this order until you get a usable response:

1. **Primary subscription** (OpenCode Go / Claude Pro / ChatGPT Plus / Z.ai)
2. **OpenRouter pay-go with BYOK** against the same provider — bypass the 5% markup, stay under 1M req/mo for free
3. **Chutes** ($10/mo, 2,000 req/day) — open-weight models (GLM-4.7, DeepSeek V3.2, Kimi K2, gpt-oss-120b)
4. **OpenRouter free models** (28 of them, 20 req/min, 200 req/day per model — enough for Watcher backup or low-stakes ideation)
5. **OpenCode Zen FREE** (MiniMax M2.5, Ling 2.6 Flash, Big Pickle stealth, Nemotron 3 Super) — non-confidential only since prompts are logged
6. **Local Ollama** (Watcher Gemma + a Qwen3-Coder-30B or GLM-4.5-Air for emergencies)

---

## 5. Hermes ProviderProfile Toggle

Hermes v0.13 ships `ProviderProfile` ABC + `plugins/model-providers/` directory. Subclass declares `auth_path`, `base_url`, `model_catalog`, `caching_headers` for any OpenAI/Anthropic/Codex-compatible endpoint. Define BV + BP profiles in `~/.hermes/config.yaml`:

```yaml
profiles:
  best_value:
    orchestrator:    opencode-go/glm-5.1
    architect:       opencode-go/glm-5.1
    planner:         qwen-code/qwen3.5-plus
    senior_coder:    openrouter/x-ai/grok-4.3
    junior_coder:    opencode-go/glm-5.1
    tester:          opencode-go/kimi-k2.6        # vision + Playwright MCP
    security:        z-ai-anthropic/glm-5.1
    devops:          opencode-go/glm-5.1
    infrastructure:  opencode-go/glm-5.1
    interface_designer: opencode-go/glm-5.1
    brand_designer:  opencode-go/glm-5.1
    motion_designer: opencode-go/glm-5.1
    researcher:      kimi-cli/kimi-k2.6
    tech_writer:     opencode-go/glm-5.1
    triage:          opencode-go/glm-5.1
    ba_handoff:      opencode-go/glm-5.1
    ba_brain:        gemini-live/gemini-3.1-flash-live   # Pipecat config, not Hermes

  best_performance:
    orchestrator:    vertex/gemini-3.1-pro
    architect:       claude-code/opus-4.7
    planner:         codex-cli/gpt-5.5
    senior_coder:    claude-code/opus-4.7
    junior_coder:    codex-cli/gpt-5.5
    tester:          claude-code/sonnet-4.6
    security:        claude-code/opus-4.7
    devops:          codex-cli/gpt-5.5
    infrastructure:  claude-code/opus-4.7
    interface_designer: claude-code/sonnet-4.6
    brand_designer:  claude-code/sonnet-4.6
    motion_designer: gemini-cli/gemini-3.1-pro
    researcher:      gemini-cli/gemini-3.1-pro
    tech_writer:     claude-code/sonnet-4.6
    triage:          claude-code/sonnet-4.6
    ba_handoff:      claude-code/sonnet-4.6
    ba_brain:        xai/grok-voice-think-fast-1.0       # Pipecat config

watcher:
  model: ollama/gemma4-e4b              # both profiles; swap to phi-4-mini for BP
  cron_mode: no_agent_watchdog
```

Toggle: `hermes profile use best_value` or `hermes profile use best_performance`. Watcher is profile-independent (not on the critical path).

---

## 6. Three Calls That Save Real Money

1. **OpenCode Go is the highest-leverage $10 in this stack.** GLM-5.1 + Kimi K2.6 + DeepSeek V4 Pro + Qwen 3.5/3.6 Plus + MiniMax M2.7 + MiMo-V2.5-Pro — all under one $10/mo subscription. No other provider gets you that breadth. Effectively your default Best-Value engine for everything except the Watcher.
2. **Claude Pro doubles as your mockup generator.** On the BP stack, Claude Artifacts streaming via the API replaces a separate v0 Premium subscription ($20 saved). Artifacts handle React + Tailwind + shadcn — close enough to v0's output for a first-draft client mockup during a live call.
3. **Don't pay Z.ai and OpenCode Go simultaneously** — for *pure model access*. OpenCode Go already includes GLM-5.1. Z.ai Lite ($18) is only worth the overlap if you specifically need the Z.ai-direct Anthropic-compatible endpoint, vision MCP, web search MCP, and Zread MCP that come bundled in Z.ai's plan but not in OpenCode Go. **Recommendation, not a hard rule** — some projects may justify the overlap.

---

## References

- [`personas/`](../personas/) — per-persona detail (17 files across 5 disciplines)
- [`strategy/agent_orchestration.md`](agent_orchestration.md) — 3-layer orchestration + 11 Paperclip meta-agents
- [`strategy/two_tier_architecture.md`](two_tier_architecture.md) — Tier 1 / Tier 2 separation
- [`execution/persona_hermes_config.md`](../execution/persona_hermes_config.md) — Pattern A vs Pattern B persona hosting; canonical Junior Coder + Codex CLI cowork example
- [`execution/use_case_team_mapping.md`](../execution/use_case_team_mapping.md) — UC → persona team mapping
- [Hermes Agent v0.13 release](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.5.7)
- [Gemini 3.1 Flash Live](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-3-1-flash-live/)
- [Grok Voice Agent API](https://x.ai/news/grok-voice-agent-api)
- [Recall.ai](https://www.recall.ai/)

---

*Owner: Felix Stanley (COO) — 2026-05-10*
