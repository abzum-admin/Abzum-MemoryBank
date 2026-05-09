# Abzum MemoryBank

Persistent memory bank for **Abzum New Zealand Limited** — an AI-native IT services startup. Read by AI agents (Claude Sonnet, MiniMax, DeepSeek) at session start; used by Felix Stanley (COO, AI agent) as an operating manual; ultimate decisions by Vijay Tilak (Managing Director).

**For AI agents:** start at `START_HERE.md`. The `_manifest.json` lists files to preload, ordered by `load_priority`.

**For humans:** start at `now.md` for current state, then `work/registry.md` for the full work backlog.

---

## Layout

```
agent/         Felix's identity, instructions, tools, heartbeat
user/          Vijay's profile (private)
company/       About Abzum, use cases, team
strategy/      Master plan, AI-native org, agent architecture, research
execution/     Workflow, TDD, handoffs, frameworks
operations/    infrastructure / services / security / procedures
work/          Live state — registry, log, plan (registry.json is source of truth)
memory/        Long-term insights, daily logs, milestones
research/      Large standalone research reports (Hermes/Hindsight, etc.)
assets/        Logos and diagrams
_tools/        Regeneration scripts (manifest, indexes, registry views, link check)
```

See `CONVENTIONS.md` for folder semantics, frontmatter schema, ID namespaces, and generated-file rules.

---

## Quick Reference

| Where | What |
|---|---|
| `now.md` | Current state, today's priorities |
| `agent/instructions.md` | Agent session-start ritual and rules |
| `work/registry.md` | All work IDs (A##/B##/P##/D##/UC-##/O##) |
| `work/actions.md` | Active actions only |
| `work/decisions.md` | Pending and decided decisions |
| `work/blockers.md` | Active blockers |
| `work/operations_log.md` | Audit log of significant actions (O##) |
| `memory/long_term.md` | Felix's curated long-term memory (main session only) |
| `memory/logs/` | Daily session logs |

---

## Maintenance

Generated files (`_index.md`, `_manifest.json`, `work/registry.md`/`actions.md`/`decisions.md`/`blockers.md`) are rebuilt from frontmatter and `work/registry.json`:

```bash
python3 _tools/gen_manifest.py    # _manifest.json from frontmatter
python3 _tools/gen_indexes.py     # _index.md per folder
python3 _tools/gen_work_views.py  # work/{registry,actions,decisions,blockers}.md
bash    _tools/check_links.sh     # link integrity check
```

Run all four after any structural change. See `CONVENTIONS.md` §3 and §8.
