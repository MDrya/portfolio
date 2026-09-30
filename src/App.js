// Owns the current page and runs page transitions:
//   old page text exits + #sail fades in → swap pages → #sail fades out + new page enters.

import gsap from 'gsap';
import { Router } from './lib/router.js';
import { revealIn } from './lib/reveal.js';
import { Renderer } from './gl/Renderer.js';
import { routes } from './config.js';
import { getProject } from './data/projects.js';
import { Home } from './pages/Home.js';
import { Project } from './pages/Project.js';
import { About } from './pages/About.js';
import { NotFound } from './pages/NotFound.js';

const pages = { home: Home, project: Project, about: About, notfound: NotFound };

function resolve(path) {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === routes.home.path) return { name: 'home', params: {} };
  if (clean === routes.about.path) return { name: 'about', params: {} };

  const slug = clean.slice(1);
  if (!slug.includes('/') && getProject(slug)) return { name: 'project', params: { slug } };
  return { name: 'notfound', params: {} };
}

export class App {
  constructor() {
    this.container = document.getElementById('app');
    this.sail = document.getElementById('sail');
    this.navLinks = [...document.querySelectorAll('.nav-link')];
    this.webgl = new Renderer(document.getElementById('gl'));
    this.page = null;
    this.scrollMemory = new Map(); // history key → scroll position

    this.router = new Router({ resolve, onNavigate: (route, info) => this.go(route, info) });
  }

  /** Resolves the current URL and mounts the first page (without entering it). */
  start() {
    return this.router.start();
  }

  /** First entrance, after the loader: nav + first page. */
  intro() {
    revealIn(this.navLinks.map((a) => a.querySelector('.line-in')), { delay: 0.1 });
    this.page.enter({ delay: 0.15 });
  }

  setNav(route) {
    const current = route.name === 'about' ? 'about' : 'home'; // projects live under Work
    this.navLinks.forEach((link) => {
      const active = link.dataset.route === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  async go(route, { initial, pop, key, fromKey }) {
    const next = new pages[route.name]({ app: this, params: route.params });
    this.setNav(route);

    if (initial) {
      // mounted behind the loader; intro() plays its entrance
      next.mount(this.container);
      document.title = next.title;
      this.page = next;
      return;
    }

    const prev = this.page;
    if (prev.scroll) this.scrollMemory.set(fromKey, prev.scroll.current);

    this.sail.style.pointerEvents = 'auto'; // block clicks on the old page mid-transition
    await Promise.all([prev.leave(), gsap.to(this.sail, { opacity: 1, duration: 0.6, ease: 'o2' })]);

    prev.destroy();
    next.mount(this.container);
    document.title = next.title;
    this.page = next;

    if (pop && next.scroll && this.scrollMemory.has(key)) {
      next.scroll.scrollTo(this.scrollMemory.get(key), { immediate: true });
      next.measure();
    }

    next.enter({ delay: 0.25 });
    await gsap.to(this.sail, { opacity: 0, duration: 0.6, ease: 'o2', delay: 0.05 });
    this.sail.style.pointerEvents = '';
  }
}
