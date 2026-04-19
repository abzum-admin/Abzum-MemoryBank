/**
 * Bootstrap state check — returns true once the first-run wizard has persisted
 * admin email + CF config + app domain to the DB.
 *
 * Stub for Step 1 scaffold. Full implementation lands in Step 13 (auth)
 * together with bootstrap token verification and CF Access JWT middleware.
 *
 * Until the DB layer is in place, this always returns false so / always
 * redirects to /bootstrap. That matches the intended first-run behaviour.
 */
export async function isBootstrapped(): Promise<boolean> {
  // TODO(step-2): read setup_config.bootstrap_complete from SQLite
  return false;
}
