#!/usr/bin/env bash
# deploy-service.sh — deploy a docker service behind the shared Cloudflare tunnel.
#
# Deploys (or redeploys) a Docker Compose project under /docker/<instance>/, wires
# it to Doppler for secret injection, starts it under systemd, and adds a routing
# rule to the existing remote-managed Cloudflare tunnel so it's reachable at
# a public https subdomain.
#
# Idempotent — safe to re-run. Interactive if flags are missing.
#
# Templates live in templates/ alongside this script (see templates/hermes.compose.tmpl).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"
TEMPLATE_DIR="$SCRIPT_DIR/templates"
DOCKER_ROOT="/docker"
CONFIG_DIR="/etc/abzum-deploy"
CONFIG_FILE="$CONFIG_DIR/config.env"
TOKEN_FILE="$CONFIG_DIR/cf-token"

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

# shellcheck source=lib/preflight.sh
source "$LIB_DIR/preflight.sh"
# shellcheck source=lib/doppler.sh
source "$LIB_DIR/doppler.sh"
# shellcheck source=lib/cloudflare.sh
source "$LIB_DIR/cloudflare.sh"

usage() {
  cat <<EOF
Usage: $(basename "$0") [flags]

  --template NAME            Template under templates/ (e.g. hermes). Default: hermes
  --instance NAME            Container/project name (e.g. hermes, hermes-felix). Required.
  --domain FQDN              Public hostname (e.g. hermes.abzum.com). Required.
  --upstream-service NAME    Container that serves the tunnel traffic. Default: <instance>-ui
  --upstream-port PORT       Port on the upstream service. Default: 9119
  --doppler-token-file PATH  Read Doppler service token from this file (vs. prompt)
  --access-emails EMAILS     Comma-separated emails to allow via CF Access (e.g. you@example.com)
                             Pass "none" to skip Access protection entirely.
  --remove                   Tear down the instance + remove its CF routing + Access app
  --yes                      Assume 'yes' for all prompts (non-interactive)
  --help                     This message

Any flag omitted will be prompted for interactively (except --yes / --remove).

First-run: prompts for Cloudflare account ID, tunnel ID, and API token. These are
cached at $CONFIG_FILE (non-secret IDs, 644) and $TOKEN_FILE (token, 600).

CF API token scopes required:
  Account → Cloudflare Tunnel → Edit
  Account → Access: Apps and Policies → Edit
  Account → Access: Organizations → Edit        (login page branding — optional)
  Account → Access: Custom Pages → Edit         (no-access page — optional)
  Zone    → DNS → Edit
  Zone    → Zone → Read
EOF
}

# --- args ----------------------------------------------------------------
TEMPLATE="hermes"
INSTANCE=""
DOMAIN=""
UPSTREAM_SERVICE=""
UPSTREAM_PORT=""
DOPPLER_TOKEN_FILE=""
ACCESS_EMAILS=""
ASSUME_YES=false
DO_REMOVE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --template) TEMPLATE="$2"; shift 2;;
    --instance) INSTANCE="$2"; shift 2;;
    --domain) DOMAIN="$2"; shift 2;;
    --upstream-service) UPSTREAM_SERVICE="$2"; shift 2;;
    --upstream-port) UPSTREAM_PORT="$2"; shift 2;;
    --doppler-token-file) DOPPLER_TOKEN_FILE="$2"; shift 2;;
    --access-emails) ACCESS_EMAILS="$2"; shift 2;;
    --yes|-y) ASSUME_YES=true; shift;;
    --remove) DO_REMOVE=true; shift;;
    -h|--help) usage; exit 0;;
    *) die "unknown arg: $1 (see --help)";;
  esac
done

ask() {
  # ask "prompt" varname [default]
  local prompt="$1" __var="$2" default="${3:-}"
  local value
  if $ASSUME_YES && [[ -n "$default" ]]; then
    printf -v "$__var" '%s' "$default"
    return
  fi
  if [[ -n "$default" ]]; then
    read -r -p "$prompt [$default]: " value
    value="${value:-$default}"
  else
    read -r -p "$prompt: " value
    [[ -z "$value" ]] && die "required value missing"
  fi
  printf -v "$__var" '%s' "$value"
}

ask_secret() {
  local prompt="$1" __var="$2"
  local value
  read -r -s -p "$prompt: " value; echo
  [[ -z "$value" ]] && die "required secret missing"
  printf -v "$__var" '%s' "$value"
}

# --- preflight -----------------------------------------------------------
preflight_all

