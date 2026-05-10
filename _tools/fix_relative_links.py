#!/usr/bin/env python3
"""Fix broken relative markdown links after the 2026-05-10 restructure.

Walks all .md files. For each `[text](relative.md...)` link:
  1. Resolve the link target relative to the source file
  2. If the resolved path doesn't exist:
     a. Check if any known target path matches (suffix match against the new tree)
     b. If found, compute the correct relative path from source to that target
     c. Replace inline

Idempotent. Run after rewrite_links.py. Safe to re-run.
"""
import re
from pathlib import Path
from typing import Optional

REPO = Path(__file__).resolve().parent.parent
EXCLUDE_DIRS = {".git", "_tools", "node_modules", "__pycache__"}

# Pattern to match markdown links: [text](relative_path.md[#anchor])
LINK_PATTERN = re.compile(r'\[([^\]]+)\]\(([^)]+\.md)((?:#[^)]*)?)\)')

# Build an index of every .md file in the repo to enable suffix matching
def build_target_index() -> dict[str, Path]:
    """Map filename → absolute path (last writer wins, but report duplicates)."""
    by_name: dict[str, list[Path]] = {}
    by_suffix: dict[str, Path] = {}  # last 2 path components → path
    for path in REPO.rglob("*.md"):
        if any(part in EXCLUDE_DIRS for part in path.parts):
            continue
        name = path.name
        by_name.setdefault(name, []).append(path)
        # Also index by parent/name (for disambiguation)
        if path.parent != REPO:
            suffix = f"{path.parent.name}/{path.name}"
            by_suffix.setdefault(suffix, path)
    return by_name, by_suffix


def resolve_target(source: Path, link_target: str, by_name, by_suffix) -> Optional[Path]:
    """Resolve a link target. Return absolute path if it exists or can be inferred."""
    # Try direct relative resolution first
    candidate = (source.parent / link_target).resolve()
    if candidate.exists():
        return candidate

    # Strip leading ../ tokens and try suffix match
    target_path = link_target.lstrip("./")
    # Try suffix matching: parent/name
    if "/" in target_path:
        suffix = "/".join(target_path.rsplit("/", 2)[-2:])
        if suffix in by_suffix:
            return by_suffix[suffix]
    # Try just name
    name = target_path.rsplit("/", 1)[-1]
    if name in by_name:
        candidates = by_name[name]
        if len(candidates) == 1:
            return candidates[0]
    return None


def fix_file(source: Path, by_name, by_suffix) -> int:
    """Rewrite broken links in source. Returns number of replacements."""
    text = source.read_text(encoding="utf-8")
    original = text

    def replace(m: re.Match) -> str:
        label = m.group(1)
        link = m.group(2)
        anchor = m.group(3) or ""
        # Skip http(s), mailto, anchor-only
        if link.startswith(("http://", "https://", "mailto:", "#")):
            return m.group(0)
        # Already valid?
        candidate = (source.parent / link).resolve()
        if candidate.exists():
            return m.group(0)
        target = resolve_target(source, link, by_name, by_suffix)
        if target is None:
            return m.group(0)
        # Compute new relative path
        try:
            new_rel = Path(*target.relative_to(source.parent.resolve(), walk_up=True).parts).as_posix()
        except (ValueError, AttributeError):
            # Python < 3.12 doesn't have walk_up; fall back to manual computation
            try:
                src_parts = source.parent.resolve().parts
                tgt_parts = target.parts
                # find common prefix
                i = 0
                while i < len(src_parts) and i < len(tgt_parts) and src_parts[i] == tgt_parts[i]:
                    i += 1
                ups = ["../"] * (len(src_parts) - i)
                downs = list(tgt_parts[i:])
                new_rel = "".join(ups) + "/".join(downs)
            except Exception:
                return m.group(0)
        return f"[{label}]({new_rel}{anchor})"

    text = LINK_PATTERN.sub(replace, text)
    if text != original:
        source.write_text(text, encoding="utf-8")
        return 1
    return 0


def main() -> None:
    by_name, by_suffix = build_target_index()
    changed = 0
    for path in REPO.rglob("*.md"):
        if any(part in EXCLUDE_DIRS for part in path.parts):
            continue
        n = fix_file(path, by_name, by_suffix)
        if n:
            changed += 1
            print(f"FIXED: {path.relative_to(REPO)}")
    print(f"\nDone. {changed} files modified.")


if __name__ == "__main__":
    main()
