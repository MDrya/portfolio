// Asset loading. Image URLs in the data files point at the JPG/PNG; when
// `npm run images` has produced a smaller WebP for one (listed in data/webp.json), that
// is what actually gets requested, with the original as the fallback.
//
// Decoded images are cached by their *data* URL so later consumers (WebGL textures,
// thumbnails) reuse them instead of fetching again.

import webp from '../data/webp.json';

const hasWebp = new Set(webp);

/** The file to request for a data URL: its WebP when one exists, otherwise itself. */
export const bestSrc = (url) => (hasWebp.has(url) ? url.replace(/\.(jpe?g|png)$/i, '.webp') : url);

/** Points an <img> at the best source, retrying with the original if that fails. */
export function setImage(img, url) {
  const best = bestSrc(url);
  if (best !== url) {
    img.onerror = () => {
      img.onerror = null;
      img.src = url;
    };
  }
  img.src = best;
}

export const images = new Map(); // data url → decoded HTMLImageElement
const pending = new Map(); // data url → in-flight promise

const decode = (src) => {
  const img = new Image();
  img.src = src;
  return img.decode().then(() => img);
};

/** Resolves with the decoded image, or null if it failed (never rejects). */
export function loadImage(url) {
  if (images.has(url)) return Promise.resolve(images.get(url));
  if (pending.has(url)) return pending.get(url);

  const best = bestSrc(url);
  const promise = decode(best)
    .catch((err) => (best === url ? Promise.reject(err) : decode(url)))
    .then((img) => {
      images.set(url, img);
      return img;
    })
    .catch(() => {
      console.warn(`[loader] could not load ${url}`);
      return null;
    })
    .finally(() => pending.delete(url));

  pending.set(url, promise);
  return promise;
}

/**
 * Loads images + font faces in parallel.
 * @param {string[]} urls
 * @param {{ fonts?: string[], onProgress?: (p: number) => void }} opts
 *   fonts: CSS font shorthands, e.g. '16px "Inter Tight"'; onProgress gets 0–1
 */
export async function preload(urls, { fonts = [], onProgress } = {}) {
  const tasks = [
    ...urls.map(loadImage),
    ...fonts.map((f) => document.fonts.load(f).catch(() => console.warn(`[loader] font ${f} failed`))),
  ];

  let done = 0;
  onProgress?.(0);
  await Promise.all(tasks.map((t) => t.then(() => onProgress?.(++done / tasks.length))));
  await document.fonts.ready;
}
