// Intro loader (§7): a tiny centred percentage that counts up smoothly while assets load,
// then slides up out of its mask while the background fades away.

import gsap from 'gsap';
import { raf } from '../lib/raf.js';
import { lerpFactor } from '../lib/math.js';
import { preload } from '../lib/loader.js';

export class Loader {
  constructor(el) {
    this.el = el;
    this.num = el.querySelector('.line-in');
    this.target = 0; // real progress, 0–100
    this.display = 0; // lerped toward target, so the number counts instead of jumping
    this.shown = -1;
  }

  /** Resolves once assets are loaded AND the counter has visibly reached 100%. */
  async load(urls, { fonts } = {}) {
    const full = new Promise((resolve) => (this.onFull = resolve));
    const stop = raf.add((time, dt) => this.update(dt));

    await preload(urls, { fonts, onProgress: (p) => (this.target = p * 100) });
    this.target = 100;
    await full;
    stop();
  }

  update(dt) {
    this.display += (this.target - this.display) * lerpFactor(0.08, dt);
    if (this.target === 100 && this.display > 99.5) {
      this.display = 100;
      this.onFull();
    }

    const value = Math.round(this.display);
    if (value !== this.shown) {
      this.shown = value;
      this.num.textContent = `${value}%`;
      this.el.setAttribute('aria-valuenow', value);
    }
  }

  /**
   * Number slides up, then the background fades. `onReveal` fires as the fade starts,
   * which is when the page underneath should begin its intro.
   */
  hide({ onReveal } = {}) {
    return gsap
      .timeline({ onComplete: () => this.el.remove() })
      .to(this.num, { y: 0, yPercent: -110, duration: 0.8 }, 0.2)
      .call(() => {
        this.el.style.pointerEvents = 'none';
        onReveal?.();
      }, null, 0.45)
      .to(this.el, { opacity: 0, duration: 0.8, ease: 'o2' }, 0.45);
  }
}
