# Bhumika Pandhare — Portfolio

Interactive portfolio built with **Next.js 16 · React 19 · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Lenis · Three.js / React Three Fiber**.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

## Editing content

All content lives in `src/data/` — components never hard-code facts.

| File | What it holds |
| --- | --- |
| `site.ts` | name, role, tagline, interests, nav |
| `social.ts` | **email, GitHub, LinkedIn, résumé PDF path** — empty values are hidden (and flagged in dev only) |
| `projects.ts` | the four projects + full case-study content and architecture diagrams |
| `skills.ts` | technologies, groups and ecosystem links for the skill graph |
| `education.ts` | degree details |
| `certifications.ts` | empty → section shows a "being compiled" state |
| `journey.ts` | thematic journey chapters (no invented dates) |

- Real screenshots: put `public/projects/<slug>.jpg` and set `image` on the project — it replaces the generative poster.
- Résumé PDF: put it in `public/` and set `social.resumePdf`. `/resume` is also generated from the data and is print-ready.

## Architecture

```
src/
  app/                 layout (fonts, providers), home, /work/[slug], /resume, 404
  components/
    cursor/            FluidCursor (WebGL2 fluid simulation) + CustomCursor (contextual label pill)
    layout/            SmoothScroll (Lenis↔GSAP ticker), PageTransition, Navigation, BackToTop
    three/             SceneCanvas, HeroScene (Hopf fibration particles), shaders/
    sections/          Hero, About, Work, Skills + SkillMap (ecosystem), Timeline, Education,
                       Certifications, Resume, Contact, Footer
    project/           ProjectPreview, ProjectPoster, ProjectDetail, ArchitectureDiagram
    ui/                MagneticButton, TransitionLink, SectionHeading, Icon, …
  lib/                 gsap setup, device tiers, pointer tracker, hooks, scroll helpers
```

**Cursor:** pointer movement injects coloured dye into a GPU fluid simulation (sleeps when idle). Elements can show a label pill with `data-cursor="view|visit|drag"` and optional `data-cursor-label`.

**Performance:** WebGL is dynamically imported, quality is tiered per device (`lib/device.ts`), render loops pause off-screen, DPR adapts under load, Reduced-motion users and devices without WebGL get static fallbacks, native cursor and no smooth scrolling.
