import { z } from "zod";
import { HERMES_SECRETS } from "@/lib/secrets/module-secrets";
import type { ModuleDef, BaseInstallConfig, HealthStatus } from "@/lib/modules/types";
import type { Installation } from "@/lib/db/schema";

/* ── Config schema ────────────────────────────────────────────────────────── */

/**
 * Install config for a Hermes agent instance.
 *
 * The install wizard renders a form from this schema (react-hook-form + zod
 * resolver). The `instanceId` field drives all container names, volume names,
 * and the compose directory path on disk.
 */
export const hermesConfigSchema = z.object({
  /**
   * Instance slug — must be lowercase letters, digits, and hyphens.
   * Used as the container name and compose directory:
   *   containers: <instanceId>  and  <instanceId>-ui
   *   directory:  /docker/<instanceId>/docker-compose.yml
   *   volume:     <instanceId>-data
   */
  instanceId: z
    .string()
    .min(1, "Instance ID is required")
    .max(48, "Instance ID must be 48 characters or fewer")
    .regex(
      /^[a-z][a-z0-9-]*$/,
      "Must start with a letter and contain only lowercase letters, numbers, and hyphens"
    ),

  /**
   * Public FQDN for this install (no protocol), e.g. "hermes-felix.yourdomain.com".
   * The install wizard pre-fills this as `<instanceId><defaultDomainSuffix>`
   * where `defaultDomainSuffix` comes from Settings → Cloudflare.
   */
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/,
      "Must be a valid hostname, e.g. hermes-felix.yourdomain.com"
    ),

  /** Doppler project holding this installation's secrets. */
  dopplerProject: z.string().min(1, "Doppler project is required"),

  /** Doppler config (environment) within that project. */
  dopplerConfig: z.string().min(1, "Doppler config is required").default("dev"),

  /**
   * Comma-separated emails for the CF Access allow-list.
   * Defaults to the admin emails from global settings if left blank.
   */
  accessEmails: z.string().default(""),

  /**
   * Port the Hermes dashboard container listens on.
   * The CF tunnel routes traffic to `<instanceId>-ui:<upstreamPort>`.
   * Defaults to 9119 (the Hermes official default).
   */
  upstreamPort: z.coerce.number().int().min(1).max(65535).default(9119),
});

export type HermesConfig = z.infer<typeof hermesConfigSchema>;

/* ── Compose YAML renderer ────────────────────────────────────────────────── */

/**
 * Render the docker-compose.yml for a Hermes installation.
 *
 * Ports the hermes.compose.tmpl bash template into TypeScript, replacing:
 *   @@INSTANCE@@        → config.instanceId
 *   @@INSTANCE_UI@@     → config.instanceId + "-ui"
 *   @@DOPPLER_ENV_LINES@@ → one env var name per required + optional secret
 *
 * Secret values are NOT embedded — only the variable names appear in the YAML.
 * `doppler run --` injects the actual values at runtime (and at every
 * container start, which refreshes secrets without rebuilding the image).
 */
function renderComposeYaml(config: HermesConfig): string {
  const { instanceId, upstreamPort } = config;
  const uiService = `${instanceId}-ui`;

  // Build the environment block lines for the gateway container.
  // Only the variable *names* are listed — no values, no equals signs.
  // Doppler's compose integration fills them from the scoped config.
  const dopplerEnvLines = HERMES_SECRETS.map(
    (s) => `      - ${s.name}`
  ).join("\n");

  return `# Hermes Personal Assistant — rendered by Abzum Setup App
# Instance: ${instanceId}
# DO NOT EDIT MANUALLY — regenerated on each install / update.
#
# Start with: doppler run -- docker compose up -d
# Secrets injected at runtime by the Doppler CLI; no .env file needed.

services:
  ${instanceId}:
    image: nousresearch/hermes-agent:latest
    container_name: ${instanceId}
    restart: unless-stopped
    command: gateway run
    shm_size: '1g'
    environment:
      - PATH=/opt/hermes/.venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
${dopplerEnvLines}
    volumes:
      - ${instanceId}-data:/opt/data
    networks:
      - proxy

  ${uiService}:
    image: nousresearch/hermes-agent:latest
    container_name: ${uiService}
    restart: unless-stopped
    command: dashboard --host 0.0.0.0 --no-open --port ${upstreamPort} --insecure
    environment:
      - PATH=/opt/hermes/.venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
      - GATEWAY_HEALTH_URL=http://${instanceId}:8642
    volumes:
      - ${instanceId}-data:/opt/data
    networks:
      - proxy
    depends_on:
      - ${instanceId}

volumes:
  ${instanceId}-data:

networks:
  proxy:
    external: true
`;
}

