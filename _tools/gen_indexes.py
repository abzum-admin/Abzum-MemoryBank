#!/usr/bin/env python3
"""Regenerate _index.md in every directory containing .md files.

Each _index.md is built from the title + summary frontmatter of its child .md
files (and a brief description of subdirectories). _index.md files are
unconditionally overwritten — they are derived artifacts.
"""
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
EXCLUDE_DIRS = {".git", "_tools", "node_modules", "__pycache__"}
GENERATED_NAMES = {"_index.md", "registry.md", "actions.md", "decisions.md", "blockers.md"}
SKIP_FROM_INDEX = {"README.md", "START_HERE.md", "CONVENTIONS.md"}


def parse_frontmatter(text: str) -> dict:
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    out: dict = {}
    for line in text[3:end].splitlines():
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        out[k.strip()] = v.strip().strip("'\"")
    return out


def folder_label(name: str) -> str:
    return name.replace("_", " ").title()


def gen_for(folder: Path) -> str:
    rel = folder.relative_to(REPO_ROOT)
    name = "Repository Root" if str(rel) == "." else folder_label(folder.name)
    lines = [
        "# generated, do not edit — see _tools/gen_indexes.py",
        "",
        f"# {name}",
        "",
    ]

    children = sorted(p for p in folder.iterdir() if p.is_file() and p.suffix == ".md")
    docs = []
    for child in children:
        if child.name in GENERATED_NAMES or child.name in SKIP_FROM_INDEX:
            continue
        fm = parse_frontmatter(child.read_text(encoding="utf-8"))
        title = fm.get("title", child.stem.replace("_", " ").title())
        summary = fm.get("summary", "")
        docs.append((child.name, title, summary))

    if docs:
        lines.append("## Documents")
        lines.append("")
        lines.append("| File | Title | Summary |")
        lines.append("|---|---|---|")
        for fname, title, summary in docs:
            lines.append(f"| `{fname}` | {title} | {summary} |")
        lines.append("")

    subdirs = sorted(
        p for p in folder.iterdir()
        if p.is_dir() and p.name not in EXCLUDE_DIRS and not p.name.startswith(".")
        and any(p.rglob("*.md"))
    )
    if subdirs:
        lines.append("## Subdirectories")
        lines.append("")
        for sub in subdirs:
            lines.append(f"- `{sub.name}/` — see `{sub.name}/_index.md`")
        lines.append("")

    return "\n".join(lines)


def walk(root: Path) -> None:
    for folder in [root] + [p for p in root.rglob("*") if p.is_dir()]:
        if any(part in EXCLUDE_DIRS for part in folder.relative_to(root).parts):
            continue
        if folder.name.startswith(".") and folder != root:
            continue
        if not any(folder.rglob("*.md")):
            continue
        out = folder / "_index.md"
        # Skip curated indexes (preserve hand-written content like mermaid charts)
        if out.exists():
            head = out.read_text(encoding="utf-8")[:200]
            if "<!-- curated" in head or "DO NOT regenerate" in head:
                print(f"SKIPPED (curated): {out.relative_to(root)}")
                continue
        out.write_text(gen_for(folder) + "\n", encoding="utf-8")
        print(f"Wrote {out.relative_to(root)}")


if __name__ == "__main__":
    walk(REPO_ROOT)
