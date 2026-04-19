import { notFound } from "next/navigation";
import { Topbar } from "@/components/shell/topbar";
import { getJob } from "@/lib/jobs";
import { UninstallProgressStream } from "./_components/uninstall-progress-stream";

interface Props {
  params: Promise<{ id: string; jobId: string }>;
}

/**
 * Uninstall progress page — live view of the uninstall job steps.
 */
export default async function UninstallProgressPage({ params }: Props) {
  const { id: instanceId, jobId } = await params;

  const job = getJob(jobId);
  if (!job) notFound();

  return (
    <div className="flex flex-col">
      <Topbar
        title={`Uninstalling ${instanceId}`}
        description="Removing service and all associated resources"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl">
          <UninstallProgressStream
            jobId={jobId}
            instanceId={instanceId}
            initialSteps={job.steps}
            initialStatus={job.status}
          />
        </div>
      </div>
    </div>
  );
}
