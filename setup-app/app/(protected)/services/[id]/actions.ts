"use server";

import { redirect } from "next/navigation";

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
};

/**
 * Start an uninstall job for an installed module instance.
 *
 * Returns the job ID so the caller can redirect to the uninstall progress page.
 */
export async function actionStartUninstall(
  instanceId: string,
  removeVolume = false
): Promise<ActionResult> {
  try {
    const { startUninstallJob } = await import("@/lib/uninstall-engine");
    const jobId = startUninstallJob({ instanceId, removeVolume });
    return { success: true, data: { jobId, instanceId } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to start uninstall: ${msg}` };
  }
}

/**
 * Restart the containers for an installation by running compose up again.
 * Does NOT re-provision Cloudflare resources.
 */
export async function actionRestartService(
  instanceId: string
): Promise<ActionResult> {
  try {
    const { getDb } = await import("@/lib/db/client");
    const db = getDb();
    const { installations } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(installations)
      .where(eq(installations.id, instanceId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return { success: false, error: `Installation "${instanceId}" not found` };
    }

    const { composeUp } = await import("@/lib/docker/compose");
    await composeUp({
      instanceId,
      dopplerProject: row.dopplerProject,
      dopplerConfig: row.dopplerConfig,
    });

    await db
      .update(installations)
      .set({ status: "running", updatedAt: new Date() })
      .where(eq(installations.id, instanceId));

    redirect(`/services/${instanceId}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Restart failed: ${msg}` };
  }
}
