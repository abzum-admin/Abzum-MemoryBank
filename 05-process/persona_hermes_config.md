---
id: exec-persona-hermes-config
title: Persona Hermes Config — Patterns A & B
summary: Two persona-hosting patterns (Model-as-Engine vs CLI-as-Tool cowork) plus Hermes v0.13 ProviderProfile setup
tags: [execution, hermes, personas, config]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
related: [strat-persona-v013, agent-tools]
---
# Persona Hermes Config — Patterns A & B

This document defines the **two patterns** by which a persona is hosted in Hermes v0.13, and the `~/.hermes/config.yaml` shape for each. The master persona table and subscription stacks are in [`strat-persona-v013`](../08-strategy/persona_team_v013.md).

---

## Pattern A — Model-as-Engine

The persona's brain **is** the LLM. The Hermes profile points directly to a provider/model and the model's capabilities define the persona's behaviour. Most personas use this pattern.

```yaml
profiles:
  best_value:
    senior_coder: openrouter/x-ai/grok-4.3
    # role / system prompt / tool grants live in the profile body
```

When to use Pattern A:
- The model's native quality is the bottleneck (review, design, security analysis)
- One round-trip per turn is acceptable (no specialist CLI needed)
- The model is already best-in-class for the task at the chosen price point

---

## Pattern B — CLI-as-Tool (Cowork)

The persona = a Hermes profile with a *cheap* brain (e.g. GLM-5.1) that orchestrates and dispatches the actual work to a specialist CLI agent (Codex CLI, Claude Code, Aider, Kimi CLI, Qwen Code) via Hermes' shell tool + `kanban_*` worker toolset. The CLI agent uses its own model under the hood; the Hermes persona reads the Kanban task, frames it, calls the CLI, verifies output, posts back.

```yaml
profiles:
  best_value:
    junior_coder:
      model: opencode-go/glm-5.1            # cheap orchestrator brain
      cowork_tools:
        - name: codex_cli
          command: codex exec --model gpt-5.5 "{task}"
          when: complex_implementation
        - name: claude_code
          command: claude -p "{task}"
          when: refactor_with_context
        - name: aider
          command: aider --message "{task}" {files}
          when: quick_local_edit
```

When to use Pattern B:
- The specialist CLI carries deep capabilities (e.g. Codex's repo-aware tool use, Claude Code's IDE-style multi-file edits) that justify the dispatch
- Cost per task is dominated by the specialist call, not the orchestration → cheap brain wins
- Different tasks call for different specialists → Hermes brain picks at dispatch time

### Worked example — Junior Coder dispatching to Codex CLI

The Junior Coder persona (see [`02-org/02-ai-systems/01-engineering/junior_coder.md`](../02-org/02-ai-systems/01-engineering/junior_coder.md)) is the canonical Pattern B example. On the BV stack:

```
Kanban task posted → Junior Coder claims it
    │
    ▼
GLM-5.1 brain reads task + acceptance criteria
    │
    ▼
Decides: complex_implementation → uses codex_cli cowork tool
    │
    ▼
Shell call: codex exec --model gpt-5.5 "<framed task>"
    │
    ▼ (Codex CLI runs to completion using GPT-5.5)
GLM-5.1 brain receives diff
    │
    ▼
Verifies: compile? tests pass? diff sane?
    │
    ▼
Opens PR via `gh`, posts kanban progress + Hindsight episode
```

In this pattern, **Codex CLI is the tool** the Junior persona picks up. Senior Coder still reviews the PR — the dispatch doesn't bypass review.

---

## Hermes v0.13 ProviderProfile ABC

Hermes v0.13 ships a `ProviderProfile` ABC plus a `plugins/model-providers/` directory so any third-party inference provider can drop in without core modifications. If a provider speaks an OpenAI-, Anthropic-, or Codex-compatible API, you implement a `ProviderProfile` subclass that declares:

- `auth_path` — env-var name or file path for credentials
- `base_url` — provider's API endpoint
- `model_catalog` — list of models exposed to Hermes
- `caching_headers` — provider-specific prompt-caching conventions

