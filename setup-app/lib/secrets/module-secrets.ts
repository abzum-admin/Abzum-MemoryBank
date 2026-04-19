import type { SecretDef } from "./types";

/**
 * Secrets required by each module in its own Doppler project/config.
 *
 * These are separate from the setup app's own Doppler config. When the user
 * installs a module, the install wizard:
 *   1. Asks for the Doppler project + config that holds these secrets.
 *   2. Shows this checklist so the user can verify all secrets are present.
 *   3. Validates via `doppler secrets --json` that every required key exists.
 *   4. Only then runs `doppler run -- docker compose up -d`.
 */

export const HERMES_SECRETS: SecretDef[] = [
  {
    name: "OPENROUTER_API_KEY",
    description: "OpenRouter API key — routes LLM requests across providers",
    required: true,
    example: "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    howToGetUrl: "https://openrouter.ai/keys",
    howToGet: `
1. Go to openrouter.ai and sign in (or create a free account).

2. Navigate to openrouter.ai/keys → "Create Key".

3. Give it a name (e.g. "hermes-felix") and click "Create".

4. Copy the key — it starts with "sk-or-v1-".

5. Add to Doppler (in your Hermes project/config):
   doppler secrets set OPENROUTER_API_KEY=<your key>
`.trim(),
  },

  {
    name: "TAVILY_API_KEY",
    description: "Tavily Search API key — powers web search tool in Hermes agents",
    required: true,
    example: "tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    howToGetUrl: "https://app.tavily.com",
    howToGet: `
1. Go to app.tavily.com and sign in (or create an account).

2. Your API key is shown on the dashboard homepage.
   It starts with "tvly-".

3. Free tier includes 1,000 searches/month. Upgrade for higher limits.

4. Add to Doppler:
   doppler secrets set TAVILY_API_KEY=<your key>
`.trim(),
  },

  {
    name: "BRAVE_SEARCH_API_KEY",
    description: "Brave Search API key — alternative/fallback search provider",
    required: false,
    example: "BSA-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    howToGetUrl: "https://api.search.brave.com/app/keys",
    howToGet: `
1. Go to api.search.brave.com → sign in with a Brave account.

2. Navigate to "API Keys" → "New API Key".

3. Free tier: 2,000 queries/month. Paid tiers available.

4. Add to Doppler:
   doppler secrets set BRAVE_SEARCH_API_KEY=<your key>
`.trim(),
  },

  {
    name: "MINIMAX_API_KEY",
    description: "MiniMax API key — for MiniMax speech/video models (optional)",
    required: false,
    example: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    howToGetUrl: "https://www.minimaxi.com/user-center/basic-information/interface-key",
    howToGet: `
1. Go to minimaxi.com and sign in.

2. Navigate to User Center → Basic Information → Interface Key.

3. Create a new key and copy it.

4. Add to Doppler:
   doppler secrets set MINIMAX_API_KEY=<your key>
`.trim(),
  },

  {
    name: "TELEGRAM_BOT_TOKEN",
    description: "Telegram Bot token — required only if using Hermes Telegram integration",
    required: false,
    example: "1234567890:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    howToGetUrl: "https://t.me/BotFather",
    howToGet: `
1. Open Telegram and search for "@BotFather" (the official bot).

2. Send /newbot — follow the prompts to name your bot.

3. BotFather replies with a token in the format:
   1234567890:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

4. Add to Doppler:
   doppler secrets set TELEGRAM_BOT_TOKEN=<your token>
`.trim(),
  },

  {
    name: "TELEGRAM_ALLOWED_USERS",
    description: "Comma-separated Telegram user IDs allowed to message the bot",
    required: false,
    example: "123456789,987654321",
    howToGetUrl: "https://t.me/userinfobot",
    howToGet: `
1. Open Telegram and search for "@userinfobot".

2. Send any message — it replies with your numeric user ID.

3. Repeat for any other users you want to allow.

4. Add to Doppler (comma-separated, no spaces):
   doppler secrets set TELEGRAM_ALLOWED_USERS=123456789,987654321
`.trim(),
  },
];

/**
 * Map of module ID → its required Doppler secrets.
 * Used by the install wizard to show the secrets checklist.
 */
export const MODULE_SECRETS: Record<string, SecretDef[]> = {
  hermes: HERMES_SECRETS,
  // cloudflared: CLOUDFLARED_SECRETS,   // added when cloudflared module lands
  // paperclip:   PAPERCLIP_SECRETS,     // added when paperclip module lands
  // multica:     MULTICA_SECRETS,       // added when multica module lands
};
