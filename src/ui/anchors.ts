import { anchorProgress, cubicBezier, scrollYForProgress } from "../scroll/timeline";

const easeInOut = cubicBezier(0.77, 0, 0.175, 1); // the same curve as --ease-in-out in tokens.css

export interface AnchorHooks {
  /** A nav link jumped the scroll to a scene: let the camera glide there slowly. */
  onGlide(): void;
  /** The visitor took over (wheel, touch or key): stop any glide at once. */
  onTakeover(): void;
}

/**
 * Nav buttons. The browser's own smooth scroll would fly through every scene in about half a second, so it is not used.
 * Links to scenes jump the scroll position and the camera glides straight there. Links to ordinary page content
 * (like the footer) get a short eased scroll.
 */
export function setupAnchors(story: HTMLElement, hooks: AnchorHooks): void {
  let raf = 0;
  const cancelTween = (): void => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const tweenTo = (y: number, ms: number): void => {
    cancelTween();
    const from = window.scrollY;
    const t0 = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo({ top: from + (y - from) * easeInOut(t), behavior: "instant" });
      raf = t < 1 ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  };

  document.addEventListener("click", (e) => {
    const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute("href") ?? "";
    const scene = anchorProgress(href);
    if (scene !== undefined) {
      e.preventDefault();
      cancelTween();
      const top = story.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: scrollYForProgress(scene, top, story.offsetHeight, window.innerHeight), behavior: "instant" });
      hooks.onGlide();
      return;
    }
    const el = href.length > 1 ? document.getElementById(href.slice(1)) : null;
    if (el) {
      e.preventDefault();
      tweenTo(Math.min(el.getBoundingClientRect().top + window.scrollY, document.documentElement.scrollHeight - window.innerHeight), 900);
    }
  });

  const takeover = (): void => {
    cancelTween();
    hooks.onTakeover();
  };
  window.addEventListener("wheel", takeover, { passive: true });
  window.addEventListener("touchstart", takeover, { passive: true });
  window.addEventListener("keydown", takeover);
}
