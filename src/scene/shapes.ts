import { filletProfile, type Corner } from "./profile";

/* The bottle's outlines. Each is a list of corners (radius from the axis, height) with an optional fillet radius, rounded
   by filletProfile. All measurements in scene units: the bottle is 2.43 tall and 0.62 wide, standing on y = 0.
   Edges that meet on a real product are rounded, which is what catches the thin highlight lines you see on photos. */
export const HEIGHT = 2.43;

/** Body: straight wall, an ogive-like shoulder built from three gentle bends, a short neck and a rolled lip. */
const BODY_CORNERS: Corner[] = [
  { x: 0.31, y: 0.147 },
  { x: 0.31, y: 1.5, r: 0.4 },
  { x: 0.26, y: 1.74, r: 0.3 },
  { x: 0.15, y: 1.885, r: 0.1 },
  { x: 0.15, y: 1.93, r: 0.01 },
  { x: 0.13, y: 1.93 },
];

/** Rubber foot: a shallow recess in the middle, a standing ring, then a rounded wall that tucks under the body. */
const FOOT_CORNERS: Corner[] = [
  { x: 0, y: 0.035 },
  { x: 0.19, y: 0.035, r: 0.012 },
  { x: 0.198, y: 0, r: 0.006 },
  { x: 0.29, y: 0, r: 0.03 },
  { x: 0.325, y: 0.07, r: 0.04 },
  { x: 0.325, y: 0.125, r: 0.015 },
  { x: 0.31, y: 0.147 },
];

/** Cap, a solid of revolution from its underside up over the top, with a ring-shaped groove for the LED light. */
const CAP_CORNERS: Corner[] = [
  { x: 0, y: 1.936 },
  { x: 0.18, y: 1.936, r: 0.004 },
  { x: 0.18, y: 2.43, r: 0.0275 },
  { x: 0.125, y: 2.43, r: 0.004 },
  { x: 0.125, y: 2.411, r: 0.004 },
  { x: 0.096, y: 2.411, r: 0.004 },
  { x: 0.096, y: 2.43, r: 0.004 },
  { x: 0, y: 2.43 },
];

/** A thin steel band round the cap's lower edge, sitting just proud of the cap wall. */
const CAP_RING_CORNERS: Corner[] = [
  { x: 0.176, y: 1.934 },
  { x: 0.186, y: 1.934, r: 0.004 },
  { x: 0.186, y: 1.972, r: 0.004 },
  { x: 0.176, y: 1.972 },
];

/** Rubber gasket between the neck and the cap. Its ends are hidden inside the neck and the cap. */
const SEAL_CORNERS: Corner[] = [
  { x: 0.13, y: 1.928 },
  { x: 0.162, y: 1.928, r: 0.004 },
  { x: 0.162, y: 1.938, r: 0.004 },
  { x: 0.13, y: 1.938 },
];

/** The frosted light strip that sits in the cap's groove. */
const DIFFUSER_CORNERS: Corner[] = [
  { x: 0.098, y: 2.4115 },
  { x: 0.1235, y: 2.4115, r: 0.005 },
  { x: 0.1235, y: 2.4295, r: 0.005 },
  { x: 0.098, y: 2.4295 },
];

export const BODY = filletProfile(BODY_CORNERS, 10);
export const FOOT = filletProfile(FOOT_CORNERS, 6);
export const CAP = filletProfile(CAP_CORNERS, 8);
export const CAP_RING = filletProfile(CAP_RING_CORNERS, 4);
export const SEAL = filletProfile(SEAL_CORNERS, 4);
export const DIFFUSER = filletProfile(DIFFUSER_CORNERS, 4);

/** Radius of the body at a given height (used to put the sparkles exactly on the surface). */
export function bodyRadiusAt(y: number): number {
  for (let i = 1; i < BODY.length; i++) {
    const [r0, y0] = BODY[i - 1];
    const [r1, y1] = BODY[i];
    if (y <= y1) return y1 === y0 ? r1 : r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return BODY[BODY.length - 1][0];
}
