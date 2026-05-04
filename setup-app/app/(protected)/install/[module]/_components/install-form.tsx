"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import type { SecretDef } from "@/lib/secrets/types";
import { actionStartInstall } from "../actions";
import type { ActionResult } from "../actions";

interface Props {
  moduleId: string;
  moduleName: string;
  moduleVersion: string;
  secrets: SecretDef[];
  defaultDomainSuffix: string;
  defaultDopplerProject: string;
  defaultDopplerConfig: string;
  defaultAccessEmails: string;
  defaultUpstreamPort: number;
}

type FormStep = "form" | "summary";

interface FormValues {
  instanceId: string;
  domain: string;
  dopplerProject: string;
  dopplerConfig: string;
  accessEmails: string;
  upstreamPort: string;
}

/**
 * Install form — two-phase UI:
 *  1. Form: operator fills instance details.
 *  2. Summary: deployment plan shown for confirmation before applying.
 *
 * Submitting the summary calls the `actionStartInstall` server action which
 * validates the config, creates an in-process job, and redirects to the
 * SSE progress page.
 */
export function InstallForm({
  moduleId,
  moduleName,
  moduleVersion,
  secrets,
  defaultDomainSuffix,
  defaultDopplerProject,
  defaultDopplerConfig,
  defaultAccessEmails,
  defaultUpstreamPort,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<FormStep>("form");
  const [result, setResult] = useState<ActionResult | null>(null);

  const [values, setValues] = useState<FormValues>({
    instanceId: `${moduleId}-1`,
    domain: `${moduleId}-1${defaultDomainSuffix}`,
    dopplerProject: defaultDopplerProject,
    dopplerConfig: defaultDopplerConfig,
    accessEmails: defaultAccessEmails,
    upstreamPort: String(defaultUpstreamPort),
  });

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-update domain when instanceId changes (as long as domain still
      // matches the pattern <prev-instanceId><suffix>).
      if (
        field === "instanceId" &&
        prev.domain === `${prev.instanceId}${defaultDomainSuffix}`
      ) {
        next.domain = `${value}${defaultDomainSuffix}`;
      }
      // Auto-update Doppler project from instanceId template.
      if (
        field === "instanceId" &&
        prev.dopplerProject === prev.instanceId
      ) {
        next.dopplerProject = value;
      }
      return next;
    });
  }

  function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setPhase("summary");
  }

  function handleConfirm() {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.set(k, v));
      fd.set("moduleId", moduleId);
      const res = await actionStartInstall(fd);
      if (res.success && res.data?.jobId) {
        router.push(`/install/${moduleId}/${res.data.jobId}`);
      } else {
        setResult(res);
        setPhase("form");
      }
    });
  }

  const requiredSecrets = secrets.filter((s) => s.required);
  const optionalSecrets = secrets.filter((s) => !s.required);

  if (phase === "summary") {
    return (
      <Summary
        values={values}
        moduleName={moduleName}
        moduleVersion={moduleVersion}
        requiredSecrets={requiredSecrets}
        optionalSecrets={optionalSecrets}
        isPending={isPending}
        result={result}
        onBack={() => setPhase("form")}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <form onSubmit={handlePreview} className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          New Install
        </p>
        <h1 className="text-2xl font-semibold text-text-primary">
          {moduleName}
        </h1>
        <p className="text-sm text-text-secondary">
          Configure this instance. A deployment summary will be shown before
          anything is provisioned.
        </p>
      </div>

      {result && !result.success && (
        <div className="flex gap-2 rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-error" />
          <p className="text-xs text-status-error leading-relaxed">
            {result.error}
          </p>
        </div>
      )}

      {/* Instance configuration */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Instance
        </legend>

        <Field
          id="instanceId"
          label="Instance ID"
          hint="Slug used for container names and the compose directory. e.g. hermes-felix"
          placeholder={`${moduleId}-1`}
          value={values.instanceId}
          onChange={(v) => handleChange("instanceId", v)}
          pattern="^[a-z][a-z0-9-]*$"
          required
        />

        <Field
          id="domain"
          label="Public domain"
          hint="Fully-qualified hostname. The DNS CNAME and CF Access app will be created for this."
          placeholder={`${moduleId}-1.yourdomain.com`}
          value={values.domain}
          onChange={(v) => handleChange("domain", v)}
          required
        />
      </fieldset>

      {/* Doppler */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Doppler (module secrets)
        </legend>

        <Field
          id="dopplerProject"
          label="Doppler project"
          hint="The Doppler project that holds this installation's API keys."
          placeholder={moduleId}
          value={values.dopplerProject}
          onChange={(v) => handleChange("dopplerProject", v)}
          required
        />

        <Field
          id="dopplerConfig"
          label="Doppler config"
          hint='The Doppler config (environment) within that project. Usually "dev" or "production".'
          placeholder="dev"
          value={values.dopplerConfig}
          onChange={(v) => handleChange("dopplerConfig", v)}
          required
        />
      </fieldset>

      {/* Cloudflare Access */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Cloudflare Access
        </legend>

        <Field
          id="accessEmails"
          label="Allowed emails"
          hint="Comma-separated email addresses that can log in via Cloudflare Access. Defaults to admin emails from Settings."
          placeholder="you@example.com"
          value={values.accessEmails}
          onChange={(v) => handleChange("accessEmails", v)}
        />

        <Field
          id="upstreamPort"
          label="Upstream port"
          hint="Port the module's UI container listens on. The CF tunnel routes to this port."
          placeholder="9119"
          value={values.upstreamPort}
          onChange={(v) => handleChange("upstreamPort", v)}
          type="number"
          required
        />
      </fieldset>

      {/* Secrets checklist */}
      {secrets.length > 0 && (
        <div className="rounded-lg border border-border bg-elevated/50 p-4 space-y-3">
          <div className="flex gap-2 items-start">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="text-xs font-medium text-text-primary">
                Required Doppler secrets
              </p>
              <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                These secrets must be present in the Doppler project before
                installing. The wizard validates them when you click &quot;Review&quot;.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {requiredSecrets.map((s) => (
              <SecretItem key={s.name} secret={s} />
            ))}
            {optionalSecrets.length > 0 && (
              <>
                <p className="pt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Optional
                </p>
                {optionalSecrets.map((s) => (
                  <SecretItem key={s.name} secret={s} optional />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90"
      >
        Review deployment plan
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}

/* ── Summary screen ──────────────────────────────────────────────────────── */

function Summary({
  values,
  moduleName,
  moduleVersion,
  requiredSecrets,
  optionalSecrets,
  isPending,
  result,
  onBack,
  onConfirm,
}: {
  values: FormValues;
  moduleName: string;
  moduleVersion: string;
  requiredSecrets: SecretDef[];
  optionalSecrets: SecretDef[];
  isPending: boolean;
  result: ActionResult | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const rows = [
    { label: "Module", value: `${moduleName} v${moduleVersion}` },
    { label: "Instance ID", value: values.instanceId },
    { label: "Public domain", value: values.domain },
    { label: "Doppler project", value: `${values.dopplerProject} / ${values.dopplerConfig}` },
    {
      label: "Access emails",
      value: values.accessEmails || "(inherits admin emails from settings)",
    },
  ];

  const willProvision = [
    `DNS CNAME: ${values.domain} → tunnel`,
    `Tunnel ingress: ${values.domain} → ${values.instanceId}-ui:${values.upstreamPort}`,
    `CF Access app + policy for ${values.domain}`,
    "Login branding",
    `Volume: ${values.instanceId}-data`,
    `Containers: ${values.instanceId}, ${values.instanceId}-ui`,
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Deployment Summary
        </p>
        <h1 className="text-2xl font-semibold text-text-primary">
          Review &amp; Confirm
        </h1>
        <p className="text-sm text-text-secondary">
          Nothing has been changed yet. Review the plan below then click
          &quot;Deploy&quot; to start the installation.
        </p>
      </div>

      {result && !result.success && (
        <div className="flex gap-2 rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-error" />
          <p className="text-xs text-status-error leading-relaxed">
            {result.error}
          </p>
        </div>
      )}

      {/* Config table */}
      <div className="rounded-xl border border-border bg-elevated/50 divide-y divide-border overflow-hidden">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-start gap-4 px-4 py-3"
          >
            <span className="w-36 shrink-0 text-xs text-text-muted">{label}</span>
            <span className="font-mono text-xs text-text-primary break-all">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* What will be provisioned */}
      <div className="rounded-lg border border-border bg-elevated/40 p-4 space-y-2">
        <p className="text-xs font-medium text-text-primary">Will be provisioned</p>
        <ul className="space-y-1">
          {willProvision.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-status-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Secrets validation note */}
      {requiredSecrets.length > 0 && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-1">
          <p className="text-xs font-medium text-text-primary">
            Doppler secret validation
          </p>
          <p className="text-xs text-text-muted">
            The installer will validate that the following secrets are present
            in <span className="font-mono">{values.dopplerProject}/{values.dopplerConfig}</span>{" "}
            before starting. If any are missing the install will abort with a clear error.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...requiredSecrets, ...optionalSecrets].map((s) => (
              <span
                key={s.name}
                className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${
                  s.required
                    ? "bg-accent/10 text-accent"
                    : "bg-surface text-text-muted border border-border"
                }`}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-all hover:bg-elevated disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting install…
            </>
          ) : (
            "Deploy"
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Shared sub-components ───────────────────────────────────────────────── */

function Field({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
  required,
  type = "text",
  pattern,
}: {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: "text" | "number";
  pattern?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ml-1 text-status-error">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
      />
      <p className="text-xs text-text-muted leading-relaxed">{hint}</p>
    </div>
  );
}

function SecretItem({
  secret,
  optional,
}: {
  secret: SecretDef;
  optional?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center ${
          optional
            ? "border-border"
            : "border-accent/40 bg-accent/10"
        }`}
      >
        {!optional && (
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-text-primary">
            {secret.name}
          </span>
          {secret.howToGetUrl && (
            <a
              href={secret.howToGetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-[11px] text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Get key
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          {secret.description}
        </p>
      </div>
    </div>
  );
}
