// Inline every local stylesheet and script from index.html into single files:
//   dist/the-long-table.html  — a complete standalone document
//   dist/artifact.html        — the same, without the document skeleton (for claude.ai Artifacts)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const read = (p) => readFileSync(join(root, p), 'utf8');

const css = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">/g)].map((m) => `/* ${m[1]} */\n` + read(m[1])).join('\n');
const js = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map((m) => `/* ${m[1]} */\n` + read(m[1])).join('\n;\n');
const safeJs = js.replace(/<\/script/gi, '<\\/script');
const fonts = html.match(/<link rel="preconnect"[^>]*>\s*<link rel="preconnect"[^>]*>\s*<link rel="stylesheet" href="https:\/\/fonts[^>]*>/)[0];
const title = html.match(/<title>[^<]*<\/title>/)[0];
const cdn = [...html.matchAll(/<script src="https:[^"]+"><\/script>/g)].map((m) => m[0]).join('\n');
const desc = html.match(/<meta name="description"[^>]*>/)[0];

const inner = `${title}
${desc}
${fonts}
<style>
${css}
</style>
<div id="app"></div>
${cdn}
<script>
${safeJs}
</script>
`;
const full = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#15110c">
${inner.replace('<div id="app"></div>', '</head>\n<body>\n<div id="app"></div>')}</body>
</html>
`;
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/the-long-table.html'), full);
writeFileSync(join(root, 'dist/artifact.html'), inner);
console.log(`built: ${(full.length / 1024).toFixed(1)} KB`);
