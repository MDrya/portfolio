// Home slider: one plane per project.
//
// Full mode (this phase): the active cover fills the viewport. Each plane has an offset
// `x` in viewport widths (0 = on screen, ±1 = just off either side). Changing project
// slides the outgoing plane to -dir and the incoming one from +dir to 0; while a plane is
// off-centre it zooms in slightly and its image lags inside the frame (inner parallax).
// Strip mode (cards in a row) is added in phase 7.

import gsap from 'gsap';
import { Plane } from './Plane.js';
import { images } from '../lib/loader.js';

const MOVE_ZOOM = 0.15; // extra zoom at |x| = 1, gives the parallax room to travel

export class Slider {
  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {Array<{cover: string}>} projects
   */
  constructor(renderer, projects, { index = 0 } = {}) {
    this.renderer = renderer;
    this.index = index;
    this.zoomBoost = 0; // extra zoom for all planes, used by the intro settle

    this.items = projects.map((p, i) => {
      const plane = new Plane(renderer);
      const img = images.get(p.cover); // preloaded by the loader
      if (img) plane.setImage(img);
      return { plane, x: i === index ? 0 : 2 };
    });
  }

  /** @param {number} dir +1: new cover enters from the right, -1: from the left */
  goTo(index, dir) {
    if (index === this.index) return;
    this.index = index;

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

  update() {
    const { width, height } = this.renderer.viewport;

    this.items.forEach(({ plane, x }) => {
      const visible = Math.abs(x) < 0.999;
      plane.visible = visible;
      if (!visible) return;

      plane.setRect(x * width, 0, width, height);
      plane.uniforms.uZoom.value = 1 + Math.abs(x) * MOVE_ZOOM + this.zoomBoost;
      plane.uniforms.uParallax.value = -x; // image lags behind its frame
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
