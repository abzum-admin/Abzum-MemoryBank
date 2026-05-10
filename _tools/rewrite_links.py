#!/usr/bin/env python3
"""Bulk rewrite legacy paths in all .md files to new structure.

Idempotent. Run after a structural reorg to fix cross-references.
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
EXCLUDE_DIRS = {".git", "_tools", "node_modules", "__pycache__"}

REWRITES: list[tuple[str, str]] = [
    # Phantom files -> real replacements (or removed)
    (r"\bMEMORY\.md\b", "memory/long_term.md"),
    (r"\bABZUM\.md\b", "company/about.md"),
    (r"\bACTIVE_TASKS\.md\b", "work/actions.md"),
    (r"\bBOOTSTRAP\.md\b", "agent/instructions.md"),
    (r"\bMASTER_INDEX\.md\b", "_index.md"),
    (r"\bAGENTS\.md\b", "agent/instructions.md"),
    (r"\bSOUL\.md\b", "agent/soul.md"),
    (r"\bIDENTITY\.md\b", "agent/identity.md"),
    (r"\bUSER\.md\b", "user/vijay.md"),
    (r"\bTOOLS\.md\b", "agent/tools.md"),
    (r"\bHEARTBEAT\.md\b", "agent/heartbeat.md"),
    (r"\bNOW\.md\b", "now.md"),

    # Root research docs moved
    (r"\bSUMMARY\.md\b", "research/hermes_hindsight/summary.md"),
    (r"\bTECHNICAL_REFERENCE\.md\b", "research/hermes_hindsight/technical_reference.md"),
    (r"\bIMPLEMENTATION_GUIDE\.md\b", "research/hermes_hindsight/implementation_guide.md"),
    (r"\bPLAN_OF_ACTION\.md\b", "research/hermes_hindsight/plan_of_action.md"),
    # README.md is special-cased (don't rewrite the new root README's own self-references; only
    # rewrite plain "README.md" tokens that legacy links use)

    # Old operations flat paths -> new sub-folders
    (r"operations/azure_architecture\.md", "operations/infrastructure/azure.md"),
    (r"operations/data_architecture\.md", "operations/infrastructure/data.md"),
    (r"operations/vps_infrastructure\.md", "operations/infrastructure/vps.md"),
    (r"operations/docker_containers\.md", "operations/infrastructure/docker.md"),
    (r"operations/doppler\.md", "operations/infrastructure/doppler.md"),
    (r"operations/email_setup_brevo_cloudflare\.md", "operations/services/email.md"),
    (r"operations/hermes_local_environment\.md", "operations/services/hermes_local.md"),
    (r"operations/bimemorybank_git_sync\.md", "operations/services/memorybank_git_sync.md"),
    (r"operations/ollama_local\.md", "operations/services/ollama.md"),
    (r"operations/ollama/local_llm_setup\.md", "operations/services/ollama.md"),
    (r"operations/ollama/_index\.md", "operations/services/ollama.md"),
    (r"operations/agent_watcher/agent_watcher_system\.md", "operations/services/agent_watcher.md"),
    (r"operations/agent_watcher/_index\.md", "operations/services/agent_watcher.md"),
    (r"operations/agent_watcher/context\.md", "operations/services/agent_watcher.md"),
    (r"operations/security_stack\.md", "operations/security/stack.md"),
    (r"operations/ai_security_framework\.md", "operations/security/ai_framework.md"),
    (r"operations/ai_infrastructure_compliance\.md", "operations/security/compliance.md"),
    (r"operations/compliance_roadmap\.md", "operations/security/compliance_roadmap.md"),
    (r"operations/deploy_service\.md", "operations/procedures/deploy_service.md"),
    (r"operations/setup_app\.md", "operations/procedures/setup_app.md"),
    (r"work/operations/gateway_boot_conflict_resolution\.md", "operations/procedures/gateway_boot.md"),
    (r"work/operations/gateway_stop_procedure\.md", "operations/procedures/gateway_stop.md"),
    (r"work/operations/log\.md", "work/operations_log.md"),
    (r"work/operations/_index\.md", "work/operations_log.md"),

    # Strategy renames
    (r"strategy/ai_company_master_plan\.md", "strategy/master_plan.md"),
    (r"strategy/two_tier_agent_architecture\.md", "strategy/two_tier_architecture.md"),
    (r"strategy/ai_native_org_structure\.md", "strategy/ai_native_org_overview.md"),
    (r"strategy/ai_native_org/_index\.md", "strategy/ai_native_org_overview.md"),
    (r"strategy/ai_native_org/ai_native_5_tier_org_model\.md", "strategy/ai_native_5_tier_model.md"),
    (r"strategy/ai_native_org/agent_kubernetes\.md", "strategy/agent_kubernetes.md"),
    (r"strategy/ai_native_org/ai_native_org_context\.md", "strategy/ai_native_org_context.md"),
    (r"strategy/ai_native_org/context\.md", "strategy/ai_native_org_context.md"),
    (r"strategy/crm_delivery/_index\.md", "strategy/crm_delivery.md"),
    (r"strategy/crm_delivery/crm_build_deploy_approaches\.md", "strategy/crm_delivery.md"),
    (r"strategy/research/ai_monitoring_research\.md", "strategy/research/ai_monitoring.md"),
    (r"strategy/research/hermes_space_agent_integration\.md", "strategy/research/hermes_space_agents.md"),

    # Execution renames
    (r"execution/agent_workflow\.md", "execution/workflow.md"),
    (r"execution/handoff_protocol\.md", "execution/handoff.md"),
    (r"execution/tdd_cycle\.md", "execution/tdd.md"),
    (r"execution/ai_agent_capabilities\.md", "execution/capabilities.md"),
    (r"execution/ai_company_framework\.md", "execution/company_framework.md"),
    (r"execution/project_management_methodology\.md", "execution/project_management.md"),
    (r"execution/agent_scripting/_index\.md", "execution/agent_scripting.md"),
    (r"execution/agent_scripting/agent_scripting_intelligence\.md", "execution/agent_scripting.md"),

    # Company renames
    (r"company/abzum/_index\.md", "company/about.md"),
    (r"company/abzum/identity\.md", "company/about.md"),
    (r"company/abzum/context\.md", "company/about.md"),
    (r"company/abzum/vision\.md", "company/about.md"),
    (r"company/abzum/top_5_priority_use_cases\.md", "company/use_cases.md"),
    (r"company/abzum/team/felix_stanley\.md", "company/team/felix.md"),
    (r"company/abzum/team/vijay_tilak\.md", "company/team/vijay.md"),
    (r"company/abzum/team/_index\.md", "company/team/_index.md"),

    # Work folder renames
    (r"work/actions/_index\.md", "work/actions.md"),
    (r"work/actions/active\.md", "work/actions.md"),
    (r"work/decisions/decided\.md", "work/decisions.md"),
    (r"work/decisions/pending\.md", "work/decisions.md"),
    (r"work/blockers/_index\.md", "work/blockers.md"),
    (r"work/plan/dynamic-agent-provisioning-plan\.md", "work/plan/dynamic_agent_provisioning.md"),

    # Memory renames
    (r"memory/milestones/context_tree_v1_0_milestone\.md", "memory/milestones/context_tree_v1_0.md"),
    (r"memory/overview/_index\.md", "memory/_index.md"),

    # Diagrams moved
    (r"diagrams/gen_diagram\.py", "assets/diagrams/gen_diagram.py"),
    (r"diagrams/hindsight-clickhouse-flow\.svg", "assets/diagrams/hindsight-clickhouse-flow.svg"),

    # === 2026-05-10 Heavy restructure: numbered top-level company-shaped tree ===
    # Order matters — more-specific first.

    # personas/ → 02-org/02-ai-systems/* and 02-org/04-platform-orchestration/*
    (r"personas/orchestration/orchestrator\.md", "02-org/04-platform-orchestration/01-orchestration/orchestrator.md"),
    (r"personas/orchestration/watcher\.md", "02-org/04-platform-orchestration/01-orchestration/watcher.md"),
    (r"personas/product/triage_intake\.md", "02-org/02-ai-systems/02-project-delivery/triage_intake.md"),
    (r"personas/product/business_analyst\.md", "02-org/02-ai-systems/02-project-delivery/_legacy_business_analyst.md"),
    (r"personas/product/planner\.md", "02-org/02-ai-systems/02-project-delivery/planner.md"),
    (r"personas/engineering/architect\.md", "02-org/02-ai-systems/01-engineering/architect.md"),
    (r"personas/engineering/senior_coder\.md", "02-org/02-ai-systems/01-engineering/senior_coder.md"),
    (r"personas/engineering/junior_coder\.md", "02-org/02-ai-systems/01-engineering/junior_coder.md"),
    (r"personas/engineering/tester\.md", "02-org/02-ai-systems/01-engineering/tester.md"),
    (r"personas/engineering/security\.md", "02-org/02-ai-systems/01-engineering/security.md"),
    (r"personas/engineering/devops\.md", "02-org/02-ai-systems/01-engineering/devops.md"),
    (r"personas/engineering/infrastructure_engineer\.md", "02-org/02-ai-systems/01-engineering/infrastructure_engineer.md"),
    (r"personas/design/interface_designer\.md", "02-org/02-ai-systems/03-design/interface_designer.md"),
    (r"personas/design/brand_designer\.md", "02-org/02-ai-systems/03-design/brand_designer.md"),
    (r"personas/design/motion_designer\.md", "02-org/02-ai-systems/03-design/motion_designer.md"),
    (r"personas/knowledge/researcher\.md", "02-org/02-ai-systems/04-knowledge-intelligence/researcher.md"),
    (r"personas/knowledge/tech_writer\.md", "02-org/02-ai-systems/04-knowledge-intelligence/tech_writer.md"),
    (r"personas/README\.md", "02-org/02-ai-systems/_personas_readme.md"),

    # strategy/ → 08-strategy/ and 07-research/
    (r"strategy/master_plan\.md", "08-strategy/master_plan.md"),
    (r"strategy/agent_orchestration\.md", "08-strategy/agent_orchestration.md"),
    (r"strategy/two_tier_architecture\.md", "08-strategy/two_tier_architecture.md"),
    (r"strategy/persona_team_v013\.md", "08-strategy/persona_team_v013.md"),
    (r"strategy/ai_native_org_overview\.md", "08-strategy/ai_native_org_overview.md"),
    (r"strategy/ai_native_org_context\.md", "08-strategy/ai_native_org_context.md"),
    (r"strategy/ai_native_5_tier_model\.md", "08-strategy/ai_native_5_tier_model.md"),
    (r"strategy/agent_kubernetes\.md", "08-strategy/agent_kubernetes.md"),
    (r"strategy/crm_delivery\.md", "08-strategy/crm_delivery.md"),
    (r"strategy/research/ai_monitoring\.md", "07-research/ai-monitoring/ai_monitoring.md"),
    (r"strategy/research/hermes_space_agents\.md", "07-research/hermes-space-agents/hermes_space_agents.md"),
    (r"strategy/research/mcra_ai_security\.md", "07-research/mcra-ai-security/mcra_ai_security.md"),
    (r"strategy/research/product_watchlist\.md", "07-research/product-watchlist/product_watchlist.md"),

    # execution/ → 05-process/
    (r"execution/workflow\.md", "05-process/workflow_superpowers.md"),
    (r"execution/tdd\.md", "05-process/tdd.md"),
    (r"execution/handoff\.md", "05-process/handoff.md"),
    (r"execution/capabilities\.md", "05-process/capabilities.md"),
    (r"execution/project_management\.md", "05-process/kanban_and_pm.md"),
    (r"execution/skill_matrix\.md", "05-process/skill_matrix.md"),
    (r"execution/company_framework\.md", "05-process/company_framework.md"),
    (r"execution/agent_scripting\.md", "05-process/agent_scripting.md"),
    (r"execution/context_persistence\.md", "05-process/memory_protocol.md"),
    (r"execution/persona_hermes_config\.md", "05-process/persona_hermes_config.md"),
    (r"execution/use_case_team_mapping\.md", "05-process/use_case_team_mapping.md"),

    # operations/ → 06-infrastructure/*
    (r"operations/infrastructure/azure\.md", "06-infrastructure/01-cloud/azure.md"),
    (r"operations/infrastructure/data\.md", "06-infrastructure/01-cloud/data.md"),
    (r"operations/infrastructure/vps\.md", "06-infrastructure/01-cloud/vps.md"),
    (r"operations/infrastructure/docker\.md", "06-infrastructure/01-cloud/docker.md"),
    (r"operations/infrastructure/doppler\.md", "06-infrastructure/03-services/doppler.md"),
    (r"operations/security/ai_framework\.md", "06-infrastructure/02-security/ai_framework.md"),
    (r"operations/security/stack\.md", "06-infrastructure/02-security/stack.md"),
    (r"operations/security/compliance\.md", "06-infrastructure/02-security/compliance.md"),
    (r"operations/security/compliance_roadmap\.md", "06-infrastructure/02-security/compliance_roadmap.md"),
    (r"operations/services/email\.md", "06-infrastructure/03-services/email.md"),
    (r"operations/services/ollama\.md", "06-infrastructure/03-services/ollama.md"),
    (r"operations/services/hermes_local\.md", "06-infrastructure/03-services/hermes_local.md"),
    (r"operations/services/memorybank_git_sync\.md", "06-infrastructure/03-services/memorybank_git_sync.md"),
    (r"operations/services/agent_watcher\.md", "06-infrastructure/03-services/agent_watcher.md"),
    (r"operations/procedures/setup_app\.md", "06-infrastructure/04-procedures/setup_app.md"),
    (r"operations/procedures/deploy_service\.md", "06-infrastructure/04-procedures/deploy_service.md"),
    (r"operations/procedures/gateway_boot\.md", "06-infrastructure/04-procedures/gateway_boot.md"),
    (r"operations/procedures/gateway_stop\.md", "06-infrastructure/04-procedures/gateway_stop.md"),

    # agent/ split: Felix → 02-org/01-executive/felix-caio/; tools → 09-knowledge/
    (r"agent/soul\.md", "02-org/01-executive/felix-caio/soul.md"),
    (r"agent/identity\.md", "02-org/01-executive/felix-caio/identity.md"),
    (r"agent/instructions\.md", "02-org/01-executive/felix-caio/instructions.md"),
    (r"agent/heartbeat\.md", "02-org/01-executive/felix-caio/heartbeat.md"),
    (r"agent/tools\.md", "09-knowledge/agent_tooling_inventory.md"),

    # company/ → 01-identity/ and 02-org/01-executive/felix-caio/
    (r"company/about\.md", "01-identity/company_about.md"),
    (r"company/use_cases\.md", "03-services/legacy_top5_priority.md"),
    (r"company/team/felix\.md", "02-org/01-executive/felix-caio/role.md"),
    (r"company/team/vijay\.md", "12-private/company_team_vijay.md"),

    # user/ → 12-private/
    (r"user/vijay\.md", "12-private/vijay.md"),

    # research/ → 07-research/hermes-hindsight/
    (r"research/hermes_hindsight/summary\.md", "07-research/hermes-hindsight/summary.md"),
    (r"research/hermes_hindsight/implementation_guide\.md", "07-research/hermes-hindsight/implementation_guide.md"),
    (r"research/hermes_hindsight/technical_reference\.md", "07-research/hermes-hindsight/technical_reference.md"),
    (r"research/hermes_hindsight/plan_of_action\.md", "07-research/hermes-hindsight/plan_of_action.md"),
    (r"research/hermes_hindsight/analysis\.md", "07-research/hermes-hindsight/analysis.md"),

    # memory/ → 10-memory/
    (r"memory/long_term\.md", "10-memory/long_term.md"),
    (r"memory/milestones/context_tree_v1_0\.md", "10-memory/milestones/context_tree_v1_0.md"),

    # work/ → 11-work/
    (r"work/registry\.json", "11-work/registry.json"),
    (r"work/registry\.md", "11-work/registry.md"),
    (r"work/actions\.md", "11-work/actions.md"),
    (r"work/decisions\.md", "11-work/decisions.md"),
    (r"work/blockers\.md", "11-work/blockers.md"),
    (r"work/operations_log\.md", "11-work/operations_log.md"),
    (r"work/plan/phases\.md", "11-work/plan/phases.md"),
    (r"work/plan/dynamic_agent_provisioning\.md", "11-work/plan/dynamic_agent_provisioning.md"),

    # assets/ → 99-assets/
    (r"assets/abzum-logo\.svg", "99-assets/abzum-logo.svg"),
    (r"assets/diagrams/", "99-assets/diagrams/"),

    # Root files → 00-meta/ or 01-identity/
    # NOTE: leave bare `now.md` alone if at root reference level inside identity/; only fix relative refs from outside.
    # We intentionally don't rewrite README.md/CONVENTIONS.md/START_HERE.md path patterns globally because they're rare
    # and manual fix is safer.
]


def main() -> None:
    changed = 0
    for path in REPO.rglob("*.md"):
        if any(part in EXCLUDE_DIRS for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        for pattern, replacement in REWRITES:
            text = re.sub(pattern, replacement, text)
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed += 1
            print(f"REWROTE: {path.relative_to(REPO)}")
    print(f"\nDone. {changed} files modified.")


if __name__ == "__main__":
    main()
