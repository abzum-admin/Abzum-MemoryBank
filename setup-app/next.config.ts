import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // better-sqlite3 and dockerode are native/node-only — keep them out of the edge bundle
  serverExternalPackages: ["better-sqlite3", "dockerode", "libsodium-wrappers"],
  experimental: {
    // Required for server actions that shell out to docker/doppler
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default config;
