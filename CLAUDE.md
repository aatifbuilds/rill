# Project: bottle-page ("RILL", a fictional product, a design practice build)

## Goal
Learn web page, UI and UX design by rebuilding a scroll-driven smart-bottle product page seen in a reel, and by trying
our web-design skills on it (see docs/plan.md for the phases and docs/design.md for the chosen direction).

## Hard rules
- **Published on the owner's OK, 6 Nov 2026** (public GitHub repo and GitHub Pages) as RILL, a fictional product. It was renamed from DRIP, the original creator's demo name, before publishing. Never publish anything else, or change what is public, without the owner's explicit OK.
- **No third-party assets.** Frames from the reel live only in git-ignored `docs/reference/` for side-by-side checks. Never copy them, their text or their artwork into `src/` or `public/`. All copy and art are original.
- **Free tools only:** three.js, Motion, Vite, Vitest, ESLint (all MIT). Fonts self-hosted through `@fontsource/*` (no external requests).
- Secrets go in `.env.local` only (there are none today). `.env*` stays in `.gitignore`.
- Add `.playwright-cli/`, `.taste-skill/`, `.impeccable/` to `.gitignore` (done).

## Layout
- `src/scene/` the 3D bottle, lighting and particles (three.js)
- `src/scroll/` pure scroll-to-camera maths (unit tested) and the Motion `scroll()` binding
- `src/ui/` nav, text overlays, gauge. `src/styles/` design tokens and layout CSS
- `docs/` PRD.md, plan.md, design.md, design-system/ (from ui-ux-pro-max), reference/ (git-ignored)

## Commands
`npm run dev` (dev server) · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` · `npm run preview`
Before saying "done": run lint, typecheck, test and build, and report what passed.

## Skills and order
design-taste-frontend then ui-ux-pro-max (direction), animate and apple-design (build), review-animations and
animation-performance (motion), impeccable and emil-design-eng (polish), break-ui and mobile-native (stress test),
playwright-cli (look). Direction wins over lookups if they disagree.
