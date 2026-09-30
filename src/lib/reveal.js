// Masked line reveal. `target` is a SplitLines instance, an element (its .line-in
// children are used), or an array/NodeList of .line-in elements.
//
// Every tween sets `y: 0` alongside `yPercent`: the CSS start state (translate 110%)
// is read by GSAP as a pixel `y`, which we clear so only yPercent drives the move.

import gsap from 'gsap';
import { motion } from '../config.js';

const resolve = (target) => {
  if (target.lines) return target.lines;
  if (target instanceof Element) return [...target.querySelectorAll('.line-in')];
  return [...target];
};

const track = (target, pos) => {
  if (target.lines) target.pos = pos;
};

export function revealIn(target, { delay = 0, stagger = motion.stagger / 1000, duration = 1.2, ease = 'o6' } = {}) {
  track(target, 0);
  return gsap.fromTo(
    resolve(target),
    { y: 0, yPercent: 110 },
    { yPercent: 0, delay, stagger, duration, ease, overwrite: 'auto' } // cancels a running exit
  );
}

export function revealOut(target, { delay = 0, stagger = 0.04, duration = 0.8, ease = 'o6' } = {}) {
  track(target, -110);
  return gsap.to(resolve(target), { y: 0, yPercent: -110, delay, stagger, duration, ease, overwrite: 'auto' });
}

/** Snap lines back to the hidden-below start state (e.g. before replaying). */
export function revealReset(target) {
  track(target, 110);
  gsap.killTweensOf(resolve(target));
  gsap.set(resolve(target), { y: 0, yPercent: 110 });
}
