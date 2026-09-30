// Site-wide configuration. Page modules and the router read from here.

export const routes = {
  home: { path: '/', page: 'Home' },
  about: { path: '/about', page: 'About' },
  // any other single-segment path is matched against project slugs
  project: { path: '/:slug', page: 'Project' },
};

// Reference sizes the type scale and layout were designed at.
export const design = {
  desktop: { width: 1600, height: 1000 },
  mobile: { width: 375, height: 800 },
};

export const breakpoints = {
  mobile: 768, // project + about switch to single column
  tablet: 1000, // hide home pagination and about minimap
};

export const gl = {
  maxDpr: 2,
};

export const motion = {
  lerp: 0.09, // inertia factor for scroll / drag
  reveal: 1200, // ms, default reveal duration
  stagger: 70, // ms between masked lines
  hover: 300, // ms
};

export const slider = {
  snapOnRelease: true, // snap to nearest card and return to full mode after a drag
  cardHeight: 0.28, // fraction of viewport height
  cardRatio: 0.7, // width / height
  cardGap: 15, // px
};

// Follows the OS setting; `?motion=full` or `?motion=reduce` overrides it for testing.
// Exposed to CSS as <html data-motion="full|reduce">.
export const reducedMotion = (() => {
  if (typeof window === 'undefined') return false;
  const override = new URLSearchParams(window.location.search).get('motion');
  const reduce = override
    ? override === 'reduce'
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.dataset.motion = reduce ? 'reduce' : 'full';
  return reduce;
})();
