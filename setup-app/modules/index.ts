/**
 * Module registry. Each module is a `ModuleDef` exported from `modules/<id>.ts`.
 *
 * Scaffold placeholder for Step 1. The real `ModuleDef` interface + discovery
 * lands in Step 3 together with `modules/hermes.ts` (the first module).
 *
 * Planned modules (from the design doc):
 *   - hermes     (Hermes agent + dashboard)
 *   - cloudflared (migrated from /docker/cloudflared)
 *   - paperclip  (migrated from existing container)
 *   - multica    (future — multica.ai)
 */
export const MODULES: Record<string, unknown> = {};
