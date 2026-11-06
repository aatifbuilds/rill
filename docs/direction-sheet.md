# DIRECTION SHEET — The object, large
seed 1310354238 · drawn 2026-11-06 · redraws: 9 · sector physical-product
Brief: DRIP, a smart matte-black stainless steel water bottle (600 ml, 5000 mAh battery, rubber base, speckled finish, glowing smart cap); a scroll-driven product page where a 3D camera moves through the bottle

| | |
| --- | --- |
| Direction | The object, large |
| Hero | Object splits the headline |
| Type | Work Sans |
| Colour | kept from the brand |
| Sections | showcase (One frame, three distances) → features (Capabilities at poster scale) → stats (Figure on the photograph's edge) → cta (The object returns) → footer (The back of the card) |
| Motion | Slow crossfade |
| Photographs | the "Desert and road" set, as atmosphere |

This is the direction for this build. Adopt it. Do not blend it with the layout you would have made anyway,
and do not redraw because it is unfamiliar: unfamiliar is the point. Redraw a slot only when it conflicts
with a stated brand constraint or needs an asset that does not exist, and say why in your report.

The parts of this sheet were written separately and will disagree in small ways. Settle every disagreement in this order:
**house rules** (including type no smaller than 13px and body text of 16px or more) → **the direction** (the idea, the composition habits, where the
one accent goes) → **the type system and the palette** (which face does which job, the five size steps, which colour is the ground and where the
accent goes) → **the hero blueprint** → **the section blueprints**. Under each blueprint below, "Adjusted for this page" lists where it disagrees.
In practice: take geometry from blueprints (columns, proportions, what sits where) and take everything else from above them. Map every size a
blueprint names onto one of your five type steps instead of adding a sixth. Use one button shape, one corner radius and one pair of page margins on
the whole page, whatever individual blueprints say. If a blueprint names a kind of typeface (a light serif, a heavy grotesk), use the dealt face.

## 1. The idea
Show the thing, bigger than seems reasonable. One photographed object fills the first screen, scaled until the viewport crops it, with the text small and tucked beside or behind it. The crop is the idea: a record whose edge leaves the top-right corner, a bottle whose shoulder runs off the bottom, a chair seen so close you read its grain. Being that close reads as confidence in the object. Everything else on the page serves it: details as tight close-ups, facts as short lines, one way to buy.

Before anything else, write one sentence in your notes: "On this page, <the subject's own material> becomes <the device>."
Fill the first blank from your inventory of what only this client has (its name and what it means, its street, its numbers, its
constraint), then put the nearest competitor in the sentence: if it still works, the idea is the category's, not the client's.
Then name the one live thing the visitor can do on the page (SKILL.md step 4).

## 2. Composition
First screen: the object occupies 55–75% of the viewport and breaks at least one edge. It sits on a flat field (ground colour or one bold colour), never in a box. The headline is short and either very large and partly hidden behind the object (10–13vw, the object overlapping two or three letters) or small (28–36px) in the opposite corner with a one-line description. No navigation bar beyond a wordmark and one action. Following sections: a row of three or four close-up details at different crop ratios (not equal tiles), a single wide photograph of the object in use, a plain list of facts set large (materials, size, price) aligned to one edge, then the purchase action. The object returns once at the end from a different angle.

## 3. Type — Work Sans
A light grotesque with open, slightly old-fashioned shapes; large headings look airy and the text weight beneath stays easy to read. Suits AI and research products, fashion houses and calm brand sites.
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```
- Display: **Work Sans** — weight 300 · tracking -0.035em · leading 1.0 · sentence case
- Text: **Work Sans** — 400 for body, 500 for emphasis · leading 1.55 · tracking 0
```css
:root {
  --step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);
  --step-body: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);
  --step-lead: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  --step-head: clamp(2rem, 1.3rem + 3.2vw, 4rem);
}
```
Either very large and structural or very small and precise; pick one for the headline and hold it. Facts are set in the text face at 22–28px, not in a table.
The direction decides sizes and how many of them; the type system decides how this face is set. Where the two give different tracking or leading, use the values of the type system: they are tuned to this face.
The display size itself comes from the hero blueprint below.

## 4. Colour
Kept from the brand. A flat field chosen to make the object's own colour sing (its complement, or a tone darker than its shadow side). One field for the whole page, or a second for the facts section.

## 5. Imagery
**Use the images that belong to the project in every picture slot.** For slots they cannot fill, real pictures of the subject's world from the open collections come next (start with `node /Users/aatifsiddiqui/Builder-HQ/Toolshed/claude-skills/design-taste-frontend/scripts/assets.mjs "water bottle"`, then queries from your inventory (its street, its materials, its trade's tools and history); credit them on the page), then the dealt photographs.

Use the product's own photographs if they exist. Otherwise use a still-life from the dealt set as a stand-in and say so. Prefer images with a plain background; use `mix-blend-mode: multiply` on light fields so a white studio background disappears into the page colour.

**Floor (the inspector checks it):** at least four real pictures on the page, usually six to twelve; SVG drawings do not count. One moving picture where an honest clip exists: `node <skill>/scripts/assets.mjs --video "<query>"`, used as a muted loop with a poster frame. Whatever this direction says about pictures, it is carried out with real ones.

Photographs dealt for this build, from the "Desert and road" set (dunes, dry land and open roads)
Order of preference for imagery: (1) the project's own photographs and product shots; (2) images you generate, if an image tool is
available; (3) real pictures of the subject's world found in the open collections (assets.mjs, downloaded and credited on the page);
(4) drawings of the subject in code; (5) these. They are real photographs (Unsplash licence, served by picsum.photos) of places, light and
texture. They are atmosphere, never a stand-in for a specific product, dish, person or interface. List the ones you use in your report so
they can be replaced.
Treatment: Scale the main image well past its container (`width: 120–160%`) and let `overflow: hidden` on the section do the cropping.
- `https://picsum.photos/id/964/1600/1000` — Empty road curving through a snow-covered landscape · light tone · white, asphalt grey, pale blue · calm area: top · native landscape · photo: Jon Ottosson
- `https://picsum.photos/id/314/1600/1000` — Empty two-lane road curving through pale sand dunes · mid tone · sand beige, asphalt grey, teal · calm area: top · native landscape · photo: Fré Sonneveld
- `https://picsum.photos/id/379/1600/1000` — Empty asphalt road running through a brown moorland valley under overcast sky · mid tone · warm grey, brown, pale grey · calm area: top · native landscape · photo: Kamil Lehmann
- `https://picsum.photos/id/767/1600/1000` — Straight empty road running through a tall pine forest · mid tone · forest green, asphalt grey, warm brown · calm area: bottom · native landscape · photo: Sébastien Marchand
- `https://picsum.photos/id/525/1600/1000` — Orange sand dune with tiny figures on its ridge under blue sky · mid tone · burnt orange, sky blue · calm area: top · native landscape · photo: Luca Zanon
- `https://picsum.photos/id/563/1600/1000` — Straight road with a white centre line leading toward dark conical mountains · mid tone · charcoal, olive green, pale grey · calm area: top · native landscape · photo: Bec Brown
- `https://picsum.photos/id/261/1600/1000` — Sharp sand dune ridge dividing sunlit and shadowed slopes · mid tone · golden sand, deep indigo · calm area: left · native landscape · photo: Fabio Rose
- `https://picsum.photos/id/184/1600/1000` — Sand dune ridges catching the last light under a dark sky · dark tone · deep purple, burnt orange · calm area: top · native landscape · photo: Tim de Groot
The last two path numbers are width and height: request the exact crop you render (`/1200/1500` for a 4:5 portrait, `/2400/1350` for a hero) and
add `?grayscale` to desaturate. Use three to six of them, not all eight. Always set `width`, `height`, `alt` and `loading="lazy"` (not on the hero image).
Other sets that fit this brief: water, architecture, object-still, fog-and-quiet — `node draw.mjs --photos <set>` prints one in full; `--photos list` shows all sets. Taking photographs from another set is your call and is not a redraw; keep them to one light and one treatment.

