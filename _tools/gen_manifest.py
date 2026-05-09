#!/usr/bin/env python3
"""Regenerate _manifest.json from frontmatter across the repo.

Reads YAML frontmatter from every .md file (except generated ones), filters by
status != deprecated/archived and load_lane != private, sorts by load_priority
desc, and emits _manifest.json at repo root.
"""
import json
import re
import sys
from pathlib import Path
import hashlib
from datetime import datetime, timezone

REPO_ROOT = Path(__file__).resolve().parent.parent
EXCLUDE_DIRS = {".git", "_tools", "assets", "node_modules", "__pycache__"}
GENERATED_NAMES = {"_index.md", "registry.md", "actions.md", "decisions.md", "blockers.md"}
INCLUDE_LANES = {"context", "summary"}
TOKENS_PER_CHAR = 1 / 4.0


def parse_frontmatter(text: str) -> dict | None:
    """Extract YAML frontmatter (between --- markers). Minimal parser."""
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    block = text[3:end].strip()
    data: dict = {}
    for line in block.splitlines():
        line = line.rstrip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            data[key] = [v.strip().strip("'\"") for v in inner.split(",") if v.strip()]
        elif value:
            try:
                data[key] = int(value)
            except ValueError:
                data[key] = value.strip("'\"")
        else:
            data[key] = ""
    return data


def estimate_tokens(text: str) -> int:
    return max(1, int(len(text) * TOKENS_PER_CHAR))


def collect_entries(repo: Path) -> list[dict]:
    entries = []
    for path in repo.rglob("*.md"):
        if any(part in EXCLUDE_DIRS for part in path.parts):
            continue
        if path.name in GENERATED_NAMES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        fm = parse_frontmatter(text)
        if not fm:
            continue
        if fm.get("status") in {"deprecated", "archived"}:
            continue
        lane = fm.get("load_lane", "context")
        if lane not in INCLUDE_LANES:
            continue
        entries.append({
            "id": fm.get("id"),
            "path": str(path.relative_to(repo)),
            "tokens": estimate_tokens(text),
            "load_priority": int(fm.get("load_priority", 0)),
            "load_lane": lane,
            "title": fm.get("title", ""),
        })
    return entries


def fingerprint(entries: list[dict]) -> str:
    h = hashlib.sha256()
    for e in sorted(entries, key=lambda x: x["path"]):
        h.update(f"{e['path']}|{e['tokens']}".encode())
    return h.hexdigest()


def main() -> None:
    entries = collect_entries(REPO_ROOT)
    entries.sort(key=lambda e: (-e["load_priority"], e["path"]))

    lane_tokens = {"context": 0, "summary": 0}
    for e in entries:
        lane_tokens[e["load_lane"]] = lane_tokens.get(e["load_lane"], 0) + e["tokens"]

    manifest = {
        "version": 2,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "active_context": entries,
        "lane_tokens": lane_tokens,
        "total_tokens": sum(e["tokens"] for e in entries),
        "source_fingerprint": fingerprint(entries),
    }

    out = REPO_ROOT / "_manifest.json"
    out.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out} with {len(entries)} entries, {manifest['total_tokens']} tokens.")


if __name__ == "__main__":
    main()
