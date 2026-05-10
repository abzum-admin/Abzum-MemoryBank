---
id: persona-security
title: Security
summary: Runs on every Junior PR — vuln review, threat modeling, secrets scan, dependency CVE check, prompt-injection probing
tags: [persona, engineering, tier-2, security]
updated: 2026-05-10
load_priority: 50
load_lane: reference
status: active
discipline: engineering
tier: 2
related: [strat-persona-v013, res-mcra]
---
# Security

## Function
Security runs on every Junior PR (and once at architecture lock by the Architect). Vuln review, threat modeling, secrets scan, dependency CVE check, prompt-injection probing. Cheap enough on the BV stack to gate every PR.

## Default Stack — Best Value
- **Brain**: GLM-5.1 via Claude Code with Z.ai endpoint
- **Why this fit**: High Hermes runtime fit means clean structured findings; cheap enough to run on every PR without budget pain.
- **Cost signal**: ~$0.05 per PR scan; included in $10 OpenCode Go (or $18 Z.ai Lite).

## Escalation Stack — Best Performance
- **Brain**: Claude Opus 4.7 via Claude Code ($20/mo Pro)
- **Escalation triggers**: Architecture-level review (auth boundaries, multi-tenant isolation, encryption-at-rest decisions); Anthropic CyberGym + Project Glasswing leadership; ties #1 OpenClaw zero-shim agentic safety; PRs touching secrets / IAM / database access patterns.

## Tools / Cowork CLIs
- `semgrep` MCP — static analysis (custom rule sets per domain)
- `gitleaks` — secrets scan
- `osv-scanner` — dependency CVE database
- `trivy` — container image scan (when DevOps hands off a Dockerfile)
- Cowork CLI: `claude -p` for deep prompt-injection probing on AI features

## Hermes Profile Snippet
```yaml
profiles:
  best_value:
    security: z-ai-anthropic/glm-5.1
  best_performance:
    security: claude-code/opus-4.7
```

## Inputs / Outputs
- **Upstream**: Tester (PR cleared functionally) | Architect (RFC for review)
- **Downstream**: DevOps (PR cleared for merge) | Senior Coder (security findings to address)

## Quality Gates
- Every PR has: secrets scan (clean), CVE scan (no high/critical), semgrep run (no new findings)
- Every architecture RFC has a threat-model section
- Findings posted with severity, exploit path, suggested fix, and CWE reference

## Use Cases
- Joins **every** code-bearing UC (UC-21, UC-23, UC-01, UC-26, UC-28...)
- UC-26 Code/Security Audit on Existing Codebase — lead persona

## References
- [`08-strategy/persona_team_v013.md`](../../../08-strategy/persona_team_v013.md)
- [`07-research/mcra-ai-security/mcra_ai_security.md`](../../../07-research/mcra-ai-security/mcra_ai_security.md)
- [`operations/security/`](../../operations/security/)

---

<!-- backlinks-start -->

## Referenced by

- [Security Lead](../../03-human-delivery/security_lead.md)
- [Compliance Meta](../../04-platform-orchestration/03-governance/compliance_meta.md)
- [Mcra Ai Security](../../../07-research/mcra-ai-security/mcra_ai_security.md)
- [Persona Team V013](../../../08-strategy/persona_team_v013.md)

<!-- backlinks-end -->
