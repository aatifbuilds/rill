import { CHAPTERS, fadeWindow, type ChapterId } from "../scroll/timeline";

interface Chapter { el: HTMLElement; window: readonly [number, number, number, number]; reveals: HTMLElement[] }

/** Text chapters: each fades and rises in, then out, as its window of the scroll passes. Only opacity and transform move. */
export function createOverlays(root: ParentNode = document) {
  const chapters: Chapter[] = [...root.querySelectorAll<HTMLElement>("[data-chapter]")].map((el) => ({
    el,
    window: CHAPTERS[el.dataset.chapter as ChapterId],
    reveals: [...el.querySelectorAll<HTMLElement>("[data-reveal]")],
  }));
  return {
    update(p: number): void {
      for (const c of chapters) {
        const [a, b, cc, d] = c.window;
        const o = fadeWindow(p, a, b, cc, d);
        const on = o > 0.004;
        c.el.style.setProperty("--o", o.toFixed(3)); // lets the phone caption panel fade with its chapter
        c.el.style.visibility = on ? "visible" : "hidden"; // hidden text is also out of the tab order
        if (!on) continue;
        c.reveals.forEach((r, i) => {
          const lag = i * 0.01; // a 10 ms-of-scroll stagger between lines (the animate skill's 30-80 ms, in scroll terms)
          const ro = fadeWindow(p, a + lag, b + lag, cc, d);
          r.style.opacity = ro.toFixed(3);
          r.style.transform = `translate3d(0, ${((1 - ro) * 18).toFixed(1)}px, 0)`; // rises into place; never scale(0)
        });
      }
    },
  };
}
