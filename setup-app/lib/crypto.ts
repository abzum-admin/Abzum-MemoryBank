import "server-only";
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";
import sodium from "libsodium-wrappers";

/**
 * At-rest secret encryption via libsodium secretbox (XSalsa20 + Poly1305).
 *
 * Key lifecycle:
 *   - A 32-byte symmetric key is generated once at bootstrap.
 *   - Stored at /etc/abzum-setup-app/secret (mode 0600, root-owned).
 *   - Also readable from SETUP_APP_SECRET env var for dev/tests (base64).
 *   - The container bind-mounts /etc/abzum-setup-app/ so the key survives
 *     container upgrades and is NEVER baked into the image.
 *
 * Ciphertext format (stored in SQLite as base64): nonce || ciphertext, both
 * concatenated and b64-encoded. The nonce is freshly generated per encrypt
 * call (libsodium.randombytes_buf).
 */

const KEY_PATH = process.env.SETUP_APP_SECRET_PATH ?? "/etc/abzum-setup-app/secret";

let cachedKey: Uint8Array | null = null;
let sodiumReadyPromise: Promise<void> | null = null;

async function ensureReady(): Promise<void> {
  if (!sodiumReadyPromise) {
    sodiumReadyPromise = sodium.ready;
  }
  await sodiumReadyPromise;
}

function loadOrCreateKey(): Uint8Array {
  if (cachedKey) return cachedKey;

  // Env var takes precedence (dev/test)
  const envKey = process.env.SETUP_APP_SECRET;
  if (envKey) {
    const decoded = Buffer.from(envKey, "base64");
    if (decoded.length !== 32) {
      throw new Error("SETUP_APP_SECRET must be a base64-encoded 32-byte key");
    }
    cachedKey = new Uint8Array(decoded);
    return cachedKey;
  }

  // File-backed key (production path written by install-setup-app.sh)
  if (existsSync(KEY_PATH)) {
    const raw = readFileSync(KEY_PATH, "utf8").trim();
    const decoded = Buffer.from(raw, "base64");
    if (decoded.length !== 32) {
      throw new Error(`${KEY_PATH} is not a base64-encoded 32-byte key`);
    }
    cachedKey = new Uint8Array(decoded);
    return cachedKey;
  }

  // First-run: generate + persist (0600)
  if (!sodium.crypto_secretbox_KEYBYTES) {
    throw new Error("libsodium not initialised — call ensureReady() first");
  }
  const keyBytes = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
  mkdirSync(dirname(KEY_PATH), { recursive: true });
  writeFileSync(KEY_PATH, Buffer.from(keyBytes).toString("base64"), { mode: 0o600 });
  try {
    chmodSync(KEY_PATH, 0o600);
  } catch {
    // Windows dev — chmod is a no-op
  }
  cachedKey = keyBytes;
  return cachedKey;
}

export async function encryptSecret(plaintext: string): Promise<string> {
  await ensureReady();
  const key = loadOrCreateKey();
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_secretbox_easy(
    sodium.from_string(plaintext),
    nonce,
    key
  );
  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce, 0);
  combined.set(ciphertext, nonce.length);
  return Buffer.from(combined).toString("base64");
}

export async function decryptSecret(stored: string): Promise<string> {
  await ensureReady();
  const key = loadOrCreateKey();
  const combined = new Uint8Array(Buffer.from(stored, "base64"));
  const nonceLen = sodium.crypto_secretbox_NONCEBYTES;
  if (combined.length <= nonceLen) {
    throw new Error("ciphertext too short");
  }
  const nonce = combined.slice(0, nonceLen);
  const ciphertext = combined.slice(nonceLen);
  const plainBytes = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
  return sodium.to_string(plainBytes);
}

/**
 * Generate a human-shareable bootstrap token: `abzs_` + 32 hex chars.
 * Returns { token, hash } — the hash is stored in setup_config, the token
 * is printed to stdout by the install script (one-time, single-use).
 */
export async function generateBootstrapToken(): Promise<{ token: string; hash: string }> {
  await ensureReady();
  const bytes = sodium.randombytes_buf(16);
  const token = "abzs_" + Buffer.from(bytes).toString("hex");
  const hashBytes = sodium.crypto_generichash(32, sodium.from_string(token));
  const hash = Buffer.from(hashBytes).toString("hex");
  return { token, hash };
}

export async function hashBootstrapToken(token: string): Promise<string> {
  await ensureReady();
  const hashBytes = sodium.crypto_generichash(32, sodium.from_string(token));
  return Buffer.from(hashBytes).toString("hex");
}
