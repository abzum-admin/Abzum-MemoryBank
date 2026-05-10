#!/usr/bin/env python3
"""Regenerate human-readable views (registry.md, actions.md, decisions.md,
blockers.md) from the canonical work/registry.json.
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
WORK = REPO_ROOT / "11-work"
REGISTRY = WORK / "registry.json"

HEADER = "<!-- generated, do not edit — see _tools/gen_work_views.py -->"


def fmt_table(rows: list[dict], cols: list[tuple[str, str]]) -> list[str]:
    if not rows:
        return ["_No entries._", ""]
    header = "| " + " | ".join(label for _, label in cols) + " |"
    sep = "|" + "|".join("---" for _ in cols) + "|"
    out = [header, sep]
    for row in rows:
        out.append("| " + " | ".join(str(row.get(key, "—") or "—") for key, _ in cols) + " |")
    out.append("")
    return out


def main() -> None:
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))

    # registry.md — full view
    lines = [HEADER, "", "# Work Registry", "",
             f"Source of truth: `work/registry.json` ({sum(len(v) for v in data.values() if isinstance(v, list))} entries)", ""]
    for section, label in [
        ("actions", "Actions"),
        ("blockers", "Blockers"),
        ("pending_decisions", "Pending Decisions"),
        ("decided", "Decided"),
        ("use_cases", "Use Cases"),
        ("operations_log", "Operations Log"),
    ]:
        lines.append(f"## {label}")
        lines.append("")
        rows = data.get(section, [])
        cols_map = {
            "actions": [("id", "ID"), ("title", "Title"), ("priority", "Pri"), ("phase", "Phase"), ("status", "Status"), ("owner", "Owner"), ("depends_on", "Depends")],
            "blockers": [("id", "ID"), ("title", "Title"), ("blocks", "Blocks"), ("owner", "Owner"), ("status", "Status")],
            "pending_decisions": [("id", "ID"), ("title", "Decision"), ("blocks", "Blocks"), ("urgency", "Urgency"), ("owner", "Owner")],
            "decided": [("id", "ID"), ("title", "Decision"), ("date", "Date"), ("rationale", "Rationale"), ("owner", "Owner")],
            "use_cases": [("id", "ID"), ("title", "Use Case"), ("description", "Description")],
            "operations_log": [("id", "ID"), ("date", "Date"), ("title", "Action"), ("owner", "Owner"), ("significance", "Significance")],
        }
        lines.extend(fmt_table(rows, cols_map[section]))

    (WORK / "registry.md").write_text("\n".join(lines), encoding="utf-8")

    # actions.md — active subset
    actions = data.get("actions", [])
    active = [a for a in actions if a.get("status") not in {"done", "completed", "cancelled"}]
    lines = [HEADER, "", "# Actions (Active)", "",
             f"All non-completed actions from `work/registry.json`. {len(active)} of {len(actions)} entries.", ""]
    lines.extend(fmt_table(active,
        [("id", "ID"), ("title", "Title"), ("priority", "Pri"), ("phase", "Phase"),
         ("status", "Status"), ("owner", "Owner"), ("depends_on", "Depends")]))
    (WORK / "actions.md").write_text("\n".join(lines), encoding="utf-8")

    # decisions.md — pending + decided
    pending = data.get("pending_decisions", [])
    decided = data.get("decided", [])
    lines = [HEADER, "", "# Decisions", "",
             "## Pending", ""]
    lines.extend(fmt_table(pending,
        [("id", "ID"), ("title", "Decision"), ("blocks", "Blocks"), ("urgency", "Urgency"), ("owner", "Owner")]))
    lines += ["## Decided", ""]
    lines.extend(fmt_table(decided,
        [("id", "ID"), ("title", "Decision"), ("date", "Date"), ("rationale", "Rationale"), ("owner", "Owner")]))
    (WORK / "decisions.md").write_text("\n".join(lines), encoding="utf-8")

    # blockers.md
    blockers = data.get("blockers", [])
    lines = [HEADER, "", "# Blockers", "", f"{len(blockers)} entries from `work/registry.json`.", ""]
    lines.extend(fmt_table(blockers,
        [("id", "ID"), ("title", "Title"), ("blocks", "Blocks"), ("owner", "Owner"), ("status", "Status")]))
    (WORK / "blockers.md").write_text("\n".join(lines), encoding="utf-8")

    print(f"Generated registry.md, actions.md, decisions.md, blockers.md in {WORK}")


if __name__ == "__main__":
    main()
