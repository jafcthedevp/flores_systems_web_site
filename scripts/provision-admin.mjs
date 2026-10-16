import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { loadBackendEnv, projectUrl, required } from './backend-env.mjs';
loadBackendEnv();
try {
  const url = projectUrl();
  const secret = required('SUPABASE_SECRET_KEY');
  if (!secret.startsWith('sb_secret_')) throw new Error('Configura una secret key moderna, exclusiva del servidor.');
  const email = z.email().parse(required('ADMIN_EMAIL').toLowerCase());
  const settingsResponse = await fetch(new URL('/auth/v1/settings',url), { headers: { apikey: required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') }, signal: AbortSignal.timeout(10000) });
  if (!settingsResponse.ok || (await settingsResponse.json()).disable_signup !== true) throw new Error('Desactiva primero el registro público en Supabase Auth.');
  const client = createClient(url.href,secret,{ auth: { persistSession: false,autoRefreshToken: false } });
  let user;
  for (let page = 1; page <= 20; page++) {
    const { data,error } = await client.auth.admin.listUsers({ page,perPage: 100 });
    if (error) throw new Error('No se pudieron consultar los usuarios de Auth.');
    user = data.users.find(candidate => candidate.email?.toLowerCase() === email);
    if (user || data.users.length < 100) break;
  }
  if (!user) {
    if (!process.argv.includes('--invite')) throw new Error('La cuenta no existe. Usa --invite después de configurar SMTP y la plantilla de invitación.');
    const { data,error } = await client.auth.admin.inviteUserByEmail(email, { redirectTo: new URL('/auth/confirm',required('APP_URL')).href });
    if (error || !data.user) throw new Error('No se pudo enviar la invitación; revisa SMTP y la cuenta.');
    user = data.user;
  }
  const { error } = await client.from('admin_users').upsert({ user_id: user.id },{ onConflict: 'user_id' });
  if (error) throw new Error('No se pudo autorizar la cuenta. Si fue invitada, repite sin --invite cuando se resuelva el error.');
  console.log(`Cuenta administradora habilitada: ${user.id}`);
} catch (error) { console.error(error instanceof z.ZodError ? 'ADMIN_EMAIL no es válido.' : error.message); process.exitCode = 1; }
