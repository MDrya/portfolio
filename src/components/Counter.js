// 3-part counter:  [current] — [total]
//
// - left: a vertical column of every number, clipped to one line and shifted to show
//   the current one; enters from the left (xPercent -110 → 0)
// - dash: scaleX 0 → 1
// - right: the total; enters from the right (xPercent 110 → 0)
//
// Used for home pagination and the project page counter.

import gsap from 'gsap';

export class Counter {
  constructor({ total, current = 0, className = '' }) {
    this.total = total;
    this.current = current;

    const numbers = Array.from({ length: total }, (_, i) => `<span>${i + 1}</span>`).join('');

    this.el = document.createElement('div');
    this.el.className = `counter t-ui ${className}`.trim();
    this.el.innerHTML = `
      <span class="sr-only"></span>
      <span class="counter-l" aria-hidden="true"><span class="counter-l-in"><span class="counter-col">${numbers}</span></span></span>
      <span class="counter-dash" aria-hidden="true">—</span>
      <span class="counter-r" aria-hidden="true"><span class="counter-r-in">${total}</span></span>
    `;

    this.label = this.el.querySelector('.sr-only');
    this.left = this.el.querySelector('.counter-l-in');
    this.col = this.el.querySelector('.counter-col');
    this.dash = this.el.querySelector('.counter-dash');
    this.right = this.el.querySelector('.counter-r-in');

    this.set(current, { immediate: true });
  }

  /** @param {number} index 0-based */
  set(index, { immediate = false, duration = 1.2, ease = 'o6' } = {}) {
    this.current = ((index % this.total) + this.total) % this.total;
    this.label.textContent = `${this.current + 1} of ${this.total}`;

    const yPercent = (-100 * this.current) / this.total;
    if (immediate) gsap.set(this.col, { yPercent });
    else gsap.to(this.col, { yPercent, duration, ease, overwrite: true });
  }

  next(opts) {
    this.set(this.current + 1, opts);
  }

  prev(opts) {
    this.set(this.current - 1, opts);
  }

  enter({ delay = 0 } = {}) {
    return gsap
      .timeline({ delay })
      .fromTo(this.left, { x: 0, xPercent: -110 }, { xPercent: 0 }, 0)
      .fromTo(this.dash, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1 }, 0.1)
      .fromTo(this.right, { x: 0, xPercent: 110 }, { xPercent: 0 }, 0.15);
  }

  leave({ delay = 0 } = {}) {
    return gsap
      .timeline({ delay, defaults: { duration: 0.8 } })
      .to(this.left, { x: 0, xPercent: -110 }, 0)
      .to(this.dash, { scaleX: 0, transformOrigin: 'right center' }, 0)
      .to(this.right, { x: 0, xPercent: 110 }, 0);
  }

  destroy() {
    gsap.killTweensOf([this.left, this.col, this.dash, this.right]);
    this.el.remove();
  }
}
