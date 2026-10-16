import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
try {
  const publishable = process.argv[2] ?? '';
  if (publishable && !publishable.startsWith('sb_publishable_')) throw new Error('Usa una clave publishable moderna.');
  const source = await readFile('.env.example', 'utf8');
  const output = source
    .replace(/^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=.*$/m, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable}`)
    .replace(/^RATE_LIMIT_HMAC_SECRET=.*$/m, `RATE_LIMIT_HMAC_SECRET=${randomBytes(32).toString('hex')}`)
    .replace(/^NOTIFICATION_CRON_SECRET=.*$/m, `NOTIFICATION_CRON_SECRET=${randomBytes(32).toString('hex')}`);
  await writeFile('.env.local', output, { flag: 'wx', mode: 0o600 });
  console.log('Creado .env.local. Secretos generados sin mostrarlos. Completa las credenciales pendientes.');
} catch (error) {
  console.error(error.code === 'EEXIST' ? '.env.local ya existe; se conservó su contenido.' : error.message);
  process.exitCode = error.code === 'EEXIST' ? 0 : 1;
}
