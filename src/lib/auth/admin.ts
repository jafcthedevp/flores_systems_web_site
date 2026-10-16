import 'server-only';
import { cache } from 'react';
import { createSessionClient } from '@/lib/supabase/server';
export const getAdmin = cache(async () => {
  const client = await createSessionClient();
  // getUser valida las credenciales en Auth; no confiar en getSession.
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data, error: denied } = await client.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (denied || !data) return null;
  return { client, user };
});
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error('UNAUTHORIZED');
  return admin;
}
