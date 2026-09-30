// Project page. The hero background is the cover in WebGL, handed over from Home's slider.
// Phase 9 adds lazy images, parallax, minimap, progress bar and the scroll icon.

import { Page } from './Page.js';
import { Counter } from '../components/Counter.js';
import { Plane } from '../gl/Plane.js';
import { linesHTML } from '../lib/splitLines.js';
import { clamp } from '../lib/math.js';
import { projects, getProject, getNextProject } from '../data/projects.js';
import { reducedMotion } from '../config.js';
import { store } from '../store.js';

const HERO_ZOOM = 0.12; // extra zoom by the time the hero has scrolled away

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
    p.gallery.forEach((img) => {
      const last = groups[groups.length - 1];
      if (last && last.id === img.group) last.items.push(img);
      else groups.push({ id: img.group, items: [img] });
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
          <button class="p-scroll-down t-ui" type="button" data-reveal>${linesHTML(['Scroll down'])}</button>
        </div>
      </section>

      <section class="p-gallery" aria-label="Gallery">
        ${groups
          .map(
            (g) => `
          <div class="p-group">
            ${g.items
              .map(
                (img) => `
              <figure class="p-img" style="aspect-ratio: ${img.w} / ${img.h}; background: ${img.bg}">
                <figcaption class="sr-only">${img.alt}</figcaption>
              </figure>`
              )
              .join('')}
          </div>`
          )
          .join('')}
      </section>

      <footer class="p-footer">
        <a class="p-next" href="/${n.slug}">
          <span class="p-next-title t-xl">
            <span data-reveal>${linesHTML([n.title])}</span>
            <span class="p-next-sup t-sup" data-reveal>${linesHTML([String(n.imageCount).padStart(2, '0')])}</span>
          </span>
          <span class="p-next-tagline t-l" data-reveal>${linesHTML([n.tagline])}</span>
        </a>
      </footer>
    `;
  }

  ui() {
    return `
      <a class="p-back t-ui" href="/" data-reveal>${linesHTML(['Back'])}</a>
      <div class="p-counter"></div>
    `;
  }

  onMount() {
    store.activeIndex = this.project.index;

    this.counter = new Counter({ total: projects.length, current: this.project.index });
    this.el.querySelector('.p-counter').append(this.counter.el);
    this.components.push(this.counter);

    this.el.querySelector('.p-scroll-down').addEventListener('click', () => {
      const gallery = this.el.querySelector('.p-gallery');
      this.scroll.scrollTo(gallery.offsetTop - window.innerHeight * 0.1);
    });

    // Hero background: the cover in WebGL. Coming from Home it uses the same texture and
    // the same full-screen rect as the slider's plane, so the swap is invisible.
    this.hero = new Plane(this.app.webgl, { src: this.project.cover });
    this.update();
  }

  /**
   * Hand-off back to Home: only while the hero still fills the screen. Home opens on
   * this project (store.activeIndex), so its slider draws the identical frame.
   */
  handsOffTo(route) {
    return route.name === 'home' && this.scrollY < 1;
  }

  update() {
    const { width, height } = this.app.webgl.viewport;
    const y = this.scrollY;

    const visible = y < height;
    this.hero.visible = visible;
    if (!visible) return;

    // The plane moves up 1:1 with the page (exact DOM alignment); inside it the image
    // lags and zooms slightly, which reads as a slower parallax layer. At y = 0 this is
    // an exact cover fit — required for the hand-off.
    const progress = clamp(y / height, 0, 1) * (reducedMotion ? 0 : 1);
    this.hero.setRect(0, -y, width, height);
    this.hero.uniforms.uZoom.value = 1 + progress * HERO_ZOOM;
    this.hero.uniforms.uParallaxY.value = progress;
  }

  enter(opts) {
    super.enter(opts);
    this.el.classList.add('is-in'); // fades in the legibility gradient over the hero
  }

  leave(opts) {
    this.el.classList.remove('is-in');
    return super.leave(opts);
  }

  destroy() {
    this.hero.destroy();
    super.destroy();
  }
}
