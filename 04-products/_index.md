<!-- curated 2026-05-10 -->

# Abzum-Owned Products

> Products Abzum builds and owns — distinct from per-client services in [`03-services/`](../03-services/_index.md). Each product is BUILT once and DEPLOYED per-tenant as a service offering.

## Active Products

### 🎙️ Abzum InterACT — voice-activated dynamic CRM

> **Anchor product.** Multi-tenant CRM where the UI renders dynamically in real-time based on voice context. Built on the Hermes + Space Agent dynamic widget pattern.

[`interact/`](interact/_index.md) — full spec

**Why it matters**: replaces traditional CRM UIs (Salesforce, HubSpot) with a voice-first, AI-native surface that adapts to the user's intent moment-to-moment. Multi-tenant with parent-child hierarchy lets MSPs and franchises run nested accounts.

**Status**: PoC (per A73). Sequencing: build PoC → MVP → multi-tenant GA → marketplace.

**Service form**: [UC-30 InterACT Tenant Deployment](../03-services/01-build/interact_deploy.md)

### 🎤 Abzum ReQuire — requirements elicitation

> Productization of the CEA voice + mockup runtime. Conducts client discovery calls, generates UI mockups live, produces structured requirements docs.

[`require/`](require/_index.md) — full spec

**Why it matters**: 80% of ReQuire's runtime is what the CEA already does day-to-day. Productizing it gives Abzum (a) consistent internal tooling for every project's discovery (b) a sellable SaaS product for clients who want self-service discovery for their own teams or customers.

**Status**: v1 (internal-use mode) is fastest-to-deliver — leverage existing CEA stack (per A75). v2 = hosted client mode.

**Service form**: [UC-31 ReQuire Tenant Deployment](../03-services/01-build/require_deploy.md)

## Sequencing Recommendation

Per the approved plan, sequence is **ReQuire v1 first, then InterACT PoC** because:

1. ReQuire's runtime exists already (the CEA voice + Pipecat + Recall.ai + mockup pipeline). Productizing = wrapping in a UI + multi-tenant boundary + deploy automation.
2. InterACT requires the dynamic-UI engine (Hermes + Space Agent), multi-tenancy infrastructure, RLS, voice-to-schema authoring — significantly heavier.
3. Shipping ReQuire first proves the productize-internal-stack pattern, validates the deploy-as-service model, and provides revenue + learnings before InterACT investment.

## Future Product Slots

The 6th layer of `02-org/05-business-ops/future/` (stub) anticipates further products. Candidates (post-v1.5 services):

- **Abzum Observe** — agent observability dashboard (productize Watcher)
- **Abzum Compose** — content generation at scale (productize Researcher + Tech Writer + Brand)
- **Abzum Audit** — automated compliance audit (productize the Compliance Audit service)

These remain catalogued in [`03-services/07-future/`](../03-services/07-future/) until prioritized.

## Related

- [`02-org/_index.md`](../02-org/_index.md) — who builds and operates these products
- [`08-strategy/master_plan.md`](../08-strategy/master_plan.md) — product strategy in context
- [`07-research/hermes-space-agents/hermes_space_agents.md`](../07-research/hermes-space-agents/hermes_space_agents.md) — the dynamic-UI architecture InterACT builds on
