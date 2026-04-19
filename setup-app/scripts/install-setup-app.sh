#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  Abzum Setup App — bootstrap installer                                  ║
# ║                                                                          ║
# ║  Usage (fresh VPS, run as root):                                         ║
# ║    curl -fsSL https://raw.githubusercontent.com/vijaytilak/             ║
# ║      Abzum-Setup-Script/main/install-setup-app.sh | sudo bash           ║
# ║                                                                          ║
# ║  What it does:                                                           ║
# ║    1. Checks prerequisites (root, Docker, cloudflared, DOPPLER_TOKEN)   ║
# ║    2. Creates the `proxy` Docker network (shared with other services)   ║
# ║    3. Builds the setup-app Docker image from source (GitHub)            ║
# ║    4. Creates required directories on the host                          ║
# ║    5. Generate SETUP_APP_SECRET (32-byte key, base64, mode 0600)        ║
# ║    6. Generate a one-time bootstrap token (abzs_...)                    ║
# ║    7. Hash the token and store it (SHA3-256)                            ║
# ║    8. Write /docker/abzum-setup-app/docker-compose.yml                  ║
# ║    9. Pull the setup app image and start the container                  ║
# ║   10. Configure Cloudflare tunnel ingress for abzum.cloud               ║
# ║   11. Ensure DNS CNAME for abzum.cloud points to the tunnel             ║
# ║   12. Print the bootstrap URL + one-time token                          ║
# ╚══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ── Colours ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}→ $*${RESET}"; }
success() { echo -e "${GREEN}✓ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠ $*${RESET}"; }
error()   { echo -e "${RED}✗ $*${RESET}" >&2; exit 1; }

# ── Root check ───────────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  error "This script must be run as root (use sudo)"
fi

# ── Configuration ─────────────────────────────────────────────────────────────
IMAGE="${SETUP_APP_IMAGE:-ghcr.io/vijaytilak/abzum-setup-app:latest}"
PORT="${SETUP_APP_PORT:-3000}"
COMPOSE_DIR="/docker/abzum-setup-app"
DATA_DIR="/opt/abzum-setup-app/data"
SECRET_DIR="/etc/abzum-setup-app"
SECRET_FILE="${SECRET_DIR}/secret"
CONTAINER_NAME="abzum-setup-app"
SETUP_DOMAIN="${SETUP_DOMAIN:-abzum.cloud}"
APP_SOURCE_REPO="https://github.com/vijaytilak/Abzum-MemoryBank-BusinessIntelligence"

# ── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   Abzum Setup App — Bootstrap          ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════╝${RESET}"
echo ""

# ── Prerequisite: cloudflared ─────────────────────────────────────────────────
if ! docker ps --format '{{.Names}}' | grep -qE '^cloudflared'; then
  error "cloudflared container is not running.
  The setup app is exposed at https://${SETUP_DOMAIN} via the cloudflared tunnel.
  Start cloudflared first, then re-run this installer."
fi
success "cloudflared is running"

# ── Prerequisite: DOPPLER_TOKEN ────────────────────────────────────────────────
DOPPLER_TOKEN="${DOPPLER_TOKEN:-}"
if [[ -z "$DOPPLER_TOKEN" ]]; then
  error "DOPPLER_TOKEN environment variable is required.
  Run: DOPPLER_TOKEN=dp.st.xxx bash install-setup-app.sh"
fi

# ── Fetch CF credentials from Doppler API ─────────────────────────────────────
info "Loading Cloudflare credentials from Doppler…"

# Download all secrets in one call using the service token.
# The /download endpoint works with service tokens without requiring
# explicit project/config params — they are encoded in the token.
_DOPPLER_SECRETS=$(curl -fsS \
  "https://api.doppler.com/v3/configs/config/secrets/download?format=json&include_dynamic_secrets=false" \
  -H "Authorization: Bearer ${DOPPLER_TOKEN}") \
  || error "Failed to download secrets from Doppler. Check your DOPPLER_TOKEN and ensure it has access."

