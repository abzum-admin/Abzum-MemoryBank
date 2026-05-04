import "server-only";
import Dockerode from "dockerode";

/**
 * Singleton Dockerode instance.
 *
 * In production the setup-app container binds /var/run/docker.sock from the
 * host (see docker-compose.yml). Dockerode auto-detects the socket path from
 * the DOCKER_HOST env var or falls back to /var/run/docker.sock.
 *
 * In development on a machine with Docker Desktop, DOCKER_HOST is usually
 * set automatically, so this works on both macOS/Windows dev and Linux prod.
 */

let _docker: Dockerode | null = null;

export function getDockerClient(): Dockerode {
  if (!_docker) {
    _docker = new Dockerode();
  }
  return _docker;
}
