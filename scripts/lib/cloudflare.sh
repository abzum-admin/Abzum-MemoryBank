# shellcheck shell=bash
# Cloudflare API wrappers — manages a remote-managed (token-based) tunnel.
#
# Requires these vars set by the caller (loaded from /etc/abzum-deploy/config.env
# + /etc/abzum-deploy/cf-token):
#   CF_API_TOKEN      Cloudflare API token (scopes: Tunnel:Edit, DNS:Edit, Zone:Read,
#                     Access:Apps and Policies:Edit)
#   CF_ACCOUNT_ID     Cloudflare account ID (UUID)
#   CF_TUNNEL_ID      Cloudflare Tunnel ID (UUID) — the one cloudflared is connected to

CF_API="https://api.cloudflare.com/client/v4"

# --- low-level helper ----------------------------------------------------
cf_api() {
  local method="$1" path="$2" body="${3:-}"
  local url="${CF_API}${path}"
  if [[ -n "$body" ]]; then
    curl -sS -X "$method" "$url" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data-raw "$body"
  else
    curl -sS -X "$method" "$url" \
      -H "Authorization: Bearer $CF_API_TOKEN"
  fi
}

cf_require_success() {
  local response="$1" what="$2"
  if [[ "$(jq -r '.success' <<<"$response")" != "true" ]]; then
    echo "Cloudflare API error while $what:" >&2
    jq -r '.errors' <<<"$response" >&2
    return 1
  fi
}

# --- zone lookup ---------------------------------------------------------
# Find the Cloudflare zone that covers a given hostname.
# Echoes the zone_id on success.
cf_zone_id_for_host() {
  local host="$1"
  # Walk up the labels until a zone is found (covers abzum.com, sub.abzum.com, etc.).
  local candidate="$host"
  while [[ "$candidate" == *.* ]]; do
    local resp
    resp=$(cf_api GET "/zones?name=$candidate")
    if [[ "$(jq -r '.success' <<<"$resp")" == "true" ]]; then
      local zid
      zid=$(jq -r '.result[0].id // empty' <<<"$resp")
      if [[ -n "$zid" ]]; then
        printf '%s' "$zid"
        return 0
      fi
    fi
    candidate="${candidate#*.}"
  done
  echo "No Cloudflare zone found for $host" >&2
  return 1
}

# --- DNS: upsert proxied CNAME -> <tunnel-id>.cfargotunnel.com -----------
cf_ensure_tunnel_cname() {
  local host="$1"
  local zone_id target existing_id existing_content resp body
  zone_id=$(cf_zone_id_for_host "$host")
  target="${CF_TUNNEL_ID}.cfargotunnel.com"

  resp=$(cf_api GET "/zones/$zone_id/dns_records?name=$host&type=CNAME")
  cf_require_success "$resp" "looking up DNS for $host"
  existing_id=$(jq -r '.result[0].id // empty' <<<"$resp")
  existing_content=$(jq -r '.result[0].content // empty' <<<"$resp")

  body=$(jq -nc --arg name "$host" --arg content "$target" \
    '{type:"CNAME", name:$name, content:$content, proxied:true, ttl:1}')

  if [[ -n "$existing_id" ]]; then
    if [[ "$existing_content" == "$target" ]]; then
      log "dns: $host already CNAMEs to $target"
      return 0
    fi
    log "dns: updating existing CNAME for $host → $target"
    resp=$(cf_api PUT "/zones/$zone_id/dns_records/$existing_id" "$body")
  else
    log "dns: creating CNAME $host → $target (proxied)"
    resp=$(cf_api POST "/zones/$zone_id/dns_records" "$body")
  fi
  cf_require_success "$resp" "writing DNS for $host"
}

