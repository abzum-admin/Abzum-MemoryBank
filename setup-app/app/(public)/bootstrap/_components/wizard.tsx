"use client";
import { useState } from "react";
import { StepToken } from "./step-token";
import { StepDoppler } from "./step-doppler";
import { StepSecrets } from "./step-secrets";
import { StepDomain } from "./step-domain";
import { StepReady } from "./step-ready";
import type { BootstrapState } from "../actions";

/**
 * Client wizard shell — manages which step to display and passes
 * callbacks for step completion. Initial step comes from the server
 * (pre-computed from DB state) so refreshes land on the right step.
 */
export function BootstrapWizard({ initial }: { initial: BootstrapState }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(initial.currentStep);
  const [dopplerProject, setDopplerProject] = useState(initial.savedProject);
  const [dopplerConfig, setDopplerConfig] = useState(initial.savedConfig);
  const [domain, setDomain] = useState(initial.savedDomain);

  return (
    <>
      {step === 1 && (
        <StepToken onSuccess={() => setStep(2)} />
      )}
      {step === 2 && (
        <StepDoppler
          defaultProject={dopplerProject}
          defaultConfig={dopplerConfig}
          onSuccess={(project, config) => {
            setDopplerProject(project);
            setDopplerConfig(config);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <StepSecrets
          onSuccess={() => setStep(4)}
          dopplerProjectHint={
            dopplerProject && dopplerConfig
              ? `${dopplerProject} / ${dopplerConfig}`
              : undefined
          }
        />
      )}
      {step === 4 && (
        <StepDomain
          defaultDomain={domain}
          onSuccess={(d) => {
            setDomain(d);
            setStep(5);
          }}
        />
      )}
      {step === 5 && <StepReady domain={domain} />}
    </>
  );
}
