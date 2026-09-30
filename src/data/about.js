// About page content. Each section renders as one `.a-r-s` block in the right column
// (and is mirrored automatically in the left minimap).
//
// Section types:
//   text    — paragraphs in About-large type
//   entries — heading-size title, muted meta line below (dates / place)
//   links   — list of { label, href }

export const about = [
  {
    id: 'intro',
    type: 'text',
    paragraphs: [
      'I am Muhammad Daiva Rasendrya, an Interior Design student at Institut Teknologi Bandung, Faculty of Art and Design.',
      'I work on small, careful spaces: how light falls, how a body moves through a room, and how materials age. I also design identities and build websites for the things I care about.',
    ],
  },
  {
    id: 'education',
    type: 'entries',
    title: 'Education',
    entries: [
      { title: 'Interior Design, ITB (FSRD)', meta: 'Class of 2025 — Bandung' },
      // { title: 'Course or program name', meta: 'Year — Place' },
    ],
  },
  {
    id: 'experience',
    type: 'entries',
    title: 'Selected Projects',
    entries: [
      { title: 'Designer — Scale Model Study', meta: '2024' },
      { title: 'Brand Designer — Birudaun', meta: '2024' },
      { title: 'Designer & Developer — Kaos KMSR', meta: '2024' },
      { title: 'Interior Designer — Café Concept', meta: '2025' },
    ],
  },
  {
    id: 'skills',
    type: 'entries',
    title: 'Skills & Tools',
    entries: [
      { title: 'SketchUp, AutoCAD, Enscape', meta: 'Modelling & visualisation' },
      { title: 'Illustrator, Photoshop, Figma', meta: 'Graphics & identity' },
      { title: 'Physical model making', meta: 'Scale models, prototypes' },
      { title: 'HTML, CSS, JavaScript', meta: 'Web' },
    ],
  },
  {
    id: 'contact',
    type: 'links',
    title: 'Get In Touch',
    links: [
      { label: 'daivarasendrya1680@gmail.com', href: 'mailto:daivarasendrya1680@gmail.com' },
      // TODO: add your profile URLs, then uncomment
      // { label: 'Instagram', href: 'https://instagram.com/<your-handle>' },
      // { label: 'LinkedIn', href: 'https://www.linkedin.com/in/<your-handle>' },
    ],
  },
  {
    id: 'credits',
    type: 'text',
    small: true,
    paragraphs: [
      'Design & development: MDR.',
      'Layout & interaction study inspired by camillemormal.com',
      'Typeface: Inter Tight (SIL Open Font License).',
      // remove this line once your own project photos are in public/images
      'Stand-in photography from Unsplash — see /images/CREDITS.md.',
    ],
  },
];
