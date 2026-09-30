// Home — full mode shell: active cover in WebGL + centred title + pagination.
// Phase 6/7 turn this into the slider (full + strip modes).

import { Page } from './Page.js';
import { Counter } from '../components/Counter.js';
import { Plane } from '../gl/Plane.js';
import { linesHTML } from '../lib/splitLines.js';
import { loadImage } from '../lib/loader.js';
import { projects } from '../data/projects.js';
import { store } from '../store.js';

export class Home extends Page {
  name = 'home';

  get title() {
    return 'MDR — Interior Design Portfolio';
  }

  get project() {
    return projects[store.activeIndex];
  }

  ui() {
    const p = this.project;
    return `
      <a class="h-title t-xl" href="/${p.slug}">
        <span class="h-title-text" data-reveal>${linesHTML([p.title])}</span>
        <span class="h-sup t-sup" data-reveal>${linesHTML([String(p.imageCount).padStart(2, '0')])}</span>
      </a>
      <div class="h-pagination"></div>
    `;
  }

  onMount() {
    this.counter = new Counter({ total: projects.length, current: store.activeIndex });
    this.el.querySelector('.h-pagination').append(this.counter.el);
    this.components.push(this.counter);

    const { webgl } = this.app;
    this.cover = new Plane(webgl);
    loadImage(this.project.cover).then((img) => img && this.cover && this.cover.setImage(img));

    this.layout = ({ width, height }) => this.cover.setRect(0, 0, width, height);
    this.layout(webgl.viewport);
    this.offResize = webgl.onResize(this.layout);
  }

  destroy() {
    super.destroy();
    this.offResize();
    this.cover.destroy();
    this.cover = null;
  }
}
