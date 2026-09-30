// Asset preloading. Decoded images are cached by URL so later consumers (WebGL
// textures, thumbnails) reuse them instead of fetching again.

export const images = new Map(); // url → decoded HTMLImageElement

/** Resolves with the decoded image, or null if it failed (never rejects). */
export function loadImage(url) {
  if (images.has(url)) return Promise.resolve(images.get(url));

  const img = new Image();
  img.src = url;
  return img
    .decode()
    .then(() => {
      images.set(url, img);
      return img;
    })
    .catch(() => {
      console.warn(`[loader] could not load ${url}`);
      return null;
    });
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
