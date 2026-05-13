---
id: cfo-procurement
title: Procurement Agent
summary: Vendor onboarding, purchase orders, subscription renewals, supplier SLA tracking
tags: [cfo, procurement, l4]
updated: 2026-05-13
load_priority: 35
load_lane: reference
status: active
tier: L4
---
# Procurement Agent

## Function
Manages vendor onboarding, purchase order creation, subscription renewal tracking (model subscriptions, tooling), and supplier SLA monitoring. Operates under Finance & Billing oversight (L3 parent).

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Pro

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    procurement: opencode-go/glm-5.1
  best_performance:
    procurement: claude-code/sonnet-4.6
```

## Responsibilities
- Subscription renewal calendar (OpenCode Go $10, Claude Pro $20, ChatGPT Plus $20, Chutes Pro $10)
- New vendor onboarding (NDA trigger to Legal & Compliance)
- Purchase order creation (requires CFO approval >$200)

## SoD Boundary
Procurement initiates spend requests; Finance & Billing executes payment. No self-approval.

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
