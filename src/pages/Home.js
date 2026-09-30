// Home — the WebGL project slider (§8).
//
// Full mode: active cover, centred title + superscript, crosshairs, pagination,
//   thumbnails, ←/→ to change project.
// Strip mode: entered by wheel, drag or swipe. Cards glide with inertia; the centre
//   crosshair becomes the reticle. Click a card (or release a drag / let the wheel go
//   idle, with snapOnRelease) to expand it back to full mode. Esc also returns.

import gsap from 'gsap';
import { Page } from './Page.js';
import { Counter } from '../components/Counter.js';
import { Slider } from '../gl/Slider.js';
import { linesHTML } from '../lib/splitLines.js';
import { revealIn, revealOut } from '../lib/reveal.js';
import { projects } from '../data/projects.js';
import { slider as config } from '../config.js';
import { store } from '../store.js';

const pad = (n) => String(n).padStart(2, '0');

const cross = (modifier) => `
  <svg class="h-cross h-cross--${modifier}" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
    <path d="M11 0v22M0 11h22" stroke="currentColor" stroke-width="1.5" />
  </svg>`;

const isTyping = (el) => el.closest?.('input, textarea, select, [contenteditable]');

const LINE_HEIGHT = 16; // px per wheel "line" (Firefox deltaMode 1)

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
            <img class="h-thumb-img" src="${p.thumb}" alt="" width="200" height="125" draggable="false" />
          </button>`
          )
          .join('')}
      </nav>
    `;
  }

  onMount() {
    this.index = store.activeIndex;
    this.drag = null;

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
      if (this.slider.mode === 'strip') this.exitStrip(i);
      else this.select(i, Math.sign(i - this.index));
    });
    this.updateThumbs(this.index);

    this.slider = new Slider(this.app.webgl, projects, { index: this.index });

    this.onKey = this.onKey.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    window.addEventListener('keydown', this.onKey);
    window.addEventListener('wheel', this.onWheel, { passive: true });
    this.el.addEventListener('pointerdown', this.onPointerDown);
    this.el.addEventListener('pointermove', this.onPointerMove);
    this.el.addEventListener('pointerup', this.onPointerUp);
    this.el.addEventListener('pointercancel', this.onPointerUp);
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

  /** Current title(s) exit upward and are removed afterwards. */
  dropTitles() {
    [...this.titles.children].forEach((t) => {
      if (t.classList.contains('is-leaving')) return;
      t.classList.add('is-leaving');
      t.setAttribute('aria-hidden', 'true');
      t.tabIndex = -1;
      revealOut(t, { duration: 0.6 }).then(() => t.remove());
    });
    this.titleEl = null;
  }

  // --- full mode ----------------------------------------------------------------

  next() {
    this.select((this.index + 1) % projects.length, 1);
  }

  prev() {
    this.select((this.index - 1 + projects.length) % projects.length, -1);
  }

  /** @param {number} dir +1 new cover comes from the right, -1 from the left */
  select(index, dir) {
    if (index === this.index || !this.entered || !this.slider.isFull) return;
    this.index = index;
    store.activeIndex = index;

    this.slider.goTo(index, dir);
    this.counter.set(index);
    this.updateThumbs(index);

    // Separate title elements, so rapid presses never leave text half-swapped.
    const hadFocus = document.activeElement === this.titleEl;
    this.dropTitles();
    this.titleEl = this.makeTitle(projects[index]);
    revealIn(this.titleEl, { delay: 0.12 });
    if (hadFocus) this.titleEl.focus();
  }

  // --- strip mode ---------------------------------------------------------------

  enterStrip() {
    if (this.slider.mode === 'strip') return;
    this.slider.enterStrip();
    this.el.classList.add('is-strip');
    this.dropTitles();
    this.counter.leave();
  }

  exitStrip(index) {
    clearTimeout(this.idleTimer);
    if (this.slider.mode !== 'strip') return;

    this.index = index;
    store.activeIndex = index;
    this.slider.exitStrip(index);
    this.el.classList.remove('is-strip');

    this.updateThumbs(index);
    this.counter.set(index, { immediate: true });
    this.counter.enter({ delay: 0.35 });
    this.titleEl = this.makeTitle(projects[index]);
    revealIn(this.titleEl, { delay: 0.4 });
  }

  /** With snapOnRelease, return to full mode on the nearest card once input stops. */
  scheduleSnap(delay) {
    clearTimeout(this.idleTimer);
    if (!config.snapOnRelease) return;
    this.idleTimer = setTimeout(() => {
      if (!this.drag) this.exitStrip(this.slider.nearest());
    }, delay);
  }

  // --- input --------------------------------------------------------------------

  onKey(e) {
    if (!this.entered || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    const strip = this.slider.mode === 'strip';

    if (e.key === 'Escape' && strip) {
      this.exitStrip(this.slider.nearest());
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      if (strip) {
        this.slider.setTarget(this.slider.nearest() + dir);
        this.scheduleSnap(config.wheelIdle);
      } else if (dir > 0) this.next();
      else this.prev();
    } else return;

    e.preventDefault();
  }

  onWheel(e) {
    if (!this.entered || e.ctrlKey) return; // ctrl+wheel = pinch zoom
    const scale = e.deltaMode === 1 ? LINE_HEIGHT : e.deltaMode === 2 ? window.innerHeight : 1;
    const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * scale;
    if (!delta) return;

    this.enterStrip();
    this.slider.scrollBy(delta);
    this.scheduleSnap(config.wheelIdle);
  }

  onPointerDown(e) {
    // links and buttons (title, thumbnails, nav) keep their normal click behaviour
    if (!this.entered || e.button !== 0 || e.target.closest('a, button')) return;
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
  }

  onPointerMove(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;

    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.hypot(dx, e.clientY - d.y) < config.dragThreshold) return;
      d.moved = true;
      try {
        this.el.setPointerCapture(e.pointerId); // keep receiving moves outside the window
      } catch {
        // pointer already released — the drag just ends on the next pointerup
      }
      this.el.classList.add('is-dragging');
      clearTimeout(this.idleTimer);
      this.enterStrip();
      d.x = e.clientX; // start from here so the row doesn't jump by the threshold
      d.startPos = this.slider.target;
      return;
    }

    // velocity in px/ms for the flick on release
    const dt = Math.max(e.timeStamp - d.lastT, 1);
    d.v = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;

    this.slider.setTarget(d.startPos - dx / this.slider.card.pitch);
  }

  onPointerUp(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    this.drag = null;
    this.el.classList.remove('is-dragging');

    if (d.moved) {
      const recent = e.timeStamp - d.lastT < 80; // finger still moving when lifted
      if (recent && e.type === 'pointerup') this.slider.scrollBy(-d.v * 220);
      this.scheduleSnap(0);
    } else if (this.slider.mode === 'strip' && e.type === 'pointerup') {
      const i = this.slider.hitTest(e.clientX, e.clientY);
      if (i !== -1) this.exitStrip(i);
    }
  }

  // --- frame / lifecycle ---------------------------------------------------------

  updateThumbs(index) {
    if (index === this.thumbIndex) return;
    this.thumbIndex = index;
    this.thumbs.forEach((t, i) => {
      const active = i === index;
      t.classList.toggle('is-active', active);
      if (active) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
  }

  update(time, dt) {
    this.slider.update(dt);
    if (this.slider.mode === 'strip') this.updateThumbs(this.slider.nearest(this.slider.pos));
  }

  /**
   * Hand-off (§8d): going to the project that's on screen, the cover stays put and the
   * project page's hero plane takes over from the slider — no sail, no flash.
   */
  handsOffTo(route) {
    return (
      route.name === 'project' &&
      route.params.slug === projects[this.index].slug &&
      this.slider.mode === 'full'
    );
  }

  enter({ delay = 0, handoff = false } = {}) {
    super.enter({ delay });
    this.el.classList.add('is-in'); // crosses scale in (CSS transition)
    if (!handoff) this.slider.intro(); // arriving by hand-off, the cover must not move
    revealIn(this.titleEl, { delay: delay + 0.1 });
    gsap.fromTo(
      this.thumbImgs,
      { y: 0, yPercent: 110 },
      { yPercent: 0, duration: 1.2, stagger: 0.04, delay: delay + 0.2, overwrite: true }
    );
  }

  leave({ handoff = false } = {}) {
    clearTimeout(this.idleTimer);
    this.el.classList.remove('is-in', 'is-strip');
    const titles = [...this.titles.children].map((t) => revealOut(t, { duration: 0.6 }));
    const thumbs = gsap.to(this.thumbImgs, { y: 0, yPercent: 110, duration: 0.6, stagger: 0.02, overwrite: true });
    const settled = handoff ? this.slider.settle() : null; // cover at rest before the swap
    return Promise.all([super.leave(), thumbs, settled, ...titles]);
  }

  destroy() {
    clearTimeout(this.idleTimer);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('wheel', this.onWheel);
    gsap.killTweensOf(this.thumbImgs);
    this.slider.destroy();
    super.destroy();
  }
}
