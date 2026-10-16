import { existsSync } from 'node:fs';
export const projectRef = 'shonvjevhinvllfjndbq';
export function loadBackendEnv() {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
}
export function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta configurar ${name}.`);
  return value;
}
export function projectUrl() {
  const url = new URL(required('NEXT_PUBLIC_SUPABASE_URL'));
  if (url.protocol !== 'https:' || url.hostname !== `${projectRef}.supabase.co`) throw new Error('El entorno no apunta al proyecto flores_systems esperado.');
  return url;
}
