import { Page } from './Page.js';
import { linesHTML } from '../lib/splitLines.js';

export class NotFound extends Page {
  name = 'notfound';

  get title() {
    return 'Not found — MDR';
  }

  ui() {
    return `
      <div class="nf">
        <h1 class="t-xl" data-reveal>${linesHTML(['Nothing here'])}</h1>
        <a class="nf-link t-ui" href="/" data-reveal>${linesHTML(['Back to work'])}</a>
      </div>
    `;
  }
}
