---
id: persona-triage-intake
title: Triage / Intake
summary: Layer-0 first contact — classifies a request, extracts urgency and domain, routes to BA or Planner
tags: [persona, product, layer-0]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: product
tier: 1
related: [strat-orchestration, strat-persona-v013]
---
# Triage / Intake

## Function
The Triage persona is the first agent any inbound request hits — from Vijay, a customer email, a Telegram voice memo, or an automated trigger. It classifies the request (project / incident / research / maintenance), extracts urgency and domain, decides whether to route to the BA (for new client work) or directly to the Planner (for known internal tasks), and posts an intake record into the Kanban backlog.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go ($10/mo, included)
- **Why this fit**: Cheap, fast, accurate on classification. Triage is high-volume but each call is short.
- **Cost signal**: ~$0.001 per intake (token count is small).

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Code ($20/mo Pro, included)
- **Escalation triggers**: Inbound request is ambiguous, multi-modal (audio + image attachments), or a known-VIP client where misclassification has commercial cost.

## Tools / Cowork CLIs
- Email + Telegram webhook listeners (existing OpenClaw infra)
- Whisper transcription wrapper (already configured — see `agent/tools.md`)
- Kanban `create` tool — drops the classified intake row
- Calendar lookup (for scheduling BA call) via the `707da64f-*` MCP calendar tools

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    triage: opencode-go/glm-5.1
  best_performance:
    triage: claude-code/sonnet-4.6
```

## Inputs / Outputs
- **Upstream**: Inbound channels (Telegram, email, web form, Felix relay)
- **Downstream**: BA (new client engagement) | Planner (internal/known work) | DevOps (incident) | Researcher (research-only request)

## Quality Gates
- Every intake record has: `source`, `classification`, `urgency`, `domain`, `routed_to`, `client_id?`
- VIP client requests escalate to the BP brain automatically (rule in profile)
- No silent drops — even unclassifiable requests post a "manual review needed" record

## Use Cases
- Entry point for **every** UC. The first persona in every workflow.

## References
- [`strategy/agent_orchestration.md`](../../strategy/agent_orchestration.md) — Layer 0 intake context
- [`strategy/persona_team_v013.md`](../../strategy/persona_team_v013.md)
- [`agent/tools.md`](../../agent/tools.md) — Whisper + Telegram setup
