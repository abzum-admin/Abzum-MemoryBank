import "server-only";
import { cfRequest } from "./api";
import type { CfCredentials } from "./api";

/**
 * Cloudflare DNS helpers.
 *
 * Ports the DNS functions from scripts/lib/cloudflare.sh:
 *   cf_zone_id_for_host   → cfZoneIdForHost
 *   cf_ensure_tunnel_cname → cfEnsureTunnelCname
 */

interface ZoneResult {
  id: string;
  name: string;
}

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
}

/**
 * Find the Cloudflare zone ID that covers a given hostname.
 *
 * Walks up the label hierarchy until a zone is found. For example:
 *   hermes-felix.yourdomain.com → tries yourdomain.com → finds zone
 *
 * Mirrors: cf_zone_id_for_host()
 */
export async function cfZoneIdForHost(
  creds: CfCredentials,
  hostname: string
): Promise<string> {
  // Strip down from the full hostname to find the root zone.
  const parts = hostname.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join(".");
    const res = await cfRequest<ZoneResult[]>(
      creds,
      "GET",
      `/zones?name=${encodeURIComponent(candidate)}`
    ).catch(() => null);

    if (res?.success && res.result.length > 0 && res.result[0]) {
      return res.result[0].id;
    }
  }

  throw new Error(`No Cloudflare zone found for hostname "${hostname}"`);
}

/**
 * Upsert a proxied CNAME record pointing at the Cloudflare tunnel.
 *
 * Target: <tunnelId>.cfargotunnel.com
 * - Creates the record if it doesn't exist.
 * - Updates the record only if the content has changed.
 * - No-ops if the record already matches (idempotent).
 *
 * Mirrors: cf_ensure_tunnel_cname()
 */
export async function cfEnsureTunnelCname(
  creds: CfCredentials,
  hostname: string
): Promise<void> {
  const zoneId = await cfZoneIdForHost(creds, hostname);
  const target = `${creds.tunnelId}.cfargotunnel.com`;

  // Check for an existing CNAME for this hostname.
  const listRes = await cfRequest<DnsRecord[]>(
    creds,
    "GET",
    `/zones/${zoneId}/dns_records?name=${encodeURIComponent(hostname)}&type=CNAME`
  );

  const existing = listRes.result[0];

  const body = {
    type: "CNAME",
    name: hostname,
    content: target,
    proxied: true,
    ttl: 1, // 1 = automatic TTL when proxied
  };

  if (existing) {
    if (existing.content === target) {
      // Already correct — nothing to do.
      return;
    }
    // Content differs — update in-place.
    await cfRequest(creds, "PUT", `/zones/${zoneId}/dns_records/${existing.id}`, body);
  } else {
    // No existing record — create.
    await cfRequest(creds, "POST", `/zones/${zoneId}/dns_records`, body);
  }
}

/**
 * Remove a CNAME record for the given hostname.
 * No-ops if no matching record exists.
 */
export async function cfRemoveDnsRecord(
  creds: CfCredentials,
  hostname: string
): Promise<void> {
  const zoneId = await cfZoneIdForHost(creds, hostname).catch(() => null);
  if (!zoneId) return;

  const listRes = await cfRequest<DnsRecord[]>(
    creds,
    "GET",
    `/zones/${zoneId}/dns_records?name=${encodeURIComponent(hostname)}&type=CNAME`
  ).catch(() => null);

  const existing = listRes?.result[0];
  if (existing) {
    await cfRequest(creds, "DELETE", `/zones/${zoneId}/dns_records/${existing.id}`);
  }
}
