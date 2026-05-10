# AGENTS.md — How AI Agents Navigate This Memory Bank

> Single entry point for any AI agent (Felix CAIO, project Orchestrator, sub-task agents) loading this repo. **Read this file first.**

## What This Repo Is

The **company-shaped memory bank** for Abzum NZ Ltd — a 95% AI-agent software-engineering company. Files are organised by *where they belong in the org* (Identity → Org → Services → Products → Process → Infrastructure → Research → Strategy → Knowledge → Memory → Work), not by *what kind of doc* they are. This makes navigation feel like walking through a real company.

## Boot Sequence (in order)

1. **[00-meta/CONVENTIONS.md](00-meta/CONVENTIONS.md)** — frontmatter schema, ID namespaces, generated-file rules. **Skim before any edit.**
2. **[01-identity/](01-identity/)** — who Abzum is. Read `now.md` always; `company_about.md` and `positioning.md` for context.
3. **[02-org/_index.md](02-org/_index.md)** — the **org chart with click-link mermaid diagram**. Find any role here, click through to its persona file.
4. **Your own role file** — depends which agent you are:
   - **Felix Stanley (CAIO)**: [02-org/01-executive/felix-caio/](02-org/01-executive/felix-caio/) — `soul.md` → `identity.md` → `instructions.md` → `role.md`
   - **Project Orchestrator**: [02-org/04-platform-orchestration/01-orchestration/orchestrator.md](02-org/04-platform-orchestration/01-orchestration/orchestrator.md)
   - **Tier-2 personas**: each has its own file under [02-org/02-ai-systems/](02-org/02-ai-systems/) — read your own first
5. **Vijay (if direct chat with founder)**: [12-private/vijay.md](12-private/vijay.md) — **`load_lane: private` — only load with explicit consent**
6. **[11-work/](11-work/)** — live state. `registry.json` is the source-of-truth for actions / decisions / blockers / use cases / ops log; the `.md` files are generated views.

## The Tree at a Glance

| # | Folder | Contains | Read when |
|---|---|---|---|
| 00 | [`00-meta/`](00-meta/) | README, START_HERE, CONVENTIONS, _tools/ generators, _manifest.json | First boot, after restructure, debugging tooling |
| 01 | [`01-identity/`](01-identity/) | Mission, brand, positioning, **`now.md`** live status | Always at session start |
| 02 | [`02-org/`](02-org/_index.md) | **The company tree.** Mermaid org chart with clickable nav to all 43 role files | Composing project teams, understanding reporting lines |
| 03 | [`03-services/`](03-services/_index.md) | What we sell — services catalogue with click-links per UC | Sales / triage / scoping a new client engagement |
| 04 | [`04-products/`](04-products/_index.md) | Abzum-owned products (**InterACT** voice CRM, **ReQuire** requirements elicitation) | Product work, deploying for new tenant |
| 05 | [`05-process/`](05-process/) | How we work — Superpowers TDD, handoff, Kanban, persona Hermes config, UC team mapping | Mid-project execution |
| 06 | [`06-infrastructure/`](06-infrastructure/) | Tech substrate — cloud, security, services, procedures, **memory-stack** | Provisioning, deploys, ops, memory writes |
| 07 | [`07-research/`](07-research/) | Standalone investigations — hermes-hindsight, hermes-space-agents, mcra-ai-security, etc. | Background reading on specific topics |
| 08 | [`08-strategy/`](08-strategy/) | Plans, models — master_plan, agent_orchestration, two_tier, persona_team_v013 | Strategic decisions, scoping new work |
| 09 | [`09-knowledge/`](09-knowledge/) | Reference — agent_tooling_inventory, glossary, id-namespaces | Looking up "what does X mean / where does Y live" |
| 10 | [`10-memory/`](10-memory/) | Continuity — long_term, milestones, daily logs, decisions log | Recall past learnings; write new ones at session end |
| 11 | [`11-work/`](11-work/) | Live state — registry.json + generated registry/actions/decisions/blockers views | Adding A##/O##/D##/UC; checking what's blocked |
| 12 | [`12-private/`](12-private/) | `load_lane: private` — Vijay personal profile | Only with explicit consent in main session |
| 99 | [`99-assets/`](99-assets/) | Logos, diagrams, generation scripts | Brand work, embedding diagrams |

## How to Find Things

| If you need… | Go to… |
|---|---|
| **A persona's role + tools + when to call** | [`02-org/_index.md`](02-org/_index.md) → click the role → its `.md` |
| **What persona team a UC needs** | [`05-process/use_case_team_mapping.md`](05-process/use_case_team_mapping.md) |
| **What we sell + indicative pricing** | [`03-services/_index.md`](03-services/_index.md) + [`03-services/pricing.md`](03-services/pricing.md) |
| **Anchor product specs** | [`04-products/interact/_index.md`](04-products/interact/_index.md) (CRM) + [`04-products/require/_index.md`](04-products/require/_index.md) (discovery) |
| **Which model a persona uses (BV vs BP)** | [`08-strategy/persona_team_v013.md`](08-strategy/persona_team_v013.md) |
| **Hermes config patterns (A vs B)** | [`05-process/persona_hermes_config.md`](05-process/persona_hermes_config.md) |
| **The memory stack (Hindsight + LLM Wiki + GitHub backup)** | [`06-infrastructure/05-memory-stack/`](06-infrastructure/05-memory-stack/) and [`07-research/memory-architecture/`](07-research/memory-architecture/) |
| **Live blockers / pending decisions / actions** | [`11-work/blockers.md`](11-work/blockers.md), [`11-work/decisions.md`](11-work/decisions.md), [`11-work/actions.md`](11-work/actions.md) |
| **Repository conventions + frontmatter schema** | [`00-meta/CONVENTIONS.md`](00-meta/CONVENTIONS.md) |
| **Glossary of internal terms (Tier-1, Pattern A/B, BV/BP)** | [`09-knowledge/glossary.md`](09-knowledge/glossary.md) |

