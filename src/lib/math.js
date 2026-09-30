import { reducedMotion } from '../config.js';

export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Inertia factor for `current += (target - current) * factor`, corrected for frame time
 * so the feel is the same at 60Hz and 120Hz. `factor` is the per-frame value at 60fps.
 * Reduced motion → 1 (no easing, jump straight to target).
 */
export const lerpFactor = (factor, dt) =>
  reducedMotion ? 1 : 1 - Math.pow(1 - factor, dt / (1000 / 60));
