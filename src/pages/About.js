// About page (§10).
//
// Right column — the real content, rendered from src/data/about.js.
// Left minimap — a live clone of that column scaled to 9.64vw (≈ 1/5), so it is never
//   written twice. A frame marks the part of the page currently on screen and moves with
//   the scroll; each mini section fades in when its full-size counterpart enters view.
//   Clicking the minimap jumps to that spot. Hidden below 1000px (CSS).

import { Page } from './Page.js';
import { linesHTML } from '../lib/splitLines.js';
import { clamp } from '../lib/math.js';
import { about } from '../data/about.js';

const external = (href) => /^https?:/.test(href);

const SEEN_AT = 0.9; // a section counts as "entered" when its text passes 90% of the viewport
const MINI_BOTTOM = 40; // px kept free below the minimap

const sections = {
  text: (s) =>
    s.paragraphs.map((p) => `<p class="${s.small ? 'a-small' : 'a-large'}" data-split>${p}</p>`).join(''),

  entries: (s) => `
    <h2 class="a-heading" data-split>${s.title}</h2>
    <ul class="a-entries">
      ${s.entries
        .map(
          (e) => `
        <li class="a-entry">
          <p class="a-heading" data-split>${e.title}</p>
          <p class="a-small a-meta" data-split>${e.meta}</p>
        </li>`
        )
        .join('')}
    </ul>`,

  links: (s) => `
    <h2 class="a-heading" data-split>${s.title}</h2>
    <ul class="a-links">
      ${s.links
        .map(
          (l) => `
        <li>
          <a class="a-link a-heading" href="${l.href}" data-reveal
            ${external(l.href) ? 'target="_blank" rel="noopener noreferrer"' : ''}>${linesHTML([l.label])}${
              external(l.href) ? '<span class="sr-only"> (opens in a new tab)</span>' : ''
            }</a>
        </li>`
        )
        .join('')}
    </ul>`,
};

export class About extends Page {
  name = 'about';
  scrollable = true;

  get title() {
    return 'About — MDR';
  }

  template() {
    return `
      <h1 class="sr-only">About</h1>
      <div class="a-right">
        ${about.map((s) => `<section class="a-r-s" id="${s.id}">${sections[s.type](s)}</section>`).join('')}
      </div>
    `;
  }

  ui() {
    return `
      <div class="a-frame" aria-hidden="true"></div>
      <div class="a-mini" aria-hidden="true"><div class="a-mini-inner" inert></div></div>
    `;
  }

  onMount() {
    this.rightEl = this.el.querySelector('.a-right');
    this.sectionEls = [...this.rightEl.querySelectorAll('.a-r-s')];
    this.miniEl = this.el.querySelector('.a-mini');
    this.miniInner = this.el.querySelector('.a-mini-inner');
    this.frameEl = this.el.querySelector('.a-frame');
    this.seen = this.sectionEls.map(() => false);

    // click anywhere on the minimap → centre that part of the page
    this.miniEl.addEventListener('click', (e) => {
      const y = e.clientY - this.miniEl.getBoundingClientRect().top;
      this.scroll.scrollTo(this.contentStart + y / this.scale - window.innerHeight / 2);
    });
  }

  /** Rebuilds the clone (text may have re-wrapped) and re-measures. Runs on mount + resize. */
  measure() {
    super.measure();
    if (!this.miniInner) return;

    // The clone copies the column *after* line splitting, so its line breaks are identical.
    this.miniInner.innerHTML = this.rightEl.innerHTML;
    this.miniInner.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    this.miniSections = [...this.miniInner.querySelectorAll('.a-r-s')];
    this.miniSections.forEach((el, i) => el.classList.toggle('is-seen', this.seen[i]));

    // scale so the column's content width becomes the minimap width (9.64vw, from CSS)
    const contentWidth = this.sectionEls[0].offsetWidth;
    this.scale = this.miniEl.offsetWidth / contentWidth;
    this.miniInner.style.width = `${contentWidth}px`;
    this.miniInner.style.transform = `scale(${this.scale})`;

    // page y of the first line of text = the top of the minimap
    this.contentStart = this.sectionEls[0].firstElementChild.offsetTop;
    this.tops = this.sectionEls.map((el) => el.firstElementChild.offsetTop);

    this.miniHeight = this.miniInner.offsetHeight * this.scale;
    this.miniEl.style.height = `${this.miniHeight}px`;
    this.miniTop = this.miniEl.offsetTop;
    this.frameEl.style.height = `${window.innerHeight * this.scale}px`;

    this.lastY = null; // force a reposition
    this.update();
  }

  update() {
    if (!this.scale) return;
    const vh = window.innerHeight;
    const y = this.scrollY;

    // mini sections fade in when their full-size counterpart enters the viewport
    if (this.entered) {
      this.tops.forEach((top, i) => {
        if (this.seen[i] || top > y + vh * SEEN_AT) return;
        this.seen[i] = true;
        this.miniSections[i].classList.add('is-seen');
      });
    }

    if (y === this.lastY) return;
    this.lastY = y;

    // A minimap taller than the space available scrolls within it as the page scrolls.
    const overflow = Math.max(0, this.miniTop + this.miniHeight + MINI_BOTTOM - vh);
    const shift = -overflow * clamp(this.scroll.progress, 0, 1);
    const frameY = this.miniTop + shift + (y - this.contentStart) * this.scale;

    this.miniEl.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    this.frameEl.style.transform = `translate3d(0, ${frameY.toFixed(2)}px, 0)`;
  }

  enter(opts) {
    super.enter(opts);
    this.el.classList.add('is-in'); // frame fades in
  }

  leave(opts) {
    this.el.classList.remove('is-in');
    return super.leave(opts);
  }
}
