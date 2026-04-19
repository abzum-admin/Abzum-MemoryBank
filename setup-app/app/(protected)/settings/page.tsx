import {
  CloudCog,
  Package,
  Settings2,
  AlertCircle} from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Separator } from "@/components/ui/separator";
import { getSettings } from "@/lib/config/settings";
import { SettingsSaveButton } from "./_components/settings-save-button";

/**
 * Settings → Configuration
 *
 * All operator-configurable values that were previously hardcoded.
 * Values are persisted in setup_config (key = "settings.<section>.<field>").
 *
 * Server-renders the current values; form submission via Server Action
 * (wired in Step 11). Currently read-only display with save stubs.
 */
export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col">
      <Topbar
        title="Settings"
        description="Configuration applied across all module installs"
      />

      <div className="flex-1 p-6">
        <form className="mx-auto max-w-2xl space-y-10">

          {/* ── Application ── */}
          <SettingsSection
            icon={<Settings2 className="h-4 w-4" />}
            title="Application"
            description="Identity and access settings for this setup console."
          >
            <FieldRow
              label="Console name"
              hint="Shown in the sidebar and browser tab."
              id="app.name"
              defaultValue={settings.app.name}
              placeholder="Abzum"
            />
            <FieldRow
              label="Console domain"
              hint="Public URL of this setup app (provisioned in the bootstrap wizard). e.g. https://setup.abzum.cloud"
              id="app.domain"
              defaultValue={settings.app.domain}
              placeholder="https://setup.abzum.cloud"
            />
            <FieldRow
              label="Admin emails"
              hint="Comma-separated emails added to the Cloudflare Access allow-list for every protected module."
              id="app.adminEmails"
              defaultValue={settings.app.adminEmails}
              placeholder="alice@example.com,bob@example.com"
            />
          </SettingsSection>

          {/* ── Cloudflare ── */}
          <SettingsSection
            icon={<CloudCog className="h-4 w-4" />}
            title="Cloudflare"
            description="Defaults applied when provisioning DNS records, tunnel ingress routes, and Access apps."
          >
            <FieldRow
              label="Default domain suffix"
              hint="Appended to the instance name to build the public URL. e.g. .abzum.cloud → hermes-felix.abzum.cloud"
              id="cloudflare.defaultDomainSuffix"
              defaultValue={settings.cloudflare.defaultDomainSuffix}
              placeholder=".yourdomain.com"
            />
            <FieldRow
              label="Access auth domain"
              hint="Your Cloudflare Access organisation domain. Populated automatically after the first CF Access app is created. e.g. yourteam.cloudflareaccess.com"
              id="cloudflare.authDomain"
              defaultValue={settings.cloudflare.authDomain}
              placeholder="yourteam.cloudflareaccess.com"
              readOnly
            />
          </SettingsSection>

          {/* ── Doppler ── */}
          <SettingsSection
            icon={<CloudCog className="h-4 w-4" />}
            title="Doppler"
            description="Doppler project and config used by the setup app itself, plus defaults applied to new module installations."
          >
            <div className="rounded-lg border border-border bg-elevated/50 p-4 space-y-1">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                <div className="text-xs text-text-secondary leading-relaxed">
                  <span className="font-medium text-text-primary">Setup app Doppler project</span>
                  {" "}holds infrastructure secrets (CF_API_TOKEN, CF_TUNNEL_ID, etc.).
                  The service token for this project is entered in the bootstrap wizard and
                  stored encrypted — not editable here. To rotate it, re-run the bootstrap
                  wizard or use the CLI on the VPS.
                </div>
              </div>
            </div>

            <FieldRow
              label="Setup project"
              hint="Doppler project that holds the setup app's own secrets."
              id="doppler.setupProject"
              defaultValue={settings.doppler.setupProject}
              placeholder="abzum-setup"
            />
            <FieldRow
              label="Setup config (environment)"
              hint='Doppler config within the setup project. Usually "production".'
              id="doppler.setupConfig"
              defaultValue={settings.doppler.setupConfig}
              placeholder="production"
            />

            <Separator />

            <div>
              <p className="text-xs font-medium text-text-primary mb-1">Module install defaults</p>
              <p className="text-xs text-text-muted mb-3">
                Pre-filled in the install wizard for each new module. Leave blank to prompt per install.
              </p>
            </div>

            <FieldRow
              label="Default module project template"
              hint='Supports the token {module_id}. e.g. "{module_id}" → "hermes" for a Hermes install.'
              id="doppler.defaultModuleProjectTemplate"
              defaultValue={settings.doppler.defaultModuleProjectTemplate}
              placeholder="{module_id}"
            />
            <FieldRow
              label="Default module config"
              hint='Doppler config (environment) for new module installs. Usually "dev" or "production".'
              id="doppler.defaultModuleConfig"
              defaultValue={settings.doppler.defaultModuleConfig}
              placeholder="dev"
            />
          </SettingsSection>

          {/* ── Module Defaults ── */}
          <SettingsSection
            icon={<Package className="h-4 w-4" />}
            title="Module Defaults"
            description="Defaults pre-filled in every module install wizard. Can be overridden per install."
          >
            <FieldRow
              label="Default upstream port"
              hint="Port the module's UI container listens on. The compose template uses this for the Cloudflare tunnel → container routing."
              id="modules.defaultUpstreamPort"
              defaultValue={String(settings.modules.defaultUpstreamPort)}
              placeholder="9119"
              type="number"
            />
            <FieldRow
              label="Default compose template"
              hint='Name of the compose template file (without extension) at scripts/templates/. e.g. "hermes" → hermes.compose.tmpl'
              id="modules.defaultTemplate"
              defaultValue={settings.modules.defaultTemplate}
              placeholder="hermes"
            />
          </SettingsSection>

          {/* Save */}
          <SettingsSaveButton />

        </form>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function SettingsSection({
  icon,
  title,
  description,
  children}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="ml-11 space-y-5">{children}</div>

      <Separator />
    </section>
  );
}

function FieldRow({
  label,
  hint,
  id,
  defaultValue,
  placeholder,
  type = "text",
  readOnly = false}: {
  label: string;
  hint: string;
  id: string;
  defaultValue: string;
  placeholder: string;
  type?: "text" | "number";
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        {readOnly && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted border border-border rounded px-1.5 py-0.5">
            auto-populated
          </span>
        )}
      </div>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm transition-colors placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 ${
          readOnly ? "cursor-default text-text-muted" : "text-text-primary"
        }`}
      />
      <p className="text-xs text-text-muted leading-relaxed">{hint}</p>
    </div>
  );
}
