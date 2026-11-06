import { describe, expect, it } from "vitest";
import { CHAPTERS, KEYS, clamp01, fadeWindow, samplePose, scrollProgress, smootherstep, stepSpring } from "./timeline";

describe("keyframes", () => {
  it("are ordered, start at 0 and end at 1", () => {
    expect(KEYS[0].at).toBe(0);
    expect(KEYS[KEYS.length - 1].at).toBe(1);
    for (let i = 1; i < KEYS.length; i++) expect(KEYS[i].at).toBeGreaterThan(KEYS[i - 1].at);
  });
  it("hit their exact pose at their own progress value", () => {
    for (const k of KEYS) expect(samplePose(KEYS, k.at)).toEqual(k.pose);
  });
  it("clamp outside 0..1", () => {
    expect(samplePose(KEYS, -3)).toEqual(KEYS[0].pose);
    expect(samplePose(KEYS, 7)).toEqual(KEYS[KEYS.length - 1].pose);
  });
  it("move continuously: no jump bigger than a small step between neighbouring samples", () => {
    let prev = samplePose(KEYS, 0);
    for (let p = 0.001; p <= 1; p += 0.001) {
      const cur = samplePose(KEYS, p);
      expect(Math.abs(cur.camPos[2] - prev.camPos[2])).toBeLessThan(0.15);
      expect(Math.abs(cur.rotY - prev.rotY)).toBeLessThan(0.05);
      prev = cur;
    }
  });
  it("the cap only rises, never dips, through the last scene", () => {
    let prev = samplePose(KEYS, 0.8).capLift;
    for (let p = 0.8; p <= 1; p += 0.005) {
      const c = samplePose(KEYS, p).capLift;
      expect(c).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = c;
    }
  });
});

describe("easing helpers", () => {
  it("smootherstep is 0 and 1 at the ends and increasing", () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.25)).toBeLessThan(smootherstep(0.5));
  });
  it("clamp01 clamps", () => {
    expect([clamp01(-1), clamp01(0.4), clamp01(9)]).toEqual([0, 0.4, 1]);
  });
});

describe("fadeWindow", () => {
  it("is 0 outside, 1 inside, ramps at the edges", () => {
    const w = [0.2, 0.3, 0.5, 0.6] as const;
    expect(fadeWindow(0.1, ...w)).toBe(0);
    expect(fadeWindow(0.4, ...w)).toBe(1);
    expect(fadeWindow(0.7, ...w)).toBe(0);
    const up = fadeWindow(0.25, ...w);
    expect(up).toBeGreaterThan(0);
    expect(up).toBeLessThan(1);
  });
  it("the hero is fully visible at the very top and gone by the end of its window", () => {
    expect(fadeWindow(0, ...CHAPTERS.hero)).toBe(1);
    expect(fadeWindow(0.2, ...CHAPTERS.hero)).toBe(0);
  });
  it("the buy chapter stays on to the end of the page", () => {
    expect(fadeWindow(1, ...CHAPTERS.buy)).toBe(1);
  });
  it("chapter windows are valid (a < b <= c < d) and in story order", () => {
    let lastStart = -Infinity;
    for (const [a, b, c, d] of Object.values(CHAPTERS)) {
      expect(a).toBeLessThan(b);
      expect(b).toBeLessThanOrEqual(c);
      expect(c).toBeLessThan(d);
      expect(a).toBeGreaterThan(lastStart);
      lastStart = a;
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
  it("gives the same answer whether stepped in one go or in small steps", () => {
    let a = { x: 0, v: 0 };
    for (let i = 0; i < 30; i++) a = stepSpring(a, 1, 1 / 60, 9);
    const b = stepSpring({ x: 0, v: 0 }, 1, 0.5, 9);
    expect(a.x).toBeCloseTo(b.x, 9);
  });
  it("redirects smoothly when the target reverses mid-flight (keeps its velocity)", () => {
    let s = { x: 0, v: 0 };
    for (let i = 0; i < 20; i++) s = stepSpring(s, 1, 1 / 60, 9);
    const before = s.x;
    s = stepSpring(s, 0, 1 / 60, 9);
    expect(Math.abs(s.x - before)).toBeLessThan(0.05); // no teleport
  });
});

describe("scrollProgress", () => {
  it("maps the pinned range to 0..1 and clamps", () => {
    expect(scrollProgress(0, 0, 4000, 1000)).toBe(0);
    expect(scrollProgress(1500, 0, 4000, 1000)).toBeCloseTo(0.5);
    expect(scrollProgress(9999, 0, 4000, 1000)).toBe(1);
    expect(scrollProgress(-50, 0, 4000, 1000)).toBe(0);
  });
  it("does not divide by zero for a short wrapper", () => {
    expect(scrollProgress(100, 0, 800, 800)).toBe(0);
  });
});
