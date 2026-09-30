// Home — shell. Phase 6/7 replace this with the WebGL slider (full + strip modes).

import { Page } from './Page.js';
import { Counter } from '../components/Counter.js';
import { linesHTML } from '../lib/splitLines.js';
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
  }
}
