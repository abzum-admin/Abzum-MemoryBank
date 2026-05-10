# personas/ — Project Team Persona Library

This folder contains one `.md` file per active persona on the Abzum project team. The orchestrator reads these files when staffing a project to decide which personas to spawn, which model to back each persona with, and which tools to grant.

## Discipline Layout

| Discipline | Tier | Personas |
|---|---|---|
| `orchestration/` | Tier 1 | Orchestrator, Watcher |
| `product/` | Layer 0 / Tier 1 | Triage / Intake, Business Analyst, Planner |
| `engineering/` | Tier 2 | Architect, Senior Coder, Junior Coder, Tester, Security, DevOps, Infrastructure Engineer |
| `design/` | Tier 2 | Interface Designer, Brand Designer, Motion Designer |
| `knowledge/` | Tier 2 | Researcher, Tech Writer |

17 personas, 5 disciplines.

**Tier mapping** is defined in [`08-strategy/two_tier_architecture.md`](../../08-strategy/two_tier_architecture.md). The 11 Paperclip meta-agents (RBAC, Compliance, Provisioning, etc.) live in Tier 1 alongside Orchestrator/Watcher and are documented separately in [`08-strategy/agent_orchestration.md`](../../08-strategy/agent_orchestration.md). Personas here represent the **active project team** assembled per project.

## Per-Persona File Structure

Each persona file follows the same template — see any existing one for the pattern. Required sections:

1. **Function** — what the persona does, when an orchestrator picks it
2. **Default Stack — Best Value** — model + access path + cost signal
3. **Escalation Stack — Best Performance** — model + escalation triggers
4. **Tools / Cowork CLIs** — native MCP tools and any CLI agents this persona dispatches to (Pattern B cowork)
5. **Hermes Profile Snippet** — YAML for `~/.hermes/config.yaml`
6. **Inputs / Outputs** — upstream and downstream handoffs
7. **Quality Gates** — concrete checks before signaling complete
8. **Use Cases** — links to UC rows in `11-work/registry.json`
9. **References** — strategy/execution docs

## Two Persona-Hosting Patterns

- **Pattern A (Model-as-Engine)** — the LLM IS the persona's brain. Set `model: <provider/<model>` in the Hermes profile.
- **Pattern B (CLI-as-Tool / Cowork)** — a cheap brain orchestrates and dispatches the actual work to a specialist CLI agent (Codex CLI, Claude Code, Aider, Kimi CLI, Qwen Code) via Hermes shell tool. The CLI agent uses its own model under the hood.

Full pattern documentation: [`05-process/persona_hermes_config.md`](../../05-process/persona_hermes_config.md).

## Subscription Stacks

The Best Value ($40/mo) and Best Performance ($50/mo) stacks, the BA voice runtime architecture, and the master persona table live in [`08-strategy/persona_team_v013.md`](../../08-strategy/persona_team_v013.md).

## Use-Case Mapping

Which personas join which Abzum project use cases is in [`05-process/use_case_team_mapping.md`](../../05-process/use_case_team_mapping.md).

---

<!-- backlinks-start -->

## Referenced by

- [Persona Hermes Config](../../05-process/persona_hermes_config.md)
- [Use Case Team Mapping](../../05-process/use_case_team_mapping.md)
- [Agent Orchestration](../../08-strategy/agent_orchestration.md)
- [Persona Team V013](../../08-strategy/persona_team_v013.md)
- [Two Tier Architecture](../../08-strategy/two_tier_architecture.md)

<!-- backlinks-end -->
