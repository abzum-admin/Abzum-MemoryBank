import "server-only";

/**
 * Cloudflare API — low-level fetch wrapper.
 *
 * All functions in this module take an explicit CfCredentials parameter rather
 * than reading from process.env so callers can source credentials from Doppler,
 * the DB, or the bootstrap wizard form without coupling this layer to any
 * specific retrieval mechanism.
 */

export const CF_API_BASE = "https://api.cloudflare.com/client/v4";

/* ── Credentials ──────────────────────────────────────────────────────────── */

/**
 * Credentials needed for Cloudflare API calls.
 * In production these come from Doppler (CF_API_TOKEN) and the DB
 * (CF_ACCOUNT_ID, CF_TUNNEL_ID from the cloudflare_config row).
 */
export interface CfCredentials {
  /** Cloudflare API token — must have Tunnel:Edit, DNS:Edit, Zone:Read, Access scopes. */
  apiToken: string;
  /** Cloudflare account ID (32-char hex). */
  accountId: string;
  /** Cloudflare tunnel UUID. */
  tunnelId: string;
}

/* ── Error types ──────────────────────────────────────────────────────────── */

export interface CfApiError {
  code: number;
  message: string;
}

export class CfError extends Error {
  constructor(
    public readonly errors: CfApiError[],
    public readonly context: string
  ) {
    const msgs = errors.map((e) => `[${e.code}] ${e.message}`).join("; ");
    super(`Cloudflare API error while ${context}: ${msgs}`);
    this.name = "CfError";
  }
}

/* ── Response type ────────────────────────────────────────────────────────── */

export interface CfResponse<T> {
  success: boolean;
  result: T;
  errors: CfApiError[];
  messages: Array<{ code: number; message: string }>;
  result_info?: {
    count: number;
    page: number;
    per_page: number;
    total_count: number;
  };
}

/* ── Low-level request ────────────────────────────────────────────────────── */

/**
 * Make a Cloudflare API request.
 * Throws CfError if `success` is false in the response body.
 */
export async function cfRequest<T>(
  creds: CfCredentials,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<CfResponse<T>> {
  const url = `${CF_API_BASE}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${creds.apiToken}`,
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // 30-second timeout for CF API calls
    signal: AbortSignal.timeout(30_000),
  });

  const data = (await res.json()) as CfResponse<T>;

  if (!data.success) {
    throw new CfError(data.errors ?? [], path);
  }

  return data;
}

/**
 * Variant of cfRequest that does not throw on CF API error — returns the raw
 * response instead. Use for soft-fail operations (login branding, custom pages)
 * where the token might not have the required scope.
 */
export async function cfRequestSoft<T>(
  creds: CfCredentials,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<CfResponse<T> | null> {
  try {
    return await cfRequest<T>(creds, method, path, body);
  } catch {
    return null;
  }
}
