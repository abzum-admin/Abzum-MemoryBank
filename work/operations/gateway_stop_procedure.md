---
title: Gateway Stop Procedure
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-04-01T11:06:16.110Z'
updatedAt: '2026-04-01T11:06:16.110Z'
---
## Raw Concept
**Task:**
Document proper procedure for stopping OpenClaw gateway process

**Changes:**
- Added SIGTERM vs SIGKILL distinction

**Flow:**
Identify PID -> Send SIGTERM -> Process terminates gracefully

## Narrative
### Structure
Single-line process management knowledge

### Dependencies
Requires finding gateway PID via pgrep or ps aux

### Highlights
Always use kill -15 (SIGTERM), never kill -9 (SIGKILL). SIGKILL breaks the cron scheduler, breaking all scheduled tasks.

## Facts
- **gateway_stop_signal**: Use 'kill -15' (SIGTERM) to stop the OpenClaw gateway [convention]
- **kill_signal_prohibition**: Never use 'kill -9' (SIGKILL) — it breaks the cron scheduler [other]
- **pid_lookup_command**: Get gateway PID with 'pgrep -f openclaw' or 'ps aux | grep openclaw' [convention]
