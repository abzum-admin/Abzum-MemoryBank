---
children_hash: c9db9f40227a8b858d95bd422e4859a53f20f6de102c97540d15d425253ff1e0
compression_ratio: 0.10050150451354062
condensation_order: 2
covers: [azure_architecture.md, bimemorybank_git_sync.md, compliance_roadmap.md, data_architecture.md, email_setup_brevo_cloudflare.md, ollama/_index.md, ollama_local.md, security_stack.md]
covers_token_total: 4985
summary_level: d2
token_count: 501
type: summary
---
<think>
The user wants me to create a structural summary of the provided knowledge entry about local LLM setup with Ollama. I need to condense the input into ~20-30% of the input token count while preserving key facts, architectural decisions, and relationships.

Let me extract the key information:

1. **Ollama v0.20.0** at `/home/node/.local/bin/` (non-standard install)
2. **Library path:** `/home/node/.local/bin/lib/ollama/`
3. **Default model:** llama3.2 (3B params, ~2GB)
4. **CPU-only inference** with cold start 3-5s
5. **API:** OpenAI-compatible at `localhost:11434/v1`
6. **Key rules:**
   - Must set `LD_LIBRARY_PATH` before running
   - Start with `nohup` + log redirection
   - Access via `http://localhost:11434/v1`
7. **Extraction:** Uses Python `zstandard` package
8. **Related context:** `infrastructure/ollama/` parent, `ollama_local.md` for deployment patterns

Let me write a concise summary in ~20-30% of the token count.
</think>

# Local LLM Setup — Ollama v0.20.0

## Core Configuration

| Setting | Value |
|---------|-------|
| Binary | `/home/node/.local/bin/bin/ollama` |
| Libraries | `/home/node/.local/bin/lib/ollama/` |
| API | `localhost:11434` (OpenAI-compatible `/v1`) |
| Default Model | `llama3.2` (3B, ~2GB) |
| Execution | CPU-only, cold start 3–5s |

## Startup Command

```bash
export LD_LIBRARY_PATH=/home/node/.local/bin/lib/ollama:$LD_LIBRARY_PATH
nohup /home/node/.local/bin/bin/ollama serve > /home/node/.local/bin/ollama.log 2>&1 &
```

## Key Rules

1. **LD_LIBRARY_PATH required** — Must be set before running the binary
2. **Use nohup with log redirection** — For reliable background service
3. **API access** — OpenAI-compatible endpoint at `http://localhost:11434/v1`

## Extraction Note

Binary extraction uses Python `zstandard` package (not the `zstd` CLI).

## Related Context

- `infrastructure/ollama/` — Parent domain summary
- `ollama_local.md` — Full deployment patterns including integration with Abzum AI stack and multi-model pull commands