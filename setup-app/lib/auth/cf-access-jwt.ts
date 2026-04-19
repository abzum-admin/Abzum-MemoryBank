/**
 * Cloudflare Access JWT verification.
 *
 * Cloudflare Access injects a signed JWT into every request via the
 * `Cf-Access-Jwt-Assertion` header (or `CF_Authorization` cookie). This
 * module verifies that JWT against the Cloudflare public key endpoint:
 *
 *   https://<authDomain>/cdn-cgi/access/certs
 *
 * We use `jose` (JOSE = JSON Object Signing and Encryption) which runs in
 * both Node.js and the Edge Runtime. The `jose` package is installed as a
 * direct dependency.
 *
 * References:
 *   https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 */

import { createRemoteJWKSet, jwtVerify } from "jose";

export interface CfAccessClaims {
  /** Email of the authenticated user (from the Access identity). */
  email?: string;
  /** Access application audience tag. */
  aud?: string[];
  /** Subject (user ID). */
  sub?: string;
  /** Token issue time. */
  iat?: number;
  /** Token expiry. */
  exp?: number;
  /** Cloudflare country code. */
  country?: string;
}

/** Cached JWKS fetchers — one per auth domain to avoid redundant fetches. */
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(authDomain: string) {
  const existing = jwksCache.get(authDomain);
  if (existing) return existing;

  const url = new URL(
    "/cdn-cgi/access/certs",
    `https://${authDomain}`
  );
  const jwks = createRemoteJWKSet(url);
  jwksCache.set(authDomain, jwks);
  return jwks;
}

/**
 * Verify a Cloudflare Access JWT.
 *
 * @param token   The JWT string from the `Cf-Access-Jwt-Assertion` header.
 * @param authDomain  e.g. "yourteam.cloudflareaccess.com"
 * @param audience   The CF Access application AUD tag (optional — validated if provided).
 * @returns Decoded claims if valid.
 * @throws If the token is invalid, expired, or the signature can't be verified.
 */
export async function verifyCfAccessJwt(
  token: string,
  authDomain: string,
  audience?: string
): Promise<CfAccessClaims> {
  const jwks = getJwks(authDomain);

  const verifyOptions = audience
    ? { audience }
    : undefined;

  const { payload } = await jwtVerify(token, jwks, verifyOptions);

  return payload as CfAccessClaims;
}

/**
 * Extract the Cloudflare Access JWT from the request.
 * Checks both the `Cf-Access-Jwt-Assertion` header and the `CF_Authorization` cookie.
 */
export function extractCfJwt(request: Request): string | null {
  // Header takes priority.
  const header = request.headers.get("Cf-Access-Jwt-Assertion");
  if (header) return header;

  // Fall back to cookie.
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k?.trim() ?? "", v.join("=")];
    })
  );
  return cookies["CF_Authorization"] ?? null;
}
