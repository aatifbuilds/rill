# Design direction: RILL (private practice)

Sources: `docs/direction-sheet.md` (design-taste-frontend), `docs/design-system/rill/MASTER.md` and lookups (ui-ux-pro-max), reference stills in git-ignored `docs/reference/`.
**Status: Gate A approved (6 Nov 2026). Phases 2 and 3 built: the 3D bottle and the scroll story. Gate B passed: the procedural bottle looks good enough, so no fallback was needed.**

## The idea
"On this page, the bottle's own matte-black steel and its single purple LED become the device": a black object on a light ground, with one glow as the only colour. Nearest competitor test: a generic bottle page would show a catalogue shot; ours has no picture, only the object, cropped, and light.
Inventory (what only RILL has): the name (a rill is a small stream); matte-black stainless steel; the speckled finish; the rubber base that keeps it quiet; 600 ml; the 5000 mAh battery; the smart cap with a purple LED; the hourly "time to drink" glow; the cold; the weeks a charge lasts.

## Argument (claim, proof, section)
| Section (role) | Claim | Proof |
|---|---|---|
| Hero | Cold steel, warm glow | The object itself, cropped by the screen |
| Showcase (3 distances) | It is made well, up close | Camera moves: whole bottle, cap, speckled finish |
| Features (poster list) | It does four things | Steady and quiet (rubber base), speckled steel, a charge that lasts weeks, a cap that glows when it is time to drink |
| Stats | 5000 mAh | The figure, set large on the frame of the 3D scene |
| CTA | One way to buy | The cap returns from a new angle, one button |
| Footer | Honest sign-off | "RILL is a fictional product for a design practice" |

