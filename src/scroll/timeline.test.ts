import { describe, expect, it } from "vitest";
import {
  ANCHORS, CHAPTER_RANGES, CHANNELS, KEYS, OMEGA, anchorProgress, arrayToPose, buildCurve, clamp01, compactFraming, createPoseState, cubicBezier,
  isChapterActive, poseToArray, sampleCurve, samplePose, scrollProgress, scrollYForProgress, stepPoseSpring, stepSpring, type ChapterId,
} from "./timeline";

const curve = buildCurve(KEYS);
const at = (p: number): number[] => sampleCurve(curve, p, new Array<number>(CHANNELS).fill(0));
const keyArrays = KEYS.map((k) => poseToArray(k.pose));

describe("keyframes", () => {
  it("are ordered, start at 0 and end at 1", () => {
    expect(KEYS[0].at).toBe(0);
    expect(KEYS[KEYS.length - 1].at).toBe(1);
    for (let i = 1; i < KEYS.length; i++) expect(KEYS[i].at).toBeGreaterThan(KEYS[i - 1].at);
  });
  it("pass through every key exactly", () => {
    KEYS.forEach((k, i) => at(k.at).forEach((v, c) => expect(v).toBeCloseTo(keyArrays[i][c], 9)));
  });
  it("clamp outside 0..1", () => {
    expect(at(-3)).toEqual(keyArrays[0]);
    expect(at(7)).toEqual(keyArrays[KEYS.length - 1]);
  });
  it("round-trip between a pose and an array", () => {
    for (const k of KEYS) expect(arrayToPose(poseToArray(k.pose))).toEqual(k.pose);
  });
  it("samplePose agrees with the curve", () => {
    expect(poseToArray(samplePose(KEYS, 0.33))).toEqual(at(0.33));
  });
});

describe("the camera path is smooth", () => {
  it("never overshoots between two keys, on any channel", () => {
    for (let k = 0; k < KEYS.length - 1; k++) {
      for (let c = 0; c < CHANNELS; c++) {
        const lo = Math.min(keyArrays[k][c], keyArrays[k + 1][c]) - 1e-9;
        const hi = Math.max(keyArrays[k][c], keyArrays[k + 1][c]) + 1e-9;
        for (let i = 0; i <= 40; i++) {
          const v = at(KEYS[k].at + ((KEYS[k + 1].at - KEYS[k].at) * i) / 40)[c];
          expect(v).toBeGreaterThanOrEqual(lo);
          expect(v).toBeLessThanOrEqual(hi);
        }
      }
    }
  });
  it("holds are perfectly still (two keys with the same value make a flat segment)", () => {
    // keys 0 and 1 (hero hold) share camPos and camTarget
    for (let i = 0; i <= 20; i++) {
      const v = at((0.1 * i) / 20);
      expect(v[2]).toBeCloseTo(4.6, 9); // camera z
      expect(v[1]).toBeCloseTo(-0.2, 9); // camera y
    }
  });
  it("has no corner at a key: the slope matches on both sides (no stop-start)", () => {
    const eps = 1e-7; // small enough that the curve's own bend does not show up as a fake corner (a real corner differs by whole units)
    for (let k = 1; k < KEYS.length - 1; k++) {
      const x = KEYS[k].at;
      const l1 = at(x - 2 * eps);
      const l2 = at(x - eps);
      const r1 = at(x + eps);
      const r2 = at(x + 2 * eps);
      for (let c = 0; c < CHANNELS; c++) {
        const left = (l2[c] - l1[c]) / eps;
        const right = (r2[c] - r1[c]) / eps;
        expect(Math.abs(left - right)).toBeLessThan(1e-2 * (1 + Math.abs(left)));
      }
    }
  });
  it("keeps moving through a key when both neighbours move the same way (smootherstep would stop here)", () => {
    const eps = 1e-4;
    const x = 0.34; // the camera is still travelling towards the rubber base on both sides of this key
    const slope = Math.abs((at(x + eps)[2] - at(x - eps)[2]) / (2 * eps));
    expect(slope).toBeGreaterThan(1);
  });
  it("the cap only rises, never dips, through the last scene", () => {
    let prev = at(0.8)[10];
    for (let p = 0.8; p <= 1; p += 0.005) {
      const c = at(p)[10];
      expect(c).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = c;
    }
  });
});

describe("stepSpring (critically damped)", () => {
  it("converges to the target without overshooting", () => {
    let s = { x: 0, v: 0 };
    let max = 0;
    for (let i = 0; i < 240; i++) {
      s = stepSpring(s, 1, 1 / 60, 9);
      max = Math.max(max, s.x);
    }
    expect(max).toBeLessThanOrEqual(1 + 1e-9);
    expect(s.x).toBeGreaterThan(0.999);
  });
  it("gives the same answer in one big step or many small ones", () => {
    let a = { x: 0, v: 0 };
    for (let i = 0; i < 30; i++) a = stepSpring(a, 1, 1 / 60, 9);
    expect(a.x).toBeCloseTo(stepSpring({ x: 0, v: 0 }, 1, 0.5, 9).x, 9);
  });
});