Each provider plugin's `__init__.py` calls `providers.register_provider(ProviderProfile(...))` at module load. Already-shipped: `openrouter`, `anthropic`, `gmi`, `deepseek`, `nvidia`, plus the Z.ai Anthropic-compatible endpoint and OpenCode Go.

Adding a new provider (e.g. xAI's Voice Agent for the BA runtime — though the BA runs outside Hermes anyway):

```python
# plugins/model-providers/xai_voice/__init__.py
from hermes.providers import ProviderProfile, register_provider

register_provider(ProviderProfile(
    name="xai-voice",
    auth_path="env:XAI_API_KEY",
    base_url="https://api.x.ai/v1",
    model_catalog=["grok-voice-think-fast-1.0"],
    caching_headers={"x-prompt-cache": "true"},
    api_compat="openai-realtime",        # OpenAI-Realtime compatible
))
```

---

## Toggling BV ↔ BP

```bash
# Switch the whole team's brains in one command:
hermes profile use best_value
hermes profile use best_performance

# Validate before switching (catches missing API keys):
hermes profile validate best_value
hermes profile validate best_performance

# Per-persona override at dispatch time:
hermes dispatch senior_coder --profile best_performance --task T-1234
```

The Watcher stays the same across profiles (not on the critical path; runs on local Ollama).

---

## Open Questions

### Q1: Watchdog vs long-running cowork CLIs

**Symptom**: When a Junior Coder profile shells out to `codex exec`, the Codex run can take minutes. Hermes' Kanban heartbeat / zombie-detector may flag the long-running CLI as a stall and reclaim the task — wasting work.

**Hypothesis**: We need a heartbeat shim that the Hermes persona emits *while* waiting on the CLI subprocess. Approaches:

- **Subprocess heartbeat** — wrap the CLI invocation in a wrapper that pings the Kanban API every 30 s while the CLI is alive
- **`--watchdog-passthrough` flag** — Hermes runtime feature request: tell the watchdog "the agent is intentionally blocking on a tool call; treat tool-time as live"
- **Async dispatch** — submit the CLI task, return control to Hermes immediately, poll for completion

**Status**: TODO — needs an A-series action. Document the chosen mitigation here once implemented.

### Q2: BA session rollover for Grok 30-min cap

**Symptom**: Grok `voice-think-fast-1.0` enforces a 30-min hard session cap. Discovery calls run 30–60 min.

**Hypothesis**: Pipecat session boundary + Recall.ai bot context handoff. At t=27 min, BA snapshots conversation state to a structured doc, opens a new Grok session, and re-grounds it with the snapshot. Recall.ai bot continues uninterrupted from the client's perspective.

**Status**: TODO — flagged in `02-org/02-ai-systems/02-project-delivery/_legacy_business_analyst.md`. Implementation belongs to a separate A-series action when first BA deployment lands.

### Q3: Cowork CLI cost attribution

**Symptom**: When Junior Coder (GLM-5.1 brain) dispatches to Codex CLI (GPT-5.5), token cost lands on the user's ChatGPT Plus account, not in our Hermes ClickHouse cost stream.

**Hypothesis**: A wrapper around each cowork CLI estimates token usage per dispatch and emits a synthetic `cost_event` to ClickHouse so Cost-Optimizer Tier-1 meta-agent has full visibility.

**Status**: TODO — relates to A54 (token usage tracking) in `11-work/registry.json`.

---

## References

- [`08-strategy/persona_team_v013.md`](../08-strategy/persona_team_v013.md) — master persona table + subscription stacks
- [`02-org/02-ai-systems/01-engineering/junior_coder.md`](../02-org/02-ai-systems/01-engineering/junior_coder.md) — Pattern B canonical example
- [`02-org/02-ai-systems/02-project-delivery/_legacy_business_analyst.md`](../02-org/02-ai-systems/02-project-delivery/_legacy_business_analyst.md) — separate-runtime example
- [`09-knowledge/agent_tooling_inventory.md`](../09-knowledge/agent_tooling_inventory.md) — local tool inventory (Whisper, Ollama, etc.)
- [Hermes Agent v0.13 release notes](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.5.7)
- [Hermes Kanban docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban)
