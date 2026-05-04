# ── Stage 1: deps ────────────────────────────────────────────────────────────
# Install all dependencies including devDeps (needed for the build step).
FROM node:22-alpine AS deps

WORKDIR /app

# Native build tools for better-sqlite3 and other native modules.
RUN apk add --no-cache python3 make g++ sqlite-dev

COPY package.json package-lock.json* ./

# Install with scripts enabled so better-sqlite3 builds its native binding.
RUN npm ci

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy deps from previous stage.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js app (output: standalone).
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Runtime dependencies for native modules.
RUN apk add --no-cache sqlite-libs

# Install the Doppler CLI.
# We use the official install script which places `doppler` on PATH.
RUN apk add --no-cache curl gnupg && \
    curl -Ls https://cli.doppler.com/install.sh | sh && \
    apk del curl gnupg && \
    doppler --version

# Non-root user for the app process.
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy standalone build output.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

# Copy the native better-sqlite3 binding that was compiled in the deps stage.
# The standalone output bundles most of node_modules but omits native .node files.
COPY --from=deps --chown=nextjs:nodejs \
  /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node \
  ./node_modules/better-sqlite3/build/Release/better_sqlite3.node

# Data directory — persisted via bind mount from host.
# /opt/abzum-setup-app/data  → SQLite DB
RUN mkdir -p /opt/abzum-setup-app/data && \
    chown -R nextjs:nodejs /opt/abzum-setup-app

# Secret key file — written by install-setup-app.sh, mounted read-only.
# /etc/abzum-setup-app/secret  → 32-byte hex key for libsodium secretbox
RUN mkdir -p /etc/abzum-setup-app

USER nextjs

EXPOSE 3000

# DOCKER_ROOT is the host path where compose dirs live, bind-mounted into the
# container at /docker. Managed services write their compose files here.
ENV DOCKER_ROOT=/docker

CMD ["node", "server.js"]