doppler_secret() {
  local name="$1"
  local value
  value=$(echo "${_DOPPLER_SECRETS}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
val = d.get('$name')
if val is None:
    raise KeyError('Secret $name not found in Doppler config')
print(val)
") || error "Secret ${name} not found in Doppler. Check the token has access to this secret."
  echo "$value"
}

CF_API_TOKEN=$(doppler_secret CF_API_TOKEN)
CF_ACCOUNT_ID=$(doppler_secret CF_ACCOUNT_ID)
CF_TUNNEL_ID=$(doppler_secret CF_TUNNEL_ID)
CF_ZONE_ID=$(doppler_secret CF_ZONE_ID)
success "CF credentials loaded from Doppler"

# ── Step 1: Docker ────────────────────────────────────────────────────────────
if command -v docker &>/dev/null && docker info &>/dev/null; then
  success "Docker already installed ($(docker --version | cut -d' ' -f3 | tr -d ','))"
else
  info "Installing Docker Engine…"
  if [[ -f /etc/os-release ]]; then
    # shellcheck disable=SC1091
    source /etc/os-release
    case "${ID:-}" in
      ubuntu|debian)
        apt-get update -qq
        apt-get install -y -qq ca-certificates curl gnupg lsb-release
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
          | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) \
          signed-by=/etc/apt/keyrings/docker.gpg] \
          https://download.docker.com/linux/${ID} $(lsb_release -cs) stable" \
          > /etc/apt/sources.list.d/docker.list
        apt-get update -qq
        apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
          docker-buildx-plugin docker-compose-plugin
        ;;
      centos|rhel|fedora)
        dnf install -y -q dnf-utils
        dnf config-manager --add-repo \
          https://download.docker.com/linux/centos/docker-ce.repo
        dnf install -y -q docker-ce docker-ce-cli containerd.io \
          docker-buildx-plugin docker-compose-plugin
        systemctl enable --now docker
        ;;
      *)
        info "Unknown distro — using get.docker.com convenience script"
        curl -fsSL https://get.docker.com | sh
        ;;
    esac
  else
    info "No /etc/os-release — using get.docker.com convenience script"
    curl -fsSL https://get.docker.com | sh
  fi

  if ! docker info &>/dev/null; then
    systemctl start docker || service docker start || true
    sleep 2
    docker info &>/dev/null || error "Docker failed to start after installation"
  fi

  success "Docker installed"
fi

# ── Step 2: Docker proxy network ──────────────────────────────────────────────
if docker network inspect proxy &>/dev/null; then
  success "Docker network 'proxy' already exists"
else
  info "Creating Docker network 'proxy'…"
  docker network create proxy
  success "Docker network 'proxy' created"
fi

# ── Step 2b: Build setup-app Docker image ─────────────────────────────────────
if docker image inspect "${IMAGE}" &>/dev/null; then
  success "Image ${IMAGE} already present locally"
else
  info "Cloning app source and building image (first run: ~3-5 min)…"
  if [[ -d /tmp/abzum-build/.git ]]; then
    git -C /tmp/abzum-build pull --ff-only
  else
    git clone --depth 1 "${APP_SOURCE_REPO}" /tmp/abzum-build
  fi
  docker build -t "${IMAGE}" /tmp/abzum-build/setup-app
  success "Image built: ${IMAGE}"
fi

# ── Step 3: Directories ───────────────────────────────────────────────────────
info "Creating required directories…"
mkdir -p "${COMPOSE_DIR}" "${DATA_DIR}" "${SECRET_DIR}" /docker

chmod 750 "${SECRET_DIR}"
chmod 755 "${DATA_DIR}" "${COMPOSE_DIR}"

success "Directories ready"

# ── Step 4: Encryption key ────────────────────────────────────────────────────
if [[ -f "${SECRET_FILE}" ]]; then
  success "Encryption key already exists at ${SECRET_FILE}"
else
  info "Generating encryption key…"
  if command -v openssl &>/dev/null; then
    openssl rand -base64 32 | tr -d '\n' > "${SECRET_FILE}"
  else
    python3 -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode(), end='')" \
      > "${SECRET_FILE}"
  fi
  chmod 600 "${SECRET_FILE}"
  chown root:root "${SECRET_FILE}"
  success "Encryption key written to ${SECRET_FILE} (mode 0600)"
fi

# ── Steps 5 & 6: Bootstrap token ──────────────────────────────────────────────
BOOTSTRAP_TOKEN="abzs_$(openssl rand -hex 24 2>/dev/null || python3 -c "import os; print(os.urandom(24).hex())")"

if openssl dgst -sha3-256 /dev/null &>/dev/null; then
  TOKEN_HASH=$(printf '%s' "${BOOTSTRAP_TOKEN}" | openssl dgst -sha3-256 -hex | awk '{print $2}')
