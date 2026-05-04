import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Edge Middleware — auth guard for protected routes.
 *
 * Authentication strategy (in priority order):
 *
 * 1. **Bootstrap not yet complete** (DB flag `bootstrap_complete` ≠ "1"):
 *    - Any request to a protected route (`/(protected)/**`) is redirected to
 *      `/bootstrap` so the first-run wizard runs first.
 *    - Bootstrap and public routes are allowed through.
 *
 * 2. **Bootstrap complete + CF Access JWT present**:
 *    - The JWT in `Cf-Access-Jwt-Assertion` header or `CF_Authorization` cookie
 *      is verified against the Cloudflare public key endpoint.
 *    - Valid JWT → allowed through; email attached as `x-cf-email` header.
 *    - Invalid/missing JWT → redirect to the CF Access login page.
 *
 * 3. **Development bypass** (`NODE_ENV !== "production"`):
 *    - CF Access JWT verification is skipped entirely so the app is accessible
 *      at `http://localhost:3000` without a CF tunnel.
 *    - Bootstrap wizard is still shown until it's manually completed.
 *
 * ⚠ Middleware runs on the Edge Runtime. All imports must be Edge-compatible:
 *   - No `better-sqlite3` (native), no `dockerode`, no `child_process`.
 *   - We read `BOOTSTRAP_COMPLETE` and `CF_AUTH_DOMAIN` from environment
 *     variables that are injected at request time by the Next.js server
 *     (set via instrumentation.ts at startup) — NOT from SQLite directly.
 *
 * Since middleware cannot do async SQLite reads, the auth domain and bootstrap
 * state are cached in Next.js `unstable_after`-style env vars written by the
 * instrumentation hook. On Windows dev (no SQLite), both are absent and the
 * middleware falls through to the dev bypass.
 */

/** Routes that are always public (no auth required). */
const PUBLIC_PATHS = ["/bootstrap", "/api/health"];

/** Routes that bypass auth even when protected path. */
function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/** Routes that are part of the protected app shell. */
function isProtected(pathname: string): boolean {
  // Everything except public paths and static assets.
  return (
    !isPublic(pathname) &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/favicon") &&
    !pathname.startsWith("/abzum-logo") &&
    !pathname.match(/\.(ico|png|svg|jpg|jpeg|webp|woff2?)$/)
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Static assets and API routes other than protected ones pass through.
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const isDev = process.env.NODE_ENV !== "production";

  // ── Bootstrap gate ────────────────────────────────────────────────────── //
  // `BOOTSTRAP_COMPLETE` is set to "1" by the instrumentation hook after
  // confirming the DB flag. On first run it will be absent (falsy).
  const bootstrapComplete = process.env.BOOTSTRAP_COMPLETE === "1";

  if (!bootstrapComplete) {
    // Allow the bootstrap route itself; redirect everything else.
    if (pathname.startsWith("/bootstrap")) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/bootstrap";
    return NextResponse.redirect(url);
  }

  // ── Dev bypass ───────────────────────────────────────────────────────── //
  if (isDev) {
    return NextResponse.next();
  }

  // ── CF Access JWT verification ────────────────────────────────────────── //
  const authDomain = process.env.CF_AUTH_DOMAIN;
  if (!authDomain) {
    // No auth domain configured — allow through (operator must fix settings).
    const response = NextResponse.next();
    response.headers.set("x-auth-warning", "CF_AUTH_DOMAIN not configured");
    return response;
  }

  // Extract JWT from header or cookie.
  const jwt =
    request.headers.get("Cf-Access-Jwt-Assertion") ??
    extractCookieValue(request.headers.get("cookie") ?? "", "CF_Authorization");

  if (!jwt) {
    // No JWT — redirect to the CF Access login page.
    const loginUrl = new URL(`https://${authDomain}/cdn-cgi/access/login`);
    loginUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Dynamically import jose (Edge-compatible).
    const { createRemoteJWKSet, jwtVerify } = await import("jose");
    const jwks = createRemoteJWKSet(
      new URL(`https://${authDomain}/cdn-cgi/access/certs`)
    );
    const { payload } = await jwtVerify(jwt, jwks);
    const email = (payload as { email?: string }).email ?? "";

    const response = NextResponse.next();
    if (email) response.headers.set("x-cf-email", email);
    return response;
  } catch {
    // JWT invalid or expired — redirect to CF Access login.
    const loginUrl = new URL(`https://${authDomain}/cdn-cgi/access/login`);
    loginUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

/** Extract a single cookie value by name from a raw cookie header string. */
function extractCookieValue(header: string, name: string): string | null {
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return match.slice(name.length + 1) || null;
}

export const config = {
  /**
   * Run on all routes except:
   *  - Next.js internals (_next/static, _next/image, favicon)
   *  - The public bootstrap route (handled inside middleware)
   *
   * Note: `/((?!_next|favicon|abzum-logo).*)`  covers everything else.
   */
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|abzum-logo\\.svg).*)"],
};
