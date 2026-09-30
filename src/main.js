import './styles/home.css';
import './styles/project.css';
import './styles/about.css';

import './lib/ease.js'; // registers eases + GSAP defaults before anything animates
import { App } from './App.js';

// Boot. Phase 4 puts the loader in front of this.
async function boot() {
  await document.fonts.ready; // line splitting needs final font metrics
  const app = new App();
  await app.start();
}

boot();
