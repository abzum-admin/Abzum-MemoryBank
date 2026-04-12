---
title: Local LLM Setup
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-04-03T11:15:44.140Z'
updatedAt: '2026-04-03T11:15:44.140Z'
---
## Raw Concept
**Task:**
Document Ollama local LLM deployment configuration

**Changes:**
- Initial setup with non-standard install path
- Python zstandard extraction method
- CPU-only inference configuration

**Files:**
- /home/node/.local/bin/ollama
- /home/node/.local/bin/bin/ollama

**Flow:**
install -> extract (zstandard) -> configure LD_LIBRARY_PATH -> start service

**Timestamp:** 2026-04-03

**Patterns:**
- `^LD_LIBRARY_PATH=/home/node/.local/bin/lib/ollama` - Required library path for Ollama runtime
- `^nohup.*ollama serve.*>$` - Ollama service startup command

## Narrative
### Structure
Ollama v0.20.0 installed at /home/node/.local/bin/ (non-standard, no sudo required). Libraries located at /home/node/.local/bin/lib/ollama/. Default model: llama3.2 (3B parameters, ~2GB).

### Dependencies
Python zstandard package (used instead of zstd CLI). LD_LIBRARY_PATH must include /home/node/.local/bin/lib/ollama before running.

### Highlights
CPU-only inference (no GPU available). Cold start ~3-5s. OpenAI-compatible API at http://localhost:11434/v1. Service logs to /home/node/.local/bin/ollama.log.

### Rules
Rule 1: Must set LD_LIBRARY_PATH=/home/node/.local/bin/lib/ollama before running ollama
Rule 2: Start command: nohup /home/node/.local/bin/bin/ollama serve > /home/node/.local/bin/ollama.log 2>&1 &
Rule 3: API endpoint: http://localhost:11434 (OpenAI-compatible at /v1)

### Examples
Startup: LD_LIBRARY_PATH=/home/node/.local/bin/lib/ollama nohup /home/node/.local/bin/bin/ollama serve > /home/node/.local/bin/ollama.log 2>&1 &

## Facts
- **ollama_version**: Ollama version is 0.20.0 [project]
- **default_model**: Default model is llama3.2 with 3B parameters (~2GB) [project]
- **install_path**: Ollama installed at /home/node/.local/bin/ (non-standard path) [project]
- **api_port**: API runs on localhost:11434 [project]
- **inference_hardware**: CPU-only inference (no GPU available) [project]
- **cold_start**: Cold start takes 3-5 seconds [project]
- **extraction_method**: Extracted using Python zstandard package [project]