else
  TOKEN_HASH=$(python3 -c "
import sys, hashlib
token = sys.stdin.read()
print(hashlib.sha3_256(token.encode()).hexdigest())
" <<< "${BOOTSTRAP_TOKEN}")
fi

# ── Step 7: docker-compose.yml ────────────────────────────────────────────────
info "Writing ${COMPOSE_DIR}/docker-compose.yml…"

cat > "${COMPOSE_DIR}/docker-compose.yml" << COMPOSEOF
# Abzum Setup App — generated by install-setup-app.sh
# DO NOT EDIT manually — re-run the installer to regenerate.

services:
  ${CONTAINER_NAME}:
    image: ${IMAGE}
    container_name: ${CONTAINER_NAME}
    restart: unless-stopped

    ports:
      - "${PORT}:3000"

    environment:
      NODE_ENV: production
      SETUP_APP_SECRET_PATH: /run/secrets/setup-app-secret
      BOOTSTRAP_TOKEN_HASH: "${TOKEN_HASH}"

    volumes:
      - /opt/abzum-setup-app/data:/opt/abzum-setup-app/data
      - /etc/abzum-setup-app/secret:/run/secrets/setup-app-secret:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - /docker:/docker
      - /root/.doppler:/root/.doppler:ro

    networks:
      - proxy

networks:
  proxy:
    external: true
COMPOSEOF

success "Compose file written"

# ── Step 8: Start container ───────────────────────────────────────────────────
info "Starting ${CONTAINER_NAME}…"
cd "${COMPOSE_DIR}"
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d

# ── Step 9: Wait for health ───────────────────────────────────────────────────
info "Waiting for setup app to start…"
for i in $(seq 1 30); do
  if docker exec "${CONTAINER_NAME}" wget -qO- http://localhost:3000/api/health &>/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Inject bootstrap token hash into SQLite
info "Injecting bootstrap token hash into database…"
docker exec "${CONTAINER_NAME}" sh -c "
  until [ -f /opt/abzum-setup-app/data/setup.db ]; do sleep 1; done
  sqlite3 /opt/abzum-setup-app/data/setup.db \
    \"INSERT OR REPLACE INTO setup_config (key, value, updated_at)
      VALUES ('bootstrap_token_hash', '${TOKEN_HASH}', unixepoch('subsec') * 1000);\"
" 2>/dev/null || warn "Could not inject token hash into DB (setup app will use BOOTSTRAP_TOKEN_HASH env var as fallback)"

success "Setup app started"

# ── Step 10: Cloudflare tunnel ingress for ${SETUP_DOMAIN} ───────────────────
info "Configuring Cloudflare tunnel ingress for ${SETUP_DOMAIN}…"

CURRENT=$(curl -fsS \
  "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/cfd_tunnel/${CF_TUNNEL_ID}/configurations" \
  -H "Authorization: Bearer ${CF_API_TOKEN}") \
  || error "Failed to fetch tunnel configuration from Cloudflare API."

NEW_CONFIG=$(CURRENT="${CURRENT}" SETUP_DOMAIN="${SETUP_DOMAIN}" CONTAINER_NAME="${CONTAINER_NAME}" python3 - <<'PYEOF'
import json, os
data = json.loads(os.environ['CURRENT'])
domain = os.environ['SETUP_DOMAIN']
container = os.environ['CONTAINER_NAME']
ingress = data.get('result', {}).get('config', {}).get('ingress', [])
# Remove existing rule for this domain and any bare catch-all
ingress = [r for r in ingress if r.get('hostname') and r.get('hostname') != domain]
# Prepend our rule
ingress = [{'hostname': domain, 'service': f'http://{container}:3000'}] + ingress
# Always end with catch-all
ingress.append({'service': 'http_status:404'})
print(json.dumps({'config': {'ingress': ingress}}))
PYEOF
)

curl -fsS -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/cfd_tunnel/${CF_TUNNEL_ID}/configurations" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${NEW_CONFIG}" > /dev/null \
  || error "Failed to update Cloudflare tunnel configuration."

success "Tunnel ingress configured: ${SETUP_DOMAIN} → ${CONTAINER_NAME}:3000"

# ── Step 11: DNS CNAME for ${SETUP_DOMAIN} (idempotent) ──────────────────────
info "Ensuring DNS record for ${SETUP_DOMAIN}…"

DNS_RECORDS=$(curl -fsS \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${SETUP_DOMAIN}&type=CNAME" \
  -H "Authorization: Bearer ${CF_API_TOKEN}")

DNS_COUNT=$(echo "${DNS_RECORDS}" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('result',[])))")

if [[ "$DNS_COUNT" -eq 0 ]]; then
  curl -fsS -X POST \
    "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"CNAME\",\"name\":\"@\",\"content\":\"${CF_TUNNEL_ID}.cfargotunnel.com\",\"proxied\":true}" > /dev/null \
    || warn "Could not create DNS CNAME — it may already exist as a different record type."
  success "DNS CNAME created: ${SETUP_DOMAIN} → ${CF_TUNNEL_ID}.cfargotunnel.com"
else
  success "DNS CNAME already exists for ${SETUP_DOMAIN}"
fi

# ── Step 12: Print access info ────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  Abzum Setup App is running!                               ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${CYAN}Setup URL:${RESET}       https://${SETUP_DOMAIN}/bootstrap"
echo ""
echo -e "  ${YELLOW}${BOLD}Bootstrap token:${RESET} ${BOLD}${BOOTSTRAP_TOKEN}${RESET}"
echo ""
echo -e "  ${RED}⚠  This token is shown ONCE and never stored in plain text.${RESET}"
echo -e "  ${RED}   Copy it now — you will need it to complete setup.${RESET}"
echo ""
echo -e "  Once setup is complete, Cloudflare Access (Google SSO) will"
echo -e "  protect ${SETUP_DOMAIN}. Port ${PORT} can then be firewalled off."
echo ""
echo -e "  ${CYAN}Logs:${RESET} docker logs -f ${CONTAINER_NAME}"
echo ""
