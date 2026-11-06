import * as THREE from "three";

/** Deterministic random numbers (mulberry32), so the speckle looks identical on every load. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas is not available");
  return [c, ctx];
}

/**
 * The bottle's surface, drawn in code: a fine speckled finish plus an embossed DRIP wordmark.
 * `bump` gives the tiny relief; `rough` varies how shiny each speck is (the glints) and makes the wordmark glossier.
 * Both wrap once around the bottle (u) and run bottom to top (v).
 */
export function makeSurfaceMaps(size: number): { bump: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  const [bumpCanvas, bump] = makeCanvas(size);
  const [roughCanvas, rough] = makeCanvas(size);
  bump.fillStyle = "#808080";
  bump.fillRect(0, 0, size, size);
  rough.fillStyle = "#8f8f8f";
  rough.fillRect(0, 0, size, size);

  const rand = rng(7);
  const specks = Math.floor((size * size) / 14);
  for (let i = 0; i < specks; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const s = rand() < 0.1 ? 2 : 1;
    const h = Math.floor(70 + rand() * 120);
    bump.fillStyle = `rgb(${h},${h},${h})`;
    bump.fillRect(x, y, s, s);
    const r = rand() < 0.25 ? 60 + rand() * 50 : 135 + rand() * 70; // a quarter of the specks are glossy glints
    rough.fillStyle = `rgb(${r},${r},${r})`;
    rough.fillRect(x, y, s, s);
  }

  // embossed wordmark, reading bottom to top along the body
  const drawWord = (ctx: CanvasRenderingContext2D, fill: string): void => {
    ctx.save();
    ctx.translate(size * 0.25, size * 0.42);
    ctx.rotate(-Math.PI / 2);
    ctx.scale(0.8, 1); // the texture is stretched around the circumference; this keeps the letters in proportion
    ctx.fillStyle = fill;
    ctx.font = `700 ${Math.round(size * 0.075)}px "Work Sans Variable", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("DRIP", 0, 0);
    ctx.restore();
  };
  drawWord(bump, "#f2f2f2");
  drawWord(rough, "#2a2a2a");

  const mk = (c: HTMLCanvasElement): THREE.CanvasTexture => {
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    t.colorSpace = THREE.NoColorSpace; // data, not colour
    return t;
  };
  return { bump: mk(bumpCanvas), rough: mk(roughCanvas) };
}

/** A soft round glow (used for the cap's LED halo). */
export function makeGlowTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(190,150,255,1)");
  g.addColorStop(0.25, "rgba(150,100,255,0.55)");
  g.addColorStop(1, "rgba(120,70,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
