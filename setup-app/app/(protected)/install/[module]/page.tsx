import { notFound } from "next/navigation";
import { Topbar } from "@/components/shell/topbar";
import { MODULES } from "@/modules/index";
import { getSettings } from "@/lib/config/settings";
import { InstallForm } from "./_components/install-form";

interface Props {
  params: Promise<{ module: string }>;
}

/**
 * Install form page for a specific module.
 *
 * Loads the module definition from the registry and the current settings
 * (used to pre-fill domain suffix, Doppler defaults, admin emails), then
 * renders the client-side install form.
 *
 * The form submits to the `actionStartInstall` server action which validates
 * the config, creates a job, and redirects to the progress page.
 */
export default async function InstallModulePage({ params }: Props) {
  const { module: moduleId } = await params;
  const mod = MODULES[moduleId];
  if (!mod) notFound();

  const settings = await getSettings();

  // Build install form defaults from module hints + settings.
  const defaultDoppler = {
    project: mod.doppler?.suggestedProjectTemplate
      ? mod.doppler.suggestedProjectTemplate.replace("{instance_id}", `${moduleId}-1`)
      : settings.doppler.defaultModuleProjectTemplate.replace("{module_id}", moduleId),
    config: mod.doppler?.suggestedConfig ?? settings.doppler.defaultModuleConfig,
  };

  const defaultAccessEmails = settings.app.adminEmails;
  const defaultDomainSuffix = settings.cloudflare.defaultDomainSuffix;

  return (
    <div className="flex flex-col">
      <Topbar
        title={`Install ${mod.name}`}
        description={mod.description}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl">
          <InstallForm
            moduleId={moduleId}
            moduleName={mod.name}
            moduleVersion={mod.version}
            secrets={mod.secrets ?? []}
            defaultDomainSuffix={defaultDomainSuffix}
            defaultDopplerProject={defaultDoppler.project}
            defaultDopplerConfig={defaultDoppler.config}
            defaultAccessEmails={defaultAccessEmails}
            defaultUpstreamPort={settings.modules.defaultUpstreamPort}
          />
        </div>
      </div>
    </div>
  );
}
