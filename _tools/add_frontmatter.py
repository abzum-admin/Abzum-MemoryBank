#!/usr/bin/env python3
"""One-off: add/replace frontmatter on every leaf .md file per CONVENTIONS.md.

Idempotent — running twice produces the same result. The mapping below is
authoritative: it sets id, title, summary, tags, load_priority, load_lane,
and status for every file. Files not in the mapping get inferred defaults.
"""
import re
from pathlib import Path
from datetime import date

REPO = Path(__file__).resolve().parent.parent

# rel_path -> dict of frontmatter values (id, title, summary, tags, load_priority, load_lane, status, related)
MAP: dict[str, dict] = {
    # === root ===
    "now.md": {
        "id": "now", "title": "Now — Current State",
        "summary": "Current priorities, decisions, blockers — the live status board",
        "tags": ["status", "current"], "load_priority": 95, "load_lane": "summary",
    },
    "CONVENTIONS.md": {  # already has frontmatter; mapping for reference only
        "id": "conventions", "title": "Repository Conventions",
        "summary": "Frontmatter schema, ID namespaces, folder semantics",
        "tags": ["meta", "conventions"], "load_priority": 90, "load_lane": "reference",
    },

    # === agent ===
    "agent/soul.md": {
        "id": "agent-soul", "title": "Felix Stanley — Soul",
        "summary": "Core identity, operating style, and boundaries for Felix (COO)",
        "tags": ["agent", "identity"], "load_priority": 85, "load_lane": "context",
        "related": ["agent-identity", "co-about"],
    },
    "agent/identity.md": {
        "id": "agent-identity", "title": "Felix Stanley — Identity Card",
        "summary": "Felix Stanley COO identity card: role, contact, vibe",
        "tags": ["agent", "identity"], "load_priority": 80, "load_lane": "context",
        "related": ["agent-soul", "co-about"],
    },
    "agent/instructions.md": {
        "id": "agent-instructions", "title": "Agent Operating Instructions",
        "summary": "Session-start ritual, memory rules, work registry, and red lines for AI agents",
        "tags": ["agent", "instructions", "meta"], "load_priority": 88, "load_lane": "context",
        "related": ["agent-soul", "conventions", "now"],
    },
    "agent/tools.md": {
        "id": "agent-tools", "title": "Agent Tools & Local Setup",
        "summary": "ByteRover memory, Whisper, fallback flat-files, skills inventory",
        "tags": ["agent", "tools"], "load_priority": 60, "load_lane": "reference",
    },
    "agent/heartbeat.md": {
        "id": "agent-heartbeat", "title": "Heartbeat Tasks",
        "summary": "Periodic check-in tasks (empty by default)",
        "tags": ["agent", "heartbeat"], "load_priority": 30, "load_lane": "reference",
    },

    # === user ===
    "user/vijay.md": {
        "id": "user-vijay", "title": "Vijay Tilak — User Profile",
        "summary": "User profile, preferences, and confidentiality rules",
        "tags": ["user", "private"], "load_priority": 80, "load_lane": "private",
    },

    # === company ===
    "company/about.md": {
        "id": "co-about", "title": "About Abzum",
        "summary": "Company identity, vision, and operational principles for Abzum NZ Ltd",
        "tags": ["company", "identity", "vision"], "load_priority": 70, "load_lane": "context",
        "related": ["co-use-cases", "co-felix", "co-vijay"],
    },
    "company/use_cases.md": {
        "id": "co-use-cases", "title": "Top 5 Priority Use Cases",
        "summary": "Anchor product (UC-01 CRM) and ranked use case priorities",
        "tags": ["company", "use-cases", "gtm"], "load_priority": 65, "load_lane": "context",
    },
    "company/team/felix.md": {
        "id": "co-felix", "title": "Felix Stanley (COO)",
        "summary": "Felix Stanley's profile, role, and background",
        "tags": ["team", "felix"], "load_priority": 50, "load_lane": "context",
    },
    "company/team/vijay.md": {
        "id": "co-vijay", "title": "Vijay Tilak (Managing Director)",
        "summary": "Vijay Tilak's profile (CONFIDENTIAL — private lane)",
        "tags": ["team", "vijay", "private"], "load_priority": 50, "load_lane": "private",
    },

    # === strategy ===
    "strategy/master_plan.md": {
        "id": "strat-master-plan", "title": "AI Company Master Plan",
        "summary": "Comprehensive multi-phase strategy for Abzum",
        "tags": ["strategy", "plan"], "load_priority": 65, "load_lane": "context",
    },
    "strategy/ai_native_org_overview.md": {
        "id": "strat-ai-native-org", "title": "AI-Native Org Structure (Overview)",
        "summary": "5-tier AI-native organisational model overview",
        "tags": ["strategy", "org"], "load_priority": 60, "load_lane": "context",
        "related": ["strat-5-tier", "strat-agent-k8s"],
    },
    "strategy/ai_native_5_tier_model.md": {
        "id": "strat-5-tier", "title": "AI-Native 5-Tier Org Model",
        "summary": "Full breakdown of the 5-tier AI-native organisation model",
        "tags": ["strategy", "org"], "load_priority": 55, "load_lane": "context",
    },
    "strategy/ai_native_org_context.md": {
        "id": "strat-ai-native-org-context", "title": "AI-Native Org Context",
        "summary": "Context and rationale for AI-native org adoption",
        "tags": ["strategy", "org"], "load_priority": 50, "load_lane": "context",
    },
    "strategy/agent_kubernetes.md": {
        "id": "strat-agent-k8s", "title": "Agent Kubernetes Model",
        "summary": "Agents as compute units (Kubernetes-style scheduling and lifecycle)",
        "tags": ["strategy", "agents", "kubernetes"], "load_priority": 55, "load_lane": "context",
    },
    "strategy/agent_orchestration.md": {
        "id": "strat-orchestration", "title": "Agent Orchestration",
        "summary": "End-to-end orchestration: 3-layer architecture, memory stack, intake-to-delivery flow",
        "tags": ["strategy", "agents", "orchestration"], "load_priority": 60, "load_lane": "context",
    },
    "strategy/two_tier_architecture.md": {
        "id": "strat-two-tier", "title": "Two-Tier Agent Architecture",
        "summary": "Paperclip global container + per-project containers (A71)",
        "tags": ["strategy", "agents", "architecture"], "load_priority": 60, "load_lane": "context",
    },
    "strategy/crm_delivery.md": {
        "id": "strat-crm-delivery", "title": "CRM Build & Deploy Approaches",
        "summary": "4 CRM delivery strategies for customer projects",
        "tags": ["strategy", "crm", "delivery"], "load_priority": 50, "load_lane": "reference",
    },
    "strategy/research/mcra_ai_security.md": {
        "id": "res-mcra", "title": "MCRA AI Security Framework",
        "summary": "MCRA security framework research and applicability to Abzum",
        "tags": ["research", "security", "mcra"], "load_priority": 40, "load_lane": "reference",
    },
    "strategy/research/ai_monitoring.md": {
        "id": "res-ai-monitoring", "title": "AI Monitoring Research",
        "summary": "Landscape of AI monitoring tools and approaches",
        "tags": ["research", "monitoring"], "load_priority": 35, "load_lane": "reference",
    },
    "strategy/research/product_watchlist.md": {
        "id": "res-product-watchlist", "title": "Product Watchlist",
        "summary": "Competitive products and tools to track",
        "tags": ["research", "competitive"], "load_priority": 35, "load_lane": "reference",
    },
    "strategy/research/hermes_space_agents.md": {
        "id": "res-hermes-space", "title": "Hermes × Space Agent Integration",
        "summary": "Integration plan between Hermes and Space Agents",
        "tags": ["research", "hermes", "agents"], "load_priority": 35, "load_lane": "reference",
    },

    # === execution ===
    "execution/workflow.md": {
        "id": "exec-workflow", "title": "Agent Workflow",
        "summary": "Master workflow: gates, TDD cycle, roles, model routing",
        "tags": ["execution", "workflow"], "load_priority": 65, "load_lane": "context",
    },
    "execution/handoff.md": {
        "id": "exec-handoff", "title": "Handoff Protocol",
        "summary": "Structured handoff formats between agents",
        "tags": ["execution", "handoff"], "load_priority": 55, "load_lane": "context",
    },
    "execution/tdd.md": {
        "id": "exec-tdd", "title": "TDD Cycle",
        "summary": "RED/GREEN/REFACTOR detail; mandatory for AI agents",
        "tags": ["execution", "tdd"], "load_priority": 55, "load_lane": "context",
    },
    "execution/context_persistence.md": {
        "id": "exec-context-persistence", "title": "Context Persistence",
        "summary": "5-layer memory architecture and ByteRover usage",
        "tags": ["execution", "memory"], "load_priority": 50, "load_lane": "reference",
    },
    "execution/capabilities.md": {
        "id": "exec-capabilities", "title": "Agent Capabilities",
        "summary": "AI agent capability framework",
        "tags": ["execution", "capabilities"], "load_priority": 50, "load_lane": "context",
    },
    "execution/company_framework.md": {
        "id": "exec-company-framework", "title": "AI Company Framework",
        "summary": "Operational framework and superpowers",
        "tags": ["execution", "framework"], "load_priority": 50, "load_lane": "context",
    },
    "execution/skill_matrix.md": {
        "id": "exec-skill-matrix", "title": "Skill Matrix",
        "summary": "Skills × Agent Roles matrix",
        "tags": ["execution", "skills"], "load_priority": 45, "load_lane": "context",
    },
    "execution/project_management.md": {
        "id": "exec-pm", "title": "Project Management Methodology",
        "summary": "Project tracking and estimation (A70)",
        "tags": ["execution", "pm"], "load_priority": 45, "load_lane": "context",
    },
    "execution/agent_scripting.md": {
        "id": "exec-agent-scripting", "title": "Agent Scripting Intelligence",
        "summary": "Script reuse and token optimisation (A64)",
        "tags": ["execution", "scripting"], "load_priority": 45, "load_lane": "context",
    },

    # === operations / infrastructure ===
    "operations/infrastructure/azure.md": {
        "id": "ops-azure", "title": "Azure Architecture",
        "summary": "Azure deployment design (AU East Sydney)",
        "tags": ["infrastructure", "azure", "cloud"], "load_priority": 55, "load_lane": "context",
    },
    "operations/infrastructure/data.md": {
        "id": "ops-data", "title": "Data Architecture",
        "summary": "Data layer and storage design",
        "tags": ["infrastructure", "data"], "load_priority": 45, "load_lane": "context",
    },
    "operations/infrastructure/vps.md": {
        "id": "ops-vps", "title": "VPS Infrastructure",
        "summary": "VPS layout and operational notes",
        "tags": ["infrastructure", "vps"], "load_priority": 40, "load_lane": "reference",
    },
    "operations/infrastructure/docker.md": {
        "id": "ops-docker", "title": "Docker Containers",
        "summary": "Container patterns for agent deployments",
        "tags": ["infrastructure", "docker"], "load_priority": 40, "load_lane": "reference",
    },
    "operations/infrastructure/doppler.md": {
        "id": "ops-doppler", "title": "Doppler Secrets Management",
        "summary": "Doppler usage for secrets across environments",
        "tags": ["infrastructure", "secrets"], "load_priority": 40, "load_lane": "reference",
    },

    # === operations / services ===
    "operations/services/email.md": {
        "id": "ops-email", "title": "Email Setup (Brevo + Cloudflare)",
        "summary": "Email infrastructure: Brevo SMTP + Cloudflare Email Routing",
        "tags": ["services", "email"], "load_priority": 40, "load_lane": "reference",
    },
    "operations/services/ollama.md": {
        "id": "ops-ollama", "title": "Ollama (Local LLM)",
        "summary": "Local LLM via Ollama: install, models, API",
        "tags": ["services", "llm", "ollama"], "load_priority": 40, "load_lane": "reference",
    },
    "operations/services/hermes_local.md": {
        "id": "ops-hermes-local", "title": "Hermes Local Environment",
        "summary": "Local Hermes dev/test environment (A66)",
        "tags": ["services", "hermes", "dev"], "load_priority": 40, "load_lane": "reference",
    },
    "operations/services/memorybank_git_sync.md": {
        "id": "ops-memorybank-sync", "title": "MemoryBank Git Sync",
        "summary": "GitHub ↔ ByteRover sync setup for the BIMemoryBank repo",
        "tags": ["services", "git", "sync"], "load_priority": 45, "load_lane": "reference",
    },
    "operations/services/agent_watcher.md": {
        "id": "ops-agent-watcher", "title": "Agent Watcher System",
        "summary": "Meta-agent monitoring + 4-level escalation ladder (A62)",
        "tags": ["services", "monitoring", "agents"], "load_priority": 45, "load_lane": "reference",
    },

    # === operations / security ===
    "operations/security/stack.md": {
        "id": "ops-sec-stack", "title": "Security Stack",
        "summary": "Security tools and implementation",
        "tags": ["security", "stack"], "load_priority": 45, "load_lane": "context",
    },
    "operations/security/ai_framework.md": {
        "id": "ops-sec-ai-framework", "title": "AI Security Framework",
        "summary": "MCRA security operations framework adapted for Abzum",
        "tags": ["security", "ai", "mcra"], "load_priority": 45, "load_lane": "context",
    },
    "operations/security/compliance.md": {
        "id": "ops-sec-compliance", "title": "AI Infrastructure Compliance",
        "summary": "Compliance planning and roadmap for AI infra",
        "tags": ["security", "compliance"], "load_priority": 40, "load_lane": "reference",
    },
    "operations/security/compliance_roadmap.md": {
        "id": "ops-sec-compliance-roadmap", "title": "Compliance Roadmap",
        "summary": "Compliance implementation phases",
        "tags": ["security", "compliance", "roadmap"], "load_priority": 40, "load_lane": "reference",
    },

    # === operations / procedures ===
    "operations/procedures/deploy_service.md": {
        "id": "ops-proc-deploy", "title": "Deploy Service Procedure",
        "summary": "Procedure for deploying a service",
        "tags": ["procedures", "deploy"], "load_priority": 35, "load_lane": "reference",
    },
    "operations/procedures/setup_app.md": {
        "id": "ops-proc-setup-app", "title": "Setup App Procedure",
        "summary": "Procedure for app setup",
        "tags": ["procedures", "setup"], "load_priority": 35, "load_lane": "reference",
    },
    "operations/procedures/gateway_boot.md": {
        "id": "ops-proc-gw-boot", "title": "Gateway Boot Conflict Resolution",
        "summary": "Resolve BOOT.md ↔ cron wake-up conflicts",
        "tags": ["procedures", "gateway"], "load_priority": 30, "load_lane": "reference",
    },
    "operations/procedures/gateway_stop.md": {
        "id": "ops-proc-gw-stop", "title": "Gateway Stop Procedure",
        "summary": "Always use kill -15 (SIGTERM); never -9",
        "tags": ["procedures", "gateway"], "load_priority": 30, "load_lane": "reference",
    },

    # === work ===
    "work/operations_log.md": {
        "id": "work-ops-log", "title": "Operations Log",
        "summary": "Running log of significant actions (O##) and decisions (D##)",
        "tags": ["work", "log", "audit"], "load_priority": 50, "load_lane": "reference",
    },
    "work/plan/phases.md": {
        "id": "work-phases", "title": "Phases to First Revenue",
        "summary": "5-phase roadmap from foundation to first revenue",
        "tags": ["work", "plan", "phases"], "load_priority": 60, "load_lane": "context",
    },
    "work/plan/dynamic_agent_provisioning.md": {
        "id": "work-dyn-provisioning", "title": "Dynamic Agent Provisioning Plan",
        "summary": "Detailed plan for dynamic agent provisioning (A69)",
        "tags": ["work", "plan", "agents"], "load_priority": 50, "load_lane": "reference",
    },

    # === memory ===
    "memory/long_term.md": {
        "id": "mem-long-term", "title": "Long-Term Memory",
        "summary": "Curated long-term insights, lessons, and decisions",
        "tags": ["memory", "long-term"], "load_priority": 70, "load_lane": "summary",
    },
    "memory/milestones/context_tree_v1_0.md": {
        "id": "mem-context-tree-v1", "title": "Context Tree v1.0 Milestone",
        "summary": "Milestone: ByteRover context tree v1.0 — 33 files / 9 directories",
        "tags": ["memory", "milestone"], "load_priority": 30, "load_lane": "reference",
    },

    # === research ===
    "research/hermes_hindsight/analysis.md": {
        "id": "res-hermes-analysis", "title": "Hermes + Hindsight BI Memory Analysis",
        "summary": "Full 30KB analysis of Hermes + Hindsight as a BI memory architecture for enterprises",
        "tags": ["research", "hermes", "hindsight", "bi"], "load_priority": 25, "load_lane": "reference",
    },
    "research/hermes_hindsight/summary.md": {
        "id": "res-hermes-summary", "title": "Hermes + Hindsight Executive Summary",
        "summary": "Executive summary of the Hermes + Hindsight analysis",
        "tags": ["research", "hermes", "hindsight"], "load_priority": 30, "load_lane": "reference",
    },
    "research/hermes_hindsight/technical_reference.md": {
        "id": "res-hermes-tech-ref", "title": "Hermes + Hindsight Technical Reference",
        "summary": "Technical architecture and implementation details",
        "tags": ["research", "hermes", "hindsight", "technical"], "load_priority": 25, "load_lane": "reference",
    },
    "research/hermes_hindsight/implementation_guide.md": {
        "id": "res-hermes-impl-guide", "title": "Hermes + Hindsight Implementation Guide",
        "summary": "Step-by-step implementation instructions",
        "tags": ["research", "hermes", "hindsight", "implementation"], "load_priority": 25, "load_lane": "reference",
    },
    "research/hermes_hindsight/plan_of_action.md": {
        "id": "res-hermes-plan", "title": "Hermes + Hindsight Plan of Action (Static)",
        "summary": "Static plan of action — the live work-tracking version is in work/registry.json",
        "tags": ["research", "hermes", "hindsight", "plan"], "load_priority": 25, "load_lane": "reference",
    },
}


