#!/usr/bin/env bash
# Link integrity checker for Abzum-MemoryBank.
#
# Verifies:
#  1. No references to phantom files (MEMORY.md, ABZUM.md, ACTIVE_TASKS.md,
#     BOOTSTRAP.md, MASTER_INDEX.md, infrastructure/_index.md, process/_index.md).
#  2. No references to old flat operations/<file>.md paths.
#  3. No <think> blocks in any markdown.
#  4. Every relative .md link target exists.
#
# Exit non-zero if any check fails.

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

fail=0
report() { echo "FAIL: $*"; fail=1; }
ok()     { echo "PASS: $*"; }

echo "== 1. Phantom file references =="
phantom_pattern='(\bMEMORY\.md\b|\bABZUM\.md\b|\bACTIVE_TASKS\.md\b|\bBOOTSTRAP\.md\b|\bMASTER_INDEX\.md\b)'
hits=$(grep -rln -E "$phantom_pattern" --include='*.md' --exclude-dir=.git --exclude-dir=_tools --exclude-dir=research . 2>/dev/null || true)
if [[ -n "$hits" ]]; then
  report "Phantom references found:"; echo "$hits"
else
  ok "No phantom file references"
fi

echo "== 2. Old flat operations/ paths =="
old_ops_pattern='operations/(azure_architecture|email_setup_brevo|ollama_local|hermes_local_environment|docker_containers|doppler|vps_infrastructure|setup_app|deploy_service|security_stack|ai_security_framework|ai_infrastructure_compliance|compliance_roadmap|data_architecture|bimemorybank_git_sync)\.md'
hits=$(grep -rln -E "$old_ops_pattern" --include='*.md' --exclude-dir=.git --exclude-dir=_tools --exclude-dir=research . 2>/dev/null || true)
if [[ -n "$hits" ]]; then
  report "Old operations paths found:"; echo "$hits"
else
  ok "No old operations paths"
fi

echo "== 3. <think> blocks =="
hits=$(grep -rln '<think>' --include='*.md' --exclude-dir=.git --exclude-dir=_tools . 2>/dev/null || true)
if [[ -n "$hits" ]]; then
  report "<think> blocks found:"; echo "$hits"
else
  ok "No <think> blocks"
fi

echo "== 4. Relative link integrity =="
broken=0
while IFS= read -r mdfile; do
  dir=$(dirname "$mdfile")
  while IFS= read -r target; do
    [[ -z "$target" ]] && continue
    [[ "$target" =~ ^(http|mailto|#) ]] && continue
    target_path="${target%%#*}"
    [[ -z "$target_path" ]] && continue
    full="$dir/$target_path"
    if [[ ! -e "$full" ]]; then
      echo "  $mdfile -> $target_path (missing)"
      broken=$((broken+1))
    fi
  done < <(grep -oE '\[[^]]+\]\(([^)]+\.md[^)]*)\)' "$mdfile" | sed -E 's/.*\(([^)]+)\).*/\1/')
done < <(find . -name '*.md' -not -path './.git/*' -not -path './_tools/*')
if [[ $broken -gt 0 ]]; then
  report "$broken broken markdown links"
else
  ok "All relative .md links resolve"
fi

echo
[[ $fail -eq 0 ]] && echo "ALL CHECKS PASSED" || { echo "CHECKS FAILED"; exit 1; }
