// Parse-checks every inline <script> of every demo page BEFORE a deploy.
// The pages are TypeScript template literals, which silently eat single
// backslashes (`\/` → `/`), so a regex like /^https:\/\/x/ becomes a `//`
// comment and the whole page script dies (Agents Ask stuck on "Connecting…",
// 2026-09-29). Build each page the way the worker does, then new Function().
import { build } from 'esbuild';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const out = mkdtempSync(join(tmpdir(), 'demo-pages-'));
const pages = readdirSync('src/pages').filter((f) => f.endsWith('.ts'));
let bad = 0;
for (const f of [...pages.map((p) => `src/pages/${p}`), 'src/shell.ts']) {
  const file = join(out, f.replace(/\W/g, '_') + '.cjs');
  await build({ entryPoints: [f], bundle: true, format: 'cjs', platform: 'node', outfile: file, logLevel: 'error' });
  const mod = require(file);
  for (const [name, val] of Object.entries(mod)) {
    const html = typeof val === 'function' ? (() => { try { return val(); } catch { return ''; } })() : val;
    if (typeof html !== 'string' || !html.includes('<script')) continue;
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    scripts.forEach((src, i) => {
      try { new Function(src); } catch (e) { bad++; console.error(`✘ ${f} ${name} script #${i}: ${e.message}`); }
    });
    console.log(`✓ ${f} ${name}: ${scripts.length} inline script(s)`);
  }
}
if (bad) { console.error(`${bad} broken page script(s) — not deploying`); process.exit(1); }
