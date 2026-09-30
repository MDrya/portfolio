// Generates placeholder JPGs for every image referenced in src/data/projects.js.
// Existing files are left alone, so real photos you drop in are never overwritten.
//
//   npm run placeholders            # only missing files
//   npm run placeholders -- --force # regenerate everything

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jpeg from 'jpeg-js';
import { projects } from '../src/data/projects.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const force = process.argv.includes('--force');

const COVER = { w: 1920, h: 1200 };
const THUMB = { w: 200, h: 125 };
const OG = { w: 1200, h: 630 };

const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const shade = (c, k) => c.map((v) => v * k);
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const smooth = (e0, e1, x) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

// Cheap deterministic grain, so gradients don't band after JPEG compression.
const grain = (x, y, seed) => {
  const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 6;
};

/**
 * Paints a soft "interior" placeholder: diagonal gradient between two colours,
 * a light pool, a window-like rectangle and a vignette. Everything is expressed
 * in normalised coordinates so the same look renders at any size.
 */
function paint(w, h, from, to, seed) {
  const data = Buffer.alloc(w * h * 4);
  const aspect = w / h;
  const lx = 0.3 + (seed % 5) * 0.1; // light pool position varies per image
  const ly = 0.35 + (seed % 3) * 0.1;

  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);

      let c = mix(from, to, smooth(0, 1, u * 0.55 + v * 0.45));

      // light pool
      const dx = (u - lx) * aspect;
      const dy = v - ly;
      const light = Math.exp(-(dx * dx + dy * dy) * 3.2);
      c = mix(c, shade(from, 1.25), light * 0.35);

      // window rectangle, centred — handy for checking cover cropping later
      const inX = Math.abs(u - 0.5) < 0.12 / aspect * 1.6;
      const inY = Math.abs(v - 0.5) < 0.2;
      if (inX && inY) c = mix(c, shade(from, 1.35), 0.25);

      // vignette
      const r = Math.hypot((u - 0.5) * 1.2, v - 0.5);
      c = shade(c, 1 - smooth(0.35, 0.95, r) * 0.45);

      const g = grain(x, y, seed);
      const i = (y * w + x) * 4;
      data[i] = clamp(c[0] + g);
      data[i + 1] = clamp(c[1] + g);
      data[i + 2] = clamp(c[2] + g);
      data[i + 3] = 255;
    }
  }
  return data;
}

let written = 0;
let skipped = 0;

function write(publicPath, w, h, from, to, seed, quality = 82) {
  const file = path.join(publicDir, publicPath);
  if (!force && fs.existsSync(file)) {
    skipped++;
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const { data } = jpeg.encode({ data: paint(w, h, from, to, seed), width: w, height: h }, quality);
  fs.writeFileSync(file, data);
  written++;
  console.log(`  ${publicPath}  ${w}×${h}  ${(data.length / 1024).toFixed(0)}KB`);
}

projects.forEach((p, pi) => {
  const [a, b] = p.accent.map(hex);
  console.log(p.slug);
  write(p.cover, COVER.w, COVER.h, a, b, pi * 7);
  write(p.thumb, THUMB.w, THUMB.h, a, b, pi * 7, 85);

  p.gallery.forEach((img, gi) => {
    const base = hex(img.bg);
    write(img.src, img.w, img.h, shade(base, 1.08), shade(base, 0.72), pi * 7 + gi + 1);
  });
});

write('/images/og.jpg', OG.w, OG.h, hex('#2a2a2a'), hex('#141414'), 99);

console.log(`\nDone — ${written} written, ${skipped} already existed.`);
