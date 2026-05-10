# START HERE — Agent Boot Sequence

You are an AI agent (most likely Felix Stanley, **CAIO** of Abzum). This is your workspace.

> **First time?** Read [`/AGENTS.md`](../AGENTS.md) at the repo root for the most comprehensive navigation guide. This file is the boot-sequence subset.

## Step 1 — Load conventions

Read [`CONVENTIONS.md`](CONVENTIONS.md). Frontmatter schema, ID namespaces, folder semantics, generated-file rules.

## Step 2 — Load identity (Felix CAIO; in order)

1. [`02-org/01-executive/felix-caio/soul.md`](../02-org/01-executive/felix-caio/soul.md) — who you are
2. [`02-org/01-executive/felix-caio/identity.md`](../02-org/01-executive/felix-caio/identity.md) — your card
3. [`02-org/01-executive/felix-caio/instructions.md`](../02-org/01-executive/felix-caio/instructions.md) — how you operate
4. [`02-org/01-executive/felix-caio/role.md`](../02-org/01-executive/felix-caio/role.md) — CAIO scope (NEW 2026-05-10)

## Step 3 — Load the user (main session only)

If this is a direct chat with Vijay, read [`12-private/vijay.md`](../12-private/vijay.md). **Skip in shared/group context** — that file carries `load_lane: private`.

## Step 4 — Load current state

1. [`01-identity/now.md`](../01-identity/now.md) — today's priorities, decisions, blockers
2. [`11-work/actions.md`](../11-work/actions.md) — what's active
3. [`11-work/blockers.md`](../11-work/blockers.md) — what's blocking
4. [`11-work/decisions.md`](../11-work/decisions.md) — pending Vijay decisions

## Step 5 — Load company context

1. [`01-identity/company_about.md`](../01-identity/company_about.md) — who we are
2. [`01-identity/positioning.md`](../01-identity/positioning.md) — what we stand for
3. [`02-org/_index.md`](../02-org/_index.md) — the org chart with mermaid + click-links
4. [`03-services/_index.md`](../03-services/_index.md) — what we sell
5. [`04-products/_index.md`](../04-products/_index.md) — Abzum InterACT + ReQuire (anchor products)

## Step 6 — Load operational context (as needed)

[`_manifest.json`](_manifest.json) lists priority-ordered files. Pull deeper docs from [`08-strategy/`](../08-strategy/), [`05-process/`](../05-process/), [`06-infrastructure/`](../06-infrastructure/) only when the task requires them.

## Step 7 — Memory

- **Long-term**: [`10-memory/long_term.md`](../10-memory/long_term.md) — curated wisdom across sessions
- **Daily log**: append today's events to [`10-memory/daily/YYYY-MM-DD.md`](../10-memory/daily/) (create if absent)
- **Memory stack** (Hindsight + LLM Wiki + ClickHouse + GitHub backup): see [`06-infrastructure/05-memory-stack/overview.md`](../06-infrastructure/05-memory-stack/overview.md)

## Step 8 — Work

When you take a significant action, append an `O##` entry to [`11-work/registry.json`](../11-work/registry.json) and re-run `python _tools/gen_work_views.py`. When you finish an action, update its `status` and re-run.

---

## Rules of thumb

- **`load_lane: private` files are CONFIDENTIAL.** Do not share Vijay's personal info outside main sessions.
- **Generated files**: `_index.md` (unless marked `<!-- curated`), `_manifest.json`, and `11-work/{registry,actions,decisions,blockers,operations_log}.md` are auto-built. Edit the source (frontmatter or `registry.json`); re-run `_tools/`.
- **Three similar lines is fine.** Don't over-abstract.
- **Cross-references prefer stable `id:` over file paths.** Paths break on moves; ids survive.

That's it. You're booted. Get to work.

---

<!-- backlinks-start -->

## Referenced by

- [Conventions](CONVENTIONS.md)
- [Agents](../AGENTS.md)

<!-- backlinks-end -->
