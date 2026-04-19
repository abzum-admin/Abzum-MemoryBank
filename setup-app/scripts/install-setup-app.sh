#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  Abzum Setup App — bootstrap installer                                  ║
# ║                                                                          ║
# ║  Usage (fresh VPS, run as root):                                         ║
# ║    curl -fsSL https://raw.githubusercontent.com/vijaytilak/              ║
# ║      Abzum-MemoryBank-BusinessIntelligence/main/                         ║
# ║      setup-app/scripts/install-setup-app.sh | sudo bash                 ║
# ║                                                                          ║
# ║  What it does:                                                           ║
# ║    1. Install Docker Engine (if not already present)                    ║
# ║    2. Create the `proxy` Docker network (shared with other services)    ║
# ║    3. Create required directories on the host                           ║
# ║    4. Generate SETUP_APP_SECRET (32-byte key, base64, mode 0600)        ║
# ║    5. Generate a one-time bootstrap token (abzs_...)                    ║
# ║    6. Hash the token and store it (bcrypt-like via sha3-256)            ║
# ║    7. Write /docker/abzum-setup-app/docker-compose.yml                  ║
# ║    8. Pull the setup app image and start the container                  ║
# ║    9. Print the bootstrap URL + one-time token                          ║
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

# ── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   Abzum Setup App — Bootstrap          ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════╝${RESET}"
echo ""

# ── Step 1: Docker ────────────────────────────────────────────────────────────
if command -v docker &>/dev/null && docker info &>/dev/null; then
  success "Docker already installed ($(docker --version | cut -d' ' -f3 | tr -d ','))"
else
  info "Installing Docker Engine…"
  # Detect OS
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

  # Start Docker daemon if not running
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
  # Generate 32 random bytes, base64-encode (no newline), write with 0600.
  if command -v openssl &>/dev/null; then
    openssl rand -base64 32 | tr -d '\n' > "${SECRET_FILE}"
  else
    # Fallback: python3
    python3 -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode(), end='')" \
      > "${SECRET_FILE}"
  fi
  chmod 600 "${SECRET_FILE}"
  chown root:root "${SECRET_FILE}"
  success "Encryption key written to ${SECRET_FILE} (mode 0600)"
fi

# ── Step 5 & 6: Bootstrap token ───────────────────────────────────────────────
# Generate a one-time bootstrap token and its SHA3-256 hash.
# The hash is stored in the setup app's SQLite DB by the token injector below.
# The plain token is printed to stdout ONCE and never stored.

BOOTSTRAP_TOKEN="abzs_$(openssl rand -hex 24 2>/dev/null || python3 -c "import os; print(os.urandom(24).hex())")"

# Compute SHA3-256 hash of the token using openssl (3.x) or python3.
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
      # Bootstrap token hash — used by the wizard to validate the one-time token.
      # Cleared from the DB after first use in production.
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

# ── Step 8: Pull image and start ──────────────────────────────────────────────
info "Pulling image ${IMAGE}…"
docker pull "${IMAGE}" || warn "Could not pull image — will use cached version if available"

info "Starting ${CONTAINER_NAME}…"
cd "${COMPOSE_DIR}"

# Stop existing container if any.
docker compose down --remove-orphans 2>/dev/null || true

docker compose up -d

# Wait up to 15s for the container to become healthy.
info "Waiting for setup app to start…"
for i in $(seq 1 15); do
  if docker exec "${CONTAINER_NAME}" wget -qO- http://localhost:3000/api/health &>/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# ── Inject bootstrap token hash into SQLite ───────────────────────────────────
# The hash is injected into the DB directly so the wizard can verify it.
# This avoids passing it as an env var that persists after first use.
info "Injecting bootstrap token hash into database…"
docker exec "${CONTAINER_NAME}" sh -c "
  until [ -f /opt/abzum-setup-app/data/setup.db ]; do sleep 1; done
  sqlite3 /opt/abzum-setup-app/data/setup.db \
    \"INSERT OR REPLACE INTO setup_config (key, value, updated_at)
      VALUES ('bootstrap_token_hash', '${TOKEN_HASH}', unixepoch('subsec') * 1000);\"
" 2>/dev/null || warn "Could not inject token hash (DB may not be ready — the setup app will handle it via env var)"

success "Setup app started"

# ── Step 9: Print access info ─────────────────────────────────────────────────
VPS_IP=$(curl -fsSL --connect-timeout 3 https://api.ipify.org 2>/dev/null \
         || hostname -I 2>/dev/null | awk '{print $1}' \
         || echo "<your-vps-ip>")

echo ""
echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  Abzum Setup App is running!                               ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${CYAN}Setup URL:${RESET}       http://${VPS_IP}:${PORT}/bootstrap"
echo ""
echo -e "  ${YELLOW}${BOLD}Bootstrap token:${RESET} ${BOLD}${BOOTSTRAP_TOKEN}${RESET}"
echo ""
echo -e "  ${RED}⚠  This token is shown ONCE and never stored in plain text.${RESET}"
echo -e "  ${RED}   Copy it now — you will need it to complete setup.${RESET}"
echo ""
echo -e "  Once setup is complete, the domain you configure will be"
echo -e "  secured by Cloudflare Access (Google SSO). Port ${PORT} can"
echo -e "  then be firewalled off."
echo ""
echo -e "  ${CYAN}Logs:${RESET} docker logs -f ${CONTAINER_NAME}"
echo ""
