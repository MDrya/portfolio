// Home slider: one plane per project, two modes.
//
// FULL — the active cover fills the viewport. Each plane has an offset `x` in viewport
// widths (0 = on screen, ±1 = just off either side). Changing project slides the
// outgoing plane to -dir and the incoming one from +dir to 0.
//
// STRIP — every project is a portrait card in one horizontal row, centred on the
// reticle. `pos` is the row position in card units (pos = 2 → card 2 is centred), eased
// toward `target` every frame for inertia.
//
// Morphing between the two is a single progress value `p` (0 = full, 1 = strip). Every
// card's rect is lerped between:
//   - its strip rect, and
//   - its "full" rect: the anchor card fills the screen and the others keep their row
//     positions scaled up by the same factor, so they sit just off-screen.
// So entering strip mode shrinks the cover into its card while neighbours slide in, and
// clicking a card expands it (from wherever it is) while the others slide away.
//
// Inner parallax: the image lags behind its frame — by frame offset in full mode, by
// distance from the centre in strip mode. Row velocity also bends the cards slightly.

import gsap from 'gsap';
import { Plane } from './Plane.js';
import { clamp, lerp, lerpFactor } from '../lib/math.js';
import { motion, reducedMotion, slider as config } from '../config.js';

const MOVE_ZOOM = 0.15; // extra zoom at |x| = 1 in full mode, gives the parallax room
const STRIP_PARALLAX = 0.8; // parallax at the screen edge, fraction of available room
const BEND = 0.0025; // bend per px/frame of row velocity
const MAX_BEND = 0.12;
const MOTION = reducedMotion ? 0 : 1; // reduced motion: no parallax, no bend

export class Slider {
  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {Array<{cover: string}>} projects
   */
  constructor(renderer, projects, { index = 0 } = {}) {
    this.renderer = renderer;
    this.count = projects.length;
    this.index = index; // active project in full mode
    this.anchor = index; // card that fills the screen at p = 0
    this.mode = 'full';
    this.p = 0;
    this.pos = index;
    this.target = index;
    this.bend = 0;
    this.zoomBoost = 0; // extra zoom for all planes, used by the intro settle

    this.items = projects.map((p, i) => ({
      plane: new Plane(renderer, { src: p.cover }), // covers are preloaded by the loader
      x: i === index ? 0 : 2,
      rect: null,
    }));
  }

  /**
   * Resolves once nothing is moving and the active cover is an exact full-screen cover
   * fit — the state another page's plane can take over from without a visible change.
   */
  settle() {
    gsap.to(this, { zoomBoost: 0, duration: 0.5, ease: 'o3', overwrite: 'auto' });
    const tweens = [...gsap.getTweensOf(this), ...this.items.flatMap((item) => gsap.getTweensOf(item))];
    const timeout = new Promise((resolve) => gsap.delayedCall(2.5, resolve)); // never hang a page change
    return Promise.race([Promise.all(tweens), timeout]);
  }

  get card() {
    const { height } = this.renderer.viewport;
    const h = height * config.cardHeight;
    const w = h * config.cardRatio;
    return { w, h, pitch: w + config.cardGap };
  }

  /** True while the full-mode slide logic is in charge (no morph in progress). */
  get isFull() {
    return this.mode === 'full' && this.p === 0;
  }

  // --- full mode --------------------------------------------------------------

  /** @param {number} dir +1: new cover enters from the right, -1: from the left */
  goTo(index, dir) {
    if (index === this.index || !this.isFull) return;
    this.index = index;
    this.anchor = index;

    const incoming = this.items[index];
    this.items.forEach((item) => {
      if (item !== incoming && Math.abs(item.x) < 1) {
        gsap.to(item, { x: -dir, duration: 1.2, ease: 'o6', overwrite: true });
      }
    });

    // Start just off-screen on the entry side, unless it's still visible from a
    // previous move (then it simply comes back from where it is).
    if (Math.abs(incoming.x) >= 1) incoming.x = dir;
    gsap.to(incoming, { x: 0, duration: 1.2, ease: 'o6', overwrite: true });
  }

  /** Cover settles from slightly zoomed-in to exact fit. */
  intro({ delay = 0 } = {}) {
    return gsap.fromTo(this, { zoomBoost: 0.12 }, { zoomBoost: 0, duration: 2, ease: 'o5', delay });
  }

