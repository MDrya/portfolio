# MDR — Portfolio

Portfolio of Muhammad Daiva Rasendrya (Interior Design, ITB). A WebGL project slider with
smooth page transitions, built with plain JavaScript: Vite, OGL and GSAP — no framework.

Layout and interaction are a study inspired by camillemormal.com. All content, images
and code here are my own.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173. `npm run build` writes the static site to `dist/`, and
`npm run preview` serves that build.

If your system has "reduce motion" switched on, animations are shortened and parallax is
off. Add `?motion=full` to the address to see the full motion while developing.

## Change the content

| What | Where |
|---|---|
| Projects (titles, text, gallery) | `src/data/projects.js` |
| About page | `src/data/about.js` |
| Images | `public/images/<slug>/` — `cover.jpg`, `cover-thumb.jpg`, `01.jpg` … |
| Colours, easings, type scale | `src/styles/main.css` |
| Slider and motion settings | `src/config.js` |

After adding or replacing photos:

```bash
npm run images
```

This downsizes them, writes a WebP next to each one and reports anything over the size
budget (covers 400KB, gallery images 300KB). It overwrites the files in `public/images`
with smaller versions, so keep your full-resolution originals somewhere else.

`npm run placeholders` draws gradient placeholders for any image listed in
`projects.js` that doesn't exist yet.

## How it is put together

```
src/
  main.js          boot: loader → first page → intro
  App.js           routes, page transitions, hand-offs
  lib/             router, virtual scroll, loader, line splitting, reveal helpers
  gl/              renderer, planes, the home slider, shaders
  pages/           Home, Project, About (each has enter / leave)
  components/      counter, loader
  data/            projects and about content
  styles/          one stylesheet per page + main.css
```

## Deploy

The site is static. On Vercel, import the repository and keep the defaults — `vercel.json`
sets the build command, the output folder and the rewrites that make direct links such as
`/about` work.
