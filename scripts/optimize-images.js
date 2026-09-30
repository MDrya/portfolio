// Optimises everything in public/images so it meets the size budgets:
//   - downscales oversized images (covers to 1920px wide, gallery to 1800px, thumbs to 200px)
//   - re-encodes the JPG (kept only when it gets smaller) — this is the fallback format
//   - writes a .webp next to it, which the site prefers when it exists
//   - records which images have a WebP in src/data/webp.json
//
// Run it after adding or replacing photos:
//
//   npm run images
//
// Safe to run repeatedly. Originals are overwritten only by a smaller file, so keep your
// full-resolution masters somewhere else.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(root, 'public', 'images');
const manifestPath = path.join(root, 'src', 'data', 'webp.json');

const KB = 1024;
const rules = [
  { test: /cover-thumb\.(jpe?g|png)$/i, kind: 'thumb', maxWidth: 200, budget: 30 * KB },
  { test: /cover\.(jpe?g|png)$/i, kind: 'cover', maxWidth: 1920, budget: 400 * KB },
  { test: /og\.(jpe?g|png)$/i, kind: 'og', maxWidth: 1200, budget: 300 * KB, webp: false }, // social cards want JPG
  { test: /\.(jpe?g|png)$/i, kind: 'gallery', maxWidth: 1800, budget: 300 * KB },
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const kb = (bytes) => `${(bytes / KB).toFixed(0)}KB`;

const manifest = [];
const overBudget = [];
let savedBytes = 0;

for (const file of walk(imagesDir).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const rule = rules.find((r) => r.test.test(file));
  const url = '/' + path.relative(path.join(root, 'public'), file).split(path.sep).join('/');
  const original = fs.readFileSync(file);
  const isPng = /\.png$/i.test(file);

  const base = () =>
    sharp(original).rotate().resize({ width: rule.maxWidth, withoutEnlargement: true });

  // fallback format, only replaced when the result is actually smaller
  const fallback = isPng
    ? await base().png({ compressionLevel: 9, palette: true }).toBuffer()
    : await base().jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  let fallbackSize = original.length;
  if (fallback.length < original.length) {
    fs.writeFileSync(file, fallback);
    savedBytes += original.length - fallback.length;
    fallbackSize = fallback.length;
  }

  let webpSize = null;
  if (rule.webp !== false) {
    const webp = await base().webp({ quality: 78, effort: 5 }).toBuffer();
    // a WebP that isn't smaller is pointless — serve the fallback instead
    const webpFile = file.replace(/\.(jpe?g|png)$/i, '.webp');
    if (webp.length < fallbackSize) {
      fs.writeFileSync(webpFile, webp);
      webpSize = webp.length;
      manifest.push(url);
    } else if (fs.existsSync(webpFile)) {
      fs.rmSync(webpFile);
    }
  }

  const served = webpSize ?? fallbackSize;
  if (served > rule.budget) overBudget.push(`${url} — ${kb(served)} (budget ${kb(rule.budget)})`);
  console.log(
    `${rule.kind.padEnd(7)} ${url.padEnd(44)} ${kb(original.length).padStart(7)} → ${kb(fallbackSize).padStart(6)}` +
      (webpSize ? `  webp ${kb(webpSize).padStart(6)}` : '')
  );
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest.sort(), null, 2) + '\n');

console.log(`\n${manifest.length} WebP files listed in src/data/webp.json; fallback files shrank by ${kb(savedBytes)} in total.`);
if (overBudget.length) {
  console.log(`\nOver budget (${overBudget.length}):\n  ${overBudget.join('\n  ')}`);
  process.exitCode = 1;
} else {
  console.log('Every image is within its size budget.');
}
