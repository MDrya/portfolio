// Wraps each rendered line of a text element in a mask, for the masked line reveal:
//
//   <span class="line"><span class="line-in">Where your</span></span>
//
// Lines are measured after fonts load and re-measured on resize. The reveal position
// (hidden below / shown / exited above) is kept across re-splits, so resizing mid-page
// never makes text disappear.

import gsap from 'gsap';

const escape = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const lineHTML = (text) => `<span class="line"><span class="line-in">${escape(text)}</span></span>`;

/** Markup for text whose lines are fixed by the content (e.g. heroTitle arrays). */
export const linesHTML = (lines) => lines.map(lineHTML).join('');

const instances = new Set();
let resizeTimer;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => instances.forEach((s) => s.split()), 150);
});

export class SplitLines {
  /** @param {HTMLElement} el element containing plain text */
  constructor(el) {
    this.el = el;
    this.text = el.textContent.trim().replace(/\s+/g, ' ');
    this.lines = [];
    this.pos = 110; // yPercent of every .line-in: 110 hidden, 0 shown, -110 exited
    this.split();
    instances.add(this);
  }

  split() {
    gsap.killTweensOf(this.lines);

    // 1. one span per word, so we can see where the browser wraps
    const words = this.text.split(' ');
    this.el.innerHTML = words.map((w) => `<span>${escape(w)}</span>`).join(' ');

    // 2. group words by their vertical position
    const rows = [];
    let top = null;
    for (const span of this.el.children) {
      if (span.offsetTop !== top) {
        rows.push([]);
        top = span.offsetTop;
      }
      rows[rows.length - 1].push(span.textContent);
    }

    // 3. rebuild as masked lines, restoring the current reveal position
    this.el.innerHTML = linesHTML(rows.map((r) => r.join(' ')));
    this.lines = [...this.el.querySelectorAll('.line-in')];
    if (this.pos !== 110) gsap.set(this.lines, { y: 0, yPercent: this.pos });
  }

  destroy() {
    instances.delete(this);
    gsap.killTweensOf(this.lines);
    this.el.textContent = this.text;
  }
}
