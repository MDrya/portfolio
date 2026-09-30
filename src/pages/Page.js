// Base class for all pages.
//
// A page renders two layers:
//   .page-ui      — fixed UI (Back link, counters…). Kept outside the content because a
//                   transformed parent would break position: fixed.
//   .page-content — scrolls (moved by VirtualScroll when `scrollable`)
//
// Text reveal groups in the markup:
//   data-reveal — element whose .line-in children are already in the markup (linesHTML)
//   data-split  — plain text, split into lines automatically (SplitLines)
// Don't nest one inside the other. Groups reveal on enter() when in view, and later as
// they scroll into view.

import { raf } from '../lib/raf.js';
import { SplitLines } from '../lib/splitLines.js';
import { revealIn, revealOut } from '../lib/reveal.js';
import { VirtualScroll } from '../lib/scroll.js';

const IN_VIEW = 0.92; // a group reveals when its top passes 92% of the viewport height

export class Page {
  name = 'page';
  scrollable = false;

  constructor({ app, params = {} }) {
    this.app = app;
    this.params = params;
    this.entered = false;
    this.components = []; // objects with enter()/leave()/destroy(), e.g. Counter
  }

  get title() {
    return 'MDR';
  }

  /** HTML for the scrolling layer. */
  template() {
    return '';
  }

  /** HTML for the fixed UI layer. */
  ui() {
    return '';
  }

  mount(container) {
    this.el = document.createElement('div');
    this.el.className = `page page--${this.name}`;
    // UI layer first: Back / counters come before the long content in tab order
    this.el.innerHTML = `<div class="page-ui">${this.ui()}</div><div class="page-content">${this.template()}</div>`;
    container.append(this.el);

    this.content = this.el.querySelector('.page-content');
    this.uiEl = this.el.querySelector('.page-ui');

    this.splits = [...this.el.querySelectorAll('[data-split]')].map((el) => new SplitLines(el));
    this.groups = [...this.el.querySelectorAll('[data-reveal], [data-split]')].map((el) => ({
      el,
      target: this.splits.find((s) => s.el === el) ?? el,
      fixed: this.uiEl.contains(el),
      shown: false,
      top: 0,
    }));

    if (this.scrollable) {
      this.scroll = new VirtualScroll(this.content);
      this.scroll.enabled = false; // input starts on enter()
    }

    this.onMount();
    this.measure();

    this.onResize = () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.measure(), 200); // after SplitLines re-splits
    };
    window.addEventListener('resize', this.onResize);

    this.tick = this.tick.bind(this);
    this.unsubscribe = raf.add(this.tick);
  }

  /** Hook for subclasses: query elements, create components, bind events. */
  onMount() {}

  get scrollY() {
    return this.scroll?.current ?? 0;
  }

  measure() {
    this.groups.forEach((g) => {
      g.top = g.el.getBoundingClientRect().top + (g.fixed ? 0 : this.scrollY);
      g.height = g.el.offsetHeight;
    });
  }

  inView(g, threshold = IN_VIEW) {
    if (g.fixed) return true;
    const y = this.scrollY;
    return g.top < y + window.innerHeight * threshold && g.top + g.height > y;
  }

  tick(time, dt) {
    this.scroll?.update(dt);
    if (this.entered) this.revealVisible();
    this.update(time, dt);
  }

  /** Hook for subclasses: per-frame work after scroll has updated. */
  update() {}

  revealVisible(delay = 0, threshold = IN_VIEW) {
    let i = 0;
    this.groups.forEach((g) => {
      if (g.shown || !this.inView(g, threshold)) return;
      g.shown = true;
      revealIn(g.target, { delay: delay + i++ * 0.08 });
    });
  }

  enter({ delay = 0 } = {}) {
    this.entered = true;
    if (this.scroll) this.scroll.enabled = true;
    this.revealVisible(delay, 1); // everything on the first screen, including bottom UI
    this.components.forEach((c) => c.enter?.({ delay: delay + 0.1 }));
  }

  /** Resolves when the exit animation is done (or near enough to swap under the sail). */
  leave() {
    this.entered = false;
    if (this.scroll) this.scroll.enabled = false;

    const tweens = this.groups
      .filter((g) => g.shown && this.inView(g, 1))
      .map((g) => revealOut(g.target));
    this.components.forEach((c) => c.leave && tweens.push(c.leave()));

    return Promise.all(tweens); // GSAP tweens/timelines are thenables
  }

  destroy() {
    this.unsubscribe();
    window.removeEventListener('resize', this.onResize);
    clearTimeout(this.resizeTimer);
    this.scroll?.destroy();
    this.splits.forEach((s) => s.destroy());
    this.components.forEach((c) => c.destroy?.());
    this.el.remove();
  }
}
