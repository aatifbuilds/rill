/**
 * The story's choreography as pure functions (no DOM, no three.js), so it can be unit tested.
 *
 * Scroll progress 0..1 over the pinned story picks a TARGET pose from keyframes (a smooth monotone curve per channel).
 * The camera does not copy that target instantly: each channel of the pose follows it with its own critically damped
 * spring. Smoothing values (not scroll progress) means a fast scroll heads straight for the destination instead of
 * replaying every scene in between, which is how Apple's product pages behave.
 */
export type Vec3 = readonly [number, number, number];

export interface Pose {
  camPos: Vec3;
  camTarget: Vec3;
  fov: number; // vertical field of view, degrees
  rotY: number; // the bottle spins about its own axis (radians)
  rotZ: number; // the bottle tilts (radians; negative leans right)
  offsetY: number; // bottle height offset in the scene
  capLift: number; // how far the cap floats up
  glow: number; // LED brightness, 0..~1.6
  sparkle: number; // 0..1, strength of the speckle glints
}
export interface Key { at: number; pose: Pose }

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

const DEG = Math.PI / 180;
const pose = (p: Partial<Pose> & Pick<Pose, "camPos" | "camTarget">): Pose => ({
  fov: 30, rotY: 0, rotZ: 0, offsetY: 0, capLift: 0, glow: 1, sparkle: 0, ...p,
});

/** Keyframes. Two keys with the same pose make a "hold" (the scene rests while the text is read). */
export const KEYS: readonly Key[] = [
  // 1 hero: tilted, big, base cropped by the bottom edge, cap clear of the nav
  { at: 0.0, pose: pose({ camPos: [0, -0.2, 4.6], camTarget: [0, -0.2, 0], rotY: 0.5, rotZ: -8 * DEG, offsetY: -0.55 }) },
  { at: 0.1, pose: pose({ camPos: [0, -0.2, 4.6], camTarget: [0, -0.2, 0], rotY: 0.7, rotZ: -8 * DEG, offsetY: -0.55 }) },
  // 2 the whole bottle, upright, then down to the rubber base
  { at: 0.2, pose: pose({ camPos: [0, 0, 6.8], camTarget: [0, 0, 0], fov: 28, rotY: 1.2 }) },
  { at: 0.27, pose: pose({ camPos: [0, 0, 6.8], camTarget: [0, 0, 0], fov: 28, rotY: 1.6 }) },
  { at: 0.34, pose: pose({ camPos: [0.7, -1.0, 2.1], camTarget: [0, -1.05, 0], rotY: 2.0 }) },
  // 3 macro: the shoulder and its speckled finish
  { at: 0.44, pose: pose({ camPos: [0.5, 0.35, 1.9], camTarget: [0, 0.4, 0.3], rotY: 2.6, sparkle: 1 }) },
  { at: 0.54, pose: pose({ camPos: [0.4, 0.4, 1.7], camTarget: [0, 0.45, 0.32], rotY: 3.2, sparkle: 1 }) },
  // 4 power: the bottle steps left, the gauge takes the right half
  { at: 0.62, pose: pose({ camPos: [0.3, 0, 6.2], camTarget: [1.35, 0, 0], rotY: 3.6, glow: 1.2 }) },
  { at: 0.78, pose: pose({ camPos: [0.3, 0, 6.2], camTarget: [1.35, 0, 0], rotY: 4.1, glow: 1.2 }) },
  // 5 the cap floats off; the bottle stays left so the buy text has the right half
  { at: 0.88, pose: pose({ camPos: [0.5, 0.1, 7.0], camTarget: [1.4, 0.5, 0], rotY: 4.6, capLift: 0.3, glow: 1.5 }) },
  { at: 1.0, pose: pose({ camPos: [0.5, 0.1, 7.0], camTarget: [1.4, 0.5, 0], rotY: 5.0, capLift: 0.5, glow: 1.6 }) },
];

/* ---------- pose <-> flat array (so every channel can be treated alike, with no allocation per frame) ---------- */
export const CHANNELS = 14;
export type PoseArray = number[];

