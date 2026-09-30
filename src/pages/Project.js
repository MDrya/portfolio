// Project page (§9).
//
// Hero     — cover in WebGL (handed over from Home's slider), text column, counter,
//            scroll icon that draws itself.
// Gallery  — grouped image blocks, lazy-loaded with a fade, subtle scroll parallax.
// Minimap  — scaled replica of the gallery column on the right edge, with a frame that
//            shows the viewport; click a mini image to jump to it. It duplicates the
//            gallery visually, so it's hidden from assistive tech and the tab order.
// Progress — 3px bar on the left edge, fills top → bottom with scroll.
// Footer   — next project; its cover fades in behind in WebGL, and once it fills the
//            screen the click hands off to that project without the sail.

import { Page } from './Page.js';
import { Counter } from '../components/Counter.js';
import { Plane } from '../gl/Plane.js';
import { linesHTML } from '../lib/splitLines.js';
import { clamp } from '../lib/math.js';
import { setImage } from '../lib/loader.js';
import { projects, getProject, getNextProject } from '../data/projects.js';
import { reducedMotion } from '../config.js';
import { store } from '../store.js';

const pad = (n) => String(n).padStart(2, '0');

const MOTION = reducedMotion ? 0 : 1;
const HERO_ZOOM = 0.12; // extra zoom by the time the hero has scrolled away
const FOOTER_ZOOM = 0.12; // next cover settles from this to an exact fit
const PARALLAX = 30; // px, gallery blocks drift ±this while crossing the viewport
const LAZY_MARGIN = 1.5; // load images this many viewport heights ahead
const MINI_WIDTH = 60; // px
const MINI_EDGE = 80; // px kept free above/below the minimap

export class Project extends Page {
  name = 'project';
  scrollable = true;

  constructor(opts) {
    super(opts);
    this.project = getProject(this.params.slug);
    this.next = getNextProject(this.params.slug);
  }

  get title() {
    return `${this.project.title} — MDR`;
  }

  template() {
    const p = this.project;
    const n = this.next;

    // group consecutive images: 40px inside a group, 320px between groups
    const groups = [];
    p.gallery.forEach((img, i) => {
      const item = { ...img, i };
      const last = groups[groups.length - 1];
      if (last && last.id === img.group) last.items.push(item);
      else groups.push({ id: img.group, items: [item] });
    });

    return `
      <section class="p-hero">
        <div class="p-hero-col">
          <h1 class="t-xl t-h1" data-reveal>${linesHTML(p.heroTitle)}</h1>
          <div class="p-hero-info">
            <p class="t-ui" data-reveal>${linesHTML([p.role])}</p>
            <p class="p-summary t-body" data-split>${p.summary.join(' ')}</p>
          </div>
          <div class="p-context t-ui" data-reveal>${linesHTML(p.context)}</div>
          <button class="p-scroll-down t-ui" type="button" data-reveal data-to-gallery>${linesHTML(['Scroll down'])}</button>
        </div>
        <button class="p-scroll-icon" type="button" aria-label="Scroll to gallery" data-to-gallery>
          <svg width="47" height="55" viewBox="0 0 47 55" fill="none" aria-hidden="true">
            <rect class="p-scroll-icon-outline" x="0.5" y="0.5" width="46" height="54" rx="23" pathLength="1" />
            <path class="p-scroll-icon-arrow" d="M23.5 19v16M18 29.5l5.5 5.5 5.5-5.5" />
          </svg>
        </button>
      </section>

      <section class="p-gallery" aria-label="Gallery">
        ${groups
          .map(
            (g) => `
          <div class="p-group">
            ${g.items
              .map(
                (img) => `
              <figure class="p-img" data-block="${img.i}" style="aspect-ratio: ${img.w} / ${img.h}; background: ${img.bg}">
                <img class="p-img-el" data-src="${img.src}" alt="${img.alt}" width="${img.w}" height="${img.h}" draggable="false" />
              </figure>`
              )
              .join('')}
          </div>`
          )
          .join('')}
      </section>

      <footer class="p-footer">
        <a class="p-next" href="/${n.slug}" aria-label="Next project: ${n.title}, ${n.imageCount} images. ${n.tagline}">
          <span class="p-next-title t-xl">
            <span data-reveal>${linesHTML([n.title])}</span>
            <span class="p-next-sup t-sup" data-reveal>${linesHTML([pad(n.imageCount)])}</span>
          </span>
          <span class="p-next-tagline t-l" data-reveal>${linesHTML([n.tagline])}</span>
        </a>
      </footer>
    `;
  }