/* ── Health check ─────────────────────────────────────────────────────────── */

async function healthCheck(installation: Installation): Promise<HealthStatus> {
  const { domain } = installation;
  if (!domain) return "unknown";

  try {
    // The Hermes gateway exposes a /health endpoint on the internal port 8642,
    // but from outside we hit the public domain (via CF tunnel).
    // A 200 or 401 (CF Access gate) both mean the service is reachable.
    const res = await fetch(`https://${domain}/health`, {
      signal: AbortSignal.timeout(8_000),
      headers: { "User-Agent": "abzum-setup-healthcheck/1" },
    });
    if (res.ok) return "healthy";
    if (res.status === 401 || res.status === 403) {
      // CF Access is gate-keeping — service is up behind the auth wall.
      return "healthy";
    }
    return "degraded";
  } catch {
    return "unhealthy";
  }
}

/* ── Module definition ────────────────────────────────────────────────────── */

export const hermes: ModuleDef<HermesConfig> = {
  id: "hermes",
  name: "Hermes",
  description:
    "NousResearch Hermes AI agent — gateway + dashboard, protected by Cloudflare Access.",
  version: "1.0.0",

  configSchema: hermesConfigSchema,
  renderComposeYaml,

  doppler: {
    required: true,
    /** Template for the Doppler project name. {instance_id} → e.g. "hermes-felix". */
    suggestedProjectTemplate: "{instance_id}",
    suggestedConfig: "dev",
  },

  secrets: HERMES_SECRETS,

  cloudflare: {
    /**
     * Tunnel ingress route: public domain → dashboard container on upstreamPort.
     * The setup app calls cf_upsert_tunnel_ingress with this data.
     */
    tunnelRoute: (config) => ({
      hostname: config.domain,
      service: `${config.instanceId}-ui`,
      port: config.upstreamPort,
    }),

    /**
     * CF Access application protecting the dashboard.
     * Uses the installation's own allowedEmails (falls back to global admin
     * emails in the install engine when accessEmails is empty).
     */
    accessApp: (config) => ({
      domain: config.domain,
      allowedEmails: config.accessEmails
        ? config.accessEmails.split(",").map((e) => e.trim()).filter(Boolean)
        : [],
    }),

    /**
     * CNAME record: <instanceId>.<zone> → <tunnelId>.cfargotunnel.com
     * The tunnel ID is resolved at install time from the CF API / Doppler.
     * The install engine fills the `content` field before calling cf_ensure_tunnel_cname.
     */
    dnsRecord: (config) => ({
      name: config.domain.split(".")[0]!,
      content: "", // filled by install engine from CF_TUNNEL_ID
      proxied: true,
    }),
  },

  publicUrl: (config) => `https://${config.domain}`,

  healthCheck,

  /**
   * Pre-install checks run before the deployment summary is shown.
   * Currently validates that the domain string looks reasonable.
   * More checks (Doppler secret presence, port availability) are added
   * when the Doppler wrapper (Step 6) lands.
   */
  preInstallChecks: async (config) => [
    {
      label: "Instance ID format",
      status: /^[a-z][a-z0-9-]*$/.test(config.instanceId) ? "ok" : "error",
      message: /^[a-z][a-z0-9-]*$/.test(config.instanceId)
        ? undefined
        : "Instance ID must start with a letter and contain only lowercase letters, numbers, and hyphens.",
    },
    {
      label: "Domain format",
      status: config.domain.includes(".") ? "ok" : "error",
      message: config.domain.includes(".")
        ? undefined
        : "Domain must be a fully-qualified hostname (e.g. hermes-felix.yourdomain.com).",
    },
  ],
};
