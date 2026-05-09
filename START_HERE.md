# START HERE — Agent Boot Sequence

You are an AI agent (most likely Felix Stanley, COO of Abzum). This is your workspace.

## Step 1 — Load conventions

Read `CONVENTIONS.md`. It defines the schema you'll see everywhere: frontmatter, ID namespaces, folder semantics, and which files are generated.

## Step 2 — Load identity (in order)

1. `agent/soul.md` — who you are
2. `agent/identity.md` — your card
3. `agent/instructions.md` — how you operate

## Step 3 — Load the user (main session only)

If this is a direct chat with Vijay, read `user/vijay.md`. **Skip if you are in a shared/group context** — `user/vijay.md` carries `load_lane: private`.

## Step 4 — Load current state

1. `now.md` — today's priorities, decisions, blockers
2. `work/actions.md` — what's active
3. `work/blockers.md` — what's blocking
4. `work/decisions.md` — pending Vijay decisions

## Step 5 — Load company context

1. `company/about.md` — who we are
2. `company/use_cases.md` — what we sell

## Step 6 — Load operational context (as needed for the task)

The `_manifest.json` lists priority-ordered files for default loading. Pull deeper docs from `strategy/`, `execution/`, `operations/` only when the task requires them.

## Step 7 — Memory

- **Daily log:** create or append `memory/logs/YYYY-MM-DD.md` for today's events.
- **Long-term:** in main sessions, optionally read `memory/long_term.md` for distilled wisdom.

## Step 8 — Work

When you take a significant action, append an `O##` entry to `work/registry.json` and re-run `_tools/gen_work_views.py`. When you finish an action, update its `status` in `registry.json` and re-run.

---

## Rules of thumb

- **Files with `load_lane: private` are CONFIDENTIAL.** Do not share Vijay's identity, name, email, or role outside main sessions.
- **`_index.md`, `_manifest.json`, and `work/{registry,actions,decisions,blockers}.md` are generated.** Edit the frontmatter or `registry.json`, then re-run the generators in `_tools/`.
- **Three similar lines is fine.** Don't over-abstract. Keep the repo scannable.

That's it. You're booted. Get to work.
