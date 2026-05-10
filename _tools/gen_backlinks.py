#!/usr/bin/env python3
"""Generate "Referenced by:" footers in every .md file based on inbound links.

For each .md file F in the repo:
  1. Find all .md files that link to F (via relative-path markdown links OR
     via `related: [<id>]` frontmatter where <id> is F's frontmatter id)
  2. Append a "## Referenced by" footer listing those files

Footer is bracketed by `<!-- backlinks-start -->` and `<!-- backlinks-end -->`
markers so re-running the tool replaces only the auto-generated region.

Idempotent. Safe to re-run.
"""
import re
from pathlib import Path
from collections import defaultdict

REPO = Path(__file__).resolve().parent.parent
EXCLUDE_DIRS = {".git", "_tools", "node_modules", "__pycache__"}
SKIP_FILES = {"_index.md", "registry.md", "actions.md", "decisions.md", "blockers.md", "operations_log.md", "_manifest.json"}

START = "<!-- backlinks-start -->"
END = "<!-- backlinks-end -->"


def parse_frontmatter_id(text: str) -> str | None:
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    block = text[3:end]
    m = re.search(r"^id:\s*(\S+)\s*$", block, re.MULTILINE)
    return m.group(1).strip("'\"") if m else None


def parse_frontmatter_related(text: str) -> list[str]:
    if not text.startswith("---"):
        return []
    end = text.find("\n---", 3)
    if end == -1:
        return []
    block = text[3:end]
    m = re.search(r"^related:\s*\[([^\]]*)\]", block, re.MULTILINE)
    if not m:
        return []
    return [s.strip().strip("'\"") for s in m.group(1).split(",") if s.strip()]


def collect_files() -> list[Path]:
    files = []
    for path in REPO.rglob("*.md"):
        if any(part in EXCLUDE_DIRS for part in path.parts):
            continue
        if path.name in SKIP_FILES:
            continue
        files.append(path)
    return files


def build_id_to_path(files: list[Path]) -> dict[str, Path]:
    out = {}
    for path in files:
        text = path.read_text(encoding="utf-8")
        fid = parse_frontmatter_id(text)
        if fid:
            out[fid] = path
    return out


def find_inbound_path_links(target: Path, files: list[Path]) -> set[Path]:
    """Find files that markdown-link to `target`."""
    inbound = set()
    target_resolved = target.resolve()
    link_re = re.compile(r'\]\(([^)]+\.md)(?:#[^)]*)?\)')
    for source in files:
        if source == target:
            continue
        text = source.read_text(encoding="utf-8")
        for link in link_re.findall(text):
            try:
                resolved = (source.parent / link).resolve()
            except Exception:
                continue
            if resolved == target_resolved:
                inbound.add(source)
                break
    return inbound


def find_inbound_id_refs(target_id: str, files: list[Path]) -> set[Path]:
    """Find files whose `related:` frontmatter includes target_id."""
    inbound = set()
    for source in files:
        text = source.read_text(encoding="utf-8")
        related = parse_frontmatter_related(text)
        if target_id in related:
            inbound.add(source)
    return inbound


def relative_link(source: Path, target: Path) -> str:
    """Compute markdown-relative path from source to target."""
    src_parts = source.parent.resolve().parts
    tgt_parts = target.resolve().parts
    i = 0
    while i < len(src_parts) and i < len(tgt_parts) and src_parts[i] == tgt_parts[i]:
        i += 1
    ups = ["../"] * (len(src_parts) - i)
    downs = list(tgt_parts[i:])
    return "".join(ups) + "/".join(downs)


def render_footer(target: Path, inbound: set[Path]) -> str:
    if not inbound:
        return ""
    lines = [START, "", "## Referenced by", ""]
    for source in sorted(inbound, key=lambda p: str(p)):
        link = relative_link(target, source)
        title = source.stem.replace("_", " ").replace("-", " ").title()
        lines.append(f"- [{title}]({link})")
    lines.append("")
    lines.append(END)
    return "\n".join(lines)


def update_file(path: Path, footer: str) -> bool:
    text = path.read_text(encoding="utf-8")
    if START in text and END in text:
        # Replace existing block
        new_text = re.sub(
            re.escape(START) + r".*?" + re.escape(END),
            footer if footer else "",
            text,
            flags=re.DOTALL,
        )
    elif footer:
        # Append
        new_text = text.rstrip() + "\n\n---\n\n" + footer + "\n"
    else:
        return False
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        return True
    return False


def main() -> None:
    files = collect_files()
    id_to_path = build_id_to_path(files)
    changed = 0
    for target in files:
        text = target.read_text(encoding="utf-8")
        target_id = parse_frontmatter_id(text)
        inbound_paths = find_inbound_path_links(target, files)
        inbound_ids = find_inbound_id_refs(target_id, files) if target_id else set()
        inbound = inbound_paths | inbound_ids
        footer = render_footer(target, inbound)
        if update_file(target, footer):
            changed += 1
    print(f"\nDone. {changed} files updated with backlinks.")


if __name__ == "__main__":
    main()