  // --- strip mode ---------------------------------------------------------------

  enterStrip() {
    if (this.mode === 'strip') return;
    this.mode = 'strip';

    // settle any full-mode slide instantly; the morph takes over from here
    this.items.forEach((item, i) => {
      gsap.killTweensOf(item);
      item.x = i === this.index ? 0 : 2;
    });

    this.anchor = this.index;
    this.pos = this.target = this.index;
    gsap.to(this, { p: 1, duration: 1.2, ease: 'o6', overwrite: 'auto' });
  }

  /** Expand card `index` to fill the screen and return to full mode. */
  exitStrip(index) {
    if (this.mode !== 'strip') return;
    this.mode = 'full';
    this.index = index;
    this.anchor = index;
    // full-mode offsets for when the morph finishes (they're ignored while p > 0)
    this.items.forEach((item, i) => (item.x = i === index ? 0 : 2));
    gsap.to(this, {
      p: 0,
      duration: 1.2,
      ease: 'o6',
      overwrite: 'auto',
      onComplete: () => {
        this.pos = this.target = index;
      },
    });
  }

  setTarget(pos) {
    this.target = clamp(pos, 0, this.count - 1);
  }

  /** Move the row by a pixel delta (wheel, drag). */
  scrollBy(px) {
    this.setTarget(this.target + px / this.card.pitch);
  }

  /** Card whose centre will end up nearest the reticle. */
  nearest(pos = this.target) {
    return clamp(Math.round(pos), 0, this.count - 1);
  }

  /** Index of the card under a screen point, or -1. */
  hitTest(x, y) {
    return this.items.findIndex(
      ({ plane, rect }) => plane.visible && rect && x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
    );
  }

  // --- frame -------------------------------------------------------------------

  update(dt) {
    const { width: W, height: H } = this.renderer.viewport;

    // row inertia + velocity (px per 60fps frame, so bend feels the same at any refresh rate)
    const { w, h, pitch } = this.card;
    const prev = this.pos;
    this.pos += (this.target - this.pos) * lerpFactor(motion.lerp, dt);
    if (Math.abs(this.target - this.pos) < 0.0005) this.pos = this.target;
    const velocity = ((this.pos - prev) * pitch * (1000 / 60)) / Math.max(dt, 1);
    const bendTarget = clamp(velocity * BEND, -MAX_BEND, MAX_BEND) * MOTION;
    this.bend += (bendTarget - this.bend) * lerpFactor(0.1, dt);

    if (this.isFull) {
      this.updateFull(W, H);
      return;
    }

    const p = this.p;
    const scaleUp = W / w; // how much the strip is scaled up so a card fills the width
    const anchorCx = W / 2 + (this.anchor - this.pos) * pitch;

    this.items.forEach((item, i) => {
      const cx = W / 2 + (i - this.pos) * pitch; // centre in the strip
      const fullCx = W / 2 + (cx - anchorCx) * scaleUp; // centre in the scaled-up "full" layout

      const rw = lerp(W, w, p);
      const rh = lerp(H, h, p);
      const rcx = lerp(fullCx, cx, p);
      const x = rcx - rw / 2;
      const visible = x + rw > 0 && x < W;

      item.plane.visible = visible;
      if (!visible) return;

      item.plane.setRect(x, (H - rh) / 2, rw, rh);
      item.rect = item.plane.rect;

      const u = item.plane.uniforms;
      u.uZoom.value = 1 + this.zoomBoost;
      u.uParallax.value = clamp((cx - W / 2) / (W / 2), -1, 1) * STRIP_PARALLAX * p * MOTION;
      u.uVelocity.value = this.bend * p;
    });
  }

  updateFull(W, H) {
    this.items.forEach((item) => {
      const { plane, x } = item;
      const visible = Math.abs(x) < 0.999;
      plane.visible = visible;
      if (!visible) return;

      plane.setRect(x * W, 0, W, H);
      item.rect = plane.rect;
      plane.uniforms.uZoom.value = 1 + Math.abs(x) * MOVE_ZOOM * MOTION + this.zoomBoost;
      plane.uniforms.uParallax.value = x * MOTION; // image lags behind its frame
      plane.uniforms.uVelocity.value = 0;
    });
  }

  destroy() {
    gsap.killTweensOf(this);
    this.items.forEach((item) => {
      gsap.killTweensOf(item);
      item.plane.destroy();
    });
  }
}
