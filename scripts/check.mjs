// Pre-deployment checks for the static site. Usage: npm run check
// Verifies in-page anchors, local file references, duplicate IDs,
// form labels, required SEO tags and leftover placeholder text.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../public', import.meta.url)));
const problems = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

const exists = (p) => stat(p).then(() => true, () => false);
const files = await walk(root);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const textFiles = files.filter((f) => /\.(html|css|js|txt)$/.test(f));

for (const file of htmlFiles) {
  const rel = file.slice(root.length + 1);
  const html = await readFile(file, 'utf8');
  const body = html.replace(/<!--[\s\S]*?-->/g, '');

  // IDs
  const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) fail(rel, `duplicate id "${id}"`);
    seen.add(id);
  }

  // In-page anchors and sprite references
  for (const [, ref] of body.matchAll(/\shref="#([^"]*)"/g)) {
    if (!ref || !seen.has(ref)) fail(rel, `link to missing anchor "#${ref}"`);
  }

  // Local files referenced by href/src
  for (const [, attr, url] of body.matchAll(/\s(href|src)="([^"#][^"]*)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    const target = url.startsWith('/') ? join(root, url) : join(dirname(file), url);
    const path = target.split('?')[0];
    const ok = (await exists(path)) || (await exists(join(path, 'index.html')));
    if (!ok) fail(rel, `${attr} points to missing file "${url}"`);
  }

  // Images need alt text
  for (const [tag] of body.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) fail(rel, `image without alt: ${tag}`);
  }

  // Every form control has a label
  for (const [, id] of body.matchAll(/<(?:input|select|textarea)\b[^>]*\sid="([^"]+)"/g)) {
    if (!body.includes(`for="${id}"`)) fail(rel, `form control #${id} has no <label for>`);
  }

  // SEO basics
  if (!/<html lang="[a-z-]+"/i.test(body)) fail(rel, 'missing <html lang>');
  if (!/<title>[^<]{10,}<\/title>/.test(body)) fail(rel, 'missing or short <title>');
  if (!/<meta name="description" content="[^"]{50,}"/.test(body)) fail(rel, 'missing or short meta description');
  if (!/<meta name="viewport"/.test(body)) fail(rel, 'missing viewport meta');
  if ((body.match(/<h1[\s>]/g) || []).length !== 1) fail(rel, 'page should have exactly one <h1>');
}

// Leftover template / placeholder text
const banned = /lorem ipsum|dolor sit amet|\bTODO\b|\bFIXME\b|example\.com|your-company/i;
for (const file of textFiles) {
  const text = await readFile(file, 'utf8');
  const m = text.match(banned);
  if (m) fail(file.slice(root.length + 1), `placeholder text found: "${m[0]}"`);
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) found:\n  - ` + problems.join('\n  - '));
  process.exit(1);
}
console.log(`✓ All checks passed (${htmlFiles.length} HTML pages, ${files.length} files).`);
