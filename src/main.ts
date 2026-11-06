import "@fontsource-variable/work-sans";
import { scroll } from "motion";
import "./styles/tokens.css";
import "./styles/layout.css";
import { createStage } from "./scene/stage";
import { adaptQuality, type Quality } from "./scene/quality";
import {
  CHANNELS, KEYS, OMEGA, buildCurve, createMutablePose, createPoseState, fillPose, sampleCurve, scrollProgress, stepPoseSpring,
} from "./scroll/timeline";
import { createGauge } from "./ui/gauge";
import { setupAnchors } from "./ui/anchors";
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
  console.info(`RILL: showing the static page (${reason}).`);
  root.classList.add("static");
};

function start(storyEl: HTMLElement, canvasEl: HTMLCanvasElement): void {
  const stage = createStage(canvasEl); // throws if WebGL is unavailable
  const gauge = createGauge();
  const activations: { t: number; id: string; on: boolean }[] = []; // for tests in development
  const overlays = createOverlays((id, on) => {
    if (id === "power") gauge.setActive(on);
    if (import.meta.env.DEV) activations.push({ t: Math.round(performance.now()), id, on });
  });

  const progressNow = (): number => {
    const r = storyEl.getBoundingClientRect();
    return scrollProgress(-r.top, 0, r.height, window.innerHeight);
  };
  let target = progressNow(); // raw scroll progress: it picks the target pose and decides which text is on
  scroll((p) => { target = p; }, { target: storyEl, offset: ["start start", "end end"] });

  // The camera: a smooth curve through the keyframes gives the TARGET pose; each channel of the real pose follows it
  // with its own critically damped spring. Smoothing values (not scroll progress) means a fast scroll or a button
  // heads straight for the destination instead of replaying every scene in between.
  const curve = buildCurve(KEYS);
  const targetPose = new Array<number>(CHANNELS).fill(0);
  sampleCurve(curve, target, targetPose);
  const state = createPoseState(targetPose);
  const pose = createMutablePose();

  // buttons make the camera glide slowly; any wheel, touch or key hands control straight back to the visitor
  let glideUntil = 0;
  const omegaAt = (now: number): number => {
    if (now < glideUntil) return OMEGA.glide;
    const k = Math.min(1, (now - glideUntil) / 500); // ease back to normal speed rather than switching abruptly
    return OMEGA.glide + (OMEGA.normal - OMEGA.glide) * k;
  };
  setupAnchors(storyEl, {
    onGlide: () => { glideUntil = performance.now() + 1600; },
    onTakeover: () => { glideUntil = 0; },
  });

  // adaptive resolution: draw fewer pixels if frames run slow, and creep back up when they do not
  let quality: Quality = { cap: stage.maxPixelRatio, goodChecks: 0 };
  let frameMs = 16.7;
  let frames = 0;

  let raf = 0;
  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    sampleCurve(curve, target, targetPose);
    stepPoseSpring(state, targetPose, dt, omegaAt(now));
    stage.render(fillPose(state.x, pose), now / 1000);
    overlays.update(target);
    gauge.update(dt);

    frameMs = frameMs * 0.92 + Math.min(100, dt * 1000) * 0.08;
    if (++frames > 60 && frames % 30 === 0) { // ignore the first second: shader compile and texture upload
      const next = adaptQuality(quality, frameMs, stage.maxPixelRatio);
      if (next.cap !== quality.cap) stage.setPixelRatioCap(next.cap);
      quality = next;
    }
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

  stage.render(fillPose(state.x, pose), 0); // first frame immediately, so there is never an empty canvas
  overlays.update(target);
  sync();

  if (import.meta.env.DEV) {
    Object.assign(window, {
      __story: {
        get target() { return target; },
        get pose() { return [...state.x]; },
        get targetPose() { return [...targetPose]; },
        get active() { return overlays.active(); },
        get activations() { return activations; },
        get pixelRatioCap() { return quality.cap; },
        get frameMs() { return frameMs; },
      },
    });
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
