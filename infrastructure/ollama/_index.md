---
children_hash: a06e618099f3eceefe215c11131a208b8ee1fc514a98c94576e55734af442b1e
compression_ratio: 0.8082437275985663
condensation_order: 1
covers: [local_llm_setup.md]
covers_token_total: 558
summary_level: d1
token_count: 451
type: summary
---
<think>
The user wants me to create a structural summary of the provided knowledge entry about local LLM setup with Ollama. This is a single entry about Ollama deployment configuration.

Key facts to preserve:
- Ollama v0.20.0 at /home/node/.local/bin/ (non-standard, no sudo)
- Libraries at /home/node/.local/bin/lib/ollama/
- Default model: llama3.2 (3B params, ~2GB)
- CPU-only inference
- Cold start ~3-5s
- OpenAI-compatible API at localhost:11434/v1
- Logs to /home/node/.local/bin/ollama.log
- Key rules about LD_LIBRARY_PATH and startup command
- Extraction using Python zstandard package

I need to condense this into ~20-30% of the input token count while preserving key facts, architectural decisions, and relationships.
</think>

# Local LLM Setup

## Overview

Ollama v0.20.0 deployed for local LLM inference with non-standard installation (no sudo required).

## Configuration

| Setting | Value |
|---------|-------|
| Install Path | `/home/node/.local/bin/` |
| Library Path | `/home/node/.local/bin/lib/ollama/` |
| API Port | `localhost:11434` |
| Default Model | `llama3.2` (3B params, ~2GB) |
| Inference | CPU-only |

## Startup

- **Library path required:** `LD_LIBRARY_PATH=/home/node/.local/bin/lib/ollama`
- **Start command:** `nohup /home/node/.local/bin/bin/ollama serve > /home/node/.local/bin/ollama.log 2>&1 &`
- **Cold start:** 3-5 seconds
- **API:** OpenAI-compatible at `/v1`

## Extraction

Python `zstandard` package used (not zstd CLI) for binary extraction.

## Key Rules

1. Set `LD_LIBRARY_PATH` before running ollama binary
2. Use nohup with log redirection for background service
3. Access via `http://localhost:11434/v1` for OpenAI-compatible API

## Related

- `infrastructure/ollama/` — Parent context
- See `ollama_local.md` for detailed deployment patterns