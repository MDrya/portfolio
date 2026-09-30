// Dev-only test bed for phase 2 (open /playground.html). Not part of the production build.

import gsap from 'gsap';
import '../lib/ease.js';
import { SplitLines, linesHTML } from '../lib/splitLines.js';
import { revealIn, revealOut, revealReset } from '../lib/reveal.js';
import { Counter } from '../components/Counter.js';
import { projects } from '../data/projects.js';
import { about } from '../data/about.js';

const project = projects[0];
const $ = (id) => document.getElementById(id);

// Fixed-line content comes straight from the data arrays.
$('hero').innerHTML = linesHTML(project.heroTitle);
$('role').innerHTML = linesHTML([project.role]);

// Free-flowing text is split by measuring where the browser wraps.
$('summary').textContent = project.summary.join(' ');
$('about').textContent = about[0].paragraphs[0];

const counter = new Counter({ total: 8 });
$('counter').append(counter.el);

let stepper;

function autoCount() {
  stepper?.kill();
  stepper = gsap.delayedCall(1, () => {
    if (counter.current < counter.total - 1) {
      counter.next();
      autoCount();
    }
  });
}

await document.fonts.ready;

const blocks = [$('hero'), $('role'), new SplitLines($('summary')), new SplitLines($('about'))];

function intro() {
  stepper?.kill();
  blocks.forEach(revealReset);
  counter.set(0, { immediate: true });

  blocks.forEach((b, i) => revealIn(b, { delay: 0.2 + i * 0.15 }));
  counter.enter({ delay: 0.3 });
  autoCount();
}

const actions = {
  replay: intro,
  out() {
    stepper?.kill();
    blocks.forEach((b) => revealOut(b));
    counter.leave();
  },
  prev: () => {
    stepper?.kill();
    counter.prev();
  },
  next: () => {
    stepper?.kill();
    counter.next();
  },
};

document.querySelector('.pg-controls').addEventListener('click', (e) => {
  const action = e.target.closest('button')?.dataset.action;
  actions[action]?.();
});

intro();
