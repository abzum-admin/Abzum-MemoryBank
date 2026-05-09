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
