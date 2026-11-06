import { describe, expect, it } from "vitest";
import { BODY, CAP, CAP_RING, DIFFUSER, FOOT, HEIGHT, SEAL, bodyRadiusAt } from "./shapes";

const all = { BODY, CAP, CAP_RING, DIFFUSER, FOOT, SEAL };

describe("bottle outlines", () => {
  it("are finite and never go below the floor or above the top", () => {
    for (const [name, pts] of Object.entries(all)) {
      for (const [x, y] of pts) {
        expect(Number.isFinite(x) && Number.isFinite(y), name).toBe(true);
        expect(x, name).toBeGreaterThanOrEqual(0);
        expect(y, name).toBeGreaterThanOrEqual(-1e-9);
        expect(y, name).toBeLessThanOrEqual(HEIGHT + 1e-9);
      }
    }
  });

  it("make the bottle exactly as tall as the pivot assumes", () => {
    expect(Math.max(...CAP.map((p) => p[1]))).toBeCloseTo(HEIGHT, 9);
    expect(Math.min(...FOOT.map((p) => p[1]))).toBeCloseTo(0, 9);
  });

  it("have a body whose height never goes backwards, so the surface cannot fold over itself", () => {
    for (let i = 1; i < BODY.length; i++) expect(BODY[i][1]).toBeGreaterThanOrEqual(BODY[i - 1][1] - 1e-9);
  });

  it("join up: the body starts where the foot ends, and the body's neck sits under the cap", () => {
    expect(BODY[0]).toEqual(FOOT[FOOT.length - 1]);
    const neckTop = Math.max(...BODY.map((p) => p[1]));
    const capBottom = Math.min(...CAP.map((p) => p[1]));
    expect(capBottom - neckTop).toBeGreaterThan(0);
    expect(capBottom - neckTop).toBeLessThan(0.01); // a hair-line gap, closed by the rubber seal
    expect(Math.min(...SEAL.map((p) => p[1]))).toBeLessThan(neckTop);
    expect(Math.max(...SEAL.map((p) => p[1]))).toBeGreaterThan(capBottom);
  });

  it("keep the LED strip inside its groove in the cap", () => {
    const xs = DIFFUSER.map((p) => p[0]);
    expect(Math.min(...xs)).toBeGreaterThan(0.096);
    expect(Math.max(...xs)).toBeLessThan(0.125);
    expect(Math.max(...DIFFUSER.map((p) => p[1]))).toBeLessThan(HEIGHT);
  });
});

describe("bodyRadiusAt", () => {
  it("is the full wall radius up the straight section", () => {
    for (const y of [0.2, 0.8, 1.4]) expect(bodyRadiusAt(y)).toBeCloseTo(0.31, 6);
  });

  it("narrows smoothly over the shoulder to the neck", () => {
    let last = bodyRadiusAt(1.4);
    for (let y = 1.45; y <= 1.9; y += 0.01) {
      const r = bodyRadiusAt(y);
      expect(r).toBeLessThanOrEqual(last + 1e-9);
      expect(last - r).toBeLessThan(0.03);
      last = r;
    }
    expect(bodyRadiusAt(1.9)).toBeCloseTo(0.15, 3);
  });

  it("agrees with the outline at every point", () => {
    for (let i = 1; i < BODY.length; i++) {
      const [x, y] = BODY[i];
      if (y - BODY[i - 1][1] > 1e-6) expect(bodyRadiusAt(y)).toBeCloseTo(x, 9);
    }
  });
});
