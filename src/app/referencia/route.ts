import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
export const dynamic = 'force-static';
// Referencia conservada de la landing original; la portada usa page.tsx.
export async function GET() {
  const html = await readFile(join(process.cwd(), 'index.html'), 'utf8');
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' } });
}
