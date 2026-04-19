"use server";

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
};

/**
 * Start an install job for a module.
 *
 * Validates the form data against the module's Zod schema, then calls
 * `startInstallJob` which creates a tracked in-process job and returns
 * its ID immediately so the caller can redirect to the progress page.
 *
 * All DB/module imports are dynamic (inside the function body) to avoid
 * better-sqlite3 native binding failure on Windows dev.
 */
export async function actionStartInstall(
  formData: FormData
): Promise<ActionResult> {
  const moduleId = String(formData.get("moduleId") ?? "").trim();

  if (!moduleId) {
    return { success: false, error: "moduleId is required" };
  }

  try {
    const { MODULES } = await import("@/modules/index");
    const mod = MODULES[moduleId];

    if (!mod) {
      return { success: false, error: `Unknown module: ${moduleId}` };
    }

    // Build a plain object from form data for Zod parsing.
    const raw: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (key !== "moduleId") raw[key] = value;
    });

    // Parse + validate with the module's schema.
    const parseResult = mod.configSchema.safeParse(raw);
    if (!parseResult.success) {
      const issues = parseResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return { success: false, error: `Validation failed: ${issues}` };
    }

    const config = parseResult.data;

    // Check no existing installation with the same instanceId.
    const { db } = await import("@/lib/db/client");
    const { installations } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const existing = await db
      .select({ id: installations.id })
      .from(installations)
      .where(eq(installations.id, config.instanceId))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: `An installation named "${config.instanceId}" already exists. Choose a different instance ID or uninstall the existing one first.`,
      };
    }

    // Start the job (non-blocking — returns job ID immediately).
    const { startInstallJob } = await import("@/lib/install-engine");
    const jobId = startInstallJob({ moduleId, config });

    return { success: true, data: { jobId, instanceId: config.instanceId } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to start install: ${msg}` };
  }
}