# --- load / prompt for Cloudflare config ---------------------------------
load_cf_config() {
  if [[ -f "$CONFIG_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$CONFIG_FILE"
  fi
  if [[ -f "$TOKEN_FILE" ]]; then
    CF_API_TOKEN="$(<"$TOKEN_FILE")"
  fi
}

save_cf_config() {
  umask 077
  cat > "$CONFIG_FILE" <<EOF
# Auto-managed by deploy-service.sh. Non-secret Cloudflare identifiers.
CF_ACCOUNT_ID="$CF_ACCOUNT_ID"
CF_TUNNEL_ID="$CF_TUNNEL_ID"
EOF
  chmod 0644 "$CONFIG_FILE"
  printf '%s' "$CF_API_TOKEN" > "$TOKEN_FILE"
  chmod 0600 "$TOKEN_FILE"
  log "saved CF config to $CONFIG_FILE + $TOKEN_FILE"
}

load_cf_config
if [[ -z "${CF_ACCOUNT_ID:-}" ]]; then ask "Cloudflare account ID" CF_ACCOUNT_ID; fi
if [[ -z "${CF_TUNNEL_ID:-}" ]];  then ask "Cloudflare tunnel ID"  CF_TUNNEL_ID; fi
if [[ -z "${CF_API_TOKEN:-}" ]];  then ask_secret "Cloudflare API token (Tunnel:Edit + DNS:Edit + Zone:Read + Access:Edit)" CF_API_TOKEN; fi
save_cf_config
export CF_ACCOUNT_ID CF_TUNNEL_ID CF_API_TOKEN

# --- prompt for per-deploy values ----------------------------------------
[[ -z "$INSTANCE" ]] && ask "Instance name (e.g. hermes, hermes-felix)" INSTANCE
[[ -z "$DOMAIN"   ]] && ask "Public domain (e.g. hermes.abzum.cloud)"   DOMAIN
UPSTREAM_SERVICE="${UPSTREAM_SERVICE:-${INSTANCE}-ui}"
UPSTREAM_PORT="${UPSTREAM_PORT:-9119}"

# Prompt for CF Access emails only on deploy, not remove.
if ! $DO_REMOVE && [[ -z "$ACCESS_EMAILS" ]]; then
  echo
  echo "  Cloudflare Access protects the dashboard with a login page."
  read -r -p "  Allowed email(s) — comma-separated (or 'none' to skip): " ACCESS_EMAILS
  ACCESS_EMAILS="${ACCESS_EMAILS:-none}"
fi

# --- remove path ---------------------------------------------------------
if $DO_REMOVE; then
  # Detect what actually exists before touching anything.
  HAS_SYSTEMD=false
  HAS_CONTAINERS=false
  HAS_COMPOSE_DIR=false
  HAS_CF_ROUTE=false
  HAS_CF_ACCESS=false

  [[ -f "/etc/systemd/system/$INSTANCE.service" ]] && HAS_SYSTEMD=true
  if docker ps -a --format '{{.Names}}' | grep -qE "^(${INSTANCE}|${INSTANCE}-ui|${INSTANCE}-dashboard)$"; then
    HAS_CONTAINERS=true
  fi
  [[ -d "$DOCKER_ROOT/$INSTANCE" ]] && HAS_COMPOSE_DIR=true

  _cf_tunnel_resp=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/cfd_tunnel/$CF_TUNNEL_ID/configurations" 2>/dev/null || true)
  if jq -e --arg h "$DOMAIN" '.result.config.ingress[]? | select(.hostname == $h)' <<<"$_cf_tunnel_resp" >/dev/null 2>&1; then
    HAS_CF_ROUTE=true
  fi
  _cf_access_resp=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/access/apps" 2>/dev/null || true)
  if jq -e --arg d "$DOMAIN" '.result[]? | select(.domain == $d)' <<<"$_cf_access_resp" >/dev/null 2>&1; then
    HAS_CF_ACCESS=true
  fi

  echo
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  REMOVAL SUMMARY — instance: $INSTANCE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  $HAS_SYSTEMD     && printf "  %-30s %s\n" "Systemd unit:" "/etc/systemd/system/$INSTANCE.service  [WILL REMOVE]" \
                   || printf "  %-30s %s\n" "Systemd unit:" "not found — skip"
  $HAS_CONTAINERS  && printf "  %-30s %s\n" "Docker containers:" "${INSTANCE} + ${INSTANCE}-ui  [WILL STOP + REMOVE]" \
                   || printf "  %-30s %s\n" "Docker containers:" "not found — skip"
  $HAS_COMPOSE_DIR && printf "  %-30s %s\n" "Compose directory:" "$DOCKER_ROOT/$INSTANCE/  [WILL REMOVE]" \
                   || printf "  %-30s %s\n" "Compose directory:" "not found — skip"
  $HAS_CF_ROUTE    && printf "  %-30s %s\n" "CF tunnel route:" "$DOMAIN  [WILL REMOVE]" \
                   || printf "  %-30s %s\n" "CF tunnel route:" "not found or undetectable — skip"
  $HAS_CF_ACCESS   && printf "  %-30s %s\n" "CF Access app:" "$DOMAIN  [WILL REMOVE]" \
                   || printf "  %-30s %s\n" "CF Access app:" "not found or undetectable — skip"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo

  if ! $ASSUME_YES; then
    read -r -p "  Proceed with removal? [y/N]: " _rc
    [[ "$_rc" == "y" || "$_rc" == "Y" ]] || die "aborted"
  fi
  echo

  if $HAS_CF_ROUTE;   then cf_remove_tunnel_ingress "$DOMAIN" || true; fi
  if $HAS_CF_ACCESS;  then cf_delete_access_app "$DOMAIN" || true; fi

  if $HAS_SYSTEMD; then
    systemctl disable --now "$INSTANCE.service" || true
    rm -f "/etc/systemd/system/$INSTANCE.service"
    systemctl daemon-reload
    log "removed systemd unit $INSTANCE.service"
  fi

  if $HAS_COMPOSE_DIR; then
    (cd "$DOCKER_ROOT/$INSTANCE" && docker compose down -v 2>/dev/null || true)
    rm -rf "$DOCKER_ROOT/$INSTANCE"
    log "removed $DOCKER_ROOT/$INSTANCE"
  elif $HAS_CONTAINERS; then
    # Compose dir is gone but containers still exist — force remove.
    docker rm -f "${INSTANCE}" "${INSTANCE}-ui" 2>/dev/null || true
  fi

  log "removal complete: $INSTANCE"
  exit 0
fi

# --- Doppler token -------------------------------------------------------
if [[ -n "$DOPPLER_TOKEN_FILE" ]]; then
  [[ -r "$DOPPLER_TOKEN_FILE" ]] || die "cannot read $DOPPLER_TOKEN_FILE"
  DOPPLER_TOKEN="$(<"$DOPPLER_TOKEN_FILE")"
else
  ask_secret "Doppler service token (for /docker/$INSTANCE)" DOPPLER_TOKEN
fi

# --- existing instance? --------------------------------------------------
INSTANCE_EXISTS=false
if docker ps -a --format '{{.Names}}' | grep -Eq "^${INSTANCE}$"; then
  INSTANCE_EXISTS=true
fi

# --- deployment summary + confirmation -----------------------------------
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOYMENT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "  %-22s %s\n" "Instance:"         "$INSTANCE"
printf "  %-22s %s\n" "Template:"         "$TEMPLATE"
printf "  %-22s %s\n" "Docker project:"   "$DOCKER_ROOT/$INSTANCE/"
printf "  %-22s %s\n" "Systemd unit:"     "$INSTANCE.service"
printf "  %-22s %s\n" "Image:"            "nousresearch/hermes-agent:latest"
printf "  %-22s %s\n" "Public URL:"       "https://$DOMAIN"
printf "  %-22s %s\n" "Tunnel upstream:"  "$UPSTREAM_SERVICE:$UPSTREAM_PORT"
if [[ "$ACCESS_EMAILS" != "none" && -n "$ACCESS_EMAILS" ]]; then
printf "  %-22s %s\n" "CF Access (login):" "$ACCESS_EMAILS"
else
printf "  %-22s %s\n" "CF Access:"        "disabled (public)"
fi
if $INSTANCE_EXISTS; then
printf "  %-22s %s\n" "Existing instance:" "FOUND — will be replaced (containers + volume removed)"
else
printf "  %-22s %s\n" "Existing instance:" "none — fresh install"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
if ! $ASSUME_YES; then
  read -r -p "  Proceed with deployment? [y/N]: " _confirm
  [[ "$_confirm" == "y" || "$_confirm" == "Y" ]] || die "aborted by user"
fi
echo

SKIP_DOCKER=false

if $INSTANCE_EXISTS; then
  log "replacing existing instance: stopping + removing volumes"
  if systemctl list-unit-files | grep -q "^${INSTANCE}.service"; then
    systemctl stop "$INSTANCE.service" || true
  fi
  (cd "$DOCKER_ROOT/$INSTANCE" 2>/dev/null && docker compose down -v || true)
fi

# --- render compose + systemd unit --------------------------------------
render_template() {
  local tmpl="$1" out="$2"; shift 2
  local content; content=$(<"$tmpl")
  while [[ $# -gt 0 ]]; do
    local marker="$1" value="$2"
    # Literal marker replacement — no shell metachar interpretation.
    content="${content//@@${marker}@@/$value}"
    shift 2
  done
  printf '%s' "$content" > "$out"
}

deploy_docker() {
  local instance_dir="$DOCKER_ROOT/$INSTANCE"
  install -d -m 0755 "$instance_dir"

  # Scope Doppler token first, so we can query secret names for the compose file.
  doppler_scope_token "$INSTANCE" "$DOPPLER_TOKEN"

  local env_lines; env_lines="$(doppler_render_env_lines "$INSTANCE")"
  if [[ -z "$env_lines" ]]; then
    die "Doppler returned 0 secrets for this token — check that the config has secrets defined."
  fi

  local tmpl="$TEMPLATE_DIR/$TEMPLATE.compose.tmpl"
  [[ -f "$tmpl" ]] || die "template not found: $tmpl"

  render_template "$tmpl" "$instance_dir/docker-compose.yml" \
    INSTANCE "$INSTANCE" \
    INSTANCE_UI "${INSTANCE}-ui" \
    DOPPLER_ENV_LINES "$env_lines"
  log "wrote $instance_dir/docker-compose.yml"

  render_template "$TEMPLATE_DIR/systemd.service.tmpl" \
    "/etc/systemd/system/$INSTANCE.service" \
    INSTANCE "$INSTANCE"
  log "wrote /etc/systemd/system/$INSTANCE.service"

  # Pull latest image before first start.
  (cd "$instance_dir" && HOME=/root doppler run -- docker compose pull)

  systemctl daemon-reload
  systemctl enable "$INSTANCE.service"
  # Use restart so systemd always re-executes ExecStart, even if the oneshot
  # service is already "active (exited)" from a previous run.
  systemctl restart "$INSTANCE.service"
  log "systemctl enabled + restarted $INSTANCE.service"
}

if [[ "${SKIP_DOCKER:-false}" != "true" ]]; then
  deploy_docker
else
  log "skipping docker deploy (s)"
fi

# --- Cloudflare: DNS + tunnel ingress + Access ---------------------------
cf_ensure_tunnel_cname "$DOMAIN"
cf_upsert_tunnel_ingress "$DOMAIN" "$UPSTREAM_SERVICE" "$UPSTREAM_PORT"

if [[ "$ACCESS_EMAILS" != "none" && -n "$ACCESS_EMAILS" ]]; then
  ACCESS_APP_ID=$(cf_create_or_update_access_app "$DOMAIN" "$INSTANCE")
  cf_upsert_access_policy "$ACCESS_APP_ID" "$ACCESS_EMAILS"
  log "access: protected https://$DOMAIN — allowed: $ACCESS_EMAILS"

  # Apply account-wide login page branding + custom no-access page.
  # Both soft-fail with a warning if the token lacks the extra scopes.
  _primary_email="${ACCESS_EMAILS%%,*}"
  cf_set_login_branding \
    "Abzum AI Platform" \
    "Private access only — contact ${_primary_email}" \
    "#0f172a" "#f8fafc" ""
  cf_upsert_no_access_page "$_primary_email"
else
  log "access: skipping Cloudflare Access (no email protection)"
fi

# --- verify --------------------------------------------------------------
echo
log "Deploy complete."
echo "  Instance       : $INSTANCE"
echo "  Docker project : $DOCKER_ROOT/$INSTANCE"
echo "  Systemd unit   : $INSTANCE.service"
echo "  Public URL     : https://$DOMAIN"
echo "  Tunnel upstream: $UPSTREAM_SERVICE:$UPSTREAM_PORT"
if [[ "$ACCESS_EMAILS" != "none" && -n "$ACCESS_EMAILS" ]]; then
  echo "  CF Access guard: $ACCESS_EMAILS"
fi
echo
docker ps --filter "name=^${INSTANCE}" --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' || true
echo
echo "First-request through the tunnel can take ~30s as Cloudflare propagates the new ingress rule."
echo "Test: curl -sSI https://$DOMAIN"
