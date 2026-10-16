import 'server-only';
export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta configurar ${name}`);
  return value;
}
export function publicSupabaseEnv() {
  return { url: requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), key: requiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') };
}
