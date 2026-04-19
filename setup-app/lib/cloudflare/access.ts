import "server-only";
import { cfRequest, cfRequestSoft } from "./api";
import type { CfCredentials } from "./api";

/**
 * Cloudflare Access helpers.
 *
 * Manages self-hosted Access applications, policies, login branding, and
 * the account-wide "no-access" custom page.
 *
 * Ports:
 *   cf_create_or_update_access_app → cfCreateOrUpdateAccessApp
 *   cf_upsert_access_policy        → cfUpsertAccessPolicy
 *   cf_delete_access_app           → cfDeleteAccessApp
 *   cf_set_login_branding          → cfSetLoginBranding
 *   cf_upsert_no_access_page       → cfUpsertNoAccessPage
 */

interface AccessApp {
  id: string;
  name: string;
  domain: string;
  type: string;
  session_duration: string;
  auto_redirect_to_identity: boolean;
}

interface AccessPolicy {
  id: string;
  name: string;
  decision: string;
  precedence: number;
}

interface AccessOrg {
  auth_domain: string;
  login_design?: Record<string, unknown>;
}

interface CustomPage {
  id: string;
  name: string;
  type: string;
}

/* ── App management ───────────────────────────────────────────────────────── */

/**
 * Create or update a Cloudflare Access self-hosted application for a domain.
 *
 * - If an app already exists for the domain, updates it in-place.
 * - Returns the app ID (used to manage policies).
 *
 * Mirrors: cf_create_or_update_access_app()
 */
export async function cfCreateOrUpdateAccessApp(
  creds: CfCredentials,
  domain: string,
  instanceName: string
): Promise<string> {
  // List all Access apps to find any existing one for this domain.
  const listRes = await cfRequest<AccessApp[]>(
    creds,
    "GET",
    `/accounts/${creds.accountId}/access/apps`
  );

  const existing = listRes.result.find((app) => app.domain === domain);

  const body = {
    name: `${instanceName} — ${domain}`,
    domain,
    type: "self_hosted",
    session_duration: "24h",
    auto_redirect_to_identity: false,
  };

  if (existing) {
    const res = await cfRequest<AccessApp>(
      creds,
      "PUT",
      `/accounts/${creds.accountId}/access/apps/${existing.id}`,
      body
    );
    return res.result.id;
  } else {
    const res = await cfRequest<AccessApp>(
      creds,
      "POST",
      `/accounts/${creds.accountId}/access/apps`,
      body
    );
    return res.result.id;
  }
}

/**
 * Delete the Cloudflare Access app for a given domain.
 * No-ops if no app exists for that domain.
 *
 * Mirrors: cf_delete_access_app()
 */
export async function cfDeleteAccessApp(
  creds: CfCredentials,
  domain: string
): Promise<void> {
  const listRes = await cfRequest<AccessApp[]>(
    creds,
    "GET",
    `/accounts/${creds.accountId}/access/apps`
  ).catch(() => null);

  if (!listRes) return;

  const existing = listRes.result.find((app) => app.domain === domain);
  if (existing) {
    await cfRequest(
      creds,
      "DELETE",
      `/accounts/${creds.accountId}/access/apps/${existing.id}`
    );
  }
}

/* ── Policy management ────────────────────────────────────────────────────── */

/**
 * Upsert an "allow" policy on an Access app that permits a set of emails.
 *
 * - Deletes all existing policies on the app first (to avoid stale entries).
 * - Creates a single new policy with `decision: "allow"` and an email allow-list.
 *
 * Mirrors: cf_upsert_access_policy()
 */
export async function cfUpsertAccessPolicy(
  creds: CfCredentials,
  appId: string,
  allowedEmails: string[]
): Promise<void> {
  const policyPath = `/accounts/${creds.accountId}/access/apps/${appId}/policies`;

  // Delete all existing policies to avoid accumulating stale ones.
  const listRes = await cfRequest<AccessPolicy[]>(creds, "GET", policyPath).catch(
    () => null
  );
  if (listRes?.success) {
    for (const policy of listRes.result) {
      await cfRequest(creds, "DELETE", `${policyPath}/${policy.id}`).catch(() => null);
    }
  }

  // Build the include array from emails.
  const includeEntries = allowedEmails
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email: { email } }));

  if (includeEntries.length === 0) {
    // No emails specified — don't create a policy (effectively blocks everyone).
    return;
  }

  const body = {
    name: "Owners only",
    decision: "allow",
    precedence: 1,
    include: includeEntries,
  };

  await cfRequest(creds, "POST", policyPath, body);
}

/* ── Login branding ───────────────────────────────────────────────────────── */

