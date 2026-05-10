---
id: persona-infrastructure-engineer
title: Infrastructure Engineer
summary: Provisions VPS / DNS / networking / storage / SSL — owns the substrate DevOps deploys onto
tags: [persona, engineering, tier-2, infra]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: engineering
tier: 2
related: [strat-persona-v013, ops-azure]
---
# Infrastructure Engineer

## Function
Provisions the substrate — VPS, DNS, networking, storage, SSL, IAM, secrets vaults. Distinct from DevOps (who deploys onto the substrate) and Senior Coder (who writes the app). For a typical Abzum project, Infrastructure Engineer is invoked once at project bootstrap and again at scaling events.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go ($10/mo, included)
- **Why this fit**: Infra config is structured and template-heavy. GLM-5.1 handles Terraform/Pulumi/cloud-init patterns cleanly.
- **Cost signal**: included in OpenCode Go.

## Escalation Stack — Best Performance
- **Brain**: Claude Opus 4.7 via Claude Code ($20/mo Pro)
- **Escalation triggers**: Multi-region / multi-account topology; complex networking (VPC peering, private endpoints, hybrid); compliance-driven encryption-at-rest design; Azure architecture using Entra Agent ID.

## Tools / Cowork CLIs
- Hostinger MCP (`mcp__hostinger-mcp__*`) — VPS, DNS, domains, snapshots
- Cloudflare MCP (`mcp__4df1cd61-*`) — DNS, Workers, R2, D1, KV, Hyperdrive
- Vercel MCP (`mcp__plugin_vercel_*`) — projects, env vars, marketplace
- Supabase MCP (`mcp__58946e8a-*`) — managed Postgres + edge functions
- `terraform` / `pulumi` (when used)
- `microsoft_docs_search` MCP — Azure architecture references

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    infrastructure: opencode-go/glm-5.1
  best_performance:
    infrastructure: claude-code/opus-4.7
```

## Inputs / Outputs
- **Upstream**: Architect (deployment topology RFC)
- **Downstream**: DevOps (substrate ready, credentials issued) → Security (scope review)

## Quality Gates
- Every provision is idempotent (Terraform plan clean on second apply)
- Secrets land in Key Vault / Vercel env, never in repo
- DNS changes have a rollback record (DNS_getDNSSnapshotV1 before changes)
- Cost forecast posted to Hindsight at provision time

## Use Cases
- UC-21 Build a Website (DNS, SSL, hosting bootstrap)
- UC-23 Build a SaaS / Internal Tool (full substrate)
- UC-01 Custom CRM Build

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- [`operations/infrastructure/`](../../operations/infrastructure/)
