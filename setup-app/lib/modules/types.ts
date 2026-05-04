import type { z } from "zod";
import type { SecretDef } from "@/lib/secrets/types";
import type { Installation } from "@/lib/db/schema";

/**
 * Health status of a running installation.
 * Mirrors the `last_health` enum in the installations table.
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

/**
 * Result of a single pre-install check (e.g. domain reachable, Doppler token
 * has the required secrets, Docker socket accessible).
 */
export interface CheckResult {
  /** Short label displayed in the UI (e.g. "Domain reachable"). */
  label: string;
  status: "ok" | "warn" | "error";
  /** Optional detail message shown below the label. */
  message?: string;
}

/**
 * Cloudflare provisioning config returned by a module for a given install.
 */
export interface CfTunnelRoute {
  /** Public hostname, e.g. "hermes-felix.yourdomain.com". */
  hostname: string;
  /** Target service name inside the compose project, e.g. "hermes-felix-ui". */
  service: string;
  /** Port the service listens on (used to build the tunnel `service` URL). */
  port: number;
}

export interface CfAccessApp {
  /** Same as the tunnel route hostname. */
  domain: string;
  /** Emails added to the Access policy allow-list. */
  allowedEmails: string[];
}

export interface CfDnsRecord {
  /** DNS record name (just the subdomain part, e.g. "hermes-felix"). */
  name: string;
  /** Record content — for CNAME this is the tunnel's cfargotunnel.com address. */
  content: string;
  proxied: boolean;
}

/**
 * Doppler settings declared by a module for a given install.
 */
export interface ModuleDopplerConfig {
  /** Whether a Doppler project/config is required to install this module. */
  required: boolean;
  /**
   * Suggested Doppler project name template.
   * Supports the `{instance_id}` token — e.g. "{instance_id}" → "hermes-felix".
   * Leave undefined to inherit from global settings.
   */
  suggestedProjectTemplate?: string;
  /** Suggested Doppler config (environment). Leave undefined to inherit from settings. */
  suggestedConfig?: string;
}

/* ── Per-install config schema ────────────────────────────────────────────── */

/**
 * Every module's install form produces a `TConfig` object that satisfies its
 * `configSchema`. The base fields below are always present; each module adds
 * its own domain-specific fields on top.
 */
export interface BaseInstallConfig {
  /** Instance slug, e.g. "hermes-felix". Used as container name and compose dir. */
  instanceId: string;
  /** Public FQDN (without protocol), e.g. "hermes-felix.yourdomain.com". */
  domain: string;
  /** Doppler project holding this installation's secrets. */
  dopplerProject: string;
  /** Doppler config (environment) within that project. */
  dopplerConfig: string;
  /**
   * Comma-separated emails added to the CF Access allow-list for this install.
   * Leave empty to inherit from the global admin emails setting.
   */
  accessEmails: string;
}

/* ── ModuleDef ────────────────────────────────────────────────────────────── */

/**
 * The interface every module must implement.
 *
 * TConfig is the validated config object produced by the install form.
 * It must extend BaseInstallConfig so the install engine can work with
 * any module without knowing its specifics.
 */
export interface ModuleDef<TConfig extends BaseInstallConfig = BaseInstallConfig> {
  /** Unique short identifier, e.g. "hermes". Used as the URL segment and registry key. */
  id: string;
  /** Human-readable name shown in the UI. */
  name: string;
  /** One-sentence description shown in the module catalogue. */
  description: string;
  /** Semver string, e.g. "1.0.0". Stored in the installations table. */
  version: string;
  /** SVG icon path or URL displayed next to the module name. Optional. */
  iconUrl?: string;

  /**
   * Zod schema for the install form. The install wizard uses this to:
   *   1. Render form fields (react-hook-form + zod resolver).
   *   2. Validate on submit server-side before running any steps.
   *
   * Using `ZodType<TConfig, ZodTypeDef, unknown>` so schemas with `.default()`
   * fields (whose input type is partial) can satisfy this constraint.
   */
  configSchema: z.ZodType<TConfig, z.ZodTypeDef, unknown>;

  /**
   * Render the docker-compose.yml content for this installation.
   * Called after config is validated; the result is written to
   * `/docker/<instanceId>/docker-compose.yml`.
   *
   * Must NOT include secrets — those are injected by `doppler run --`.
   * Only env var names (without values) should appear in the compose YAML.
   */
  renderComposeYaml(config: TConfig): string;

  /**
   * Other module IDs that must be running before this one can start.
   * The boot orchestrator respects this order at startup.
   */
  dependencies?: string[];

  /** Cloudflare provisioning helpers. Undefined = no CF resources needed. */
  cloudflare?: {
    /** Tunnel ingress route to upsert (hostname → container:port). */
    tunnelRoute?: (config: TConfig) => CfTunnelRoute;
    /** CF Access app + policy to create for this install. */
    accessApp?: (config: TConfig) => CfAccessApp;
    /** DNS record to upsert (CNAME pointing at the tunnel). */
    dnsRecord?: (config: TConfig) => CfDnsRecord;
  };

  /** Doppler configuration hints for the install wizard. */
  doppler?: ModuleDopplerConfig;

  /**
   * Doppler secrets the install wizard validates before running the install.
   * The wizard shows this as an interactive checklist with how-to-get guides.
   */
  secrets?: SecretDef[];

  /**
   * Returns the public URL of a running installation.
   * Shown on the dashboard card and after a successful install.
   */
  publicUrl?: (config: TConfig) => string;

  /**
   * Poll the health of a running installation.
   * Called periodically by the dashboard health poller (Step 10).
   * Returns "unknown" if the check cannot be performed.
   */
  healthCheck?: (installation: Installation) => Promise<HealthStatus>;

  /**
   * Optional pre-install checks run server-side before the deployment summary
   * is shown. Use for things like: domain is in a CF zone, Doppler token has
   * the required secrets, no port conflict on the host.
   *
   * A single "error" result blocks the install; "warn" results are shown but
   * do not block. "ok" results are shown as green ticks.
   */
  preInstallChecks?: (config: TConfig) => Promise<CheckResult[]>;
}

/* ── Registry ─────────────────────────────────────────────────────────────── */

/** Typed registry of all available modules, keyed by module ID. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleRegistry = Record<string, ModuleDef<any>>;
