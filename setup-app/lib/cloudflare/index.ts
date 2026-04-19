/**
 * Cloudflare API wrapper — TypeScript port of scripts/lib/cloudflare.sh.
 *
 * Re-exports everything from the sub-modules for convenient single-import usage:
 *
 *   import { cfUpsertTunnelIngress, cfCreateOrUpdateAccessApp, ... }
 *     from "@/lib/cloudflare";
 *
 * All functions require a CfCredentials object (apiToken, accountId, tunnelId).
 * Credentials are sourced by the caller from Doppler + the DB — this layer
 * has no opinion on where they come from.
 */

export * from "./api";
export * from "./dns";
export * from "./tunnel";
export * from "./access";
