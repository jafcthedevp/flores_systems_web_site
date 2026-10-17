import { cp, mkdir } from 'node:fs/promises';
await mkdir('public', { recursive: true });
for (const [source, target] of [
  ['styles.css', 'styles.css'],
  ['scripts/legacy/script.js', 'script.js'],
  ['img', 'img'],
]) {
  await cp(source, `public/${target}`, { recursive: true });
}
