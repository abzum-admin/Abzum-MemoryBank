import { Terminal } from "lucide-react";

interface Props {
  instanceId: string;
}

/**
 * Server-rendered log tail for a running service.
 *
 * Reads the last 100 lines from `docker logs --tail 100` via dockerode.
 * For a live-streaming view, a future enhancement would add SSE.
 */
export async function LogViewer({ instanceId }: Props) {
  let lines: string[] = [];
  let error: string | null = null;

  try {
    const Dockerode = (await import("dockerode")).default;
    const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

    // Hermes runs two containers: <instanceId> and <instanceId>-ui.
    // Show logs from the main container.
    const container = docker.getContainer(instanceId);
    const stream = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100,
      timestamps: true,
    });

    // Dockerode returns a Buffer for non-multiplexed streams.
    const raw = stream.toString("utf8");

    // Docker log stream prefixes each line with an 8-byte header for
    // multiplexed streams. Strip it if present.
    lines = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        // Strip the 8-byte docker stream header if present.
        if (line.charCodeAt(0) <= 3) {
          return line.slice(8);
        }
        return line;
      });
  } catch (err: unknown) {
    error =
      err instanceof Error
        ? err.message
        : "Could not retrieve logs — Docker socket may be unavailable";
  }

  return (
    <div className="rounded-xl border border-border bg-base overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-xs font-medium text-text-secondary">
          {instanceId} — last 100 lines
        </span>
      </div>

      {error ? (
        <p className="px-4 py-6 text-center text-xs text-text-muted">{error}</p>
      ) : lines.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-text-muted">
          No log output yet.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto px-4 py-3 space-y-0.5">
          {lines.map((line, i) => (
            <p
              key={i}
              className="font-mono text-[11px] leading-relaxed text-text-muted whitespace-pre-wrap break-all"
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
