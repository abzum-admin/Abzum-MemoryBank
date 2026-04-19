import "server-only";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Doppler CLI wrapper — TypeScript port of scripts/lib/doppler.sh.
 *
 * All operations are performed via the Doppler CLI (`child_process`) rather
 * than the Doppler Node SDK — this preserves the same CLI invocation pattern
 * used by the bash scripts and keeps the dependency surface minimal.
 *
 * The CLI is expected to be available on PATH. In production it is baked into
 * the Docker image. In development install it with: brew install dopplerhq/cli/doppler
 *
 * Ports:
 *   doppler_scope_token        → dopplerScopeToken
 *   doppler_list_secret_names  → dopplerListSecretNames
 *   doppler_render_env_lines   → (not needed — compose rendering is in-memory)
 *
 * New functions not in the bash script:
 *   dopplerValidateToken — validate a service token by listing secrets
 *   dopplerGetSecretNames — list secret names via API token (bypasses scope)
 *   dopplerRun — spawn a process with Doppler-injected secrets
 */

const execFileAsync = promisify(execFile);

/** Root directory where managed services' compose dirs live. */
const DOCKER_ROOT = process.env.DOCKER_ROOT ?? "/docker";

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface DopplerValidationResult {
  valid: boolean;
  /** Project slug this token has access to. */
  project?: string;
  /** Config (environment) slug. */
  config?: string;
  /** Human-readable error if invalid. */
  error?: string;
}