## 6. Hero — Object splits the headline
One deep, flat ground colour. The object, a low-key studio photograph whose background matches the ground, stands at dead centre, scaled to 66% of the viewport height and tilted about 8 degrees, with its base cropped by the bottom edge. The headline is split around it: line one is centred across the object's upper fifth and line two across its lower fifth, both at clamp(64px, 5.8vw, 92px), regular weight, spanning columns 2–11, so the object fills the gap where a paragraph would normally sit. The type lies above the object in the stacking order in the light ink, so every letter stays readable where it crosses. At the object's mid-height two small text blocks at 14px face each other: the supporting sentence far left on columns 1–2, and two short facts (size, price) far right on columns 11–12, right-aligned, each 32px from its edge. Wordmark top-left; three text links top-centre; the single action top-right as a small light rectangular tab, the only light solid on the screen. The lower corners stay dark and empty.

On a phone: The object is 54svh tall, centred, its base cropped by the bottom edge. Line one of the headline crosses its top at 11vw and line two its lower third at 11vw, both centred inside 16px margins. The side text blocks merge into one 15px sentence under the navigation. Wordmark top-left and the action tab top-right; the links collapse to one word.
Headline: A two-line statement of four to six words, up to about 16 characters per line at 5.8vw, with the object standing between the lines.

Adjusted for this page:
- It sets running text at 15px: paragraphs use your body step (16px or more).

