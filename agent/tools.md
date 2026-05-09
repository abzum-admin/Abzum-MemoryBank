---
id: agent-tools
title: Agent Tools & Local Setup
summary: ByteRover memory, Whisper, fallback flat-files, skills inventory
tags: [agent, tools]
updated: 2026-05-09
load_priority: 60
load_lane: reference
status: active
---
# agent/tools.md - Local Notes

## ByteRover Memory System (Primary)
ByteRover is the persistent memory system for Abzum's project context. Full integration is now active:

**Components installed:**
- ByteRover CLI (`/home/node/.openclaw/workspace/node_modules/.bin/brv`) — v2.5.1
- ByteRover Context Engine plugin (`@byterover/byterover@1.1.2`) — installed at `/home/node/.openclaw/extensions/byterover`
- ByteRover Skill — at `/home/node/.openclaw/skills/byterover`

**Features active:**
- ✅ **Context Engine** — ByteRover auto-queries relevant knowledge before each response (via `plugins.slots.contextEngine: byterover`)
- ✅ **Automatic Memory Flush** — pre-compaction insights are curated to ByteRover when context nears limits (`agents.defaults.compaction.memoryFlush.enabled: true`)
- ✅ **Daily Knowledge Mining cron** — runs at 9 AM NZST daily, extracts patterns from memory files, curates to ByteRover
- ✅ **LLM Provider Connected** — Google Gemini (gemini-2.0-flash) connected via BYOK

**Key paths:**
- Context tree: `/home/node/.openclaw/workspace/.brv/context-tree/`
- brv CLI: `/home/node/.openclaw/workspace/node_modules/.bin/brv`
- Workspace: `/home/node/.openclaw/workspace`

**Commands:**
- Query: `cd /home/node/.openclaw/workspace && ./node_modules/.bin/brv query "<question>"`
- Curate: `cd /home/node/.openclaw/workspace && ./node_modules/.bin/brv curate "<fact>"`
- Status: `cd /home/node/.openclaw/workspace && ./node_modules/.bin/brv status`
- View curate history: `./node_modules/.bin/brv curate view`

**Provider:** MiniMax (our default OpenClaw model) connected via BYOK. Gemini was exhausted.

## Fallback Memory (Flat Files)
- Daily logs: `memory/YYYY-MM-DD.md`
- Long-term memory: `memory/long_term.md`
- Company context: `company/about.md`
- User context: `user/vijay.md`
- Identity: `agent/identity.md`, `agent/soul.md`

## Skills
- ByteRover skill: `/home/node/.openclaw/skills/byterover/SKILL.md`
- Weather skill: `/app/skills/weather/SKILL.md`
- Healthcheck skill: `/app/skills/healthcheck/SKILL.md`
- node-connect skill: `/app/skills/node-connect/SKILL.md`

## TTS
- (Not yet configured)

## Whisper (Audio Transcription)
Whisper is configured for voice message transcription. Telegram voice messages (OGG/Opus) are transcribed before processing.

**Components (all in persisted workspace):**
- whisper.cpp binary: `/home/node/.openclaw/workspace/whisper-src/build/bin/whisper-cli`
- Static ffmpeg: `/home/node/.openclaw/workspace/ffmpeg-static/ffmpeg`
- Whisper wrapper: `/home/node/.openclaw/workspace/whisper_wrapper` ✅ (was `/home/node/bin/`)
- Models: `/home/node/.openclaw/workspace/whisper-bin/models/`

**Models installed:**
- `ggml-base.bin` (base model, ~147MB)
- `ggml-medium.bin` (medium model, ~1.5GB)

**Wrapper usage:**
```bash
/home/node/.openclaw/workspace/whisper_wrapper --model base --language en <audio_file.ogg>
```

**OpenClaw config** (`tools.media.audio`):
```json
{
  "type": "cli",
  "command": "/home/node/.openclaw/workspace/whisper_wrapper",
  "args": ["--model", "medium", "--language", "en", "{{MediaPath}}"],
  "timeoutSeconds": 120
}
```

**Important:** All whisper components are in `/home/node/.openclaw/workspace/` which is persisted via bind mount. Do NOT use `/home/node/bin/` for binaries — that directory is ephemeral in Docker.

---

## Hermes v0.13 — Tenacity Release (2026-05-07)

The agent runtime ships these features that the persona team relies on. Master config & toggle in [`strategy/persona_team_v013.md`](../strategy/persona_team_v013.md); pattern detail in [`execution/persona_hermes_config.md`](../execution/persona_hermes_config.md).

**Multi-agent Kanban**: durable SQLite-backed board with heartbeat, zombie detection, reclaim, per-task retries, hallucination recovery, auto-block on incomplete exit. Workers expose a dedicated `kanban_*` toolset. Drives all per-project task dispatch.

**`/goal` Ralph loop**: runs a goal repeatedly until success criteria met; the Orchestrator's primary verb for non-trivial work.

**Cron `no_agent_watchdog` mode**: schedules the Watcher persona to tail trace streams without spawning a costly LLM agent on each fire.

**`video_analyze` tool**: lets the Motion & Video Designer persona self-review reels.

**xAI Custom Voices TTS**: one-way TTS in Hermes (talks at you, not with you). For interactive client conversations the BA persona uses a separate Pipecat/LiveKit runtime — see persona file.

**ProviderProfile ABC** (`plugins/model-providers/`): pluggable inference providers. Subclass declares `auth_path`, `base_url`, `model_catalog`, `caching_headers`. Each plugin's `__init__.py` calls `providers.register_provider(...)`. Lets us define BV / BP profile bundles per [`exec-persona-hermes-config`](../execution/persona_hermes_config.md).

**Checkpoints v2**: durable mid-run snapshots — relied on by long-running Researcher investigations.