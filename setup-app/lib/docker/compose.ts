import "server-only";
import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { getDockerClient } from "./client";

/**
 * Docker Compose helpers for the setup app.
 *
 * All managed services live under /docker/<instanceId>/docker-compose.yml.
 * Commands are run via `doppler run -- docker compose …` so secrets are
 * injected at runtime — no .env files on disk.
 *
 * The dockerode client is used for read-only queries (container inspect,
 * status polling) since the Docker API is cleaner for those operations.
 * Mutating operations (up/down/pull) go through the CLI to preserve the
 * `doppler run --` secret injection chain.
 */

/** Root directory where all managed compose projects live. */
const DOCKER_ROOT = process.env.DOCKER_ROOT ?? "/docker";

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: "running" | "exited" | "paused" | "restarting" | "dead" | "created" | "unknown";
  startedAt?: Date;
  ports: Array<{ hostPort: number; containerPort: number; protocol: string }>;
}

export interface ComposeUpOptions {
  /** Instance ID (also the compose project directory name). */
  instanceId: string;
  /** Doppler project slug for this installation. */
  dopplerProject: string;
  /** Doppler config (environment) slug. */
  dopplerConfig: string;
  /** Emit each line of stdout/stderr as it arrives. */
  onOutput?: (line: string) => void;
}

export interface ComposeDownOptions {
  instanceId: string;
  dopplerProject: string;
  dopplerConfig: string;
  /** Remove named volumes on down (default false). */
  removeVolumes?: boolean;
  onOutput?: (line: string) => void;
}

export interface ComposePullOptions {
  instanceId: string;
  dopplerProject: string;
  dopplerConfig: string;
  onOutput?: (line: string) => void;
}

export interface ComposeLogsOptions {
  instanceId: string;
  /** Number of recent log lines to fetch (default 200). */
  tail?: number;
  /** Include timestamps in log output (default true). */
  timestamps?: boolean;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Return the absolute path to the compose file for an instance.
 * e.g. /docker/hermes-felix/docker-compose.yml
 */
export function composeFilePath(instanceId: string): string {
  return path.join(DOCKER_ROOT, instanceId, "docker-compose.yml");
}

/**
 * Return the absolute path to the compose directory for an instance.
 * e.g. /docker/hermes-felix/
 */
export function composeDirPath(instanceId: string): string {
  return path.join(DOCKER_ROOT, instanceId);
}

/**
 * Write a docker-compose.yml to disk for an instance.
 * Creates the directory if it doesn't exist.
 */
export async function writeComposeFile(
  instanceId: string,
  yaml: string
): Promise<void> {
  const dir = composeDirPath(instanceId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(composeFilePath(instanceId), yaml, "utf-8");
}

/**
 * Read the docker-compose.yml for an instance.
 * Returns null if the file doesn't exist.
 */
export async function readComposeFile(instanceId: string): Promise<string | null> {
  try {
    return await fs.readFile(composeFilePath(instanceId), "utf-8");
  } catch {
    return null;
  }
}

/**
 * Run a shell command, streaming stdout/stderr line-by-line to `onOutput`.
 * Resolves when the process exits with code 0; rejects otherwise.
 */
function runCommand(
  cmd: string,
  args: string[],
  opts: { cwd: string; env?: NodeJS.ProcessEnv; onOutput?: (line: string) => void }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: { ...process.env, ...opts.env },
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
        reject(new Error(`Command "${cmd} ${args.join(" ")}" exited with code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to spawn "${cmd}": ${err.message}`));
    });
  });
}

/**
 * Build the base `doppler run -- docker compose` command parts.
 * Doppler fetches secrets for the given project/config and exports them
 * into the child process environment before docker compose runs.
 */
function dopplerComposeCmd(
  project: string,
  config: string
): { cmd: string; prefix: string[] } {
  return {
    cmd: "doppler",
    prefix: [
      "run",
      "--project", project,
      "--config", config,
      "--",
      "docker",
      "compose",
    ],
  };
}

/* ── Core operations ──────────────────────────────────────────────────────── */

/**
 * Pull the latest images for a compose project.
 * Run before `composeUp` on first install to ensure the most recent image.
 */
export async function composePull(opts: ComposePullOptions): Promise<void> {
  const { cmd, prefix } = dopplerComposeCmd(opts.dopplerProject, opts.dopplerConfig);
  await runCommand(
    cmd,
    [...prefix, "-f", composeFilePath(opts.instanceId), "pull"],
    { cwd: composeDirPath(opts.instanceId), onOutput: opts.onOutput }
  );
}

/**
 * Start (or restart) all services in the compose project.
 *
 * Equivalent to: doppler run -- docker compose up -d --remove-orphans
 *
 * The `--remove-orphans` flag cleans up containers whose service definition
 * was removed from the compose file (e.g. after a config update).
 */
export async function composeUp(opts: ComposeUpOptions): Promise<void> {
  const { cmd, prefix } = dopplerComposeCmd(opts.dopplerProject, opts.dopplerConfig);
  await runCommand(
    cmd,
    [
      ...prefix,
      "-f", composeFilePath(opts.instanceId),
      "up", "-d",
      "--remove-orphans",
    ],
    { cwd: composeDirPath(opts.instanceId), onOutput: opts.onOutput }
  );
}

/**
 * Stop all services and remove containers for the compose project.
 *
 * Does NOT remove named volumes by default — pass `removeVolumes: true` to
 * also wipe persistent data (shown in the removal summary UI before confirm).
 */
