// One frame loop for the whole site. It piggybacks on GSAP's ticker, so tweens and our
// own per-frame code (virtual scroll, WebGL render) always run in the same tick.
//
// Each frame: GSAP tweens → update subscribers (scroll, pages) → render subscribers (WebGL),
// so what's drawn always matches this frame's DOM state.

import gsap from 'gsap';

const updates = new Set();
const renders = new Set();

gsap.ticker.add((time, deltaTime) => {
  // time in ms since start, dt in ms since last frame
  const t = time * 1000;
  updates.forEach((fn) => fn(t, deltaTime));
  renders.forEach((fn) => fn(t, deltaTime));
});

const subscribe = (set) => (fn) => {
  set.add(fn);
  return () => set.delete(fn);
};

export const raf = {
  /** Subscribe fn(time, dt) to the update phase. Returns an unsubscribe function. */
  add: subscribe(updates),
  remove: (fn) => updates.delete(fn),
  /** Subscribe to the render phase, which runs after every update. */
  render: subscribe(renders),
};
