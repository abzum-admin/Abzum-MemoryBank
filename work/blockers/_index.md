# Blockers

> **What:** Current blockers preventing Abzum from progressing
> **Status:** Updated when blockers are added, resolved, or created

---

## Active Blockers

| Blocker ID | Blocker | Blocks | Owner | Status |
|---|---|---|---|---|
| B01 | Vijay has not answered 6 blocker decisions (P01-P06) | Phase 0 completion, all downstream phases | Vijay | 🔴 OPEN |
| B02 | Azure account not set up | Phase 2 infrastructure, Entra ID, Key Vault, all cloud work | Vijay | 🔴 OPEN |
| B03 | @abzum.com email not configured | External comms, customer-facing communication, CRM | Vijay | 🔴 OPEN |
| B04 | First customer not identified | Phase 4 (Go-To-Market), Phase 5 (First Project), revenue | Vijay | 🔴 OPEN |

---

## Resolved Blockers

| Blocker ID | Blocker | Resolved | How |
|---|---|---|---|
| — | No previous blockers recorded | — | — |

---

## Blocker Dependency Graph

```
B01 (6 decisions) ─────────────────────────┐
    ↓                                       │
B02 (Azure account) ───────────────────────┤
    ↓                                       │
B03 (Email) ────────────────────────────────┤
    ↓                                       │
B04 (First customer) ──────────────────────┤
    ↓                                       ↓
Phase 0 ──→ Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5
```

---

## How to Use This

### Adding a Blocker
1. Assign next ID (B05, B06, etc.)
2. Describe the blocker clearly — what is blocked, why it matters
3. Assign to owner (Vijay or Felix)
4. Note what phase/item it blocks

### Resolving a Blocker
1. Mark as `✅ RESOLVED` with date
2. Move to Resolved Blockers section
3. Check if this unblocks any waiting items
4. Update `work/plan/phases.md` if phase can now progress

### Escalation
If a blocker has been open for more than 7 days:
- Add a note with date it became a blocker
- Flag to Vijay directly

---

## Note to Felix

Review this file daily as part of morning routine. When a blocker is resolved:
1. Record in Resolved Blockers immediately
2. Notify Vijay that the path is now clear for the next phase
3. Update `work/plan/phases.md` phase status
4. Run: `brv curate "Blocker [ID] resolved — [brief description]"`