describe("the camera's pose springs", () => {
  const target = poseToArray(KEYS[KEYS.length - 1].pose);
  const start = poseToArray(KEYS[0].pose);
  it("every channel converges to its target and none overshoots", () => {
    const s = createPoseState(start);
    const max = start.map((v, i) => Math.max(v, target[i]));
    const min = start.map((v, i) => Math.min(v, target[i]));
    for (let f = 0; f < 600; f++) {
      stepPoseSpring(s, target, 1 / 60, OMEGA.normal);
      s.x.forEach((v, i) => {
        expect(v).toBeLessThanOrEqual(max[i] + 1e-9);
        expect(v).toBeGreaterThanOrEqual(min[i] - 1e-9);
      });
    }
    s.x.forEach((v, i) => expect(v).toBeCloseTo(target[i], 4));
  });
  it("glide mode is slower than normal", () => {
    const fast = createPoseState(start);
    const slow = createPoseState(start);
    for (let f = 0; f < 30; f++) {
      stepPoseSpring(fast, target, 1 / 60, OMEGA.normal);
      stepPoseSpring(slow, target, 1 / 60, OMEGA.glide);
    }
    const dist = (s: { x: number[] }): number => Math.abs(s.x[2] - target[2]);
    expect(dist(slow)).toBeGreaterThan(dist(fast));
  });
  it("gives the same answer whether stepped in one go or in small steps", () => {
    const a = createPoseState(start);
    const b = createPoseState(start);
    for (let i = 0; i < 30; i++) stepPoseSpring(a, target, 1 / 60, OMEGA.normal);
    stepPoseSpring(b, target, 0.5, OMEGA.normal);
    a.x.forEach((v, i) => expect(v).toBeCloseTo(b.x[i], 8));
  });
  it("redirects smoothly when the target changes mid-flight (no teleport)", () => {
    const s = createPoseState(start);
    for (let i = 0; i < 20; i++) stepPoseSpring(s, target, 1 / 60, OMEGA.normal);
    const before = [...s.x];
    stepPoseSpring(s, start, 1 / 60, OMEGA.normal);
    s.x.forEach((v, i) => expect(Math.abs(v - before[i])).toBeLessThan(0.25));
  });
  it("a long jump heads straight for the destination: it never visits the scenes in between", () => {
    // jump from the hero to the buy scene; the camera's distance (z) should move one way only, never to the macro scene's 1.7
    const s = createPoseState(poseToArray(KEYS[0].pose));
    const dest = at(0.97);
    let minZ = Infinity;
    for (let f = 0; f < 240; f++) {
      stepPoseSpring(s, dest, 1 / 60, OMEGA.glide);
      minZ = Math.min(minZ, s.x[2]);
    }
    expect(minZ).toBeGreaterThan(4.5); // the macro close-up sits at z of about 1.7 and the base close-up at 2.1
  });
});

describe("text chapters", () => {
  const ids = Object.keys(CHAPTER_RANGES) as ChapterId[];
  it("ranges are valid and in story order without overlapping, even with the hysteresis margin", () => {
    let prevHi = -Infinity;
    for (const id of ids) {
      const [lo, hi] = CHAPTER_RANGES[id];
      expect(lo).toBeLessThan(hi);
      expect(lo - 0.008).toBeGreaterThan(prevHi + 0.008 - 1e-9 - (id === "hero" ? Infinity : 0));
      prevHi = hi;
    }
  });
  it("the hero is on at the very top and the buy chapter stays on to the end", () => {
    expect(isChapterActive("hero", 0, false)).toBe(true);
    expect(isChapterActive("buy", 1, false)).toBe(true);
  });
  it("hysteresis: a chapter that is on stays on a little past its edge, a chapter that is off does not turn on early", () => {
    const [lo, hi] = CHAPTER_RANGES.whole;
    expect(isChapterActive("whole", hi + 0.004, true)).toBe(true);
    expect(isChapterActive("whole", hi + 0.004, false)).toBe(false);
    expect(isChapterActive("whole", lo - 0.004, false)).toBe(false);
  });
  it("never more than one chapter at a time, scrolling down then back up", () => {
    const state: Record<string, boolean> = {};
    const sweep = (p: number): void => {
      let on = 0;
      for (const id of ids) {
        state[id] = isChapterActive(id, p, state[id] ?? false);
        if (state[id]) on++;
      }
      expect(on).toBeLessThanOrEqual(1);
    };
    for (let p = 0; p <= 1; p += 0.001) sweep(p);
    for (let p = 1; p >= 0; p -= 0.001) sweep(p);
  });
});

