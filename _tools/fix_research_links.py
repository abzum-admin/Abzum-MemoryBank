#!/usr/bin/env python3
"""Adjust relative .md links inside research/hermes_hindsight/*.md.

These docs were moved from repo root to research/hermes_hindsight/, so links
like [foo](work/decisions.md) now need to be [foo](../../work/decisions.md).
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TARGET_DIR = REPO / "research" / "hermes_hindsight"

# Top-level dirs that links may reference; if a link starts with one of these
# (and not already with ./ or ../), prepend ../../ to make it root-relative.
TOP_LEVEL_DIRS = {
    "agent", "assets", "company", "execution", "memory", "operations",
    "research", "strategy", "user", "work",
}
ROOT_FILES = {"now.md", "_index.md", "README.md", "START_HERE.md", "CONVENTIONS.md"}

LINK_RE = re.compile(r"(\[[^\]]+\]\()([^)]+)(\))")


def rewrite(target: str) -> str:
    if target.startswith(("http", "mailto:", "#", "../", "./", "/")):
        return target
    head = target.split("/", 1)[0]
    if head in TOP_LEVEL_DIRS:
        return "../../" + target
    if target.split("#", 1)[0] in ROOT_FILES:
        return "../../" + target
    return target


def main() -> None:
    changed = 0
    for path in TARGET_DIR.glob("*.md"):
        if path.name == "_index.md":
            continue
        text = path.read_text(encoding="utf-8")
        new = LINK_RE.sub(lambda m: m.group(1) + rewrite(m.group(2)) + m.group(3), text)
        if new != text:
            path.write_text(new, encoding="utf-8")
            changed += 1
            print(f"REWROTE: {path.relative_to(REPO)}")
    print(f"\nDone. {changed} files modified.")


if __name__ == "__main__":
    main()
