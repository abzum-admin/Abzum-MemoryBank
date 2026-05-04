import type { ModuleRegistry } from "@/lib/modules/types";
import { hermes } from "./hermes";

/**
 * Global module registry — keyed by module ID.
 *
 * To add a module:
 *   1. Create `modules/<id>.ts` implementing `ModuleDef<TConfig>`.
 *   2. Import it here and add it to the MODULES object.
 *
 * Planned modules (from the design doc):
 *   - cloudflared  — adopt existing /docker/cloudflared container
 *   - paperclip    — adopt existing paperclip container
 *   - multica      — multica.ai agent (future)
 */
export const MODULES: ModuleRegistry = {
  hermes,
  // cloudflared: cloudflaredModule,
  // paperclip: paperclipModule,
  // multica: multicaModule,
};

/**
 * Look up a module by ID. Returns undefined if not found.
 * Use this instead of `MODULES[id]` for type-safe access.
 */
export function getModule(id: string) {
  return MODULES[id];
}

/** All registered module IDs in insertion order. */
export const MODULE_IDS = Object.keys(MODULES);