## 7. Sections, in order
Each is a composition to rebuild with this project's content. Keep the geometry; change the subject. Re-order or drop a
section when the argument of the page needs it (see references/copy.md), never to fall back to a card grid.

### 1. showcase — One frame, three distances (pinned)
A wrapper 300vh tall holds a sticky stage of 100svh. On the stage one frame is centred: 30vw wide at 4:5, square corners, overflow hidden. Inside it the same photograph is shown at three distances as the reader scrolls: the whole subject, then scaled to 180% toward one detail, then to 320% on a second detail (transform: scale with a transform-origin per stage, 700ms ease, switched by IntersectionObserver on three invisible markers). The sentence is delivered in halves: its first two or three words sit above the frame at clamp(56px, 8vw, 130px), centred; the last words arrive below the frame at the second stage, overlapping the frame's bottom edge by 0.3em. At the third stage one caption of 28ch at 17px appears to the right of the frame, top-aligned. The two halves together are the heading and stay within two lines.
On a phone: The frame grows to 70vw at 4:5 and stays sticky at centre. The first half of the sentence sits above it at 13vw, the second half below it at the same size. The third-stage caption appears under the sentence at 16px, centred.

Adjusted for this page:
- It sets a sentence large over several lines: jurors read that as a long headline. Either cut it to a two-line headline at display size, or keep it a statement at 36px or less on three lines (24px, four lines on a phone).

### 2. features — Capabilities at poster scale (list)
No images. The heading, two to four words, is the first line of the list itself, set at the same size as the items but in the soft ink, so no separate title sits above. Five to eight capability names follow, one per line, at clamp(40px, 5.2vw, 84px), medium to heavy weight, leading 1.0, tight tracking, flush left on the page margin across columns 1–8 of 12. Each name's one-sentence description is set at 16–18px in columns 9–12, its first baseline aligned with the name's baseline (CSS grid, align-items: first baseline). Rows are separated by 0.35em of space and nothing else. On hover one row keeps full ink while the others fall to 35% opacity. Leave 18–22vh of empty ground above and below; nothing else shares the section.
On a phone: Names drop to 11vw and stay one per line; a name that will not fit breaks onto a second line with a hanging indent. Each description sits directly under its name at 16px, indented one margin width, with 28px before the next name. The soft-ink heading line stays as the first row. All rows at full ink.

Adjusted for this page:
- It fades text: anything a visitor reads, inactive items of a list included, is `--ink` or `--muted` at full strength (contrast 4.5:1 or more). The active item is told apart by `--ink` against `--muted`, weight or the accent, not by fading the rest.

### 3. stats — Figure on the photograph's edge (full-bleed)
One full-bleed photograph, 100vw by 88svh, and one figure set on it the way a film title sits on a frame. The figure, with its unit, is at clamp(120px, 17vw, 280px), leading 0.8, in paper colour, hugging the bottom-left corner with 24px margins, its baseline nearly on the photograph's lower edge. A neutral dark scrim covers only the bottom 35% of the image for legibility. On the same baseline at the right margin, right-aligned, a sentence of up to 26ch at 18px explains the figure. At the top-left, small at 20–24px, sits the heading of two to four words; the middle of the photograph stays clear. Two smaller supporting figures may follow below the photograph, on the ground: each at 40px with a one-line caption beside it, starting at columns 1 and 7, 40px under the image. Choose a figure that belongs to the picture: a height, a distance, a temperature, a year.
On a phone: The photograph is 80svh, cropped to its subject. The figure sits bottom-left at 30vw; the sentence moves above it at 16px, left-aligned. Supporting figures stack under the photograph at 32px, each with its caption on the line beneath.

### 4. cta — The object returns (split)
The thing shown in the hero comes back once, from another angle, to close the page. On one flat field 90svh tall, the object's photograph occupies columns 1–8, scaled to about 130% of that area and anchored so the section's bottom and left edges crop it (`overflow: hidden` on the section; on light fields `mix-blend-mode: multiply` removes a white studio background). The text sits small in columns 10–12, vertically centred: a closing line of three to five words at 32–40px, one sentence at 17px, the price or key fact on its own line at 22px, and one rectangular button. Nothing overlaps the object's focal area. Where the page's subject is a shape rather than a photograph, the page's motif takes the object's place at the same scale as a flat filled shape. The closing line is the only heading.
On a phone: The text block comes first: closing line at 28px, sentence, fact, full-width button. The object follows at 130% of the screen width, shifted so the right and bottom edges crop it, filling about 55svh on the same flat field.

