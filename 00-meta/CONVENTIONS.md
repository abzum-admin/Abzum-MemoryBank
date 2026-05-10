---
id: conventions
title: Repository Conventions
summary: Frontmatter schema, ID namespaces, folder semantics
tags: [meta, conventions]
updated: 2026-05-09
load_priority: 90
load_lane: reference
status: active
---
# Repository Conventions

This file is the single source of truth for how Abzum-MemoryBank is organized. Any AI agent or human modifying the repo MUST follow these rules.

---

## 1. Folder Semantics

| Folder | Contains | Read by |
|---|---|---|
| `agent/` | Agent persona, identity, instructions, tools, heartbeat | AI agents at session start |
| `user/` | Human user profile (private; load only with consent) | AI agents when explicit |
| `company/` | Who we are: about, use cases, team | All audiences |
| `strategy/` | Where we're going: master plan, org model, research | All audiences |
| `execution/` | How we work: workflow, TDD, handoffs, frameworks | AI agents (operational) |
| `operations/` | The engine: infrastructure, services, security, procedures | AI agents (operational) |
| `work/` | Live state: registry, actions, decisions, blockers, log, plan | AI agents and humans daily |
| `memory/` | Continuity: long-term insights, daily logs, milestones | AI agents at session start |
| `research/` | Large standalone research reports | On-demand reference |
| `assets/` | Logos, diagrams, generation scripts | Reference |

---

## 2. Frontmatter Schema

Every leaf `.md` file (i.e. NOT `_index.md`, `README.md`, `START_HERE.md`, `CONVENTIONS.md`, `registry.md`) MUST have YAML frontmatter:

```yaml
---
id: ops-azure                # REQUIRED. Stable kebab-case ID. Globally unique.
title: Azure Architecture    # REQUIRED. Human-readable title.
summary: One-line summary    # REQUIRED. Used by _index.md generators.
tags: [infrastructure, azure, cloud]   # OPTIONAL. Free-form tags.
updated: 2026-05-09          # REQUIRED. ISO date of last meaningful change.
load_priority: 50            # REQUIRED. 0-100. Controls _manifest.json ordering.
load_lane: context           # REQUIRED. context | summary | reference | private
status: active               # REQUIRED. active | draft | deprecated | archived
related: [ops-data]          # OPTIONAL. List of `id` values for cross-refs.
---
```

### Field semantics

- **`id`** — Stable across renames. Manifest resolves `id` → path at build time. Use kebab-case prefixed by domain (`ops-`, `strat-`, `exec-`, `work-`, `mem-`, `co-`, `agent-`, `user-`, `res-`).
- **`load_priority`** — Higher = loaded earlier in agent context. Reserve `90+` for meta files (CONVENTIONS, START_HERE), `70–89` for foundational identity, `50–69` for active operational context, `30–49` for reference, `<30` for archive.
- **`load_lane`** — `context` (loaded by default), `summary` (high-level overview), `reference` (load on demand), `private` (excluded from default load; requires explicit consent).
- **`status`** — `deprecated` and `archived` files are excluded from default agent loading.

---

## 3. Generated Files (Do Not Hand-Edit)

These files are **build outputs**. Hand-edits will be overwritten:

- `_index.md` (in every folder) — regenerated from each child's `summary` field by `_tools/gen_indexes.py`.
- `_manifest.json` (root) — regenerated from frontmatter by `_tools/gen_manifest.py`.
- `11-work/registry.md`, `11-work/actions.md`, `11-work/decisions.md`, `11-work/blockers.md` — regenerated from `11-work/registry.json` by `_tools/gen_work_views.py`.

Each generated file has a `# generated, do not edit` comment at the top.

---

## 4. Work-Tracking ID Namespaces

All work IDs live in `11-work/registry.json` (machine-readable source of truth).

| Namespace | Meaning | Format | Example |
|---|---|---|---|
| `A##` | Action | `A` + zero-padded number | `A01`, `A72` |
| `B##` | Blocker | `B` + zero-padded number | `B01`, `B04` |
| `P##` | Pending decision | `P` + zero-padded number | `P01`, `P06` |
| `D##` | Decided decision | `D` + zero-padded number | `D01`, `D15` |
| `UC-##` | Use case | `UC-` + zero-padded number | `UC-01`, `UC-20` |
| `O##` | Operations log entry | `O` + zero-padded number | `O01`, `O37` |

**Rule:** When referencing an ID in any `.md` file, that ID MUST exist in `registry.json`. The link checker enforces this.

---

## 5. Naming Conventions

- **Files:** `lower_snake_case.md` (e.g. `agent_workflow.md`, not `Agent-Workflow.md` or `agentWorkflow.md`).
- **Folders:** `lower_snake_case/` (same rule).
- **IDs:** kebab-case (e.g. `ops-azure`, not `ops_azure`).
- **No ALLCAPS files** at root anymore. The 5 root files (`README.md`, `START_HERE.md`, `CONVENTIONS.md`, `now.md`, `_index.md`) plus `_manifest.json` and `.snapshot.json` are the only allowed root entries.

---

## 6. Cross-Referencing

- **Within markdown:** use relative paths: `[Azure](../06-infrastructure/01-cloud/azure.md)`.
- **In frontmatter `related:`** use `id` values (stable across renames).
- **Work IDs:** reference inline as `A01`, `B02`, `P03`, `D04`, `UC-05`, `O06`. The link checker verifies these exist in `registry.json`.

---

## 7. Confidentiality

Files with `load_lane: private` are excluded from default agent context loading. The agent loader skips them unless invoked with an explicit consent flag. Currently:

- `12-private/vijay.md` — Managing Director identity
- `12-private/company_team_vijay.md` — Same identity in team context

Never write Vijay's personal details into any non-private file.

---

## 8. Adding New Content

When adding a new `.md` file:

1. Pick the right folder per §1.
2. Add full frontmatter per §2.
3. Pick a unique `id`.
4. If it tracks work, add the corresponding entry to `11-work/registry.json`.
5. Run `_tools/gen_manifest.py` and `_tools/gen_indexes.py` (or wait for the next scheduled regeneration).
6. Run the link checker (`_tools/check_links.sh`) before committing.
