// Easing table + global GSAP defaults. Import this once, early (main.js does).
// The same curves exist as CSS custom properties in main.css (--o2 … --io6).

import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { reducedMotion } from '../config.js';

gsap.registerPlugin(CustomEase);

const curves = {
  o2: [0.25, 0.46, 0.45, 0.94], // quad out — hovers, fades
  o3: [0.215, 0.61, 0.355, 1], // cubic out
  o4: [0.165, 0.84, 0.44, 1], // quart out
  o5: [0.23, 1, 0.32, 1], // quint out
  o6: [0.19, 1, 0.22, 1], // expo out — the signature ease
  io4: [0.77, 0, 0.175, 1], // quart in-out — big transitions
  io6: [1, 0, 0, 1], // expo in-out
};

// Registers each curve with GSAP, so tweens can use `ease: 'o6'`.
// The returned functions (t: 0–1 → 0–1) are exported for per-frame code (scroll, WebGL).
export const ease = Object.fromEntries(
  Object.entries(curves).map(([name, [x1, y1, x2, y2]]) => [
    name,
    CustomEase.create(name, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`),
  ])
);

gsap.defaults({ ease: 'o6', duration: 1.2 });

// Reduced motion: play everything 8× faster, so the default 1.2s tween lasts 150ms
// (delays and staggers shrink with it).
if (reducedMotion) gsap.globalTimeline.timeScale(8);
