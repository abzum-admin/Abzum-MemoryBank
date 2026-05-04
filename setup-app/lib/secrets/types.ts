/**
 * Secret definition — describes one secret that a module (or the setup app
 * itself) requires from Doppler.
 *
 * These are purely descriptive; the actual values are NEVER stored by this
 * app. At install/run time the app calls `doppler run --` and Docker Compose
 * reads them from the child process environment.
 */
export interface SecretDef {
  /** Exact Doppler secret name (uppercase, underscores). e.g. "CF_API_TOKEN" */
  name: string;

  /** One-line description shown next to the secret name. */
  description: string;

  /** Whether the install will fail without this secret. */
  required: boolean;

  /**
   * Step-by-step instructions shown when the user expands the "How to get"
   * panel. Plain text; newlines become paragraphs in the UI.
   */
  howToGet: string;

  /** Direct URL to the relevant dashboard page, if one exists. */
  howToGetUrl?: string;

  /** Example value format — shown grayed-out in the "add to Doppler" step. */
  example?: string;
}

/**
 * Result of checking whether a secret is present in Doppler.
 * The actual value is never returned — only presence is checked.
 */
export type SecretStatus =
  | { status: "present" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | { status: "unchecked" };

export interface SecretCheckResult {
  def: SecretDef;
  result: SecretStatus;
}
