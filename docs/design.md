# Design direction: DRIP (private practice)

Sources: `docs/direction-sheet.md` (design-taste-frontend), `docs/design-system/drip/MASTER.md` and lookups (ui-ux-pro-max), reference stills in git-ignored `docs/reference/`.
**Status: GATE A, waiting for the owner's approval of the style frame (the hero, running at `npm run dev`).**

## The idea
"On this page, the bottle's own matte-black steel and its single purple LED become the device": a black object on a light ground, with one glow as the only colour. Nearest competitor test: a generic bottle page would show a catalogue shot; ours has no picture, only the object, cropped, and light.
Inventory (what only DRIP has): the name (a drop, and slang for style); matte-black stainless steel; the speckled finish; the rubber base that keeps it quiet; 600 ml; the 5000 mAh battery; the smart cap with a purple LED; the hourly "time to drink" glow; the cold; the weeks a charge lasts.

## Argument (claim, proof, section)
| Section (role) | Claim | Proof |
|---|---|---|
| Hero | Cold steel, warm glow | The object itself, cropped by the screen |
| Showcase (3 distances) | It is made well, up close | Camera moves: whole bottle, cap, speckled finish |
| Features (poster list) | It does four things | Steady and quiet (rubber base), speckled steel, a charge that lasts weeks, a cap that glows when it is time to drink |
| Stats | 5000 mAh | The figure, set large on the frame of the 3D scene |
| CTA | One way to buy | The cap returns from a new angle, one button |
| Footer | Honest sign-off | "DRIP is a fictional product for a design practice" |

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