export function poseToArray(p: Pose, out: PoseArray = new Array<number>(CHANNELS).fill(0)): PoseArray {
  out[0] = p.camPos[0]; out[1] = p.camPos[1]; out[2] = p.camPos[2];
  out[3] = p.camTarget[0]; out[4] = p.camTarget[1]; out[5] = p.camTarget[2];
  out[6] = p.fov; out[7] = p.rotY; out[8] = p.rotZ; out[9] = p.offsetY; out[10] = p.capLift; out[11] = p.glow; out[12] = p.sparkle;
  out[13] = 0; // spare channel
  return out;
}
export interface MutablePose { camPos: [number, number, number]; camTarget: [number, number, number]; fov: number; rotY: number; rotZ: number; offsetY: number; capLift: number; glow: number; sparkle: number }
export const createMutablePose = (): MutablePose => ({ camPos: [0, 0, 0], camTarget: [0, 0, 0], fov: 30, rotY: 0, rotZ: 0, offsetY: 0, capLift: 0, glow: 1, sparkle: 0 });
/** Fill an existing pose from an array, with no allocation (used every frame). */
export function fillPose(a: readonly number[], out: MutablePose): MutablePose {
  out.camPos[0] = a[0]; out.camPos[1] = a[1]; out.camPos[2] = a[2];
  out.camTarget[0] = a[3]; out.camTarget[1] = a[4]; out.camTarget[2] = a[5];
  out.fov = a[6]; out.rotY = a[7]; out.rotZ = a[8]; out.offsetY = a[9]; out.capLift = a[10]; out.glow = a[11]; out.sparkle = a[12];
  return out;
}
export function arrayToPose(a: readonly number[]): Pose {
  return {
    camPos: [a[0], a[1], a[2]], camTarget: [a[3], a[4], a[5]],
    fov: a[6], rotY: a[7], rotZ: a[8], offsetY: a[9], capLift: a[10], glow: a[11], sparkle: a[12],
  };
}

/* ---------- a smooth path through the keyframes: monotone cubic Hermite (Fritsch-Carlson), one curve per channel ---------- */
export interface Curve { xs: number[]; ys: number[][]; ms: number[][] }

/** Slopes that keep velocity continuous through every key, never overshoot between keys, and are zero on holds. */
function tangents(xs: readonly number[], y: readonly number[]): number[] {
  const n = xs.length;
  const d: number[] = [];
  for (let k = 0; k < n - 1; k++) d.push((y[k + 1] - y[k]) / (xs[k + 1] - xs[k]));
  const m: number[] = new Array<number>(n).fill(0);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let k = 1; k < n - 1; k++) m[k] = d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2;
  for (let k = 0; k < n - 1; k++) {
    if (d[k] === 0) {
      m[k] = 0;
      m[k + 1] = 0;
    } else {
      const a = m[k] / d[k];
      const b = m[k + 1] / d[k];
      const s = a * a + b * b;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        m[k] = t * a * d[k];
        m[k + 1] = t * b * d[k];
      }
    }
  }
  return m;
}

export function buildCurve(keys: readonly Key[]): Curve {
  const xs = keys.map((k) => k.at);
  const arrays = keys.map((k) => poseToArray(k.pose));
  const ys: number[][] = [];
  const ms: number[][] = [];
  for (let c = 0; c < CHANNELS; c++) {
    const col = arrays.map((a) => a[c]);
    ys.push(col);
    ms.push(tangents(xs, col));
  }
  return { xs, ys, ms };
}

