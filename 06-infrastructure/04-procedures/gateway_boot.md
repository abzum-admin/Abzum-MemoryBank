---
id: ops-proc-gw-boot
title: Gateway Boot Conflict Resolution
summary: Resolve BOOT.md ↔ cron wake-up conflicts
tags: [procedures, gateway]
updated: 2026-05-09
load_priority: 30
load_lane: reference
status: active
---
## Raw Concept
**Task:**
Resolve conflict between BOOT.md and one-time cron wake-up for gateway restart recovery

**Changes:**
- Identified BOOT.md conflicts with cron wake-up
- Solution: remove BOOT.md entirely

**Flow:**
restart -> BOOT.md fires -> cron wake-up fires -> BOOT.md overrides cron message

**Timestamp:** 2026-04-02

## Narrative
### Structure
Gateway restart recovery uses two mechanisms: BOOT.md (openclaw boot file) and one-time cron wake-up. These conflict when firing at similar times.

### Dependencies
RESTART_WAKE.md + one-time cron approach for gateway restart recovery

### Highlights
Remove BOOT.md entirely. Use only RESTART_WAKE.md + one-time cron for gateway restart recovery.

### Rules
Rule: BOOT.md must be removed from workspace to prevent conflict with cron wake-up

## Facts
- **boot_conflict**: BOOT.md conflicts with one-time cron wake-up when both fire at similar times after restart [project]
- **wake_message_override**: The cron wake-up message gets overridden by BOOT.md firing [project]
- **resolution**: Solution: remove BOOT.md entirely from workspace [project]
