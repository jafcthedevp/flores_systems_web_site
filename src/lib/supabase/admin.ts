import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { publicSupabaseEnv, requiredEnv } from '@/lib/env';
import type { Database } from './database.types';
// Solo recepción controlada y aprovisionamiento; las operaciones CRM usan la sesión.
export function createPrivilegedClient() {
  const { url } = publicSupabaseEnv();
  return createClient<Database>(url, requiredEnv('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}
