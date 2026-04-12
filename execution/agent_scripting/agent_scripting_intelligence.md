---
title: Agent Scripting Intelligence
tags: []
related: [execution/agent_workflow.md]
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-04-03T11:03:17.432Z'
updatedAt: '2026-04-03T11:03:17.432Z'
---
## Raw Concept
**Task:**
Document agent scripting intelligence pattern for reusable scripts

**Flow:**
Task identified (3+ repetitions) -> Extract fixed logic -> Write script -> Register in registry -> Invoke via ~500 tokens

## Narrative
### Structure
Scripts stored in scripts/shared/ with registry.json index. Script types: Bash (file/log processing), Python (complex logic, APIs), CLI wrappers.

### Dependencies
Requires repeated task identification (3+ repetitions threshold)

### Highlights
Token savings: ~50,000 tokens per non-scripted task → ~500 tokens per scripted call (~99% reduction). Enables ~5-10x more productive tasks per month for same budget.

### Rules
Golden rule: if you've done this task 3 times, write the script.

### Examples
Example: File processing task repeated 3 times → Bash script in scripts/shared/file_processor.sh registered in registry.json
