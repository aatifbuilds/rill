import "@fontsource-variable/work-sans";
import { scroll } from "motion";
import "./styles/tokens.css";
import "./styles/layout.css";
import { createStage } from "./scene/stage";
import { KEYS, clamp01, samplePose, scrollProgress, stepSpring } from "./scroll/timeline";
import { createGauge } from "./ui/gauge";
import { createOverlays } from "./ui/overlays";

const root = document.documentElement;
const story = document.querySelector<HTMLElement>("#story");
const canvas = document.querySelector<HTMLCanvasElement>("#scene");

// the nav gets a solid background once the page has scrolled (see layout.css)
const markScrolled = (): void => {
  root.classList.toggle("scrolled", window.scrollY > 24);
};
window.addEventListener("scroll", markScrolled, { passive: true });
markScrolled();

/** Static mode: a plain readable page with a poster picture instead of the scroll-driven 3D scene. */
const useStaticPage = (reason: string): void => {
  console.info(`DRIP: showing the static page (${reason}).`);
  root.classList.add("static");
};

function start(storyEl: HTMLElement, canvasEl: HTMLCanvasElement): void {
  const stage = createStage(canvasEl); // throws if WebGL is unavailable
  const overlays = createOverlays();
  const gauge = createGauge();

  const progressNow = (): number => {
    const r = storyEl.getBoundingClientRect();
    return scrollProgress(-r.top, 0, r.height, window.innerHeight);
  };
  let target = progressNow();
  let spring = { x: target, v: 0 };
  scroll((p) => { target = p; }, { target: storyEl, offset: ["start start", "end end"] });

  let raf = 0;
  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    spring = stepSpring(spring, target, dt, 9); // critically damped: smooth, no overshoot, interruptible
    const p = clamp01(spring.x);
    stage.render(samplePose(KEYS, p), now / 1000);
    overlays.update(p);
    gauge.update(p);
    raf = requestAnimationFrame(frame);
  };
  const run = (on: boolean): void => {
    if (on && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!on && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  // render only while the story is on screen and the tab is visible
  let inView = true;
  const sync = (): void => run(inView && !document.hidden);
  new IntersectionObserver((entries) => { inView = entries.some((e) => e.isIntersecting); sync(); }).observe(storyEl);
  document.addEventListener("visibilitychange", sync);
  new ResizeObserver(() => stage.resize()).observe(canvasEl);

  stage.render(samplePose(KEYS, spring.x), 0); // first frame immediately, so there is never an empty canvas
  overlays.update(spring.x);
  gauge.update(spring.x);
  sync();

  if (import.meta.env.DEV) {
    Object.assign(window, { __story: { get progress() { return spring.x; }, get target() { return target; } } });
  }
}

if (!story || !canvas) {
  useStaticPage("page structure missing");
} else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  useStaticPage("reduced motion preferred");
} else if (new URLSearchParams(window.location.search).has("static")) {
  useStaticPage("?static in the address, for testing the fallback page");
} else {
  try {
    start(story, canvas);
  } catch (err) {
    console.warn(err);
    useStaticPage("WebGL unavailable");
  }
}