FRONTMATTER_RE = re.compile(r"^---\s*\n.*?\n---\s*\n", re.DOTALL)


def render_fm(d: dict) -> str:
    keys = ["id", "title", "summary", "tags", "updated", "load_priority", "load_lane", "status", "related"]
    lines = ["---"]
    for k in keys:
        v = d.get(k)
        if v is None:
            continue
        if isinstance(v, list):
            lines.append(f"{k}: [{', '.join(v)}]")
        else:
            lines.append(f"{k}: {v}")
    lines.append("---")
    return "\n".join(lines) + "\n"


def strip_old_fm(text: str) -> str:
    """Strip an existing frontmatter block AND any leading <think>...</think>."""
    text = FRONTMATTER_RE.sub("", text, count=1)
    # remove any leading <think>...</think> (LLM artifact)
    text = re.sub(r"^\s*<think>.*?</think>\s*", "", text, count=1, flags=re.DOTALL)
    return text.lstrip()


def main() -> None:
    today = date.today().isoformat()
    updated = 0
    for rel, fm in MAP.items():
        path = REPO / rel
        if not path.exists():
            print(f"SKIP (missing): {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        body = strip_old_fm(text)
        meta = {**fm}
        meta.setdefault("updated", today)
        meta.setdefault("status", "active")
        new = render_fm(meta) + body
        path.write_text(new, encoding="utf-8")
        updated += 1
        print(f"UPDATED: {rel}")
    print(f"\nDone. {updated} files updated.")


if __name__ == "__main__":
    main()
