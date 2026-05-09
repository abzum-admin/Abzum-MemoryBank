---
id: ops-memorybank-sync
title: MemoryBank Git Sync
summary: GitHub ↔ ByteRover sync setup for the BIMemoryBank repo
tags: [services, git, sync]
updated: 2026-05-09
load_priority: 45
load_lane: reference
status: active
---
# BIMemoryBank Git Sync Architecture

> **Source:** `memory/bimemorybank-architecture-2026-04-01.md`
> **Status:** Architecture designed, not yet deployed
> **Purpose:** Git-backed Business Intelligence Memory Bank for ByteRover context tree

---

## Architecture Overview

ByteRover context tree synced to GitHub as canonical backup, supporting multiple VPS instances.

### High-Level Flow
1. Each VPS runs ByteRover in a worktree on a `vps-<VPS_ID>` branch
2. Auto-sync loop (CRON) pushes/pulls only that VPS's branch
3. GitHub Actions triggers on push to `vps-*`, attempts dry merge into `main`
4. If conflicts → Action calls OpenClaw via secure webhook
5. OpenClaw analyzes diffs, resolves per `.merge-policy.yml`, logs to `MERGE_DECISIONS.md`
6. If confidence low → creates PR, notifies humans, waits for approval
7. `main` is the canonical knowledgebase — updated only after AI or human approval

---

## Key Variables

| Variable | Purpose |
|---|---|
| `VPS_ID` | Unique VPS identifier (hostname or `vps-host-01`) |
| `WORKTREE_DIR` | ByteRover context tree path |
| `REPO_DIR` | Local Git repo root |
| `REMOTE_REPO_URL` | Git remote URL |
| `SYNC_INTERVAL_SECONDS` | Auto-sync frequency (default 120s) |
| `MERGE_CONFIDENCE_THRESHOLD` | 0-1 threshold below which triggers human PR |
| `HUMAN_REVIEWERS` | GitHub usernames for PR assignment |
| `NOTIFY_CHANNEL` | Telegram/Slack webhook for human alerts |
| `OPENCLAW_WEBHOOK` | Secure webhook for GitHub Actions → OpenClaw |

---

## Repository Layout
```
Abzum-MemoryBank-BusinessIntelligence/
 ├─ .github/workflows/merge-vps-branches.yml
 ├─ memory/               ← ByteRover context tree files
 ├─ .merge-policy.yml    ← Merge rules
 ├─ MERGE_DECISIONS.md   ← AI resolution audit log
 └─ other-repo-content/
```

---

## Merge Confidence & Escalation

- **Confidence ≥ threshold:** AI creates `ai-resolution/<branch>`, auto-merges into `main`
- **Confidence < threshold:** Creates PR, labels `ai-merge/needs-review`, notifies `NOTIFY_CHANNEL`, waits for human approval

---

## Deployment Status

**Not yet deployed.** See action item A41 in `work/actions.md`.

---

## See Also
- **Architecture:** `memory/bimemorybank-architecture-2026-04-01.md`
- **Deployment Guide (step-by-step scripts + GitHub Actions):** `memory/bimemorybank-deployment-guide-2026-04-01.md`
- **Scripts:** `init-repo.sh`, `auto-sync.sh`, `restore-vps.sh` (in deployment guide)
- **GitHub Action:** `ai-merge-orchestrator.yml` (in deployment guide)
- **Backup strategy:** `memory/backup-restore-strategy-2026-04-01.md`
