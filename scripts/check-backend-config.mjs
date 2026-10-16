import { loadBackendEnv, projectUrl, required } from './backend-env.mjs';
loadBackendEnv();
const problems = [];
const check = (label, run) => { try { run(); console.log(`OK ${label}`); } catch (error) { problems.push(label); console.error(`PENDIENTE ${label}: ${error.message}`); } };
check('proyecto Supabase', projectUrl);
for (const [name,prefix] of [['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','sb_publishable_'],['SUPABASE_SECRET_KEY','sb_secret_']]) {
  check(name, () => { if (!required(name).startsWith(prefix)) throw new Error('Usa una clave moderna del proyecto.'); });
}
for (const name of ['RATE_LIMIT_HMAC_SECRET','NOTIFICATION_CRON_SECRET']) {
  check(name, () => { const value = required(name); if (value.length < 32 || value.startsWith('sb_')) throw new Error('Usa un secreto privado aleatorio de al menos 32 caracteres.'); });
}
for (const name of ['NOTIFICATION_TO','NOTIFICATION_FROM']) check(name, () => { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(required(name))) throw new Error('Configura una dirección de correo válida.'); });
check('RESEND_API_KEY', () => { if (!required('RESEND_API_KEY').startsWith('re_')) throw new Error('Configura la clave de envío de Resend.'); });
check('APP_URL', () => {
  const url = new URL(required('APP_URL'));
  if (url.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('Usa HTTPS fuera del desarrollo local.');
  if (process.argv.includes('--production') && url.protocol !== 'https:') throw new Error('Producción requiere el dominio HTTPS definitivo.');
});
check('TRUSTED_IP_HEADER', () => { if (!/^[a-z0-9-]+$/i.test(required('TRUSTED_IP_HEADER'))) throw new Error('Configura el encabezado sobrescrito por el proxy del hosting.'); });
console.log(process.env.QUOTE_RATE_LIMIT_ENABLED === 'true' ? 'Recepción habilitada por configuración; verificar flujo real antes de publicar.' : 'Recepción pública deshabilitada.');
if (problems.length) process.exitCode = 1;