# --- Tunnel: upsert ingress rule ----------------------------------------
# Inserts { hostname: <host>, service: http://<service>:<port> } into the
# remote-managed tunnel's config, just before the catch-all rule.
cf_upsert_tunnel_ingress() {
  local host="$1" service="$2" port="$3"
  local cfg_path="/accounts/$CF_ACCOUNT_ID/cfd_tunnel/$CF_TUNNEL_ID/configurations"
  local resp current_config new_config body
  local service_url="http://${service}:${port}"

  resp=$(cf_api GET "$cfg_path")
  cf_require_success "$resp" "reading tunnel config"
  current_config=$(jq -c '.result.config // {ingress: [{service: "http_status:404"}]}' <<<"$resp")

  # Build new ingress:
  #   1) all existing rules EXCEPT any that already match $host AND except the catch-all
  #   2) append new rule for $host
  #   3) append catch-all (http_status:404)
  new_config=$(jq -c \
    --arg host "$host" \
    --arg service "$service_url" \
    '
      .ingress as $in
      | ($in
          | map(select(.hostname != $host and (.service // "") != "http_status:404"))
        ) as $kept
      | .ingress = ($kept + [{hostname: $host, service: $service}] + [{service: "http_status:404"}])
    ' <<<"$current_config")

  body=$(jq -nc --argjson config "$new_config" '{config: $config}')

  log "tunnel: routing $host → $service_url"
  resp=$(cf_api PUT "$cfg_path" "$body")
  cf_require_success "$resp" "writing tunnel config"
}

cf_remove_tunnel_ingress() {
  local host="$1"
  local cfg_path="/accounts/$CF_ACCOUNT_ID/cfd_tunnel/$CF_TUNNEL_ID/configurations"
  local resp current_config new_config body
  resp=$(cf_api GET "$cfg_path")
  cf_require_success "$resp" "reading tunnel config"
  current_config=$(jq -c '.result.config' <<<"$resp")
  new_config=$(jq -c --arg host "$host" \
    '.ingress |= map(select(.hostname != $host))' <<<"$current_config")
  body=$(jq -nc --argjson config "$new_config" '{config: $config}')
  cf_api PUT "$cfg_path" "$body" >/dev/null
  log "tunnel: removed route for $host"
}

# --- Access: create or update a self-hosted application ------------------
# Echoes the app_id on success. Idempotent — updates the existing app if
# one with the same domain is found.
cf_create_or_update_access_app() {
  local domain="$1" instance="$2"
  local resp app_id body

  # Check for an existing app covering this domain.
  resp=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/access/apps")
  cf_require_success "$resp" "listing Access apps"
  app_id=$(jq -r --arg d "$domain" \
    '.result[] | select(.domain == $d) | .id' <<<"$resp" | head -1)

  body=$(jq -nc \
    --arg name "Hermes UI — $instance" \
    --arg domain "$domain" \
    '{
      name: $name,
      domain: $domain,
      type: "self_hosted",
      session_duration: "24h",
      auto_redirect_to_identity: false
    }')

  if [[ -n "$app_id" ]]; then
    log "access: updating existing app for $domain (id $app_id)"
    resp=$(cf_api PUT "/accounts/$CF_ACCOUNT_ID/access/apps/$app_id" "$body")
  else
    log "access: creating new app for $domain"
    resp=$(cf_api POST "/accounts/$CF_ACCOUNT_ID/access/apps" "$body")
  fi
  cf_require_success "$resp" "writing Access app for $domain"
  app_id=$(jq -r '.result.id' <<<"$resp")
  printf '%s' "$app_id"
}

# --- Access: upsert an allow policy with the given emails ----------------
# Replaces any existing policies on the app with a single "Owners only" rule.
# emails_csv: comma-separated list, e.g. "alice@example.com,bob@example.com"
cf_upsert_access_policy() {
  local app_id="$1" emails_csv="$2"
  local resp policy_id body include_entries

  # Build the include array from comma-separated emails.
  include_entries=$(jq -Rnc --arg emails "$emails_csv" '
    ($emails | split(",")) | map(ltrimstr(" ") | rtrimstr(" ")) |
    map(select(length > 0)) |
    map({email: {email: .}})
  ')

  body=$(jq -nc \
    --arg name "Owners only" \
    --argjson include "$include_entries" \
    '{name: $name, decision: "allow", precedence: 1, include: $include}')

  # Delete existing policies first so we don't accumulate stale ones.
  resp=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/access/apps/$app_id/policies")
  if [[ "$(jq -r '.success' <<<"$resp")" == "true" ]]; then
    while read -r pid; do
      [[ -n "$pid" ]] && cf_api DELETE "/accounts/$CF_ACCOUNT_ID/access/apps/$app_id/policies/$pid" >/dev/null
    done < <(jq -r '.result[].id' <<<"$resp")
  fi

  log "access: setting policy for app $app_id → $emails_csv"
  resp=$(cf_api POST "/accounts/$CF_ACCOUNT_ID/access/apps/$app_id/policies" "$body")
  cf_require_success "$resp" "writing Access policy"
}

# --- Access: set account-wide login page branding ------------------------
# Idempotent — PUTs to the organizations endpoint which always updates.
# Soft-fails with a warning if the token lacks Access:Organizations:Edit.
cf_set_login_branding() {
  local header_text="$1" footer_text="$2"
  local background_color="${3:-#0f172a}"
  local text_color="${4:-#f8fafc}"
  local logo_path="${5:-}"

  local body resp
  body=$(jq -nc \
    --arg header "$header_text" \
    --arg footer "$footer_text" \
    --arg bg "$background_color" \
    --arg fg "$text_color" \
    --arg logo "$logo_path" \
    '{login_design:{background_color:$bg,text_color:$fg,logo_path:$logo,header_text:$header,footer_text:$footer}}')

  log "access: applying login page branding"
  resp=$(cf_api PUT "/accounts/$CF_ACCOUNT_ID/access/organizations" "$body")
  if [[ "$(jq -r '.success' <<<"$resp")" != "true" ]]; then
    log "WARNING: could not set login branding — token may need Access:Organizations:Edit scope"
    jq -r '.errors' <<<"$resp" >&2
  fi
}

# --- Access: upsert the account-wide "forbidden" (no-access) custom page -
# Soft-fails with a warning if the token lacks Access:Custom Pages:Edit.
# contact_email is embedded in the page HTML.
cf_upsert_no_access_page() {
  local contact_email="$1"
  local resp page_id body custom_html

  # Self-contained HTML — inline SVG logo, no external dependencies.
  custom_html=$(cat <<ENDHTML
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Access Denied — Abzum</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f172a;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:48px 40px;max-width:440px;width:100%;text-align:center}
.logo{margin-bottom:24px}h1{font-size:20px;font-weight:600;margin-bottom:12px}
p{color:#94a3b8;font-size:14px;line-height:1.6}a{color:#60a5fa}
</style></head><body><div class="card">
<div class="logo"><svg width="64" height="64" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="24" fill="#0f172a"/><path d="M60 18L102 96H18L60 18Z" fill="none" stroke="#3b82f6" stroke-width="5" stroke-linejoin="round"/><path d="M60 18L102 96H18L60 18Z" fill="#3b82f6" fill-opacity="0.08"/><line x1="36" y1="72" x2="84" y2="72" stroke="#3b82f6" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="54" r="4" fill="#60a5fa"/></svg></div>
<h1>Access Denied</h1>
<p>Your account is not authorised to access this service.<br><br>Contact <a href="mailto:${contact_email}">${contact_email}</a> to request access.</p>
</div></body></html>
ENDHTML
)

  resp=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/access/custom_pages")
  if [[ "$(jq -r '.success' <<<"$resp")" != "true" ]]; then
    log "WARNING: could not manage custom pages — token may need Access:Custom Pages:Edit scope"
    jq -r '.errors' <<<"$resp" >&2
    return 0
  fi

  page_id=$(jq -r '.result[]? | select(.type == "forbidden") | .id' <<<"$resp" | head -1)

  body=$(jq -nc --arg name "Abzum — Access Denied" --arg html "$custom_html" \
    '{name:$name,type:"forbidden",custom_html:$html}')

  if [[ -n "$page_id" ]]; then
    log "access: updating no-access custom page (id $page_id)"
    resp=$(cf_api PUT "/accounts/$CF_ACCOUNT_ID/access/custom_pages/$page_id" "$body")
  else
    log "access: creating no-access custom page"
    resp=$(cf_api POST "/accounts/$CF_ACCOUNT_ID/access/custom_pages" "$body")
  fi

  if [[ "$(jq -r '.success' <<<"$resp")" != "true" ]]; then
    log "WARNING: could not set no-access page — token may need Access:Custom Pages:Edit scope"
    jq -r '.errors' <<<"$resp" >&2
  fi
}

# --- Access: delete the app for a given domain (used on --remove) --------
cf_delete_access_app() {
  local domain="$1"
  local resp app_id
  resp=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/access/apps")
  [[ "$(jq -r '.success' <<<"$resp")" == "true" ]] || return 0
  app_id=$(jq -r --arg d "$domain" \
    '.result[] | select(.domain == $d) | .id' <<<"$resp" | head -1)
  if [[ -n "$app_id" ]]; then
    cf_api DELETE "/accounts/$CF_ACCOUNT_ID/access/apps/$app_id" >/dev/null
    log "access: deleted app for $domain"
  else
    log "access: no app found for $domain — skipping"
  fi
}