/** Write the pose at `progress` into `out` (no allocation). */
export function sampleCurve(curve: Curve, progress: number, out: PoseArray): PoseArray {
  const { xs, ys, ms } = curve;
  const x = clamp01(progress);
  const last = xs.length - 1;
  if (x <= xs[0]) {
    for (let c = 0; c < CHANNELS; c++) out[c] = ys[c][0];
    return out;
  }
  if (x >= xs[last]) {
    for (let c = 0; c < CHANNELS; c++) out[c] = ys[c][last];
    return out;
  }
  let k = 0;
  while (k < last - 1 && x > xs[k + 1]) k++;
  const h = xs[k + 1] - xs[k];
  const t = (x - xs[k]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  for (let c = 0; c < CHANNELS; c++) {
    out[c] = h00 * ys[c][k] + h10 * h * ms[c][k] + h01 * ys[c][k + 1] + h11 * h * ms[c][k + 1];
  }
  return out;
}

const curveCache = new WeakMap<readonly Key[], Curve>();
/** Convenience for tests and one-off use; the render loop builds the curve once and calls sampleCurve. */
export function samplePose(keys: readonly Key[], progress: number): Pose {
  let curve = curveCache.get(keys);
  if (!curve) {
    curve = buildCurve(keys);
    curveCache.set(keys, curve);
  }
  return arrayToPose(sampleCurve(curve, progress, new Array<number>(CHANNELS).fill(0)));
}

/* ---------- springs ---------- */
export interface Spring { x: number; v: number }
/**
 * One step of a critically damped spring (damping ratio 1: no overshoot), solved exactly so any frame time is stable.
 * It always continues from the current value and velocity, so a reversal mid-flight just redirects it.
 */
export function stepSpring(s: Spring, target: number, dt: number, omega: number): Spring {
  const a = s.x - target;
  const b = s.v + omega * a;
  const e = Math.exp(-omega * dt);
  return { x: target + (a + b * dt) * e, v: (b - omega * (a + b * dt)) * e };
}

/** The camera's springs: one per pose channel. Updated in place every frame so nothing is allocated. */
export interface PoseState { x: number[]; v: number[] }
export const createPoseState = (initial: readonly number[]): PoseState => ({ x: [...initial], v: new Array<number>(initial.length).fill(0) });
export function stepPoseSpring(s: PoseState, target: readonly number[], dt: number, omega: number): void {
  const e = Math.exp(-omega * dt);
  for (let i = 0; i < s.x.length; i++) {
    const a = s.x[i] - target[i];
    const b = s.v[i] + omega * a;
    s.x[i] = target[i] + (a + b * dt) * e;
    s.v[i] = (b - omega * (a + b * dt)) * e;
  }
}
/** Response speeds in radians per second: about 0.4 s to settle normally, about 1.1 s for a cinematic glide after a button. */
export const OMEGA = { normal: 10, glide: 4.2 } as const;

/* ---------- text chapters: on or off by scroll position, never scrubbed ---------- */
/** The scroll range in which each chapter's text is shown. Gaps between them are scene-only moments. */
export const CHAPTER_RANGES = {
  hero: [-1, 0.105],
  whole: [0.175, 0.32],
  macro: [0.4, 0.565],
  power: [0.61, 0.83],
  buy: [0.87, 2],
} as const satisfies Record<string, readonly [number, number]>;
export type ChapterId = keyof typeof CHAPTER_RANGES;

/** Is a chapter on at this progress? Once on it stays on a little past its edge (hysteresis), so it cannot flicker at the boundary. */
export function isChapterActive(id: ChapterId, progress: number, wasActive: boolean, margin = 0.008): boolean {
  const [lo, hi] = CHAPTER_RANGES[id];
  const m = wasActive ? margin : 0;
  return progress >= lo - m && progress <= hi + m;
}

/* ---------- scroll and buttons ---------- */
/** Scroll progress through a pinned wrapper: 0 when its top reaches the viewport top, 1 when its bottom reaches the bottom. */
export function scrollProgress(scrollY: number, wrapperTop: number, wrapperHeight: number, viewportHeight: number): number {
  const range = wrapperHeight - viewportHeight;
  return range <= 0 ? 0 : clamp01((scrollY - wrapperTop) / range);
}
/** The inverse: which scroll position shows a given progress. */
export function scrollYForProgress(progress: number, wrapperTop: number, wrapperHeight: number, viewportHeight: number): number {
  return wrapperTop + clamp01(progress) * Math.max(0, wrapperHeight - viewportHeight);
}

/** Where each nav link takes you: Home = hero, About = the whole bottle, Shop and Buy now = the buy scene. */
export const ANCHORS: Readonly<Record<string, number>> = { "#top": 0, "#story": 0.23, "#buy": 0.97 };
export const anchorProgress = (href: string): number | undefined => ANCHORS[href];

/** A CSS-style cubic-bezier(x1, y1, x2, y2) easing as a function of time 0..1, so JS can use the same curves as the CSS tokens. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const bez = (a: number, b: number, s: number): number => 3 * a * (1 - s) * (1 - s) * s + 3 * b * (1 - s) * s * s + s * s * s;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let s = t;
    for (let i = 0; i < 28; i++) {
      s = (lo + hi) / 2;
      if (bez(x1, x2, s) < t) lo = s;
      else hi = s;
    }
    return bez(y1, y2, s);
  };
}
