import { subscribeToJob } from "@/lib/jobs";

/**
 * GET /api/jobs/[id]/events
 *
 * Server-Sent Events endpoint for a job's progress stream.
 *
 * - Replays the full event history immediately (safe for late joiners / refreshes).
 * - Streams new events as they arrive until the job reaches a terminal state.
 * - Closes the stream when the client disconnects (request.signal abort).
 *
 * Event format (each chunk):
 *   data: <JSON JobEvent>\n\n
 *
 * Example client usage:
 * ```ts
 * const es = new EventSource(`/api/jobs/${jobId}/events`);
 * es.onmessage = (e) => {
 *   const event = JSON.parse(e.data);
 *   // event.type: "step:start" | "step:log" | "step:done" | "step:fail" |
 *   //             "step:skip" | "job:done" | "job:fail"
 * };
 * ```
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: jobId } = await params;

  const stream = subscribeToJob(jobId, request.signal);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      // Disable Next.js response buffering so chunks reach the client immediately.
      "X-Accel-Buffering": "no",
    },
  });
}

// Opt out of Next.js static generation — this is a dynamic streaming endpoint.
export const dynamic = "force-dynamic";
