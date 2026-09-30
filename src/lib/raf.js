// One frame loop for the whole site. It piggybacks on GSAP's ticker, so tweens and our
// own per-frame code (virtual scroll, WebGL render) always run in the same tick.

import gsap from 'gsap';

const subscribers = new Set();

gsap.ticker.add((time, deltaTime) => {
  // time in ms since start, dt in ms since last frame
  subscribers.forEach((fn) => fn(time * 1000, deltaTime));
});

export const raf = {
  /** Subscribe fn(time, dt). Returns an unsubscribe function. */
  add(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
  remove(fn) {
    subscribers.delete(fn);
  },
};
