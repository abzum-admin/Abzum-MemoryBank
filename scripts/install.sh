#!/usr/bin/env bash
# install.sh — one-shot bootstrap that clones this repo onto the VPS and
# symlinks deploy-service.sh into $PATH. Re-running updates the checkout.
#
# Usage on the VPS:
#   REPO_URL=https://github.com/<org>/<repo>.git bash <(curl -fsSL https://raw.githubusercontent.com/<org>/<repo>/main/scripts/install.sh)
set -euo pipefail

: "${REPO_URL:?REPO_URL env var is required (e.g. https://github.com/<org>/<repo>.git)}"
INSTALL_DIR="${INSTALL_DIR:-/opt/abzum-deploy}"
BIN_LINK="${BIN_LINK:-/usr/local/bin/deploy-service}"

if [[ $EUID -ne 0 ]]; then
  echo "install.sh must run as root" >&2
  exit 1
fi

if [[ ! -d "$INSTALL_DIR/.git" ]]; then
  echo "[install] cloning $REPO_URL → $INSTALL_DIR"
  git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
else
  echo "[install] updating $INSTALL_DIR"
  git -C "$INSTALL_DIR" fetch --depth 1 origin
  git -C "$INSTALL_DIR" reset --hard origin/HEAD
fi

chmod +x "$INSTALL_DIR/scripts/deploy-service.sh"
ln -sfn "$INSTALL_DIR/scripts/deploy-service.sh" "$BIN_LINK"
echo "[install] symlinked $BIN_LINK → $INSTALL_DIR/scripts/deploy-service.sh"
echo "[install] run: deploy-service --help"