describe("buttons", () => {
  it("maps the nav links to scenes and ignores unknown links", () => {
    expect(anchorProgress("#top")).toBe(0);
    expect(anchorProgress("#story")).toBe(ANCHORS["#story"]);
    expect(anchorProgress("#buy")).toBe(0.97);
    expect(anchorProgress("#nowhere")).toBeUndefined();
    expect(anchorProgress("https://example.com")).toBeUndefined();
  });
  it("each target lands inside the matching text chapter", () => {
    const inside = (id: ChapterId, p: number): boolean => p >= CHAPTER_RANGES[id][0] && p <= CHAPTER_RANGES[id][1];
    expect(inside("hero", ANCHORS["#top"])).toBe(true);
    expect(inside("whole", ANCHORS["#story"])).toBe(true);
    expect(inside("buy", ANCHORS["#buy"])).toBe(true);
  });
  it("scroll position and progress convert both ways", () => {
    for (const p of [0, 0.23, 0.5, 0.97, 1]) {
      expect(scrollProgress(scrollYForProgress(p, 0, 9000, 900), 0, 9000, 900)).toBeCloseTo(p, 9);
    }
  });
  it("scrollProgress clamps and does not divide by zero", () => {
    expect(scrollProgress(-50, 0, 4000, 1000)).toBe(0);
    expect(scrollProgress(9999, 0, 4000, 1000)).toBe(1);
    expect(scrollProgress(100, 0, 800, 800)).toBe(0);
    expect(clamp01(5)).toBe(1);
  });
});

describe("cubicBezier (the same curves as the CSS tokens)", () => {
  const easeOut = cubicBezier(0.23, 1, 0.32, 1);
  const easeInOut = cubicBezier(0.77, 0, 0.175, 1);
  it("starts at 0 and ends at 1", () => {
    for (const f of [easeOut, easeInOut]) {
      expect(f(0)).toBe(0);
      expect(f(1)).toBe(1);
    }
  });
  it("never decreases", () => {
    for (const f of [easeOut, easeInOut]) {
      let prev = 0;
      for (let t = 0; t <= 1; t += 0.01) {
        const v = f(t);
        expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = v;
      }
    }
  });
  it("ease-out is fast at the start; ease-in-out starts slow", () => {
    expect(easeOut(0.2)).toBeGreaterThan(0.5);
    expect(easeInOut(0.1)).toBeLessThan(0.1);
  });
});

describe("phone framing (the bottle stays between the nav bar and the caption panel)", () => {
  // the bottle is 2.43 tall, centred on its pivot, with the cap floating up by capLift
  const subject = (p: ReturnType<typeof samplePose>): { top: number; bottom: number } => ({ top: p.offsetY + 1.215 + p.capLift, bottom: p.offsetY - 1.215 });
  const rests: [string, number, number][] = [["whole bottle", 0.2, 0.27], ["power", 0.62, 0.78], ["buy", 0.88, 1.0]];
  for (const [name, from, to] of rests) {
    it(`${name}: the whole bottle, cap included, is inside the free band at every point of the scene`, () => {
      for (let i = 0; i <= 20; i++) {
        const p = samplePose(KEYS, from + ((to - from) * i) / 20);
        const f = compactFraming(p);
        const s = subject(p);
        expect(s.top).toBeLessThanOrEqual(f.bandTop + 0.05); // not cropped by the nav bar
        expect(s.bottom).toBeGreaterThanOrEqual(f.bandBottom - 0.05); // not hidden behind the caption panel
      }
    });
  }
  it("the base close-up pulls back to show context: the base is visible above the panel and more than the base alone is in view", () => {
    const p = samplePose(KEYS, 0.34);
    const f = compactFraming(p);
    expect(-1.215).toBeGreaterThanOrEqual(f.bandBottom - 0.05);
    expect(f.bandTop - f.bandBottom).toBeGreaterThan(1.1); // at least 1.1 scene units of bottle fit in the free band
  });
  it("the macro close-up is free to crop: no pull-back and no shift on any screen", () => {
    for (const at of [0.44, 0.54]) {
      const p = samplePose(KEYS, at);
      expect(p.phoneFit).toBe(1);
      expect(p.phoneDy).toBe(0);
    }
  });
  it("the hero needs no caption panel, so it is only pulled back a little and not shifted", () => {
    const p = samplePose(KEYS, 0);
    expect(p.phoneDy).toBe(0);
    expect(p.phoneFit).toBeGreaterThan(1);
    expect(p.phoneFit).toBeLessThan(1.5);
  });
});
