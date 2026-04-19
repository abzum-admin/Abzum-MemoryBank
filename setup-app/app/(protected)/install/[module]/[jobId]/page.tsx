import { notFound } from "next/navigation";
import { Topbar } from "@/components/shell/topbar";
import { getJob } from "@/lib/jobs";
import { MODULES } from "@/modules/index";
import { ProgressStream } from "./_components/progress-stream";

interface Props {
  params: Promise<{ module: string; jobId: string }>;
}

/**
 * Install progress page — subscribes to the job's SSE stream and renders
 * live step-by-step progress.
 *
 * The page is server-rendered once to get the initial job snapshot (for
 * fast first paint and SEO). The client component takes over and subscribes
 * to the SSE stream for live updates.
 */
export default async function InstallProgressPage({ params }: Props) {
  const { module: moduleId, jobId } = await params;

  const mod = MODULES[moduleId];
  if (!mod) notFound();

  const job = getJob(jobId);
  if (!job) notFound();

  return (
    <div className="flex flex-col">
      <Topbar
        title={`Installing ${mod.name}`}
        description={`Instance: ${job.instanceId}`}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl">
          <ProgressStream
            jobId={jobId}
            moduleId={moduleId}
            moduleName={mod.name}
            instanceId={job.instanceId}
            initialSteps={job.steps}
            initialStatus={job.status}
            initialPublicUrl={job.publicUrl}
          />
        </div>
      </div>
    </div>
  );
}
