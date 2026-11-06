import { describe, expect, it } from "vitest";
import { REVEAL, TITLE_LINES, createReveal, heroTitleLayout, revealValues, stepReveal } from "./heroTitle";

describe("hero title layout (copied from the CSS it replaces)", () => {
  it("desktop: font is 11vw, clamped between 56px and 176px", () => {
    expect(heroTitleLayout(1440, 900, false).fontPx).toBeCloseTo(158.4, 5);
    expect(heroTitleLayout(400, 900, false).fontPx).toBe(56);
    expect(heroTitleLayout(2400, 1200, false).fontPx).toBe(176);
  });
  it("desktop: the two lines sit at 17% and 50% of the stage height", () => {
    const l = heroTitleLayout(1440, 900, false);
    expect(l.lines.map((x) => x.top)).toEqual([153, 450]);
  });
  it("phone width: font is 15vw and the lines sit at 23% and 41%", () => {
    const l = heroTitleLayout(390, 844, true);
    expect(l.fontPx).toBeCloseTo(58.5, 5);
    expect(l.lines[0].top).toBeCloseTo(0.23 * 844, 5);
    expect(l.lines[1].top).toBeCloseTo(0.41 * 844, 5);
  });
  it("carries the real words", () => {
    expect(heroTitleLayout(390, 844, true).lines.map((x) => x.text)).toEqual([...TITLE_LINES]);
  });
});

describe("hero title reveal (time-based)", () => {
  it("starts invisible and lowered", () => {
    const v = revealValues(createReveal());
    expect(v.opacity).toBe(0);
    expect(v.rise).toBe(REVEAL.rise);
  });
  it("waits its delay before it starts to appear", () => {
    const r = createReveal();
    stepReveal(r, true, REVEAL.delay * 0.9);
    expect(r.progress).toBe(0);
    stepReveal(r, true, REVEAL.delay * 0.1 + 0.05);
    expect(r.progress).toBeGreaterThan(0);
  });
  it("is fully visible and in place after the delay plus the enter time", () => {
    const r = createReveal();
    for (let i = 0; i < 120; i++) stepReveal(r, true, 1 / 60); // 2 s
    const v = revealValues(r);
    expect(v.opacity).toBe(1);
    expect(v.rise).toBe(0);
  });
  it("leaves faster than it arrives", () => {
    const r = createReveal();
    for (let i = 0; i < 120; i++) stepReveal(r, true, 1 / 60);
    const leave = (): number => { const q = { ...r }; let t = 0; while (q.progress > 0 && t < 5) { stepReveal(q, false, 1 / 60); t += 1 / 60; } return t; };
    expect(leave()).toBeLessThan(REVEAL.enter);
    expect(leave()).toBeCloseTo(REVEAL.exit, 1);
  });
  it("reverses smoothly mid-way (no jump) and never leaves 0..1", () => {
    const r = createReveal();
    for (let i = 0; i < 25; i++) stepReveal(r, true, 1 / 60); // part way in
    const before = r.progress;
    stepReveal(r, false, 1 / 60);
    expect(Math.abs(r.progress - before)).toBeLessThan(0.1);
    for (let i = 0; i < 400; i++) {
      stepReveal(r, i % 7 < 3, 1 / 60); // flicker the target on and off
      expect(r.progress).toBeGreaterThanOrEqual(0);
      expect(r.progress).toBeLessThanOrEqual(1);
    }
  });
  it("opacity never decreases while appearing", () => {
    const r = createReveal();
    let prev = 0;
    for (let i = 0; i < 90; i++) {
      stepReveal(r, true, 1 / 60);
      const o = revealValues(r).opacity;
      expect(o).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = o;
    }
  });
});
