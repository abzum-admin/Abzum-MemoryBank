---
id: org-index
title: Abzum Org Chart — AI-Native 5-Tier Model
summary: 30-role org chart with L0 Board, L1 CEO, L2 C-Suite, L3/L4 agents across CDO/CFO/COO/CSCO
tags: [org, index, structure]
updated: 2026-05-13
load_priority: 80
load_lane: identity
status: active
---
# Abzum Org Chart — AI-Native 5-Tier Model

**30 total roles** | 5 human (L0 + future L3 sign-off) | 25 AI agents | Last updated: 2026-05-13

## Tier Overview

| Tier | Count | Description |
|---|---|---|
| L0 | 1 | Human Board — Vijay Tilak (Founding Board Member) |
| L1 | 1 | AI CEO — Felix Stanley |
| L2 | 4 | AI C-Suite — CDO, CFO, COO, CSCO |
| L3 | 15 | Department Lead AI Agents |
| L4 | 9 | Operational AI Agents |

## Org Structure

```mermaid
flowchart TD
    Vijay["Vijay Tilak\nFounding Board Member\n(L0 Human)"]:::human

    Felix["Felix Stanley\nCEO\n(L1 AI)"]:::exec

    CDO["CDO\nChief Delivery Officer\n(L2 AI)"]:::exec
    CFO["CFO\nChief Financial Officer\n(L2 AI)"]:::exec
    COO["COO\nChief Operating Officer\n(L2 AI)"]:::exec
    CSCO["CSCO\nChief Security & Compliance\n(L2 AI)"]:::exec

    Vijay --> Felix
    Felix --> CDO
    Felix --> CFO
    Felix --> COO
    Felix --> CSCO

    subgraph CDO_ENG["CDO · Engineering"]
        Arch["Architect\n(L3)"]:::l3
        Senior["Senior Coder\n(L3)"]:::l3
        Junior["Junior Coder\n(L4)"]:::l4
        DevOps["DevOps\n(L4)"]:::l4
        QA["QA / Test\n(L4)"]:::l4
        SecAgent["Security Agent\n(L4)"]:::l4
    end

    subgraph CDO_UX["CDO · UX"]
        UI["UI Designer\n(L3)"]:::l3
        Brand["Visual & Brand\n(L4)"]:::l4
    end

    subgraph CDO_KI["CDO · Knowledge & Intelligence"]
        KGraph["Knowledge Graph\n(L3)"]:::l3
        LnI["Learning & Improvement\n(L3)"]:::l3
        Watch["Watcher\n(L4)"]:::l4
    end

    subgraph CDO_DEL["CDO · Delivery"]
        PM["PM / Planner\n(L3)"]:::l3
        CE["Client Engagement\n(L3)"]:::l3
        TW["Technical Writer\n(L4)"]:::l4
    end

    CDO --> CDO_ENG
    CDO --> CDO_UX
    CDO --> CDO_KI
    CDO --> CDO_DEL

    subgraph CFO_TEAM["CFO · Finance Ops"]
        Fin["Finance & Billing\n(L3)"]:::l3
        Legal["Legal & Compliance\n(L3)"]:::l3
        Proc["Procurement\n(L4)"]:::l4
    end
    CFO --> CFO_TEAM

    subgraph COO_PLAT["COO · Platform"]
        Cloud["Cloud Platforms Admin\n(L3)"]:::l3
        IAM["IAM Agent\n(L3)"]:::l3
        DevPlat["Dev Platform Admin\n(L4)"]:::l4
    end

    subgraph COO_OBS["COO · Observability"]
        PlatOps["Platform Operations\n(L3)"]:::l3
    end

    subgraph COO_SVC["COO · Service Ops"]
        SD["Service Desk\n(L3)"]:::l3
        KC["Knowledge Capture\n(L4)"]:::l4
    end

    subgraph COO_NET["COO · Foundation"]
        Net["Network & Edge\n(L3)"]:::l3
    end

    COO --> COO_PLAT
    COO --> COO_OBS
    COO --> COO_SVC
    COO --> COO_NET

    subgraph CSCO_SOC["CSCO · SOC"]
        TID["Threat Intel & Detection\n(L3)"]:::l3
        IR["Incident Response\n(L3)"]:::l3
        CR["Compliance & Risk\n(L4)"]:::l4
    end

    subgraph CSCO_POL["CSCO · Policy"]
        SecPol["Security Policy\n(L3)"]:::l3
    end

    CSCO --> CSCO_SOC
    CSCO --> CSCO_POL

    classDef human fill:#fff3cd,stroke:#856404,stroke-width:3px,color:#000
    classDef exec  fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,color:#000
    classDef l3    fill:#d4edda,stroke:#155724,stroke-width:1px,color:#000
    classDef l4    fill:#e8f5e9,stroke:#388e3c,stroke-width:1px,color:#555
```

## Directory Structure

```
02-org/
├── _index.md                          ← this file
├── 01-board/
│   └── vijay_tilak.md                 ← L0 Founding Board Member
├── 02-executive/
│   ├── felix_stanley_ceo.md           ← L1 CEO
│   ├── cdo_chief_delivery_officer.md  ← L2
│   ├── cfo_chief_financial_officer.md ← L2
│   ├── coo_chief_operating_officer.md ← L2
│   └── csco_chief_security_compliance.md ← L2
├── 03-cdo/
│   ├── 01-engineering/                ← Arch(L3) Senior(L3) Junior(L4) DevOps(L4) QA(L4) SecAgent(L4)
│   ├── 02-ux/                         ← UI(L3) VisualBrand(L4)
│   ├── 03-knowledge/                  ← KGraph(L3) L&I(L3) Watcher(L4)
│   └── 04-delivery/                   ← PM(L3) ClientEngagement(L3) TechWriter(L4)
├── 04-cfo/                            ← Finance(L3) Legal(L3) Procurement(L4)
├── 05-coo/
│   ├── 01-platform/                   ← CloudAdmin(L3) IAM(L3) DevPlatform(L4)
│   ├── 02-observability/              ← PlatformOps(L3)
│   ├── 03-service-ops/                ← ServiceDesk(L3) KnowledgeCapture(L4)
│   └── 04-foundation/                 ← NetworkEdge(L3)
└── 06-csco/
    ├── 01-soc/                        ← ThreatIntel(L3) IR(L3) ComplianceRisk(L4)
    └── 02-policy/                     ← SecurityPolicy(L3)
```

## SoD Summary (Key Boundaries)

| Boundary | Why |
|---|---|
| DevOps ≠ Cloud Platforms Admin | Build/run separation |
| Security Agent (CDO) ≠ CSCO SOC | DevSec vs operational security |
| IAM (COO) standalone | Single choke point for access grants |
| Finance & Billing ≠ Procurement | No self-approving spend |
| Legal & Compliance (CFO) ≠ Compliance & Risk (CSCO) | Contractual vs infosec compliance |
| CSCO reviews RBAC; COO/IAM provisions | Policy vs execution separation |

## References
- [`08-strategy/persona_team_v013.md`](../08-strategy/persona_team_v013.md) — model assignments
- [`08-strategy/agent_orchestration.md`](../08-strategy/agent_orchestration.md) — Hermes orchestration
- [`05-process/use_case_team_mapping.md`](../05-process/use_case_team_mapping.md) — UC → agent mapping
