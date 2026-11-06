# PRD: bottle-page ("RILL")

## Problem
I want to learn web page, UI and UX design by doing: rebuild a scroll-driven product page I saw in a reel and learn what each
design skill adds along the way.

## Target user
Me: a PM learning to build. (The imagined site visitor: someone considering a premium smart water bottle, on a phone or laptop.)

## Goal and success
- A single page where scrolling moves a camera through scenes of a matte-black smart bottle: hero, full bottle, macro texture, battery gauge, floating cap, buy call to action.
- I understand what each skill contributed (a skills scorecard at the end).
- Quality bar: 60 fps on this Mac, text readable (contrast 4.5:1), works on a phone, respects reduced motion, has a no-WebGL fallback.

## V1 scope
**In:** the scroll scenes, sticky nav, original copy, responsive layout, accessibility basics, unit tests for the scroll maths.
**Out (not now):** a real shop, cart or payments, CMS, analytics, deployment, multiple products.

## Edge cases and risks
- A procedural 3D bottle may look cheap next to the reel's AI video: spike it early (Gate B) and fall back to simplifying or pre-rendered frames.
- WebGL may not render in the headless test browser: verify in Phase 2.
- Heavy scenes on phones: cap pixel ratio and particle counts.
- IP: private practice only, no third-party assets, rename before any publishing.

## Open questions
Which font and exact palette (decided in Phase 1 with the design skills).
