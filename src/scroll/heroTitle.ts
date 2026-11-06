import { cubicBezier } from "./timeline";

/**
 * The hero headline is drawn inside the WebGL scene (see src/scene/heroTitle.ts), because Safari does not reliably
 * blend a DOM element over a live WebGL canvas. These are its pure layout and timing rules, so they can be tested.
 * The numbers are copied from the CSS the DOM headline used, so the look is unchanged.
 */
export interface TitleLine { text: string; top: number } // top of the line box, in CSS pixels from the top of the stage
export interface TitleLayout { fontPx: number; lines: TitleLine[] }

export const TITLE_LINES = ["Cold steel,", "warm glow."] as const;

/** Desktop: font clamp(56px, 11vw, 176px), lines at 17svh and 50svh. Phone width (<= 700px): 15vw, lines at 23svh and 41svh. */
export function heroTitleLayout(width: number, height: number, compact: boolean): TitleLayout {
  const fontPx = compact ? 0.15 * width : Math.min(176, Math.max(56, 0.11 * width));
  const tops = compact ? [0.23, 0.41] : [0.17, 0.5];
  return { fontPx, lines: TITLE_LINES.map((text, i) => ({ text, top: tops[i] * height })) };
}

/** Letter spacing from the CSS: -0.035em. */
export const TITLE_TRACKING_EM = -0.035;
/**
 * The CSS headline is weight 300. Canvas text comes out heavier than DOM text at the same weight, and by different amounts
 * per engine (measured as ink in the same crop at weight 262: about 13% more in Chromium, about 8% more in WebKit).
 * 250 splits the difference without over-correcting for Chrome, since on iOS the DOM and canvas text share one renderer.
 */
export const TITLE_WEIGHT = 250;

/* ---------- fade and rise, time-based (the same curve and durations the CSS transitions used) ---------- */
export const REVEAL = { delay: 0.12, enter: 0.45, exit: 0.22, rise: 18 } as const; // seconds, and pixels
const ease = cubicBezier(0.23, 1, 0.32, 1); // --ease-out in tokens.css

export interface Reveal { progress: number; wait: number; active: boolean }
export const createReveal = (): Reveal => ({ progress: 0, wait: 0, active: false });

/** Move the reveal toward on or off. Retargets from wherever it is, so a quick reversal never jumps. Updates in place. */
export function stepReveal(r: Reveal, active: boolean, dt: number): void {
  if (active !== r.active) {
    r.active = active;
    r.wait = active ? REVEAL.delay : 0; // entry waits a moment; exit starts at once
  }
  if (active) {
    const waited = Math.min(r.wait, dt);
    r.wait -= waited;
    r.progress = Math.min(1, r.progress + (dt - waited) / REVEAL.enter);
  } else {
    r.progress = Math.max(0, r.progress - dt / REVEAL.exit);
  }
}

export function revealValues(r: Reveal): { opacity: number; rise: number } {
  const e = ease(r.progress);
  return { opacity: e, rise: (1 - e) * REVEAL.rise };
}
