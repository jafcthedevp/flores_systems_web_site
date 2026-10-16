import { timingSafeEqual } from 'node:crypto';
export type Message = { from: string; to: string[]; subject: string; html: string };
export type Job = { id: string; lease_token: string; payload: Message };
export type ProcessorDependencies = {
  claim: () => Promise<Job[]>;
  send: (message: Message, idempotencyKey: string) => Promise<{ id: string } | { error: string }>;
  finish: (job: Job, providerId: string | null, errorCode: string | null) => Promise<boolean>;
};
export function validSchedulerSecret(received: string | null, expected: string | undefined) {
  if (!expected || expected.length < 32 || expected.startsWith('sb_') || !received) return false;
  const a = new TextEncoder().encode(received), b = new TextEncoder().encode(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function processNotifications(deps: ProcessorDependencies) {
  const jobs = await deps.claim();
  let accepted = 0, failed = 0, unresolved = 0;
  // Lote pequeño y secuencial para acotar cuota, memoria y duración de la función.
  for (const job of jobs) {
    let providerId: string | null = null, errorCode: string | null = null;
    try {
      const result = await deps.send(job.payload, `quote-notice/${job.id}`);
      if ('id' in result) providerId = result.id;
      else errorCode = 'provider_rejected';
    } catch { errorCode = 'provider_unavailable'; }
    try {
      const finished = await deps.finish(job, providerId, errorCode);
      if (!finished) unresolved++;
      else if (providerId) accepted++;
      else failed++;
    } catch { unresolved++; }
  }
  return { claimed: jobs.length, accepted, failed, unresolved };
}
