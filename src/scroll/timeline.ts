/**
 * The story's choreography as pure functions (no DOM, no three.js), so it can be unit tested.
 * Scroll progress 0..1 over the pinned story maps to a camera/bottle "pose" by easing between keyframes.
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
/** Perlin's smootherstep: zero velocity and acceleration at both ends, so each scene settles gently. */
export const smootherstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
/** Exact at both ends (t = 0 gives a, t = 1 gives b), unlike a + (b - a) * t, which can drift by a rounding error. */
const lerp = (a: number, b: number, t: number): number => a * (1 - t) + b * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

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

export function samplePose(keys: readonly Key[], progress: number): Pose {
  const x = clamp01(progress);
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (x <= first.at) return first.pose;
  if (x >= last.at) return last.pose;
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = smootherstep((x - a.at) / (b.at - a.at));
  return {
    camPos: lerp3(a.pose.camPos, b.pose.camPos, t),
    camTarget: lerp3(a.pose.camTarget, b.pose.camTarget, t),
    fov: lerp(a.pose.fov, b.pose.fov, t),
    rotY: lerp(a.pose.rotY, b.pose.rotY, t),
    rotZ: lerp(a.pose.rotZ, b.pose.rotZ, t),
    offsetY: lerp(a.pose.offsetY, b.pose.offsetY, t),
    capLift: lerp(a.pose.capLift, b.pose.capLift, t),
    glow: lerp(a.pose.glow, b.pose.glow, t),
    sparkle: lerp(a.pose.sparkle, b.pose.sparkle, t),
  };
}

/** 0 before `a`, eases to 1 at `b`, holds to `c`, eases back to 0 at `d` (a < b <= c < d). */
export function fadeWindow(p: number, a: number, b: number, c: number, d: number): number {
  if (p <= a || p >= d) return 0;
  if (p < b) return smootherstep((p - a) / (b - a));
  if (p <= c) return 1;
  return 1 - smootherstep((p - c) / (d - c));
}

/** When each text chapter is on screen, as [a, b, c, d] for fadeWindow. The last one never fades out. */
export const CHAPTERS = {
  hero: [-0.2, -0.1, 0.06, 0.15],
  whole: [0.15, 0.2, 0.29, 0.35],
  macro: [0.37, 0.43, 0.53, 0.6],
  power: [0.58, 0.64, 0.8, 0.86],
  buy: [0.84, 0.9, 1.5, 1.6],
} as const satisfies Record<string, readonly [number, number, number, number]>;
export type ChapterId = keyof typeof CHAPTERS;

export interface Spring { x: number; v: number }
/**
 * One step of a critically damped spring (damping ratio 1: no overshoot), solved exactly so any frame time is stable.
 * It always continues from the current value and velocity, so a scroll reversal mid-flight just redirects it.
 */
export function stepSpring(s: Spring, target: number, dt: number, omega: number): Spring {
  const a = s.x - target;
  const b = s.v + omega * a;
  const e = Math.exp(-omega * dt);
  return { x: target + (a + b * dt) * e, v: (b - omega * (a + b * dt)) * e };
}

/** Scroll progress through a pinned wrapper: 0 when its top reaches the viewport top, 1 when its bottom reaches the bottom. */
export function scrollProgress(scrollY: number, wrapperTop: number, wrapperHeight: number, viewportHeight: number): number {
  const range = wrapperHeight - viewportHeight;
  return range <= 0 ? 0 : clamp01((scrollY - wrapperTop) / range);
}
