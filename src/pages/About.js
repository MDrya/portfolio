// About page — right column content. Phase 10 adds the scaled left minimap.

import { Page } from './Page.js';
import { linesHTML } from '../lib/splitLines.js';
import { about } from '../data/about.js';

const external = (href) => /^https?:/.test(href);

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
            ${external(l.href) ? 'target="_blank" rel="noopener noreferrer"' : ''}>${linesHTML([l.label])}</a>
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
      <div class="a-right">
        ${about.map((s) => `<section class="a-r-s" id="${s.id}">${sections[s.type](s)}</section>`).join('')}
      </div>
    `;
  }
}
