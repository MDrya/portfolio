import './styles/home.css';
import './styles/project.css';
import './styles/about.css';

import './lib/ease.js'; // registers eases + GSAP defaults before anything animates
import { App } from './App.js';
import { Loader } from './components/Loader.js';
import { projects } from './data/projects.js';

// Boot: loader (covers + thumbs + font) → mount first page → loader exit → intro.
async function boot() {
  const loader = new Loader(document.getElementById('loader'));
  await loader.load(
    projects.flatMap((p) => [p.cover, p.thumb]),
    { fonts: ['400 16px "Inter Tight"'] }
  );

  const app = new App();
  await app.start(); // mounts the first page behind the loader (fonts are ready, so lines split correctly)

  loader.hide({ onReveal: () => app.intro() });
}

boot();
