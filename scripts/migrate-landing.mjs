// Migración mecánica inicial. Los originales quedan como referencia visual.
import { readFileSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const dir = new URL('src/components/landing/', root);
mkdirSync(dir, { recursive: true });
mkdirSync(new URL('public/img/', root), { recursive: true });
mkdirSync(new URL('src/app/', root), { recursive: true });
for (const name of readdirSync(new URL('img/', root))) if (name.endsWith('_nobg.png')) copyFileSync(new URL(`img/${name}`, root), new URL(`public/img/${name}`, root));
const cssTarget = new URL('src/app/landing.css', root);
if (!existsSync(cssTarget)) copyFileSync(new URL('styles.css', root), cssTarget);
function jsx(text) {
  return text.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}').replace(/class=/g, 'className=').replace(/\.\/img\//g, '/img/').replace(/<img\b/g, '<Image').replace(/fetchpriority="high"/g, 'preload sizes="(max-width: 800px) 88vw, 620px"').replace(/(<Image[^>]+)(?<!\/)\s*>/g, '$1 />');
}
const sections = [...html.matchAll(/<section\b[\s\S]*?<\/section>/g)].map(m => m[0]);
for (const [name, index] of [['hero', 0], ['solutions', 1], ['sectors', 2], ['principles', 4], ['about', 5]]) {
  const component = name[0].toUpperCase() + name.slice(1);
  let content = jsx(sections[index]);
  if (name === 'hero') content = content.replace(/href="https:\/\/wa.me\/[^"]+"\s+target="_blank"\s+rel="noopener noreferrer"/, 'href="#contacto"').replace('Cuéntame tu idea', 'Solicitar cotización');
  writeFileSync(new URL(`${name}.tsx`, dir), `${content.includes('<Image') ? 'import Image from "next/image";\n' : ''}export function ${component}() { return (${content}); }\n`);
}
const marquee = html.match(/<!-- TODO para el próximo plan: tomar[\s\S]*?(?=\s*<section class="solutions)/)[0];
writeFileSync(new URL('marquee.tsx', dir), `export function Marquee() { return (<>${jsx(marquee)}</>); }\n`);
writeFileSync(new URL('motion-content.tsx', dir), `import { MotionInteractions } from './motion-interactions';\nexport function MotionContent() { return (<MotionInteractions>${jsx(sections[3])}</MotionInteractions>); }\n`);
