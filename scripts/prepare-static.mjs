import { cp, mkdir } from 'node:fs/promises';
await mkdir('public', { recursive: true });
for (const file of ['styles.css', 'script.js', 'img']) {
  await cp(file, `public/${file}`, { recursive: true });
}
