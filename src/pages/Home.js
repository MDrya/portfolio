// Home — full mode (§8a): active cover in WebGL, centred title + superscript, crosshairs,
// pagination, thumbnail strip, ←/→ to change project. Strip mode arrives in phase 7.

import gsap from 'gsap';
import { Page } from './Page.js';
import { Counter } from '../components/Counter.js';
import { Slider } from '../gl/Slider.js';
import { linesHTML } from '../lib/splitLines.js';
import { revealIn, revealOut } from '../lib/reveal.js';
import { projects } from '../data/projects.js';
import { store } from '../store.js';

const pad = (n) => String(n).padStart(2, '0');

const cross = (modifier) => `
  <svg class="h-cross h-cross--${modifier}" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
    <path d="M11 0v22M0 11h22" stroke="currentColor" stroke-width="1.5" />
  </svg>`;

const isTyping = (el) => el.closest?.('input, textarea, select, [contenteditable]');

export class Home extends Page {
  name = 'home';

  get title() {
    return 'MDR — Interior Design Portfolio';
  }

  ui() {
    return `
      ${cross('l')}${cross('r')}${cross('c')}
      <div class="h-titles" aria-live="polite"></div>
      <div class="h-pagination"></div>
      <nav class="h-thumbs" aria-label="Projects">
        ${projects
          .map(
            (p, i) => `
          <button class="h-thumb" type="button" data-index="${i}" aria-label="Show ${p.title}">
            <img class="h-thumb-img" src="${p.thumb}" alt="" width="200" height="125" />
          </button>`
          )
          .join('')}
      </nav>
    `;
  }

  onMount() {
    this.index = store.activeIndex;

    this.titles = this.el.querySelector('.h-titles');
    this.titleEl = this.makeTitle(projects[this.index]);

    this.counter = new Counter({ total: projects.length, current: this.index });
    this.el.querySelector('.h-pagination').append(this.counter.el);
    this.components.push(this.counter);

    this.thumbs = [...this.el.querySelectorAll('.h-thumb')];
    this.thumbImgs = this.thumbs.map((t) => t.querySelector('.h-thumb-img'));
    this.el.querySelector('.h-thumbs').addEventListener('click', (e) => {
      const thumb = e.target.closest('.h-thumb');
      if (!thumb) return;
      const i = Number(thumb.dataset.index);
      this.select(i, Math.sign(i - this.index));
    });
    this.updateThumbs();

    this.slider = new Slider(this.app.webgl, projects, { index: this.index });

    this.onKey = (e) => {
      if (!this.entered || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === 'ArrowRight') this.next();
      else if (e.key === 'ArrowLeft') this.prev();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', this.onKey);
  }

  makeTitle(p) {
    const a = document.createElement('a');
    a.className = 'h-title t-xl';
    a.href = `/${p.slug}`;
    a.innerHTML = `
      <span class="h-title-text">${linesHTML([p.title])}</span>
      <span class="h-sup t-sup" aria-label="${p.imageCount} images">${linesHTML([pad(p.imageCount)])}</span>`;
    this.titles.append(a);
    return a;
  }

  next() {
    this.select((this.index + 1) % projects.length, 1);
  }

  prev() {
    this.select((this.index - 1 + projects.length) % projects.length, -1);
  }

  /** @param {number} dir +1 new cover comes from the right, -1 from the left */
  select(index, dir) {
    if (index === this.index || !this.entered) return;
    this.index = index;
    store.activeIndex = index;

    this.slider.goTo(index, dir);
    this.counter.set(index);
    this.updateThumbs();

    // Old title exits upward; a new one rises in its place. Titles are separate elements,
    // so rapid presses never leave text half-swapped.
    const old = this.titleEl;
    const hadFocus = document.activeElement === old;
    old.setAttribute('aria-hidden', 'true');
    old.tabIndex = -1;
    old.classList.add('is-leaving');
    revealOut(old, { duration: 0.6 }).then(() => old.remove());

    this.titleEl = this.makeTitle(projects[index]);
    revealIn(this.titleEl, { delay: 0.12 });
    if (hadFocus) this.titleEl.focus();
  }

  updateThumbs() {
    this.thumbs.forEach((t, i) => {
      const active = i === this.index;
      t.classList.toggle('is-active', active);
      if (active) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
  }

  update() {
    this.slider.update();
  }

  enter({ delay = 0 } = {}) {
    super.enter({ delay });
    this.el.classList.add('is-in'); // crosses scale in (CSS transition)
    this.slider.intro();
    revealIn(this.titleEl, { delay: delay + 0.1 });
    gsap.fromTo(
      this.thumbImgs,
      { y: 0, yPercent: 110 },
      { yPercent: 0, duration: 1.2, stagger: 0.04, delay: delay + 0.2, overwrite: true }
    );
  }

  leave() {
    this.el.classList.remove('is-in');
    const titles = [...this.titles.children].map((t) => revealOut(t, { duration: 0.6 }));
    const thumbs = gsap.to(this.thumbImgs, { y: 0, yPercent: 110, duration: 0.6, stagger: 0.02, overwrite: true });
    return Promise.all([super.leave(), thumbs, ...titles]);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKey);
    gsap.killTweensOf(this.thumbImgs);
    this.slider.destroy();
    super.destroy();
  }
}