### 5. footer — The back of the card (stack)
The footer is the reverse side of the page's artefact, laid out as the back of a postcard. A paper-coloured panel spans columns 2–11 on the contrasting ground, about 420px tall, its top edge cut into a row of twelve semicircular scallops (an inline SVG path or `clip-path`, each scallop about 100px wide). The panel is divided by space into two halves. Left half: a short sign-off of two to four words at 32px, then two or three lines at 16px, written like a message. Right half: the address block, four left-aligned lines at 18px with 12px between them, each line a link (email, telephone, street, social); above it in the top-right corner, a stamp: one small photograph, 3:4 and 88px wide, with a 6px paper-coloured margin. Along the panel's bottom edge, a single centred line at 12px gives the copyright like a printer's imprint.
On a phone: The panel runs full width with six scallops across its top edge. The stamp sits top-right at 64px wide; the sign-off and message come first, then the address lines at 17px beneath them, then the imprint line centred at 12px.

Adjusted for this page:
- It sets text at 12px: use your small step (13px or more) instead.

## 8. Motion — Slow crossfade
The principal photograph quietly changes: three or four images of the same framing crossfade over about 1.6 seconds, holding five to six seconds each, or the fixed image changes when its matching section arrives. It should feel like light shifting in a room. Pause when the tab is hidden; under reduced motion show only the first image.
This is the signature move, the one loud moment. Around it the page still needs the rest of the motion layer (SKILL.md step 9): an entrance for the parts of every section, feedback on every control, and one moving picture. The inspector fails a page that barely moves. Recipes: references/motion.md.

## 10. Where the richness comes from
The object's surface at close range, and the tension of the crop.

## 11. How this direction goes wrong
A small centred product shot with space all round is a catalogue thumbnail, not this direction. If the image has a busy background it cannot sit on a field; crop tighter or change image. Keep text off the object's focal area.

## 12. Real references
Studied sites that work this way. Take the principle, never the specifics: no names, copy, images or signature assets of theirs.
- **Moto Finance** (Awwwards Site of the Day, studied score 7.3) `aww-moto-finance`
  Idea: A metal card presented like a museum piece: lit by a single overhead light box in a black room, then orbiting through dim architectural stills.
  Hero: Black full-bleed 3D scene. A pale silver-lavender light panel, a trapezoid in perspective like a ceiling light box, occupies the top 20% and centre 55% of the viewport. The two-line uppercase headline, centred at 4.4vw in medium grotesk with tight leading, straddles the panel's lower edge so its first line sits half on light, half on black. In the exact centre a small metal card stands on a low plinth, only about 150px wide, surrounded by darkness. A light-grey pill button (about 250 by 52px) is centred near the bottom; the logo is top-left and a dark pill button top-right.
  Worth taking: Let a headline straddle the edge of a light shape so one line is half on light and half on dark.
- **The Watch** (Awwwards Site of the Day, studied score 6.8) `aww-the-watch`
  Idea: A single 3D watch is the only actor: it holds centre stage and turns, flips and finally explodes into parts while giant product-name letters slide behind and in front of it.
  Hero: Light grey field with soft darker blurs toward the corners. A steel chronograph rendered in 3D stands upright at dead centre, about 80% of viewport height. Behind it the product name is set once across the full width in a wide, squared geometric sans at 24vw in mid-grey; the watch covers the middle character, so only two letters at the left edge and two at the right are readable. A thin circle about 700px across with faint radial spokes and one darker arc sits behind the watch like a dial diagram. No navigation, logo, body copy or button anywhere.
  Worth taking: Set the product name so large that the product itself replaces one of its characters, leaving the name half-hidden and the object as the missing letter.
- **longbow** (Awwwards Site of the Day, studied score 8.1) `aww-longbow`
  Idea: The page is built on a visible four-column construction grid with square handles at every intersection, and cars, glass cards and a giant condensed marquee are slotted into its cells like objects on a designer's artboard.
  Hero: Mid-grey studio video of two roadsters fills the viewport inside a thin outer frame. White hairlines split it into four equal columns and two rows, with small white square nodes at each crossing. A frosted-glass nav bar sits top centre spanning the two middle columns: hamburger left, condensed wordmark centre, a mono models link right. Bottom left, a white condensed marquee of the brand name at 21vw, a third of viewport height, runs off the left edge and stops at the centre line. The bottom-right cell holds a small glass tag, a two-line serif headline with the second line italic, and a six-line uppercase mono paragraph.
  Worth taking: Draw the layout grid as visible hairlines with small square nodes at intersections and size every image and card to exact cells.
Full notes on any of them: `node draw.mjs --site <id>`.

## Always
Headlines two lines or fewer at every width. No eyebrow labels, no monospace, no 01/02/03, no thin rules, no gradients, no shadows at rest,
no cream-and-terracotta, no violet. The frame: one h1 on the first screen that says what this is, equal outer margins, no
section huddled on one side with the other half empty, no blank stretch over half a screen, a heading on every section.
`inspect.mjs` measures all of it.

Saved to /Users/aatifsiddiqui/Builder-HQ/Launchpad/bottle-page/.taste-skill/direction.json · reprint with `node draw.mjs --show`
