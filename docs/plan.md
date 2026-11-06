# Plan: recreate the "DRIP" bottle scroll page, and try our web-design skills on it

## Context
- **Why:** the owner wants to learn web page / UI / UX design hands-on. A creator's reel (ref 11, `@favourite.engineer`) showed a scroll-driven product site for a smart water bottle called DRIP. The owner wants to rebuild it and, in doing so, **try each design skill we have** to see what it adds.
- **What the reference page does** (read from a low-resolution screen recording of a laptop; the original page files are not available): sticky nav (Home / About / Shop, centred logo, user and bag icons, Buy now); **hero** with the matte-black bottle in a diagonal close-up and the headline "The Future / Of Hydration" plus a "Scroll Down" cue; **full bottle** upright with a small text callout (rubber base for stability); **macro close-up** of the speckled, sparkly coating on the cap; **battery section** with a glowing purple icon stack filling a gauge ("Battery Capacity", "5000 mAh", "Stainless Steel", "600 ml"); **cap floating** with a purple glow. As you scroll, a camera moves through these scenes.
- **Owner's choices (6 Nov 2026):** project in **`Launchpad/bottle-page`**; bottle made as **live 3D with three.js**; stack **Vite + TypeScript + three.js + Motion**; keep the name **DRIP** as a **private practice** project.
- **Honest limits:** (1) the creator's page used an AI-generated video, which looks photoreal; our procedural 3D bottle will be stylised, polished but not identical. (2) We reproduce structure, scenes, motion and feel, from scratch: **no frames, images or text from the video are shipped**; all copy and art are ours. (3) It stays on this Mac; if it is ever published, rename it first. (4) Free tools only: three.js (MIT), Motion (MIT), Vite (MIT).

## Skills we will use, in order (each phase notes what to record for the owner's "what did this skill add?" scorecard)
| Phase | Skill | Job |
|---|---|---|
| 1 Direction | `design-taste-frontend` | Its process: brief, argument, deal directions, find the idea, type + palette, house-rule inspector. Anchored to the reference instead of a blank brief |
| 1 Direction | `ui-ux-pro-max` | `--design-system` for the product type, `--domain ux/typography/color` lookups, accessibility and performance rules, motion presets as easing/timing reference |
| 3-4 Build | `animate`, `apple-design` | Choosing what moves, curves, durations, interruptibility; Apple-style physical scroll feel |
| 5 Motion review | `review-animations`, `animation-performance` | Check the finished motion; hit 60 fps (composite-only properties, DPR cap, no layout thrash) |
| 6 Polish | `impeccable`, `emil-design-eng` | Critique, audit and polish of hierarchy, type, spacing, copy |
| 6 Stress test | `break-ui`, `mobile-native` | Worst-case text and viewports; the phone version (100dvh, tap feedback, safe areas) |
| 7 Look | `playwright-cli` | Real-browser screenshots at set scroll positions, desktop and mobile, compared with the reference |
Not used: `dataviz` (no real chart; the battery gauge is a graphic), `prototype`/`pick-ui-library` (decided), `remove-animations` (only if it ends up over-animated), the Swift and Expo skills.

## Phases (a commit after each working step; teach-me summary and a Daily-Dump entry after each finished feature)
**Phase 0: set up.** `Launchpad/bottle-page` with `git init`, `package.json` (vite, typescript, three, @types/three, motion, vitest, eslint), `index.html`, `vite.config.ts`, `tsconfig.json`, `.gitignore` (node_modules, dist, .env*, `.playwright-cli/`, `.taste-skill/`, `.impeccable/`, `docs/reference/`), a project `CLAUDE.md` (rules: private practice, no third-party assets, free tools), `docs/PRD.md`, `docs/plan.md` (this plan). Reference stills from the video go to git-ignored `docs/reference/` for side-by-side checks only. Fonts self-hosted through `@fontsource/*` (no external requests).

**Phase 1: direction (GATE A, owner approves before the build).** Run `design-taste-frontend` with the reference as the brief, then `ui-ux-pro-max --design-system "premium smart water bottle product landing" --variance 6 --motion 7 --density 3 --persist --output-dir docs` (saved to `docs/design-system/`, never `--force`). Output: `docs/design.md` (idea, type system, palette: warm light grey ground, near-black bottle, one purple glow accent; scene list; motion rules; accessibility rules). The owner sees one static **style frame** of the hero before we build the rest.