## Chosen direction (dealt by design-taste-frontend, seed 1310354238)
- **Direction:** `hero-object` ("The object, large"). Why: the idea is the cropped object and one light; it matches how the reference opens.
- **Hero:** object splits the headline, adapted: a two-line headline, partly hidden behind the object, in white text with `mix-blend-mode: difference` (dark on the light ground, white where it crosses the black bottle) so no letter is lost.
- **Type:** Work Sans. Display weight 300, tracking -0.035em, leading 1, sentence case; text 400/500. Self-hosted (`@fontsource-variable/work-sans`). Five steps in `src/styles/tokens.css`.
- **Palette** (ours, fixed by the reference's look): ground `#ecebe7`, ink `#0f0d0c`, muted `#4b4743` (7:1 on the ground), glow `#8b5cf6` used only as the LED's light, never as a button or text colour.
- **Sections after the hero:** showcase "one frame, three distances" (our 3D camera replaces the photograph zoom), features as a poster list, stats figure on the frame, CTA "the object returns", footer as the back of a card.
- **Motion:** scroll-scrubbed camera with Motion `scroll()`, a stagger on text, reduced-motion shows the final readable state.

## Deviations from the skills (each with a reason; the rule was "the direction wins")
1. **Type slot redrawn 9 times (once for a stated reason, then repeated until a clean sans appeared).** The first deal was a news serif ("suits long-form stories, culture pieces, journals"), wrong for a smart-tech bottle and for a reference built on a clean sans. Redraw 1 gave another serif; I then rerolled until the grotesk I had already judged suitable (Work Sans) appeared. That is more rerolling than the skill intends: be sceptical of it.
2. **"No violet" house rule vs the purple LED.** The glow is the product's own light and part of the reference. Kept, only as light. The inspector may flag it.
3. **Motion slot replaced.** The skill dealt "slow crossfade of photographs"; our brief is a scroll-driven 3D camera.
4. **Imagery floor.** The skill wants at least four real pictures. We have no photographs, so the plan is 4 to 6 stills rendered from our own 3D bottle for the feature and stats slots; the live canvas does not count towards the floor.
5. **ui-ux-pro-max advice not adopted:** style "Liquid Glass", gold accent `#A16207`, serif fonts (Cormorant/Montserrat): they conflict with the direction. **Adopted:** the "Scroll-Triggered Storytelling" pattern (keep the narrative readable without scroll effects, progress indicator, pause when off-screen, final readable state under reduced motion), the pre-delivery checklist (SVG not emoji, pointer cursor, 150-300 ms hover, 4.5:1 contrast, visible focus, reduced motion, test 375/768/1024/1440), the three.js stack rules (cap pixel ratio at 2, dispose textures, update camera aspect on resize), and sticky-nav padding.

## Skills scorecard so far
- **design-taste-frontend:** forced a decision before building (three directions, one chosen with a reason), flagged the serif mismatch, and its own caution "keep text off the object's focal area" is exactly the problem I hit (headline vs bottle), which the blend trick solves. Cost: it sometimes fights a recreation brief, so redraws were needed.
- **ui-ux-pro-max:** useful as a rules checklist (reduced motion, three.js pixel ratio and disposal, nav padding); its style, colour and font picks were generic and had to be overridden.
- **playwright-cli:** found three real problems in the first screenshot (text collision, hidden letter, favicon 404) that a code read would not.

## Build notes, Phases 2-3 (the 3D bottle and the scroll story)
- **What was built:** a procedural matte-black steel bottle (lathe geometry, speckled bump and roughness maps drawn in code, embossed RILL, rubber base, closed smart cap with a purple LED, halo and point light), a sparkle shader that glints on the steel, soft studio lighting from `RoomEnvironment`, and five scenes driven by scroll: hero, whole bottle and rubber base, macro finish, battery gauge, floating cap and buy.
- **Scroll feel:** progress through a 780svh pinned wrapper is read with Motion's `scroll()`, smoothed with a critically damped spring (apple-design: direct, no overshoot, always continues from the current value, so reversing mid-flight just redirects it), and mapped to camera poses by keyframes with smootherstep easing. All of this maths is pure functions with 16 unit tests (`src/scroll/timeline.ts`).
- **Text motion (animate skill):** purpose "explanation" (marketing, delight allowed); only `transform` and `opacity`; entrances rise 18px and never use `scale(0)`; a small stagger between lines; named transitions only; strong custom curves in `tokens.css`; hover gated by `(hover: hover) and (pointer: fine)`.
- **Quality rules from ui-ux-pro-max applied:** pixel ratio capped at 2; textures, geometry and materials disposed; camera aspect updated on resize; rendering paused when the story is off-screen or the tab is hidden; sticky nav gets a solid bar once the page scrolls.
- **Reduced motion and no WebGL:** a plain readable page with a poster bottle, no pinned scrubbing. This follows ui-ux-pro-max (final readable state, no scroll-jacking) rather than animate's "gentler, not zero" (which suits UI transitions more than a full-viewport camera move). `?static` in the address forces it for testing.
- **Phone:** on portrait screens the camera lifts the bottle above the text instead of shifting it sideways, and captions sit in a solid panel so text never lies on the dark bottle.

## What the screenshots caught (playwright-cli), Phases 2-3
Round 1 (nine problems): bottle too squat (a jar, not a bottle); hero did not crop the base; cap pokes behind the nav; the cap was hollow (the page showed through it); nav links invisible over the dark bottle; buy text lay on the bottle; battery bolt turned green from a blend mode; sparkles fuzzed the silhouette; label cut off at the shoulder. Round 2: final scene cap jammed under the nav and the bottle cropped; base close-up was a black block. Round 3 (phone): caption text on the dark bottle; bottle slid off the left edge in the battery and buy scenes; the cue overlapped the base. Static test: my first check was invalid (forced the class while the 3D loop was running); a `?static` switch made it a real test; the gauge then showed "0 mAh" next to a full fill (fixed).

## Skills scorecard (updated)
- **animate:** its gate and "never ship" table prevented decorative motion and `scale(0)`; its tokens became `--ease-out`/`--ease-in-out`. It is tuned to UI transitions, so for a scrubbed camera I took its property and reduced-motion rules but not its duration table.
- **apple-design:** the single most useful idea was the critically damped, interruptible spring for scroll smoothing; its reduced-motion section agreed with the static fallback.
- **ui-ux-pro-max:** the three.js stack lookups gave the pixel-ratio cap, disposal and aspect rules directly; the "Scroll-Triggered Storytelling" pattern confirmed the reduced-motion plan.
- **playwright-cli:** every real layout bug above was found by looking at screenshots, not by reading code.
- **Still to try:** review-animations, animation-performance, impeccable, emil-design-eng, break-ui, mobile-native.

## Known limits and next
Bundle is 578 kB (146 kB gzipped), mostly three.js: code-split the 3D stage in Phase 5. Frame rate measured at about 61 fps with software rendering in a headless browser; not measured on a real GPU. Phase 4 still to build: the features poster list, the back-of-card footer, real stills for the imagery floor.

## Smoothness pass (6 Nov 2026): making the scroll feel like Apple's
**Owner feedback:** scrolling fast felt jerky; clicking a button made every animation fly by.
**What Apple's UK pages do** (read from the public page source and main script of apple.com/uk/airpods-pro; analysis only, nothing copied): each scroll-driven keyframe has its own `ease` (about 0.3), a per-frame blend of that property's *value* toward its target at the current scroll, so a fast scroll never replays every intermediate state; entrances are **time-based tweens** (about 0.33-0.4 s, `easeInOutQuad`, a 0.15-0.2 s delay, staggered); no CSS `scroll-behavior`; reduced motion respected.

**Diagnosis (animation-performance skill, cause named for each):**
1. `scroll-behavior: smooth` made the browser fly through the whole story in about 0.5 s on any `#` link. 2. One spring smoothed the scroll *progress*, so a fast scroll swept the camera through every scene. 3. Text was scrubbed per frame by JS, so chapters flickered through. 4. `smootherstep` between every pair of keys stopped the camera at each key (stop-start). 5. A `--o` custom property set every frame (an inherited variable recalculates styles for every descendant). 6. `will-change` always on 12 elements. 7. A full-viewport `mix-blend-mode` headline over a live canvas (needs a device recording). 8. Pixel ratio fixed at 2 (needs a device recording).

**Fixes:** no CSS smooth scroll; the pose (14 channels) follows a **target pose** with its own critically damped spring (smoothing values, not progress); a **monotone cubic** path through the keyframes (continuous velocity, no overshoot, flat holds); **time-based text chapters** (a class toggles named CSS transitions: enter 450 ms with a 120 ms delay and 70 ms stagger, exit 220 ms); the gauge counts up on entry; **buttons jump the scroll and the camera glides** (about 1.6 s, any wheel/touch/key hands control straight back); adaptive pixel ratio; the blended headline shrunk to a band; no per-frame allocation or style writes.

**Measured in the real browser** (dev hook, software rendering): jump 0 to 0.5: camera lands exactly on target in 0.7 s, no overshoot, only the destination chapter turns on (the scene between is never shown); Buy now / About / Home: glide to the exact target pose, no overshoot, only the destination chapter on; rapid scroll down and up: each chapter turns on and off once per direction, no repeat at an edge. 31 unit tests cover the curve (no overshoot, flat holds, continuous slope, no stop at a key), the pose springs, chapter hysteresis and overlap, the button map, easing and adaptive quality.

**Not provable from here:** the real feel on a trackpad and a real GPU (my browser renders in software, frame time 16.7 ms at DPR 1). `/review-animations` is reserved for the owner to run; I did not imitate it.

**Scorecard:** animation-performance: its "name the cause before changing code" rule and its inherited-variable and `will-change` warnings found items 5 and 6. apple-design: the interruptible, value-continuing spring is what makes a reversal feel physical.
