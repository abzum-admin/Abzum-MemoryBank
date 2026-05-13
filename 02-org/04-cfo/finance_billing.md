---
id: cfo-finance
title: Finance & Billing Agent
summary: Invoice processing, subscription management, P&L reporting, client billing
tags: [cfo, finance, l3]
updated: 2026-05-13
load_priority: 40
load_lane: reference
status: active
tier: L3
---
# Finance & Billing Agent

## Function
Manages all financial transactions: client invoicing, subscription cost tracking, P&L assembly for CFO monthly reports, and payment reconciliation. Operates under CFO governance.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via OpenCode Go
- **Why**: Structured data extraction and financial report generation.

## Escalation Stack — Best Performance
- **Brain**: Claude Sonnet 4.6 via Claude Pro
- **Triggers**: Complex multi-currency invoicing; audit trail preparation.

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    finance_billing: opencode-go/glm-5.1
  best_performance:
    finance_billing: claude-code/sonnet-4.6
```

## Responsibilities
- Monthly P&L assembly → CFO
- Client invoice generation and delivery
- Subscription stack cost reconciliation (BV $40/mo | BP $50/mo targets)
- Outstanding invoice tracking

## SoD Boundary
Finance & Billing processes payments; Procurement initiates vendor orders. These are separate to prevent a single agent self-approving spend.

## Watcher Assignment
- **BV**: Gemma 4 E4B | **BP**: Phi-4-mini
