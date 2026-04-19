# shellcheck shell=bash
# Doppler helpers: scope a service token to a project folder and list secret names.

# Scope a service token to /docker/<instance> so `doppler run --` auto-authenticates there.
# Safe to re-run (overwrites scope token).
doppler_scope_token() {
  local instance="$1" token="$2"
  local dir="/docker/$instance"
  install -d -m 0755 "$dir"
  HOME=/root doppler configure set token "$token" --scope "$dir" --silent
  log "doppler: scoped service token to $dir"
}

# Echo the list of secret names from the Doppler config this token is scoped to.
# Strips Doppler's own bookkeeping vars (DOPPLER_*) — those should not be pushed into containers.
doppler_list_secret_names() {
  local instance="$1"
  local dir="/docker/$instance"
  # --json gives machine-readable output; jq extracts plain names.
  (cd "$dir" && HOME=/root doppler secrets --json --silent 2>/dev/null) \
    | jq -r 'keys[]' 2>/dev/null \
    | grep -Ev '^(DOPPLER_PROJECT|DOPPLER_CONFIG|DOPPLER_ENVIRONMENT)$' \
    || true
}

# Render the `environment:` passthrough lines (bare names, one per line, 6-space indent).
# Output goes into the compose template at @@DOPPLER_ENV_LINES@@.
doppler_render_env_lines() {
  local instance="$1"
  doppler_list_secret_names "$instance" | while read -r name; do
    [[ -n "$name" ]] && printf '      - %s\n' "$name"
  done
}