  ui() {
    return `
      <div class="p-progress" aria-hidden="true"></div>
      <a class="p-back t-ui" href="/" data-reveal>${linesHTML(['Back'])}</a>
      <div class="p-counter"></div>
      <div class="p-mini" aria-hidden="true">
        ${this.project.gallery
          .map(
            (img, i) => `
          <button class="p-mini-item" type="button" tabindex="-1" data-index="${i}" style="background: ${img.bg}"><img class="p-mini-img" alt="" draggable="false" /></button>`
          )
          .join('')}
      </div>
      <div class="p-mini-frame" aria-hidden="true"></div>
    `;
  }

  onMount() {
    store.activeIndex = this.project.index;
    const { webgl } = this.app;

    this.counter = new Counter({ total: projects.length, current: this.project.index });
    this.el.querySelector('.p-counter').append(this.counter.el);
    this.components.push(this.counter);

    this.galleryEl = this.el.querySelector('.p-gallery');
    this.progressEl = this.el.querySelector('.p-progress');
    this.miniEl = this.el.querySelector('.p-mini');
    this.frameEl = this.el.querySelector('.p-mini-frame');
    const minis = [...this.el.querySelectorAll('.p-mini-item')];

    this.blocks = [...this.el.querySelectorAll('.p-img')].map((el, i) => ({
      el,
      img: el.querySelector('.p-img-el'),
      mini: minis[i],
      top: 0,
      height: 0,
      requested: false,
      y: 0,
    }));

    this.el.querySelectorAll('[data-to-gallery]').forEach((btn) =>
      btn.addEventListener('click', () => this.scroll.scrollTo(this.gallery.top - window.innerHeight * 0.1))
    );

    this.miniEl.addEventListener('click', (e) => {
      const item = e.target.closest('.p-mini-item');
      if (!item) return;
      const b = this.blocks[Number(item.dataset.index)];
      this.scroll.scrollTo(b.top - (window.innerHeight - b.height) / 2); // centre the image
    });

    // Footer: if the next cover doesn't fill the screen yet, finish the scroll first,
    // then navigate — so the page change is always the seamless hand-off.
    this.nextLink = this.el.querySelector('.p-next');
    this.nextLink.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || this.atBottom) return;
      e.preventDefault();
      this.goNextOnArrival = true;
      this.scroll.scrollTo(this.scroll.limit);
    });

    // Hero: the cover in WebGL. Coming from Home (or the previous project's footer) it
    // uses the same texture and full-screen rect as the plane it replaces.
    this.hero = new Plane(webgl, { src: this.project.cover });
    this.nextCover = new Plane(webgl, { src: this.next.cover });
    this.nextCover.alpha = 0;
    this.nextCover.visible = false;

    this.measure();
    this.update();
  }

  get atBottom() {
    return this.scroll.limit - this.scroll.current < 1;
  }

  /** Hand-offs: both pages draw the same cover full-screen, so the sail is skipped. */
  handsOffTo(route) {
    if (route.name === 'home') return this.scrollY < 1; // hero still fills the screen
    if (route.name === 'project') return route.params.slug === this.next.slug && this.atBottom;
    return false;
  }

  measure() {
    super.measure();
    if (!this.blocks) return;

    // offsetTop ignores transforms, so parallax never skews these
    this.blocks.forEach((b) => {
      b.top = b.el.offsetTop;
      b.height = b.el.offsetHeight;
    });
    const g = this.galleryEl;
    this.gallery = { top: g.offsetTop, height: g.offsetHeight, width: g.offsetWidth || 1 };

    // minimap = the gallery column scaled to MINI_WIDTH
    const ratio = MINI_WIDTH / this.gallery.width;
    this.ratio = ratio;
    this.miniHeight = this.gallery.height * ratio;
    this.miniEl.style.height = `${this.miniHeight}px`;
    this.blocks.forEach((b) => {
      b.mini.style.top = `${(b.top - this.gallery.top) * ratio}px`;
      b.mini.style.height = `${b.height * ratio}px`;
    });
    this.frameEl.style.height = `${window.innerHeight * ratio}px`;
  }

  load(b) {
    b.requested = true;
    b.img.onload = () => {
      b.el.classList.add('is-loaded');
      const mini = b.mini.firstElementChild;
      mini.onload = () => b.mini.classList.add('is-loaded');
      mini.src = b.img.currentSrc || b.img.src; // same file, served from cache
    };
    setImage(b.img, b.img.dataset.src); // WebP when available, JPG otherwise
  }

  update() {
    const { width, height: vh } = this.app.webgl.viewport;
    const y = this.scrollY;

    // --- hero: moves up 1:1 with the page; inside, the image lags and zooms slightly.
    //     At y = 0 it's an exact cover fit, which the hand-off relies on.
    const heroVisible = y < vh;
    this.hero.visible = heroVisible;
    if (heroVisible) {
      const t = clamp(y / vh, 0, 1) * MOTION;
      this.hero.setRect(0, -y, width, vh);
      this.hero.uniforms.uZoom.value = 1 + t * HERO_ZOOM;
      this.hero.uniforms.uParallaxY.value = t;
    }

    if (!this.scroll || !this.blocks) return;
    const limit = this.scroll.limit;

    // --- footer: next cover fades in over the last screen, settling to an exact fit
    //     (reaches exactly 1 a couple of px before the bottom, so the hand-off state is exact
    //     even while the scroll is still easing out its last fraction of a pixel)
    const f = limit > 0 ? clamp((y - (limit - vh)) / (vh - 2), 0, 1) : 0;
    const footerVisible = f > 0.2;
    this.nextCover.visible = footerVisible;
    if (footerVisible) {
      const a = clamp((f - 0.2) / 0.8, 0, 1);
      this.nextCover.setRect(0, 0, width, vh);
      this.nextCover.alpha = a * a * (3 - 2 * a);
      this.nextCover.uniforms.uZoom.value = 1 + (1 - f) * FOOTER_ZOOM * MOTION;
    }
    if (this.goNextOnArrival && this.atBottom) {
      this.goNextOnArrival = false;
      this.app.router.navigate(`/${this.next.slug}`);
    }

    // --- gallery blocks: lazy load + parallax
    this.blocks.forEach((b) => {
      const near = b.top < y + vh * (1 + LAZY_MARGIN) && b.top + b.height > y - vh * LAZY_MARGIN;
      if (near && !b.requested) this.load(b);

      const inView = b.top < y + vh + PARALLAX && b.top + b.height > y - PARALLAX;
      if (!inView) return;
      // -1 when the block is just below the viewport, +1 when just above
      const d = clamp((y + vh / 2 - (b.top + b.height / 2)) / (vh / 2 + b.height / 2), -1, 1);
      const offset = -d * PARALLAX * MOTION;
      if (offset !== b.y) {
        b.y = offset;
        b.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      }
    });

    // --- progress bar
    const progress = this.scroll.progress;
    if (progress !== this.lastProgress) {
      this.lastProgress = progress;
      this.progressEl.style.transform = `translate3d(0, ${-110 * (1 - progress)}%, 0)`;
    }

    // --- minimap: travels in with the gallery, sticks, and leaves with its end
    //     (like position: sticky). A minimap taller than the screen scrolls within it.
    const mh = this.miniHeight;
    const overflow = Math.max(0, mh - (vh - MINI_EDGE * 2));
    const galleryT = clamp((y - this.gallery.top) / Math.max(this.gallery.height - vh, 1), 0, 1);
    const stick = overflow ? MINI_EDGE - overflow * galleryT : (vh - mh) / 2;
    const miniY = Math.min(Math.max(stick, this.gallery.top - y), this.gallery.top + this.gallery.height - y - mh);
    const frameY = miniY + (y - this.gallery.top) * this.ratio;

    if (miniY !== this.lastMiniY || frameY !== this.lastFrameY) {
      this.lastMiniY = miniY;
      this.lastFrameY = frameY;
      this.miniEl.style.transform = `translate3d(0, ${miniY.toFixed(2)}px, 0)`;
      this.frameEl.style.transform = `translate3d(0, ${frameY.toFixed(2)}px, 0)`;
    }
  }

  enter(opts) {
    super.enter(opts);
    this.el.classList.add('is-in'); // hero gradient, scroll icon draw
  }

  leave(opts) {
    this.el.classList.remove('is-in');
    return super.leave(opts);
  }

  destroy() {
    this.hero.destroy();
    this.nextCover.destroy();
    super.destroy();
  }
}