**Phase 2: the bottle (GATE B, a spike).** `src/scene/bottle.ts` (a `LatheGeometry` profile for the body, cap, rubber base, speckle via a generated noise texture, embossed DRIP label), `environment.ts` (soft studio lighting from `RoomEnvironment`), a sticky full-screen canvas. **Spike test:** confirm WebGL renders in the headless browser used by `playwright-cli` (software rendering) and screenshot the bottle. If the bottle looks cheap, we stop and choose with the owner: simplify the look, or switch to pre-rendered frames (the other option from the questions).

**Phase 3: scroll engine.** `src/scroll/timeline.ts` (pure functions: scroll progress 0-1 to camera position, target, FOV and bottle rotation via keyframes and easing), `src/main.ts` binding Motion's `scroll()` to the camera, `overlays.ts` for per-scene HTML text (real DOM text, not canvas, for accessibility). **Unit tests (vitest)** for the keyframe maths (boundaries, easing, monotonic progress).

**Phase 4: scenes and details.** Hero; full-bottle callout; macro scene with a sparkle particle system (`particles.ts`, `THREE.Points`, size capped on mobile); battery gauge (SVG or shader) with a count-up of 5000 mAh; cap float with purple point-light glow; nav (transparent to solid on scroll), CTA, footer; original copy written by us.

**Phase 5: motion review.** `review-animations` and `animation-performance`: frame budget, `devicePixelRatio` cap of 2, pause rendering when off-screen or tab hidden, `prefers-reduced-motion` (static scenes, no scrub), no-WebGL fallback (a poster image plus the same text).

**Phase 6: critique, stress test, mobile.** `impeccable` audit and critique, `emil-design-eng` polish; `break-ui` (long product names, tiny and huge viewports, text scaled to 200%); `mobile-native`; the `ui-ux-pro-max` pre-delivery checklist (contrast 4.5:1, visible focus, 44 px targets, keyboard path to Buy now).

**Phase 7: look.** `playwright-cli` screenshots at 5 scroll positions on desktop (1440x900) and mobile (390x844), side by side with the reference stills, then a fix round.

**Phase 8: wrap-up.** README with run instructions, a **skills scorecard** (for each skill: what it changed or caught), Second-Brain notes (one concept note per big lesson, linked) and Daily-Dump, a short "what I built, why, what broke, one pitfall" explanation for the owner.

## Files (all new, in `Launchpad/bottle-page/`)
`index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`, `CLAUDE.md`, `.gitignore`; `src/main.ts`, `src/scene/{bottle,environment,particles}.ts`, `src/scroll/{timeline,timeline.test}.ts`, `src/ui/{overlays,nav,gauge}.ts`, `src/styles/{tokens,layout}.css`, `src/a11y.ts`; `docs/{PRD,plan,design}.md`. Reused from this machine: skills in `Toolshed/claude-skills`, `playwright-cli` with the Chromium set in `~/.claude/settings.json`, Node 24.

## Verification before saying "done" (global rules)
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass, and I report what passed.
- `npm run dev` / `npm run preview`, then `playwright-cli` screenshots at the five scroll positions (desktop and mobile) viewed by me and compared to the reference; no console errors.
- Reduced-motion and no-WebGL paths each checked once.
- Nothing is published, uploaded or committed with secrets; no third-party assets in the repo.

## Progress (6 Nov 2026, later)
- DONE: Phase 0 (setup), Phase 1 (direction, Gate A approved), Phase 2 (3D bottle, Gate B passed), Phase 3 (scroll engine: pure timeline maths with 16 unit tests, Motion `scroll()`, critically damped spring, five scenes, text chapters, battery gauge, reduced-motion/no-WebGL static page, phone layout). All of lint, typecheck, test and build pass.
- NEXT: Phase 4 (features poster list, back-of-card footer, imagery floor), Phase 5 (review-animations, animation-performance, code-split three.js), Phase 6 (impeccable, emil-design-eng, break-ui, mobile-native, checklist), Phase 7 (final look at 5 scroll positions desktop and phone), Phase 8 (README, scorecard, notes).

## Smoothness pass (6 Nov 2026): DONE
Owner feedback: jerky on fast scroll, buttons fly through all scenes. Studied Apple's UK page scripts; replaced progress smoothing with pose-space springs, a monotone camera path, time-based text chapters, a button glide (owner chose "glide straight there"), adaptive resolution, and removed CSS smooth scroll. 31 unit tests; behaviour measured in the browser. See docs/design.md. NEXT: the owner tries it on a real Mac and trackpad and runs `/review-animations`; then Phase 4 onward.
