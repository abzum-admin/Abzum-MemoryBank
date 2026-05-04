import "server-only";
import { cfRequest } from "./api";
import type { CfCredentials } from "./api";

/**
 * Cloudflare Tunnel ingress helpers.
 *
 * Manages the remote-managed tunnel's ingress configuration — the routing
 * table that maps public hostnames to upstream services.
 *
 * Ports:
 *   cf_upsert_tunnel_ingress   → cfUpsertTunnelIngress
 *   cf_remove_tunnel_ingress   → cfRemoveTunnelIngress
 */

interface TunnelIngressRule {
  hostname?: string;
  service: string;
  path?: string;
}

interface TunnelConfig {
  ingress: TunnelIngressRule[];
}

interface TunnelConfigResult {
  config: TunnelConfig;
}

function tunnelConfigPath(creds: CfCredentials): string {
  return `/accounts/${creds.accountId}/cfd_tunnel/${creds.tunnelId}/configurations`;
}

/**
 * Fetch the current ingress configuration of the tunnel.
 * Returns a config with a catch-all as the only rule if the tunnel has no config.
 */
async function getTunnelConfig(creds: CfCredentials): Promise<TunnelConfig> {
  const res = await cfRequest<TunnelConfigResult>(
    creds,
    "GET",
    tunnelConfigPath(creds)
  );

  return res.result.config ?? { ingress: [{ service: "http_status:404" }] };
}

/**
 * Upsert a hostname → upstream-service ingress rule in the tunnel config.
 *
 * The rule is inserted just before the catch-all (http_status:404). Any
 * existing rule for the same hostname is replaced (idempotent).
 *
 * serviceUrl format: "http://<containerName>:<port>"
 *
 * Mirrors: cf_upsert_tunnel_ingress()
 */
export async function cfUpsertTunnelIngress(
  creds: CfCredentials,
  hostname: string,
  serviceContainerName: string,
  port: number
): Promise<void> {
  const serviceUrl = `http://${serviceContainerName}:${port}`;
  const current = await getTunnelConfig(creds);

  // Rebuild the ingress list:
  //   1. Keep all existing rules except any that match this hostname
  //      and except the catch-all.
  //   2. Append the new rule for this hostname.
  //   3. Append the catch-all.
  const kept = current.ingress.filter(
    (r) => r.hostname !== hostname && r.service !== "http_status:404"
  );

  const newConfig: TunnelConfig = {
    ingress: [
      ...kept,
      { hostname, service: serviceUrl },
      { service: "http_status:404" },
    ],
  };

  await cfRequest(creds, "PUT", tunnelConfigPath(creds), { config: newConfig });
}

/**
 * Remove the ingress rule for the given hostname from the tunnel config.
 * No-ops if no matching rule exists.
 *
 * Mirrors: cf_remove_tunnel_ingress()
 */
export async function cfRemoveTunnelIngress(
  creds: CfCredentials,
  hostname: string
): Promise<void> {
  const current = await getTunnelConfig(creds);

  const filtered = current.ingress.filter((r) => r.hostname !== hostname);

  // If nothing changed, skip the PUT.
  if (filtered.length === current.ingress.length) return;

  await cfRequest(creds, "PUT", tunnelConfigPath(creds), {
    config: { ...current, ingress: filtered },
  });
}

/**
 * List all current ingress rules (excluding the catch-all) for diagnostic
 * display on the dashboard.
 */
export async function cfListTunnelIngress(
  creds: CfCredentials
): Promise<Array<{ hostname: string; service: string }>> {
  const config = await getTunnelConfig(creds);
  return config.ingress
    .filter((r): r is { hostname: string; service: string } =>
      Boolean(r.hostname && r.service && r.service !== "http_status:404")
    );
}
