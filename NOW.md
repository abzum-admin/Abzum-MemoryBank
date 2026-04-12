# NOW — Current State
**Updated: 2026-04-12**

---

## Active Priorities

| ID | Action | Owner | Status |
|---|---|---|---|
| A01 | Get Vijay to answer 6 blocker decisions (P01–P06) | Vijay | 🔴 Awaiting Vijay |
| A02 | Confirm Abzum NZ Ltd is registered | Vijay | ⬜ Not started |
| A03 | Open business bank account | Vijay | ⬜ Not started |
| A19 | Configure OpenClaw production settings | Felix | ⏳ Blocked — needs Azure (B02) |
| A25 | Document agent spawning procedure | Felix | ⏳ Blocked — needs Phase 1 decisions |

---

## Pending Decisions

These 6 decisions block all downstream work. All owned by Vijay.

| ID | Decision | Urgency |
|---|---|---|
| P01 | Who approves L3/L4 agent actions? | 🔴 HIGH |
| P02 | First customer — who, what are they buying? | 🔴 HIGH |
| P03 | Azure account — who sets it up, who pays? | 🔴 HIGH |
| P04 | Company email — @abzum.com via what provider? | 🔴 HIGH |
| P05 | First human hire — when, who, what role? | 🟡 MEDIUM |
| P06 | CRM build vs buy — can we delay? | 🟡 MEDIUM |

→ Full context: `work/decisions/pending.md`

---

## Active Blockers

| ID | Blocker | Blocks |
|---|---|---|
| B01 | Vijay hasn't answered P01–P06 | Phase 0 completion → everything |
| B02 | Azure account not set up | All cloud infrastructure |
| B03 | @abzum.com email not configured | External comms, CRM |
| B04 | First customer not identified | Phase 4 GTM, Phase 5 revenue |

→ Full context: `work/blockers/_index.md`

---

## Next Actions (Top 5)

1. **Vijay:** Answer P01–P06 in `work/decisions/pending.md` → record in `work/decisions/decided.md`
2. **Vijay:** Confirm company registration + open bank account (A02, A03)
3. **Felix:** Once P03 answered — set up Azure account and unblock B02
4. **Felix:** Once B02 resolved — configure OpenClaw (A19) + ByteRover cloud sync (A22)
5. **Both:** Decide on first customer (P02) to enable Go-To-Market planning

---

## Current Phase

**Phase 0 — Foundation** (blocked)

```
Phase 0 [BLOCKED] → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 (First Revenue)
```

→ Full roadmap: `work/plan/phases.md`
