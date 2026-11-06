# RILL

A scroll-driven product page for **RILL, a fictional smart water bottle**. It is a design practice build: a matte-black steel bottle, drawn in code with three.js, that the page's scroll moves through five scenes (hero, whole bottle and base, speckled macro, battery gauge, floating cap).

RILL is not a real product. Nothing here is for sale.

## Run it

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # unit tests (Vitest)
npm run build      # production build in dist/
```

## How it works

- **The bottle** is built in code (lathe geometry, a speckled surface drawn on a canvas, a purple LED, a sparkle shader) with [three.js](https://threejs.org). No images or 3D files.
- **The scroll** picks a target camera pose from keyframes (a smooth monotone curve). Each pose value follows it with its own critically damped spring, so fast scrolling or a button heads straight for the destination instead of replaying every scene. The maths lives in `src/scroll/timeline.ts` and is unit tested.
- **The text** turns on and off by scroll position and fades with timed CSS transitions (transform and opacity only), so it looks the same at any scroll speed.
- **Buttons** jump the scroll and let the camera glide there.
- **Phones:** the bottle is framed between the nav bar and a caption panel. If WebGL is unavailable, or the visitor prefers reduced motion, a plain readable page with a poster bottle is shown (add `?static` to the address to see it).
- The resolution drops automatically if frames run slow.

Design notes and the build log are in [`docs/`](docs).

## Credits

Built with [three.js](https://threejs.org), [Motion](https://motion.dev), [Vite](https://vite.dev) and the Work Sans typeface. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
