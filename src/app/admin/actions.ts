'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { contactSchema, followupSchema, SOURCES } from '@/lib/contracts/quote-requests';
import type { Database } from '@/lib/supabase/database.types';
type Result = { ok: true; data?: unknown } | { ok: false; code: 'invalid' | 'unauthorized' | 'conflict' | 'unavailable' };
type AdminFunctions = Pick<Database['public']['Functions'], 'update_quote_request' | 'add_request_note' | 'create_manual_request' | 'retry_notification'>;
async function runRpc<N extends keyof AdminFunctions>(name: N, args: AdminFunctions[N]['Args']): Promise<Result> {
  try {
    const { client } = await requireAdmin();
    const { data, error } = await client.rpc(name, args);
    if (error) return { ok: false, code: error.code === '40001' ? 'conflict' : error.code === '42501' ? 'unauthorized' : 'unavailable' };
    revalidatePath('/admin');
    return { ok: true, data };
  } catch (e) { return { ok: false, code: e instanceof Error && e.message === 'UNAUTHORIZED' ? 'unauthorized' : 'unavailable' }; }
}
export async function updateRequest(input: unknown): Promise<Result> {
  const parsed = followupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: 'invalid' };
  return runRpc('update_quote_request', { p_input: parsed.data });
}
export async function addNote(input: unknown): Promise<Result> {
  const parsed = z.object({ request_id: z.uuid(), body: z.string().trim().min(1).max(4000) }).strict().safeParse(input);
  if (!parsed.success) return { ok: false, code: 'invalid' };
  return runRpc('add_request_note', { p_request_id: parsed.data.request_id, p_body: parsed.data.body });
}
export async function createManualRequest(input: unknown): Promise<Result> {
  const parsed = contactSchema.extend({ source: z.enum(SOURCES).exclude(['formulario_web']) }).strict().safeParse(input);
  if (!parsed.success) return { ok: false, code: 'invalid' };
  return runRpc('create_manual_request', { p_input: parsed.data });
}
export async function retryNotification(input: unknown): Promise<Result> {
  const parsed = z.uuid().safeParse(input);
  if (!parsed.success) return { ok: false, code: 'invalid' };
  return runRpc('retry_notification', { p_job_id: parsed.data });
}
