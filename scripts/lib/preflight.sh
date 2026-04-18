# shellcheck shell=bash
# Preflight: root check, dependency install, proxy network, config dir.

preflight_require_root() {
  if [[ $EUID -ne 0 ]]; then
    die "deploy-service must run as root (uses /docker, /etc/systemd, Doppler at \$HOME=/root)."
  fi
}

preflight_install_deps() {
  local missing=()
  for cmd in curl jq docker; do
    command -v "$cmd" >/dev/null 2>&1 || missing+=("$cmd")
  done

  # docker must be present already (VPS base image ships with it); we only auto-install curl/jq.
  if [[ " ${missing[*]} " == *" docker "* ]]; then
    die "docker not found; install Docker before running this script."
  fi
  if [[ ${#missing[@]} -gt 0 ]]; then
    log "installing missing deps: ${missing[*]}"
    apt-get update -qq
    apt-get install -yq "${missing[@]}"
  fi

  # Doppler CLI: official install (https://docs.doppler.com/docs/install-cli).
  if ! command -v doppler >/dev/null 2>&1; then
    log "installing Doppler CLI (official apt repo)"
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' \
      | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg
    echo 'deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main' \
      > /etc/apt/sources.list.d/doppler-cli.list
    apt-get update -qq
    apt-get install -yq doppler
  fi
}

preflight_proxy_network() {
  if ! docker network inspect proxy >/dev/null 2>&1; then
    log "creating external docker network 'proxy'"
    docker network create proxy
  fi
}

preflight_config_dir() {
  install -d -m 0755 "$CONFIG_DIR"
}

preflight_all() {
  preflight_require_root
  preflight_install_deps
  preflight_proxy_network
  preflight_config_dir
}
