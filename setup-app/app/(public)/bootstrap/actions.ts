"use server";
import { redirect } from "next/navigation";
import { SETUP_SECRETS } from "@/lib/secrets/setup-secrets";

/**
 * Bootstrap wizard Server Actions.
 *
 * All DB and crypto imports are dynamic (inside function bodies) so that:
 *  - The module loads cleanly on Windows dev where better-sqlite3 has no
 *    native binding (installed with --ignore-scripts).
 *  - Import errors are caught per-function and surfaced as ActionResult errors
 *    rather than crashing the page.
 */

/* ── Shared helpers ──────────────────────────────────────────────────────── */

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
};

async function getDb() {
  const { db } = await import("@/lib/db/client");
  const { setupConfig, dopplerServiceTokens, cloudflareConfig } = await import(
    "@/lib/db/schema"
  );
  const { eq } = await import("drizzle-orm");
  return { db, setupConfig, dopplerServiceTokens, cloudflareConfig, eq };
}

async function getConfigValue(key: string): Promise<string | null> {
  try {
    const { db, setupConfig, eq } = await getDb();
    const rows = await db
      .select({ value: setupConfig.value })
      .from(setupConfig)
      .where(eq(setupConfig.key, key))
      .limit(1);
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

async function setConfigValue(key: string, value: string): Promise<void> {
  const { db, setupConfig } = await getDb();
  await db
    .insert(setupConfig)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: setupConfig.key,
      set: { value, updatedAt: new Date() },
    });
}

/* ── Step 1: Verify bootstrap token ─────────────────────────────────────── */

export async function actionVerifyToken(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const token = String(formData.get("token") ?? "").trim();

  if (!token.startsWith("abzs_")) {
    return { success: false, error: "Token must start with abzs_" };
  }

  try {
    const { hashBootstrapToken } = await import("@/lib/crypto");
    const storedHash = await getConfigValue("bootstrap_token_hash");

    if (!storedHash) {
      const isDev = process.env.NODE_ENV !== "production";
      if (!isDev) {
        return {
          success: false,
          error:
            "Bootstrap token not initialised. Run the install script first: install-setup-app.sh",
        };
      }
    } else {
      const inputHash = await hashBootstrapToken(token);
      if (inputHash !== storedHash) {
        return { success: false, error: "Invalid bootstrap token." };
      }
      if (process.env.NODE_ENV === "production") {
        await setConfigValue("bootstrap_token_hash", "");
      }
    }

    await setConfigValue("bootstrap_token_verified", "1");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Token verification failed: ${msg}` };
  }
}

/* ── Step 2: Validate + save Doppler service token ───────────────────────── */

export async function actionSaveDopplerToken(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const token = String(formData.get("token") ?? "").trim();
  const project = String(formData.get("project") ?? "").trim();
  const config = String(formData.get("config") ?? "production").trim();

  if (!token.startsWith("dp.st.")) {
    return { success: false, error: "Doppler service tokens start with dp.st." };
  }
  if (!project) {
    return { success: false, error: "Doppler project is required." };
  }

  try {
    const { dopplerValidateToken } = await import("@/lib/doppler");
    const { encryptSecret } = await import("@/lib/crypto");
    const { saveSettings } = await import("@/lib/config/settings");
    const { db, dopplerServiceTokens } = await getDb();

    const validation = await dopplerValidateToken(token, project, config);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error ?? "Token validation failed — check project and config.",
      };
    }

    const tokenEnc = await encryptSecret(token);
    await db
      .insert(dopplerServiceTokens)
      .values({
        scope: "setup",
        tokenEnc,
        project: validation.project ?? project,
        config: validation.config ?? config,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: dopplerServiceTokens.scope,
        set: {
          tokenEnc,
          project: validation.project ?? project,
          config: validation.config ?? config,
          updatedAt: new Date(),
        },
      });

    await saveSettings({
      doppler: {
        setupProject: validation.project ?? project,
        setupConfig: validation.config ?? config,
      },
    });

    await setConfigValue("bootstrap_doppler_saved", "1");

    return {
      success: true,
      data: {
        project: validation.project ?? project,
        config: validation.config ?? config,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to save Doppler token: ${msg}` };
  }
}

