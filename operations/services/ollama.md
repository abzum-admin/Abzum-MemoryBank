---
id: ops-ollama
title: Ollama (Local LLM)
summary: Local LLM via Ollama: install, models, API
tags: [services, llm, ollama]
updated: 2026-05-09
load_priority: 40
load_lane: reference
status: active
---
# Ollama Local LLM — Infrastructure

**Status:** ✅ Operational
**Installed:** 2026-04-03
**Owner:** Felix

## What's Installed

- **Service:** Ollama v0.20.0
- **Model:** llama3.2 (Meta Llama 3.2, 3B parameters, ~2GB)
- **Location:** `/home/node/.local/bin/`
- **API:** `http://localhost:11434`

## Quick Reference

### Start Service
```bash
export LD_LIBRARY_PATH=/home/node/.local/bin/lib/ollama:$LD_LIBRARY_PATH
nohup /home/node/.local/bin/bin/ollama serve > /home/node/.local/bin/ollama.log 2>&1 &
```

### Test
```bash
curl http://localhost:11434/api/generate -d '{"model":"llama3.2","prompt":"Say hello","stream":false}'
```

### Pull More Models
```bash
export LD_LIBRARY_PATH=/home/node/.local/bin/lib/ollama:$LD_LIBRARY_PATH
/home/node/.local/bin/bin/ollama pull <model-name>
```

## Integration with Abzum AI Stack

- **Local inference** — Reduces external API calls to MiniMax/Claude, lowering costs
- **OpenAI-compatible API** — Can potentially act as OpenAI-compatible endpoint at `/v1`
- **Data control** — Sensitive data stays on-premises
- **Available endpoints:**
  - `POST /api/generate` — Text generation
  - `POST /api/chat` — Chat completions
  - `GET /api/tags` — List available models

## Constraints

- **CPU-only** — No GPU on this VPS; runs in CPU mode (slower)
- **Single-user** — Optimized for local/VPS use, not multi-user
- **llama3.2 recommended** — Best balance of quality vs resource usage for CPU inference

## Adding to Abzum Stack

To use Ollama as a model provider in tools/agents:
1. Point API base to `http://localhost:11434`
2. Use model name `llama3.2`
3. For OpenAI-compatible clients: `http://localhost:11434/v1`

## Documentation

Full setup docs: `memory/ollama-setup-2026-04-03.md`
