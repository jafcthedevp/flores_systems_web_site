'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSessionClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { requiredEnv } from '@/lib/env';
export async function signIn(form: FormData) {
  const parsed = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) }).safeParse(Object.fromEntries(form));
  let permitted = false;
  if (parsed.success) {
    try {
      const client = await createSessionClient();
      const { data, error } = await client.auth.signInWithPassword(parsed.data);
      if (!error && data.user) {
        const admin = await client.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
        permitted = !!admin.data && !admin.error;
      }
      if (!permitted) await client.auth.signOut();
    } catch { /* Respuesta genérica: no revelar existencia de cuentas ni configuración. */ }
  }
  redirect(permitted ? '/admin' : '/admin/login?error=credentials');
}
export async function signOut() {
  const client = await createSessionClient();
  await client.auth.signOut();
  redirect('/admin/login');
}
export async function requestPasswordReset(form: FormData) {
  const email = z.email().max(254).safeParse(form.get('email'));
  if (email.success) {
    try {
      const client = await createSessionClient();
      const base = new URL(requiredEnv('APP_URL'));
      await client.auth.resetPasswordForEmail(email.data, { redirectTo: new URL('/auth/callback', base).href });
    } catch { console.error('password_reset_unavailable'); }
  }
  redirect('/admin/login?reset=requested');
}
export async function changePassword(form: FormData) {
  const parsed = z.string().min(12).max(128).safeParse(form.get('password'));
  const { client } = await requireAdmin();
  if (!parsed.success) redirect('/admin/restablecer?error=invalid');
  const { error } = await client.auth.updateUser({ password: parsed.data });
  if (error) redirect('/admin/restablecer?error=unavailable');
  await client.auth.signOut({ scope: 'global' });
  redirect('/admin/login?reset=done');
}
