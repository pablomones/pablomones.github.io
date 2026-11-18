// Revisa los links internos del sitio ya compilado (dist/): cada dirección y cada #ancla tienen que existir.
// Uso: npm run links (después de npm run build).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const BASE = '/'; // igual que `base` en astro.config.mjs

if (!existsSync(DIST)) {
  console.error('No existe dist/. Corré primero npm run build.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) htmlFiles.push(path);
  }
})(DIST);

const pageUrl = (file) => {
  const rel = relative(DIST, file).split(sep).join('/');
  return BASE + rel.replace(/(^|\/)index\.html$/, '$1');
};

const idsByPage = new Map();
const sources = new Map();
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  sources.set(file, html);
  idsByPage.set(pageUrl(file), new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

function resolveTarget(path) {
  const clean = decodeURIComponent(path.slice(BASE.length));
  const candidates = [join(DIST, clean), join(DIST, clean, 'index.html')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}

const problems = [];
let checked = 0;
for (const [file, html] of sources) {
  const from = pageUrl(file);
  for (const m of html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)) {
    for (const raw of m[1].split(',').map((s) => s.trim().split(/\s+/)[0])) {
      if (!raw || /^(https?:|mailto:|tel:|data:|\/\/)/.test(raw)) continue;
      checked++;
      const [pathPart, hash] = raw.split('#');
      const path = pathPart === '' ? from : pathPart;
      if (!path.startsWith('/')) {
        problems.push(`${from}: link relativo "${raw}" (usá una dirección que empiece con /)`);
        continue;
      }
      const target = resolveTarget(path);
      if (!target) {
        problems.push(`${from}: "${raw}" no existe`);
        continue;
      }
      if (hash) {
        const ids = idsByPage.get(pageUrl(target));
        if (ids && !ids.has(decodeURIComponent(hash))) problems.push(`${from}: el ancla "#${hash}" no existe en ${path}`);
      }
    }
  }
}

if (problems.length) {
  console.error(`Links internos rotos (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`Links internos OK: ${checked} links en ${htmlFiles.length} páginas.`);
