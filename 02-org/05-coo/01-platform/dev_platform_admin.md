---
id: coo-plat-devplatform
title: Dev Platform Admin
summary: GitHub org admin, Doppler secrets management — merged from GitHub Admin + Doppler Admin
tags: [coo, platform, l4]
updated: 2026-05-13
load_priority: 40
load_lane: reference
status: active
tier: L4
---
# Dev Platform Admin

## Function
Manages Abzum's developer platform tooling. Merged from the former GitHub Admin and Doppler Admin roles — these two tools are tightly coupled (GitHub Actions secrets come from Doppler) and share the same operational context. Operates under Cloud Platforms Admin (L3 parent).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Pro

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    dev_platform: opencode-go/glm-5.1
  best_performance:
    dev_platform: claude-code/sonnet-4.6
```

## Responsibilities
**GitHub (via `mcp__github__*` tools)**
- Org-level repo settings, branch protection rules
- Team membership management (via IAM Agent requests)
- Webhook and integration configuration

**Doppler (secrets management)**
- Project and environment creation
- Secret rotation scheduling
- GitHub Actions sync config

## SoD Boundary
Dev Platform Admin manages the tooling config; DevOps writes the pipelines that consume it. Secret values set by Dev Platform Admin are consumed (not read) by DevOps.

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