/* ── Step 3: Validate secrets ────────────────────────────────────────────── */

export async function actionValidateSecrets(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: ActionResult | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<ActionResult> {
  try {
    const { dopplerCheckSecrets } = await import("@/lib/doppler");
    const { decryptSecret } = await import("@/lib/crypto");
    const { db, dopplerServiceTokens, eq } = await getDb();

    const rows = await db
      .select()
      .from(dopplerServiceTokens)
      .where(eq(dopplerServiceTokens.scope, "setup"))
      .limit(1);
    const tokenRow = rows[0];

    if (!tokenRow) {
      return { success: false, error: "Doppler token not found — complete Step 2 first." };
    }

    const token = await decryptSecret(tokenRow.tokenEnc);
    const requiredNames = SETUP_SECRETS.filter((s) => s.required).map((s) => s.name);
    const allNames = SETUP_SECRETS.map((s) => s.name);

    const present = await dopplerCheckSecrets(token, tokenRow.project, tokenRow.config, allNames);

    const missingRequired = requiredNames.filter((n) => !present[n]);
    if (missingRequired.length > 0) {
      return {
        success: false,
        error: `Missing required secrets: ${missingRequired.join(", ")}. Add them to Doppler and try again.`,
        data: { present },
      };
    }

    await setConfigValue("bootstrap_secrets_ok", "1");
    return { success: true, data: { present } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Secret validation failed: ${msg}` };
  }
}

/* ── Step 4: Provision app domain ────────────────────────────────────────── */

export async function actionProvisionDomain(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const domain = String(formData.get("domain") ?? "").trim().toLowerCase();

  if (!domain || !domain.includes(".")) {
    return {
      success: false,
      error: "Enter a valid fully-qualified domain, e.g. setup.yourdomain.com",
    };
  }

  try {
    const { dopplerGetSecretValues } = await import("@/lib/doppler");
    const { decryptSecret } = await import("@/lib/crypto");
    const { getSettings, saveSettings } = await import("@/lib/config/settings");
    const {
      cfEnsureTunnelCname,
      cfUpsertTunnelIngress,
      cfCreateOrUpdateAccessApp,
      cfUpsertAccessPolicy,
      cfSetLoginBranding,
      cfGetAuthDomain,
      cfUpsertNoAccessPage,
    } = await import("@/lib/cloudflare");
    const { db, dopplerServiceTokens, cloudflareConfig, eq } = await getDb();

    const rows = await db
      .select()
      .from(dopplerServiceTokens)
      .where(eq(dopplerServiceTokens.scope, "setup"))
      .limit(1);
    const tokenRow = rows[0];

    if (!tokenRow) {
      return { success: false, error: "Doppler token not configured — complete Step 2 first." };
    }

    const dopplerToken = await decryptSecret(tokenRow.tokenEnc);
    const cfSecrets = await dopplerGetSecretValues(
      dopplerToken,
      tokenRow.project,
      tokenRow.config,
      ["CF_API_TOKEN", "CF_ACCOUNT_ID", "CF_TUNNEL_ID"]
    );

    const { CF_API_TOKEN, CF_ACCOUNT_ID, CF_TUNNEL_ID } = cfSecrets;
    if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_TUNNEL_ID) {
      return {
        success: false,
        error:
          "CF_API_TOKEN, CF_ACCOUNT_ID, and CF_TUNNEL_ID must be present in Doppler to provision the domain.",
      };
    }

    const creds = { apiToken: CF_API_TOKEN, accountId: CF_ACCOUNT_ID, tunnelId: CF_TUNNEL_ID };

    const settings = await getSettings();
    const adminEmails = settings.app.adminEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    await cfEnsureTunnelCname(creds, domain);
    await cfUpsertTunnelIngress(creds, domain, "abzum-setup-app", 3000);

    const appId = await cfCreateOrUpdateAccessApp(creds, domain, "Abzum Setup Console");
    if (adminEmails.length > 0) {
      await cfUpsertAccessPolicy(creds, appId, adminEmails);
    }

    await cfSetLoginBranding(creds, {
      headerText: settings.app.name || "Abzum Setup Console",
      footerText: "Secured by Cloudflare Access",
    });

    const authDomain = await cfGetAuthDomain(creds);

    await db
      .insert(cloudflareConfig)
      .values({
        id: 1,
        accountId: CF_ACCOUNT_ID,
        tunnelId: CF_TUNNEL_ID,
        authDomain: authDomain ?? undefined,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: cloudflareConfig.id,
        set: {
          accountId: CF_ACCOUNT_ID,
          tunnelId: CF_TUNNEL_ID,
          authDomain: authDomain ?? undefined,
          updatedAt: new Date(),
        },
      });

    if (adminEmails.length > 0) {
      await cfUpsertNoAccessPage(creds, adminEmails[0]!);
    }

    await saveSettings({
      app: { domain: `https://${domain}` },
      cloudflare: { authDomain: authDomain ?? "" },
    });

    await setConfigValue("bootstrap_domain", domain);
    await setConfigValue("bootstrap_domain_set", "1");

    return { success: true, data: { domain, authDomain } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Domain provisioning failed: ${msg}` };
  }
}

/* ── Step 5: Mark bootstrap complete ─────────────────────────────────────── */

export async function actionCompleteBootstrap(): Promise<never> {
  await setConfigValue("bootstrap_complete", "1");
  redirect("/dashboard");
}

/* ── Read current bootstrap state (used by page.tsx) ─────────────────────── */

export interface BootstrapState {
  tokenVerified: boolean;
  dopplerSaved: boolean;
  secretsOk: boolean;
  domainSet: boolean;
  complete: boolean;
  currentStep: 1 | 2 | 3 | 4 | 5;
  savedDomain?: string;
  savedProject?: string;
  savedConfig?: string;
}

export async function getBootstrapState(): Promise<BootstrapState> {
  const devDefault: BootstrapState = {
    tokenVerified: false,
    dopplerSaved: false,
    secretsOk: false,
    domainSet: false,
    complete: false,
    currentStep: process.env.NODE_ENV !== "production" ? 2 : 1,
  };

  try {
    const { db, setupConfig, dopplerServiceTokens, eq } = await getDb();

    const rows = await db.select().from(setupConfig);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    const tokenVerified = map["bootstrap_token_verified"] === "1";
    const dopplerSaved = map["bootstrap_doppler_saved"] === "1";
    const secretsOk = map["bootstrap_secrets_ok"] === "1";
    const domainSet = map["bootstrap_domain_set"] === "1";
    const complete = map["bootstrap_complete"] === "1";

    let currentStep: 1 | 2 | 3 | 4 | 5 = 1;
    if (tokenVerified && !dopplerSaved) currentStep = 2;
    else if (dopplerSaved && !secretsOk) currentStep = 3;
    else if (secretsOk && !domainSet) currentStep = 4;
    else if (domainSet) currentStep = 5;

    // In dev without an install script token hash, skip to step 2.
    if (process.env.NODE_ENV !== "production" && !map["bootstrap_token_hash"]) {
      if (!dopplerSaved) currentStep = 2;
    }

    const dopplerRows = await db
      .select()
      .from(dopplerServiceTokens)
      .where(eq(dopplerServiceTokens.scope, "setup"))
      .limit(1);
    const dopplerRow = dopplerRows[0];

    return {
      tokenVerified,
      dopplerSaved,
      secretsOk,
      domainSet,
      complete,
      currentStep,
      savedDomain: map["bootstrap_domain"],
      savedProject: dopplerRow?.project,
      savedConfig: dopplerRow?.config,
    };
  } catch {
    return devDefault;
  }
}
