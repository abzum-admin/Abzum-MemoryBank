# Pending Decisions

> **What:** Decisions awaiting Vijay's input
> **Urgency:** HIGH — these block other work
> **Owner:** Vijay Tilak

---

## 6 Blocker Decisions — Must Answer First

These block Phase 0 completion and all subsequent phases.

| ID | Decision | What It Blocks | Urgency |
|---|---|---|---|
| P01 | **Who approves L3/L4 actions?** (Vijay only, or delegated to Head of Customer Relations?) | Access Control implementation, Agent authority levels, HITL triggers | 🔴 HIGH |
| P02 | **First customer — who is it, what are they buying?** | Go-to-market, pricing, first project scope, first revenue | 🔴 HIGH |
| P03 | **Azure account — who sets it up, who pays?** | Infrastructure, Entra ID, Key Vault, all cloud services | 🔴 HIGH |
| P04 | **Company email — @abzum.com via what provider?** (Google Workspace $12/mo? Microsoft 365? Free?) | External comms, CRM integration, brand | 🔴 HIGH |
| P05 | **First human hire — when, who, what role?** | Customer Comms (need Account Manager), Phase 3 | 🟡 MEDIUM |
| P06 | **CRM build vs buy — can we delay this?** | Customer Comms Phase 2 implementation | 🟡 MEDIUM |

---

## Why These Block Progress

Without P01-P04 answered, we cannot:
- Implement access control in agents
- Set up infrastructure credentials
- Communicate with customers professionally
- Move from Phase 0 → Phase 1

Without P05-P06 answered, we cannot:
- Staff the customer communications team
- Build the CRM or choose a SaaS alternative

---

## How to Answer

When Vijay is ready to answer:
1. Add the decision to `work/decisions/decided.md` with ID, decision, date, and rationale
2. Mark as `✅ Done` in this file
3. Update the relevant action items in `work/actions/_index.md`
4. If it unblocks a phase, update `work/plan/phases.md`
5. If it creates new action items, add them to `work/actions/backlog.md`

---

## Note to Felix

When Vijay answers these questions, record them immediately in `work/decisions/decided.md`. Do not wait. Update the relevant files within the same session.
