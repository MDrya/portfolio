// Project content. Replace titles, text and images with real work.
// Images live in /public/images/<slug>/ — run `npm run placeholders` to (re)generate
// placeholder JPGs for any file listed here that doesn't exist yet.
//
// gallery[].group — visual block: 320px between groups, 40px inside a group.
// gallery[].bg    — solid colour shown behind the image while it loads.

const list = [
  {
    slug: 'maket-study',
    title: 'Scale Model Study',
    heroTitle: ['Building Space', 'At One To Fifty'],
    tagline: 'A small house, cut open',
    role: 'Designer',
    summary: ['A study model exploring', 'light, circulation and', 'material in a small', 'residential interior.'],
    context: ['Coursework', 'Interior Design ITB'],
    accent: ['#d9d3c7', '#8c7f6b'],
    gallery: [
      { group: 1, src: '/images/maket-study/01.jpg', w: 1800, h: 1012, bg: '#e9e6e1', alt: 'Model overview from above' },
      { group: 1, src: '/images/maket-study/02.jpg', w: 1800, h: 1012, bg: '#dcd8d1', alt: 'Section cut through the living area' },
      { group: 2, src: '/images/maket-study/03.jpg', w: 1800, h: 1012, bg: '#3b3834', alt: 'Night lighting test' },
      { group: 3, src: '/images/maket-study/04.jpg', w: 1200, h: 1500, bg: '#cfc8bb', alt: 'Stair detail' },
      { group: 3, src: '/images/maket-study/05.jpg', w: 1200, h: 1500, bg: '#bdb4a4', alt: 'Window reveal and light slot' },
      { group: 4, src: '/images/maket-study/06.jpg', w: 1800, h: 1012, bg: '#a79c89', alt: 'Model in context with the site plan' },
    ],
  },
  {
    slug: 'material-colour',
    title: 'Material & Colour',
    heroTitle: ['Surfaces That', 'Hold The Light'],
    tagline: 'A palette built from samples',
    role: 'Researcher',
    summary: ['A catalogue of timber,', 'stone and textile samples', 'tested under daylight', 'and warm artificial light.'],
    context: ['Studio Module', 'Interior Design ITB'],
    accent: ['#c9a78a', '#5e4636'],
    gallery: [
      { group: 1, src: '/images/material-colour/01.jpg', w: 1800, h: 1012, bg: '#c9a78a', alt: 'Sample board, overview' },
      { group: 2, src: '/images/material-colour/02.jpg', w: 1200, h: 1500, bg: '#8a6a52', alt: 'Teak veneer under daylight' },
      { group: 2, src: '/images/material-colour/03.jpg', w: 1200, h: 1500, bg: '#b8a795', alt: 'Terrazzo sample' },
      { group: 3, src: '/images/material-colour/04.jpg', w: 1800, h: 1012, bg: '#5e4636', alt: 'Samples under 2700K light' },
      { group: 3, src: '/images/material-colour/05.jpg', w: 1800, h: 1012, bg: '#d8c6b1', alt: 'Final palette' },
    ],
  },
  {
    slug: 'ergonomics',
    title: 'Ergonomics Study',
    heroTitle: ['Measured', 'By The Body'],
    tagline: 'Furniture drawn from anthropometry',
    role: 'Designer',
    summary: ['Reach, clearance and', 'posture studies turned', 'into a compact work', 'and study corner.'],
    context: ['Coursework', 'Interior Design ITB'],
    accent: ['#b7c0c2', '#4d5a5e'],
    gallery: [
      { group: 1, src: '/images/ergonomics/01.jpg', w: 1800, h: 1012, bg: '#b7c0c2', alt: 'Anthropometric reference drawing' },
      { group: 1, src: '/images/ergonomics/02.jpg', w: 1800, h: 1012, bg: '#9aa6a9', alt: 'Seated reach envelope' },
      { group: 2, src: '/images/ergonomics/03.jpg', w: 1200, h: 1500, bg: '#4d5a5e', alt: 'Desk height mock-up' },
      { group: 3, src: '/images/ergonomics/04.jpg', w: 1800, h: 1012, bg: '#d3d8d8', alt: 'Final study corner layout' },
    ],
  },
  {
    slug: 'birudaun',
    title: 'Birudaun',
    heroTitle: ['A Garment Brand', 'In Blue And Leaf'],
    tagline: 'Identity for a small label',
    role: 'Brand Designer',
    summary: ['Logo, colour system and', 'packaging for a local', 'garment brand rooted', 'in natural dyes.'],
    context: ['Independent', 'Brand Identity'],
    accent: ['#3f5a73', '#1d2c38'],
    gallery: [
      { group: 1, src: '/images/birudaun/01.jpg', w: 1800, h: 1012, bg: '#3f5a73', alt: 'Birudaun logotype' },
      { group: 2, src: '/images/birudaun/02.jpg', w: 1200, h: 1500, bg: '#6f8c6b', alt: 'Colour system' },
      { group: 2, src: '/images/birudaun/03.jpg', w: 1200, h: 1500, bg: '#2a3d4e', alt: 'Swing tag and label' },
      { group: 3, src: '/images/birudaun/04.jpg', w: 1800, h: 1012, bg: '#1d2c38', alt: 'Packaging set' },
      { group: 3, src: '/images/birudaun/05.jpg', w: 1800, h: 1012, bg: '#a7b9a2', alt: 'Garment photography' },
      { group: 4, src: '/images/birudaun/06.jpg', w: 1800, h: 1012, bg: '#56708a', alt: 'Social media templates' },
    ],
  },
  {
    slug: 'kaos-kmsr',
    title: 'Kaos KMSR',
    heroTitle: ['Pre-Order', 'For A Student Guild'],
    tagline: 'Merch, made simple to buy',
    role: 'Designer & Developer',
    summary: ['A lightweight pre-order', 'site for the KMSR guild', 'T-shirt, from design', 'to order form.'],
    context: ['KMSR ITB', 'Web Project'],
    accent: ['#2b2b2b', '#b33a2e'],
    gallery: [
      { group: 1, src: '/images/kaos-kmsr/01.jpg', w: 1800, h: 1012, bg: '#2b2b2b', alt: 'Landing page' },
      { group: 1, src: '/images/kaos-kmsr/02.jpg', w: 1800, h: 1012, bg: '#3a3a3a', alt: 'Size guide' },
      { group: 2, src: '/images/kaos-kmsr/03.jpg', w: 1200, h: 1500, bg: '#b33a2e', alt: 'T-shirt front graphic' },
      { group: 2, src: '/images/kaos-kmsr/04.jpg', w: 1200, h: 1500, bg: '#e2ddd5', alt: 'T-shirt back graphic' },
      { group: 3, src: '/images/kaos-kmsr/05.jpg', w: 1800, h: 1012, bg: '#1f1f1f', alt: 'Order form on mobile' },
    ],
  },
  {
    slug: 'interior-concept',
    title: 'Interior Concept',
    heroTitle: ['A Café', 'Under Bandung Rain'],
    tagline: 'Shelter, warmth and a long table',
    role: 'Interior Designer',
    summary: ['A concept for a small', 'café interior organised', 'around one shared table', 'and a covered terrace.'],
    context: ['Studio Project', 'Interior Design ITB'],
    accent: ['#6b5a45', '#2d251d'],
    gallery: [
      { group: 1, src: '/images/interior-concept/01.jpg', w: 1800, h: 1012, bg: '#6b5a45', alt: 'Concept rendering, main hall' },
      { group: 2, src: '/images/interior-concept/02.jpg', w: 1800, h: 1012, bg: '#e6dfd3', alt: 'Floor plan' },
      { group: 2, src: '/images/interior-concept/03.jpg', w: 1800, h: 1012, bg: '#d6ccbc', alt: 'Section A-A' },
      { group: 3, src: '/images/interior-concept/04.jpg', w: 1200, h: 1500, bg: '#2d251d', alt: 'Terrace at dusk' },
      { group: 3, src: '/images/interior-concept/05.jpg', w: 1200, h: 1500, bg: '#8a7660', alt: 'Long table detail' },
      { group: 4, src: '/images/interior-concept/06.jpg', w: 1800, h: 1012, bg: '#a8987f', alt: 'Material board' },
      { group: 4, src: '/images/interior-concept/07.jpg', w: 1800, h: 1012, bg: '#4a3e31', alt: 'Lighting plan' },
    ],
  },
  {
    slug: 'furniture-detail',
    title: 'Furniture Detail',
    heroTitle: ['One Joint,', 'Drawn Ten Times'],
    tagline: 'From sketch to shop drawing',
    role: 'Designer',
    summary: ['A side table developed', 'through iterations of a', 'single timber joint and', 'full-scale prototypes.'],
    context: ['Coursework', 'Interior Design ITB'],
    accent: ['#a88a63', '#3e3326'],
    gallery: [
      { group: 1, src: '/images/furniture-detail/01.jpg', w: 1200, h: 1500, bg: '#a88a63', alt: 'Side table prototype' },
      { group: 1, src: '/images/furniture-detail/02.jpg', w: 1200, h: 1500, bg: '#c4ad8d', alt: 'Joint close-up' },
      { group: 2, src: '/images/furniture-detail/03.jpg', w: 1800, h: 1012, bg: '#ece6dc', alt: 'Shop drawing' },
      { group: 3, src: '/images/furniture-detail/04.jpg', w: 1800, h: 1012, bg: '#3e3326', alt: 'Joint iterations' },
    ],
  },
];

export const projects = list.map((p, index) => ({
  ...p,
  index,
  cover: `/images/${p.slug}/cover.jpg`,
  thumb: `/images/${p.slug}/cover-thumb.jpg`,
  imageCount: p.gallery.length,
}));

export const getProject = (slug) => projects.find((p) => p.slug === slug);

export const getNextProject = (slug) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