export async function composeDown(opts: ComposeDownOptions): Promise<void> {
  const { cmd, prefix } = dopplerComposeCmd(opts.dopplerProject, opts.dopplerConfig);
  const extra = opts.removeVolumes ? ["--volumes"] : [];
  await runCommand(
    cmd,
    [
      ...prefix,
      "-f", composeFilePath(opts.instanceId),
      "down",
      ...extra,
    ],
    { cwd: composeDirPath(opts.instanceId), onOutput: opts.onOutput }
  );
}

/**
 * Fetch recent log lines from all containers in a compose project.
 * Returns them as a single string (pre-formatted for display).
 */
export async function composeLogs(opts: ComposeLogsOptions): Promise<string> {
  const tail = opts.tail ?? 200;
  const ts = opts.timestamps !== false;

  return new Promise((resolve, reject) => {
    const args = [
      "compose",
      "-f", composeFilePath(opts.instanceId),
      "logs",
      "--no-color",
      `--tail=${tail}`,
      ...(ts ? ["--timestamps"] : []),
    ];

    const child = spawn("docker", args, {
      cwd: composeDirPath(opts.instanceId),
      stdio: ["ignore", "pipe", "pipe"],
    });

    const chunks: Buffer[] = [];
    child.stdout?.on("data", (d: Buffer) => chunks.push(d));
    child.stderr?.on("data", (d: Buffer) => chunks.push(d));

    child.on("close", (code) => {
      const output = Buffer.concat(chunks).toString("utf-8");
      if (code === 0 || output.length > 0) {
        resolve(output);
      } else {
        reject(new Error(`docker compose logs exited with code ${code}`));
      }
    });

    child.on("error", (err) =>
      reject(new Error(`Failed to spawn docker: ${err.message}`))
    );
  });
}

/* ── Container inspect (via dockerode) ───────────────────────────────────── */

/**
 * Inspect a single container by name and return a normalised ContainerInfo.
 * Returns null if the container doesn't exist.
 */
export async function inspectContainer(
  containerName: string
): Promise<ContainerInfo | null> {
  const docker = getDockerClient();
  try {
    const container = docker.getContainer(containerName);
    const info = await container.inspect();

    const state = info.State;
    const stateStr = state.Running
      ? "running"
      : state.Paused
      ? "paused"
      : state.Restarting
      ? "restarting"
      : state.Dead
      ? "dead"
      : state.Status === "created"
      ? "created"
      : "exited";

    const ports = Object.entries(info.NetworkSettings.Ports ?? {}).flatMap(
      ([key, bindings]) => {
        if (!bindings) return [];
        const [containerPort, protocol] = key.split("/");
        return bindings.map((b) => ({
          hostPort: Number(b.HostPort),
          containerPort: Number(containerPort),
          protocol: protocol ?? "tcp",
        }));
      }
    );

    return {
      id: info.Id.slice(0, 12),
      name: info.Name.replace(/^\//, ""),
      image: info.Config.Image,
      status: info.State.Status,
      state: stateStr as ContainerInfo["state"],
      startedAt: state.StartedAt ? new Date(state.StartedAt) : undefined,
      ports,
    };
  } catch (err: unknown) {
    // 404 → container doesn't exist
    if (
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      (err as { statusCode: number }).statusCode === 404
    ) {
      return null;
    }
    throw err;
  }
}

/**
 * Return ContainerInfo for every container in a compose project.
 * Services are identified by the naming convention: <instanceId> and <instanceId>-*.
 */
export async function inspectComposeContainers(
  instanceId: string
): Promise<ContainerInfo[]> {
  const docker = getDockerClient();
  const all = await docker.listContainers({ all: true });

  // Match containers whose name starts with the instanceId.
  const relevant = all.filter((c) =>
    c.Names.some(
      (n) => n === `/${instanceId}` || n.startsWith(`/${instanceId}-`)
    )
  );

  const results: ContainerInfo[] = [];
  for (const c of relevant) {
    const name = c.Names[0]?.replace(/^\//, "") ?? c.Id;
    results.push({
      id: c.Id.slice(0, 12),
      name,
      image: c.Image,
      status: c.Status,
      state: (c.State ?? "unknown") as ContainerInfo["state"],
      ports: (c.Ports ?? []).map((p) => ({
        hostPort: p.PublicPort ?? 0,
        containerPort: p.PrivatePort ?? 0,
        protocol: p.Type ?? "tcp",
      })),
    });
  }

  return results;
}

/**
 * Quick health check based on container state alone (no HTTP probe).
 * Used by the boot orchestrator and dashboard poller as a fast approximation.
 */
export async function containerHealthFromState(
  instanceId: string
): Promise<"healthy" | "degraded" | "unhealthy" | "unknown"> {
  try {
    const containers = await inspectComposeContainers(instanceId);
    if (containers.length === 0) return "unknown";

    const states = containers.map((c) => c.state);
    if (states.every((s) => s === "running")) return "healthy";
    if (states.some((s) => s === "running")) return "degraded";
    return "unhealthy";
  } catch {
    return "unknown";
  }
}

/* ── Directory management ─────────────────────────────────────────────────── */

/**
 * Remove the compose directory for an instance from disk.
 * Called as the final step of an uninstall after containers are down.
 */
export async function removeComposeDir(instanceId: string): Promise<void> {
  await fs.rm(composeDirPath(instanceId), { recursive: true, force: true });
}

/**
 * Check whether a compose directory exists for an instance.
 */
export async function composeDirectoryExists(instanceId: string): Promise<boolean> {
  try {
    await fs.access(composeDirPath(instanceId));
    return true;
  } catch {
    return false;
  }
}
