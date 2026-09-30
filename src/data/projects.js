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
      { group: 1, src: '/images/maket-study/01.jpg', w: 1800, h: 1012, bg: '#9c988e', alt: 'White and brown architectural model of a building' },
      { group: 1, src: '/images/maket-study/02.jpg', w: 1800, h: 1012, bg: '#b6b6ae', alt: 'Scale model of a house on a table' },
      { group: 2, src: '/images/maket-study/03.jpg', w: 1800, h: 1012, bg: '#b9bdbc', alt: 'Model of a city block with buildings and streets' },
      { group: 3, src: '/images/maket-study/04.jpg', w: 1200, h: 1500, bg: '#b2b4ac', alt: 'Tall white building model seen from the front' },
      { group: 3, src: '/images/maket-study/05.jpg', w: 1200, h: 1500, bg: '#c3c8c8', alt: 'White building model with rows of windows' },
      { group: 4, src: '/images/maket-study/06.jpg', w: 1800, h: 1012, bg: '#454848', alt: 'Clear acrylic model of a large building' },
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
      { group: 1, src: '/images/material-colour/01.jpg', w: 1800, h: 1012, bg: '#6e6967', alt: 'Material samples arranged on a white surface' },
      { group: 2, src: '/images/material-colour/02.jpg', w: 1200, h: 1500, bg: '#776965', alt: 'Fabric swatches laid out on a table' },
      { group: 2, src: '/images/material-colour/03.jpg', w: 1200, h: 1500, bg: '#a29279', alt: 'Hand holding colour swatches over drawings' },
      { group: 3, src: '/images/material-colour/04.jpg', w: 1800, h: 1012, bg: '#6a4f40', alt: 'Assortment of wood and stone samples' },
      { group: 3, src: '/images/material-colour/05.jpg', w: 1800, h: 1012, bg: '#555652', alt: 'Textures and materials displayed together' },
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
      { group: 1, src: '/images/ergonomics/01.jpg', w: 1800, h: 1012, bg: '#897966', alt: 'Desk with a laptop at working height' },
      { group: 1, src: '/images/ergonomics/02.jpg', w: 1800, h: 1012, bg: '#b2b5ae', alt: 'Wooden desk with a chair and a laptop' },
      { group: 2, src: '/images/ergonomics/03.jpg', w: 1200, h: 1500, bg: '#9c9a96', alt: 'Grey office chair beside a wooden desk' },
      { group: 3, src: '/images/ergonomics/04.jpg', w: 1800, h: 1012, bg: '#9e9c91', alt: 'A chair and a desk in a plain room' },
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
      { group: 1, src: '/images/birudaun/01.jpg', w: 1800, h: 1012, bg: '#5a84a7', alt: 'Blue and white dyed pattern with yellow accents' },
      { group: 2, src: '/images/birudaun/02.jpg', w: 1200, h: 1500, bg: '#323c47', alt: 'Blue dyed cloths hanging on a line' },
      { group: 2, src: '/images/birudaun/03.jpg', w: 1200, h: 1500, bg: '#7292b1', alt: 'Patterned fabrics hanging outdoors to dry' },
      { group: 3, src: '/images/birudaun/04.jpg', w: 1800, h: 1012, bg: '#54778e', alt: 'Dyeing fabric by hand in a workshop' },
      { group: 3, src: '/images/birudaun/05.jpg', w: 1800, h: 1012, bg: '#848176', alt: 'Row of blue and white garments' },
      { group: 4, src: '/images/birudaun/06.jpg', w: 1800, h: 1012, bg: '#747f8d', alt: 'Dye vats and sinks in a workshop' },
    ],
  },
  {
    slug: 'kaos-kmsr',
    title: 'Anatomy of ITB',
    heroTitle: ['Pre-Order', 'For A Student Guild'],
    tagline: 'Merch, made simple to buy',
    role: 'Designer & Developer',
    summary: ['A lightweight pre-order', 'site for the KMSR guild', 'T-shirt, from design', 'to order form.'],
    context: ['KMSR ITB', 'Web Project'],
    accent: ['#2b2b2b', '#b33a2e'],
    gallery: [
      { group: 1, src: '/images/kaos-kmsr/01.jpg', w: 1800, h: 1012, bg: '#6f766c', alt: 'Printing a shirt by hand, wearing gloves' },
      { group: 1, src: '/images/kaos-kmsr/02.jpg', w: 1800, h: 1012, bg: '#696b62', alt: 'Working at a printing machine' },
      { group: 2, src: '/images/kaos-kmsr/03.jpg', w: 1131, h: 1600, bg: '#000000', alt: 'Anatomy of ITB T-shirt, front: two rows of numbers in blue on the chest' },
      { group: 2, src: '/images/kaos-kmsr/04.jpg', w: 1131, h: 1600, bg: '#000000', alt: 'Anatomy of ITB T-shirt, back: a grid of twelve objects above the words Anatomy of ITB — Science, Engineering, Art, Business' },
      { group: 3, src: '/images/kaos-kmsr/05.jpg', w: 1800, h: 1012, bg: '#c2bebc', alt: 'White T-shirt with a colour-block graphic' },
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
      { group: 1, src: '/images/interior-concept/01.jpg', w: 1800, h: 1012, bg: '#777068', alt: 'Rustic café interior with wooden tables' },
      { group: 2, src: '/images/interior-concept/02.jpg', w: 1800, h: 1012, bg: '#5c4e3c', alt: 'Round wooden tables beside a leather sofa' },
      { group: 2, src: '/images/interior-concept/03.jpg', w: 1800, h: 1012, bg: '#8b5f30', alt: 'Large room with tables and chairs' },
      { group: 3, src: '/images/interior-concept/04.jpg', w: 1200, h: 1500, bg: '#594c30', alt: 'Table and chairs by a large window' },
      { group: 3, src: '/images/interior-concept/05.jpg', w: 1200, h: 1500, bg: '#aba79f', alt: 'White and brown dining table and chairs' },
      { group: 4, src: '/images/interior-concept/06.jpg', w: 1800, h: 1012, bg: '#676e68', alt: 'People sitting inside a café' },
      { group: 4, src: '/images/interior-concept/07.jpg', w: 1800, h: 1012, bg: '#5d574f', alt: 'Guests seated in a café at dusk' },
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
      { group: 1, src: '/images/furniture-detail/01.jpg', w: 1200, h: 1500, bg: '#8a7463', alt: 'Finishing a wooden table top with a cloth' },
      { group: 1, src: '/images/furniture-detail/02.jpg', w: 1200, h: 1500, bg: '#8c775b', alt: 'Marking a line on a wooden board with a pencil' },
      { group: 2, src: '/images/furniture-detail/03.jpg', w: 1800, h: 1012, bg: '#6f5f44', alt: 'Marker and measurements on a wooden table' },
      { group: 3, src: '/images/furniture-detail/04.jpg', w: 1800, h: 1012, bg: '#453a3c', alt: 'Working on a piece of wood in the shop' },
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
