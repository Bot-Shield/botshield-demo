// Every demo page is an HTML template literal with inline <script>s. A stray
// escape in the TypeScript source (a `\n` that should have been `\\n`) emits a
// broken script and kills the whole page silently — Link and Send went dead on
// /agent and /flights on 2026-10-08 that way. This parses every emitted inline
// script with Node before a deploy.
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const pages: Record<string, string> = {
  shell: (await import("../src/shell")).shellHtml(),
  ticketz: (await import("../src/pages/ticketz")).ticketzHtml,
  vapez: (await import("../src/pages/vapez")).vapezHtml,
  agent: (await import("../src/pages/agent")).agentHtml,
  flights: (await import("../src/pages/agent")).flightsHtml,
  trusted: (await import("../src/pages/trusted")).trustedHtml,
  signup: (await import("../src/pages/signup")).signupHtml,
  drop: (await import("../src/pages/drop")).dropHtml,
  firm: (await import("../src/pages/firm")).firmHtml,
};

const dir = mkdtempSync(join(tmpdir(), "pagecheck-"));
let failed = 0;
let checked = 0;
for (const [name, html] of Object.entries(pages)) {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((s) => s.trim());
  scripts.forEach((src, i) => {
    const f = join(dir, `${name}-${i}.js`);
    writeFileSync(f, src);
    const r = spawnSync(process.execPath, ["--check", f], { encoding: "utf8" });
    checked++;
    if (r.status !== 0) {
      failed++;
      console.error(`✗ ${name} <script #${i}> does not parse:\n${r.stderr.split("\n").slice(0, 6).join("\n")}`);
    }
  });
}
rmSync(dir, { recursive: true, force: true });
if (failed) { console.error(`\n${failed} of ${checked} inline scripts failed to parse.`); process.exit(1); }
console.log(`✓ ${checked} inline scripts across ${Object.keys(pages).length} pages parse.`);
