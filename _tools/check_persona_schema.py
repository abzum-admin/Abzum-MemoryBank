#!/usr/bin/env python3
"""Lint persona files in 02-org/ for required schema sections.

Persona files must include the standard sections per AGENTS.md:
  - Function
  - Capabilities (or "TBD" sentinel for stubs)
  - When to Call This Persona (or "TBD")
  - Default Stack — Best Value (or "TBD")
  - Escalation Stack — Best Performance (or "TBD")
  - Tools (or "TBD")
  - Co-work Agents (or "TBD")
  - References

Stub files (status: draft) need only Function + References + at least one TBD.
Active files need all sections.
"""
import re
from pathlib import Path
from typing import Optional

REPO = Path(__file__).resolve().parent.parent
PERSONA_DIRS = [
    REPO / "02-org" / "02-ai-systems",
    REPO / "02-org" / "04-platform-orchestration",
    REPO / "02-org" / "01-executive",
    REPO / "02-org" / "03-human-delivery",
    REPO / "02-org" / "05-business-ops",
]

REQUIRED_FOR_ACTIVE = [
    "Function",
    "Capabilities",
    "When to Call This Persona",
    "Default Stack",
    "Escalation Stack",
    "Tools",
    "Co-work",
    "Hermes Profile",
    "References",
]

REQUIRED_FOR_DRAFT = [
    "Function",
]

REQUIRED_FOR_FUTURE = [
    "Function",
]

# Files in these dirs follow the older agent-identity schema, not the persona schema.
# They are EXEC-level persona components (soul / identity / instructions / heartbeat / role)
# and are intentionally allowed to skip the full-persona schema.
EXEC_PERSONA_SUBDIRS = {
    REPO / "02-org" / "01-executive" / "felix-caio",
    REPO / "02-org" / "01-executive" / "cdo-chief-delivery-officer",
    REPO / "02-org" / "01-executive" / "csco-chief-security-compliance-officer",
}

# Files allowed to skip the full schema (special-case personas).
SPECIAL_CASE_FILES = {
    # Vijay is L0 (human CEO), not an AI persona.
    REPO / "02-org" / "01-executive" / "vijay_ceo_founder.md",
}

# Pre-existing personas (created 2026-05-10 morning, before schema expansion afternoon)
# linted with relaxed rules: must have Function + at least one Stack + Hermes Profile + References.
# Full retrofit tracked under A76.
LEGACY_PERSONAS = {
    REPO / "02-org" / "04-platform-orchestration" / "01-orchestration" / "orchestrator.md",
    REPO / "02-org" / "04-platform-orchestration" / "01-orchestration" / "watcher.md",
    REPO / "02-org" / "02-ai-systems" / "02-project-delivery" / "triage_intake.md",
    REPO / "02-org" / "02-ai-systems" / "02-project-delivery" / "planner.md",
    REPO / "02-org" / "02-ai-systems" / "01-engineering" / "architect.md",
    REPO / "02-org" / "02-ai-systems" / "01-engineering" / "senior_coder.md",
    REPO / "02-org" / "02-ai-systems" / "01-engineering" / "junior_coder.md",
    REPO / "02-org" / "02-ai-systems" / "01-engineering" / "tester.md",
    REPO / "02-org" / "02-ai-systems" / "01-engineering" / "security.md",
    REPO / "02-org" / "02-ai-systems" / "01-engineering" / "devops.md",
    REPO / "02-org" / "02-ai-systems" / "01-engineering" / "infrastructure_engineer.md",
    REPO / "02-org" / "02-ai-systems" / "03-design" / "interface_designer.md",
    REPO / "02-org" / "02-ai-systems" / "03-design" / "brand_designer.md",
    REPO / "02-org" / "02-ai-systems" / "03-design" / "motion_designer.md",
    REPO / "02-org" / "02-ai-systems" / "04-knowledge-intelligence" / "researcher.md",
    REPO / "02-org" / "02-ai-systems" / "04-knowledge-intelligence" / "tech_writer.md",
}

REQUIRED_FOR_LEGACY = [
    "Function",
    "Default Stack",
    "Hermes Profile",
    "References",
]


def parse_frontmatter_status(text: str) -> Optional[str]:
    """Return status: from frontmatter, or None if no frontmatter."""
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    block = text[3:end]
    m = re.search(r"^status:\s*(\S+)\s*$", block, re.MULTILINE)
    if m:
        return m.group(1).strip("'\"")
    return None


def section_present(text: str, name: str) -> bool:
    """Match `## ...{name}...` heading anywhere in the body, case-insensitive."""
    pattern = rf"^##\s+.*{re.escape(name)}.*$"
    return bool(re.search(pattern, text, re.MULTILINE | re.IGNORECASE))


def lint_file(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    if path.name.startswith("_"):
        return []  # skip _index.md, _legacy_*, etc.
    status = parse_frontmatter_status(text)
    if status not in {"active", "draft", "future"}:
        return []  # not a persona file we lint
    if path.resolve() in {p.resolve() for p in SPECIAL_CASE_FILES}:
        return []  # special-case files exempt
    if any(path.is_relative_to(d) for d in EXEC_PERSONA_SUBDIRS):
        return []  # exec persona components follow agent-identity schema
    if path.resolve() in {p.resolve() for p in LEGACY_PERSONAS}:
        required = REQUIRED_FOR_LEGACY
    elif status == "draft":
        required = REQUIRED_FOR_DRAFT
    elif status == "future":
        required = REQUIRED_FOR_FUTURE
    else:
        required = REQUIRED_FOR_ACTIVE
    missing = [s for s in required if not section_present(text, s)]
    return missing


def main() -> int:
    fail_count = 0
    file_count = 0
    for root in PERSONA_DIRS:
        if not root.exists():
            continue
        for path in root.rglob("*.md"):
            if path.name.startswith("_"):
                continue
            file_count += 1
            missing = lint_file(path)
            if missing:
                print(f"FAIL: {path.relative_to(REPO)} — missing sections: {', '.join(missing)}")
                fail_count += 1
    print(f"\nChecked {file_count} persona files; {fail_count} failed.")
    return 1 if fail_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