export interface DopplerSecret {
  name: string;
  /** Whether the value is present (non-empty). */
  computed: boolean;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Run a Doppler CLI command and capture stdout/stderr.
 * Throws if the process exits non-zero.
 */
async function runDoppler(
  args: string[],
  env?: Record<string, string>
): Promise<string> {
  const { stdout } = await execFileAsync("doppler", args, {
    env: { ...process.env, HOME: "/root", ...env },
    timeout: 30_000,
  });
  return stdout.trim();
}

/* ── Token management ─────────────────────────────────────────────────────── */

/**
 * Validate a Doppler service token by attempting to list secrets for the
 * project/config it's scoped to.
 *
 * A valid service token can only access its own project/config — the CLI
 * `doppler secrets --json` call succeeds if the token is valid.
 */
export async function dopplerValidateToken(
  token: string,
  project?: string,
  config?: string
): Promise<DopplerValidationResult> {
  const args = ["secrets", "--json", "--silent"];
  if (project) args.push("--project", project);
  if (config) args.push("--config", config);

  try {
    const stdout = await runDoppler(args, { DOPPLER_TOKEN: token });
    const data = JSON.parse(stdout) as Record<string, { computed: string }>;

    // Extract project/config from the DOPPLER_PROJECT / DOPPLER_CONFIG keys
    // that Doppler injects into every secret list response.
    return {
      valid: true,
      project: data["DOPPLER_PROJECT"]?.computed ?? project,
      config: data["DOPPLER_CONFIG"]?.computed ?? config,
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Unknown error validating Doppler token";
    return { valid: false, error: msg };
  }
}

/* ── Secret listing ───────────────────────────────────────────────────────── */

/**
 * List all secret names from a Doppler project/config using an explicit token.
 *
 * Filters out Doppler's own bookkeeping keys (DOPPLER_PROJECT, DOPPLER_CONFIG,
 * DOPPLER_ENVIRONMENT) — those should not be pushed into containers.
 *
 * Mirrors: doppler_list_secret_names() (but uses token param instead of scope)
 */
export async function dopplerListSecretNames(
  token: string,
  project: string,
  config: string
): Promise<string[]> {
  const stdout = await runDoppler(
    ["secrets", "--json", "--silent", "--project", project, "--config", config],
    { DOPPLER_TOKEN: token }
  );

  const data = JSON.parse(stdout) as Record<string, unknown>;
  return Object.keys(data).filter(
    (k) => !["DOPPLER_PROJECT", "DOPPLER_CONFIG", "DOPPLER_ENVIRONMENT"].includes(k)
  );
}

/**
 * Check which of a set of required secret names are present (non-empty) in a
 * Doppler config. Returns a map of secretName → present.
 *
 * Used by the install wizard's secrets checklist to validate before deploying.
 */
export async function dopplerCheckSecrets(
  token: string,
  project: string,
  config: string,
  requiredNames: string[]
): Promise<Record<string, boolean>> {
  const stdout = await runDoppler(
    ["secrets", "--json", "--silent", "--project", project, "--config", config],
    { DOPPLER_TOKEN: token }
  );

  const data = JSON.parse(stdout) as Record<string, { computed: string }>;
  const result: Record<string, boolean> = {};

  for (const name of requiredNames) {
    const val = data[name]?.computed;
    result[name] = typeof val === "string" && val.length > 0;
  }

  return result;
}

/* ── Token scoping ────────────────────────────────────────────────────────── */

/**
 * Scope a Doppler service token to a directory so that `doppler run --` in
 * that directory auto-authenticates without an explicit `--token` flag.
 *
 * Equivalent to: doppler configure set token <token> --scope <dir>
 *
 * The setup app uses this when installing a module — it writes the scope
 * config so that subsequent `docker compose up` re-runs (e.g. boot
 * orchestrator) don't need to pass the token explicitly.
 *
 * Mirrors: doppler_scope_token()
 */
export async function dopplerScopeToken(
  instanceId: string,
  token: string
): Promise<void> {
  const dir = path.join(DOCKER_ROOT, instanceId);
  await fs.mkdir(dir, { recursive: true });

  await runDoppler(
    ["configure", "set", "token", token, "--scope", dir, "--silent"],
    { HOME: "/root" }
  );
}

/**
 * Remove the scoped Doppler token for a directory (called on uninstall).
 * Silently no-ops if no scope config exists.
 */
export async function dopplerUnsetScope(instanceId: string): Promise<void> {
  const dir = path.join(DOCKER_ROOT, instanceId);
  await runDoppler(
    ["configure", "set", "token", "", "--scope", dir, "--silent"]
  ).catch(() => {
    // Ignore errors — directory may not exist on cleanup.
  });
}

/* ── Running commands with injected secrets ───────────────────────────────── */

export interface DopplerRunOptions {
  /** Doppler project slug. */
  project: string;
  /** Doppler config (environment) slug. */
  config: string;
  /** Optional explicit service token. If omitted, uses scoped config for cwd. */
  token?: string;
  /** Working directory for the child process. */
  cwd: string;
  /** Command + arguments to run inside the doppler environment. */
  command: string[];
  /** Callback receiving each line of stdout/stderr as it arrives. */
  onOutput?: (line: string) => void;
}

/**
 * Run a command with Doppler-injected secrets.
 *
 * Equivalent to:
 *   doppler run --project <p> --config <c> -- <command...>
 *
 * This is the primary mechanism by which the boot orchestrator and install
 * engine start Docker Compose services — secrets are fetched from Doppler at
 * run time and exported into the child process environment.
 */
export function dopplerRun(opts: DopplerRunOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "run",
      "--project", opts.project,
      "--config", opts.config,
      "--silent",
      "--",
      ...opts.command,
    ];

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      HOME: "/root",
    };
    if (opts.token) {
      env["DOPPLER_TOKEN"] = opts.token;
    }

    const child = spawn("doppler", args, {
      cwd: opts.cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const emit = (data: Buffer) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) opts.onOutput?.(line);
      }
    };

    child.stdout?.on("data", emit);
    child.stderr?.on("data", emit);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `doppler run -- ${opts.command.join(" ")} exited with code ${code}`
          )
        );
      }
    });

    child.on("error", (err) =>
      reject(new Error(`Failed to spawn doppler: ${err.message}`))
    );
  });
}

/**
 * Convenience wrapper: run `doppler run -- docker compose up -d` for an
 * installation. Used by the boot orchestrator.
 */
export async function dopplerComposeUp(opts: {
  project: string;
  config: string;
  token?: string;
  composeFile: string;
  instanceId: string;
  onOutput?: (line: string) => void;
}): Promise<void> {
  const { DOCKER_ROOT: dr } = process.env;
  const cwd = path.join(dr ?? "/docker", opts.instanceId);

  await dopplerRun({
    project: opts.project,
    config: opts.config,
    token: opts.token,
    cwd,
    command: [
      "docker",
      "compose",
      "-f", opts.composeFile,
      "up", "-d",
      "--remove-orphans",
    ],
    onOutput: opts.onOutput,
  });
}
