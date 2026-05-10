---
id: knowledge-id-namespaces
title: ID Namespaces
summary: Canonical reference for the work-tracking ID prefixes (A##/B##/P##/D##/UC-##/O##) used across the memory bank.
tags: [knowledge, reference, ids, work]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
related: [conventions, knowledge-glossary]
---
# ID Namespaces

All work-tracking IDs live in [`11-work/registry.json`](../11-work/registry.json) (machine-readable source of truth). The link checker (`_tools/check_links.sh`) enforces that any ID referenced in any `.md` file exists in `registry.json`.

## Canonical Prefixes

| Prefix | Meaning | Example | Source |
|---|---|---|---|
| `A##` | **Action** — discrete piece of work with owner + status + dependencies | `A73` (Build InterACT PoC) | `actions:` array in registry.json |
| `B##` | **Blocker** — something blocking other work | `B02` (Azure account not set up) | `blockers:` array |
| `P##` | **Pending Decision** — waiting on Vijay or another decider | `P02` (First customer — who is it?) | `pending_decisions:` array |
| `D##` | **Decided Decision** — locked-in decision with rationale + owner | `D17` (Restructure repo into numbered tree) | `decided:` array |
| `UC-##` | **Use Case** — customer-facing service offering | `UC-30` (Abzum InterACT Tenant Deployment) | `use_cases:` array |
| `O##` | **Operations Log Entry** — significant action taken (audit trail) | `O47` (Restructure landed) | `operations_log:` array |

## Format Rules

- Zero-padded: `A01` not `A1`, `UC-09` not `UC-9`
- Sequential within namespace; never reuse a deleted ID
- The hyphen-prefix on UC (`UC-` not `UC`) is intentional and predates the rest

## When You Add a New ID

1. Add the entry to `11-work/registry.json` in the appropriate array
2. Pick the next available number in that namespace (don't reuse gaps)
3. Run `python _tools/gen_work_views.py` to regenerate the `.md` views
4. Run `bash _tools/check_links.sh` to verify cross-references

## Cross-Reference Format

Inline references in markdown body use the bare prefix:

> Per **D16**, ByteRover is deprecated. See **A74** for migration plan.

Frontmatter `related:` lists use the full `id:` from each file's own frontmatter (not work-tracking IDs):

```yaml
related: [strat-orchestration, persona-orchestrator, infra-memory-hindsight]
```

The two reference styles serve different purposes — work IDs link transient activity; frontmatter ids link stable concepts.

## Relationship to Frontmatter `id:`

Each `.md` file's frontmatter has its own `id:` field (kebab-case, domain-prefixed):

| Domain prefix | Meaning |
|---|---|
| `strat-` | Strategy doc |
| `exec-` | Execution / process doc (legacy, transitioning to `process-`) |
| `process-` | Process doc (new) |
| `infra-` | Infrastructure doc |
| `ops-` | Operations doc (legacy, mostly transitioned to `infra-`) |
| `persona-` | Persona / role file |
| `service-` | Customer-facing service spec |
| `product-` | Product spec |
| `co-` | Company identity / branding |
| `agent-` | Agent identity (Felix's `soul`, `identity`, etc.) |
| `mem-` | Memory / continuity file |
| `res-` | Research investigation |
| `knowledge-` | Reference / glossary doc |
| `user-` | User profile (private) |
| `now` / `conventions` | Top-level singletons |

Frontmatter `id:` survives file moves; markdown link paths break on moves. Prefer `related: [<id>]` over hand-typed paths when cross-referencing.

## Legacy Note

Some pre-2026-05-10 files still carry old `id:` patterns (e.g., `co-felix` for what's now `persona-felix-caio-role`). These are gradually migrating; both old and new ids resolve as long as the file exists.

---

<!-- backlinks-start -->

## Referenced by

- [Conventions](../00-meta/CONVENTIONS.md)
- [Glossary](glossary.md)

<!-- backlinks-end -->
