import './styles/home.css';
import './styles/project.css';
import './styles/about.css';

import { routes } from './config.js';

// Phase 1 boot: highlight the nav item for the current path.
// Replaced by loader → router → first page in later phases.
function setActiveNav(pathname) {
  const current = pathname === routes.about.path ? 'about' : 'home';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const active = link.dataset.route === current;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

setActiveNav(window.location.pathname);