## Persona File Schema

Every persona under `02-org/` follows the same template — see [`08-strategy/persona_team_v013.md`](08-strategy/persona_team_v013.md) for the master pattern. Key sections you'll find on each persona page:

- **Function** — what the persona does, when called
- **Capabilities** — concrete verb-led list
- **When to Call This Persona** — ✅ use when / ❌ don't use for
- **Default Stack — Best Value** — model + access path + cost
- **Escalation Stack — Best Performance** — model + escalation triggers
- **Tools (native MCP)** + **Co-work Agents** + **Cowork CLIs (Pattern B)**
- **Hermes Profile Snippet** (BV / BP YAML)
- **Inputs / Outputs** — sequential handoffs
- **Quality Gates** — checks before signalling complete
- **Use Cases This Persona Joins** — links to UC pages
- **Sample Tasks** — concrete examples
- **References**

If a persona is `status: draft`, the file holds a stub with a `## TBD` section flagging fields needing Vijay sign-off (per A76).

## Two Persona-Hosting Patterns

- **Pattern A (Model-as-Engine)** — the LLM IS the persona's brain. Set `model: <provider>/<model>` in the Hermes profile. Most personas.
- **Pattern B (CLI-as-Tool / Cowork)** — a cheap brain dispatches actual work to a specialist CLI agent (Codex CLI, Claude Code, Aider) via shell tool. Junior Coder dispatching to `codex exec --model gpt-5.5` is the canonical example.

Full detail: [`05-process/persona_hermes_config.md`](05-process/persona_hermes_config.md).

## Two Subscription Stacks

- **Best Value** — $40/mo total ($20 incremental over existing ChatGPT Plus): GLM-5.1 / Kimi K2.6 via OpenCode Go ($10) + Chutes Pro ($10) + local Ollama Watcher
- **Best Performance** — $50/mo total ($30 incremental): Claude Pro ($20) + ChatGPT Plus ($20) + OpenCode Go ($10)

Toggle in `~/.hermes/config.yaml` via `ProviderProfile`. Full detail: [`08-strategy/persona_team_v013.md`](08-strategy/persona_team_v013.md).

## When You Take Action

1. Editing a file? Update its `updated:` frontmatter date.
2. Significant action? Append an `O##` entry to [`11-work/registry.json`](11-work/registry.json) and re-run `python _tools/gen_work_views.py`.
3. New action / decision / blocker / UC? Add to `registry.json` with the right namespace prefix (`A##` / `D##` / `B##` / `P##` / `UC-##`).
4. Moved files or refactored paths? Run `python _tools/fix_relative_links.py` then `bash _tools/check_links.sh`.
5. Always end a turn by re-running `python _tools/gen_manifest.py && python _tools/gen_indexes.py && python _tools/gen_work_views.py && bash _tools/check_links.sh` if you've touched structure.

## Confidentiality

- **`load_lane: private`** — files in `12-private/` are CONFIDENTIAL. Don't share Vijay's identity, email, or personal info outside main sessions.
- **`status: archived` or `deprecated`** — present for migration history; don't depend on for new work.
- **`status: draft`** — stub awaiting fill-in; capabilities listed are *proposed*, not ratified.

## Hard Rules

- **`_index.md` files are generated** by `_tools/gen_indexes.py` UNLESS marked `<!-- curated` at the top (the org chart, services catalogue, product overviews are curated). Don't hand-edit non-curated `_index.md`.
- **`work/registry.{md,actions,decisions,blockers,operations_log}.md` are generated** from `11-work/registry.json`. Edit the JSON; regenerate.
- **Cross-references** prefer stable `id:` (in frontmatter) over file paths. Paths break on moves; ids survive.
- **Three similar lines is fine.** Don't over-abstract. Keep the repo scannable.

## Recent Major Decisions (read these for current direction)

- **D17** (2026-05-10) — repo restructured into numbered company-shaped tree
- **D18** (2026-05-10) — anchor product changed: Abzum InterACT + Abzum ReQuire (CRM Build now one of many services)
- **D19** (2026-05-10) — exec layer all-AI: Felix → CAIO; CDO + CSCO new
- **D20** (2026-05-10) — single client-facing AI = Client Engagement Agent (CEA, supersedes BA)
- **D21** (2026-05-10) — pricing: hourly + per-project estimate (drops legacy ≤$15K rule)
- **D16** (2026-05-10) — ByteRover deprecated; Hindsight + LLM Wiki + GitHub backup primary

Full list in [`11-work/decisions.md`](11-work/decisions.md).

---

That's it. You're booted. **The mermaid org chart in [`02-org/_index.md`](02-org/_index.md) is the single most useful navigation surface** — start there when in doubt.

---

<!-- backlinks-start -->

## Referenced by

- [Start Here](00-meta/START_HERE.md)

<!-- backlinks-end -->