export interface LoginBrandingOptions {
  headerText: string;
  footerText: string;
  backgroundColor?: string;
  textColor?: string;
  logoPath?: string;
}

/**
 * Set account-wide Cloudflare Access login page branding.
 *
 * - Fetches the existing org first to get the required auth_domain field.
 * - Soft-fails (returns false) if the token lacks Access:Organizations:Edit scope
 *   or if no auth_domain is configured yet.
 *
 * Returns true on success, false on soft failure.
 *
 * Mirrors: cf_set_login_branding()
 */
export async function cfSetLoginBranding(
  creds: CfCredentials,
  opts: LoginBrandingOptions
): Promise<boolean> {
  const orgRes = await cfRequestSoft<AccessOrg>(
    creds,
    "GET",
    `/accounts/${creds.accountId}/access/organizations`
  );

  if (!orgRes?.success || !orgRes.result.auth_domain) {
    // Token lacks scope or no org configured — soft fail.
    return false;
  }

  const body = {
    auth_domain: orgRes.result.auth_domain,
    login_design: {
      background_color: opts.backgroundColor ?? "#0f172a",
      text_color: opts.textColor ?? "#f8fafc",
      logo_path: opts.logoPath ?? "",
      header_text: opts.headerText,
      footer_text: opts.footerText,
    },
  };

  const res = await cfRequestSoft(
    creds,
    "PUT",
    `/accounts/${creds.accountId}/access/organizations`,
    body
  );

  return res?.success === true;
}

/**
 * Read the auth_domain from the CF Access organization.
 * Used to populate settings.cloudflare.authDomain after the first Access app
 * is created.
 *
 * Returns null if unavailable.
 */
export async function cfGetAuthDomain(
  creds: CfCredentials
): Promise<string | null> {
  const res = await cfRequestSoft<AccessOrg>(
    creds,
    "GET",
    `/accounts/${creds.accountId}/access/organizations`
  );
  return res?.result.auth_domain ?? null;
}

/* ── Custom pages ─────────────────────────────────────────────────────────── */

/**
 * Upsert the account-wide "forbidden" (no-access) custom page.
 *
 * The page is a self-contained HTML file with no external dependencies.
 * The contact email is embedded directly in the HTML.
 *
 * Soft-fails (returns false) if the token lacks Access:Custom Pages:Edit scope
 * or if the account is on a free Zero Trust plan.
 *
 * Mirrors: cf_upsert_no_access_page()
 */
export async function cfUpsertNoAccessPage(
  creds: CfCredentials,
  contactEmail: string
): Promise<boolean> {
  const listRes = await cfRequestSoft<CustomPage[]>(
    creds,
    "GET",
    `/accounts/${creds.accountId}/access/custom_pages`
  );

  if (!listRes?.success) return false;

  const existing = listRes.result.find((p) => p.type === "forbidden");

  const customHtml = buildNoAccessHtml(contactEmail);

  const body = {
    name: "Access Denied",
    type: "forbidden",
    custom_html: customHtml,
  };

  const pagePath = `/accounts/${creds.accountId}/access/custom_pages`;

  if (existing) {
    const res = await cfRequestSoft(creds, "PUT", `${pagePath}/${existing.id}`, body);
    return res?.success === true;
  } else {
    const res = await cfRequestSoft(creds, "POST", pagePath, body);
    return res?.success === true;
  }
}

/**
 * Build the self-contained "Access Denied" HTML page.
 * Inline SVG logo, no external assets.
 */
function buildNoAccessHtml(contactEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Access Denied</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f172a;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:48px 40px;max-width:440px;width:100%;text-align:center}
.logo{margin-bottom:24px}
h1{font-size:20px;font-weight:600;margin-bottom:12px}
p{color:#94a3b8;font-size:14px;line-height:1.6}
a{color:#60a5fa}
</style>
</head>
<body>
<div class="card">
  <div class="logo">
    <svg width="64" height="64" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="24" fill="#0f172a"/>
      <path d="M60 18L102 96H18L60 18Z" fill="none" stroke="#3b82f6" stroke-width="5" stroke-linejoin="round"/>
      <path d="M60 18L102 96H18L60 18Z" fill="#3b82f6" fill-opacity="0.08"/>
      <line x1="36" y1="72" x2="84" y2="72" stroke="#3b82f6" stroke-width="5" stroke-linecap="round"/>
      <circle cx="60" cy="54" r="4" fill="#60a5fa"/>
    </svg>
  </div>
  <h1>Access Denied</h1>
  <p>Your account is not authorised to access this service.<br><br>
    Contact <a href="mailto:${contactEmail}">${contactEmail}</a> to request access.
  </p>
</div>
</body>
</html>`;
}
