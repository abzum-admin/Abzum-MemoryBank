/**
 * Liveness probe. Used by the Docker HEALTHCHECK and by the install-setup-app.sh
 * bootstrap script to verify the container came up before printing the
 * bootstrap token URL.
 *
 * NOT a readiness probe — does not check DB/Docker socket. That's intentional:
 * we want this to stay green during boot-orchestrator secret refresh so the
 * container isn't killed mid-sweep.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ status: "ok", service: "abzum-setup-app" });
}
