import type { SecretDef } from "./types";

/**
 * Secrets the setup app itself reads from Doppler to operate.
 *
 * Stored in a dedicated Doppler project (e.g. "abzum-setup") and config
 * (e.g. "production"). The Doppler service token for this project is the
 * ONLY secret the setup app needs outside of Doppler — it is written by the
 * bootstrap install script to /etc/abzum-setup-app/doppler-token (0600) and
 * is never stored in SQLite.
 */
export const SETUP_SECRETS: SecretDef[] = [
  {
    name: "CF_API_TOKEN",
    description: "Cloudflare API token with Tunnel, Access, DNS, and Zone permissions",
    required: true,
    example: "cfat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    howToGetUrl: "https://dash.cloudflare.com/profile/api-tokens",
    howToGet: `
1. Go to dash.cloudflare.com → My Profile → API Tokens → "Create Custom Token".

2. Add the following permission rows:

   Account level:
   • Cloudflare Tunnel: Edit  (listed as "Argo Tunnel (Legacy)")
   • Access: Apps and Policies: Edit
   • Access: Organizations: Edit
   • Access: Custom Pages: Edit

   Zone level (select your domain zone, e.g. "yourdomain.com"):
   • DNS: Edit
   • Zone: Read

3. Set "IP Address Filtering" to your VPS IP for extra security (optional).

4. Click "Create Token" — copy the value immediately, it won't be shown again.

5. Add to Doppler:
   doppler secrets set CF_API_TOKEN=<paste value here>
`.trim(),
  },

  {
    name: "CF_ACCOUNT_ID",
    description: "Your Cloudflare account ID (shown in the CF dashboard URL)",
    required: true,
    example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    howToGetUrl: "https://dash.cloudflare.com",
    howToGet: `
1. Log in to dash.cloudflare.com.

2. The account ID is visible in the URL immediately after you log in:
   https://dash.cloudflare.com/<ACCOUNT_ID>/...

   It is a 32-character hex string.

3. Alternatively, open any zone → scroll down on the right sidebar →
   "Account ID" is listed under the API section.

4. Add to Doppler:
   doppler secrets set CF_ACCOUNT_ID=<your 32-char account ID>
`.trim(),
  },

  {
    name: "CF_TUNNEL_ID",
    description: "UUID of the Cloudflare tunnel that routes traffic to this VPS",
    required: true,
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    howToGetUrl: "https://one.dash.cloudflare.com/",
    howToGet: `
1. Go to one.dash.cloudflare.com → Networks → Tunnels.

2. If you have an existing tunnel (e.g. the one cloudflared creates on this
   VPS), click it — the UUID is in the URL and shown on the tunnel detail page.

3. If you don't have a tunnel yet, create one:
   a. Click "Create a tunnel" → "Cloudflared" → name it (e.g. "my-vps").
   b. Copy the tunnel UUID shown after creation.
   c. Install cloudflared on the VPS and run the token command shown.

4. Add to Doppler:
   doppler secrets set CF_TUNNEL_ID=<your tunnel UUID>
`.trim(),
  },

  {
    name: "CF_ZONE_ID",
    description: "Zone ID for your domain (needed for DNS record upserts)",
    required: true,
    example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    howToGetUrl: "https://dash.cloudflare.com",
    howToGet: `
1. Go to dash.cloudflare.com and select your domain zone (e.g. "yourdomain.com").

2. Scroll down on the right sidebar of the Overview page.

3. Under the "API" section you'll see "Zone ID" — copy the 32-char hex value.

4. Add to Doppler:
   doppler secrets set CF_ZONE_ID=<zone ID>
`.trim(),
  },
];

/**
 * Subset of SETUP_SECRETS that are required for Cloudflare operations.
 * Used by the CF config validation step in the bootstrap wizard.
 */
export const CF_REQUIRED_SECRETS = SETUP_SECRETS.filter((s) => s.required);
