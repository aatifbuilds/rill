import * as THREE from "three";
import { aoAt, boxBlur, fbm, heightToNormal, ridgeHeight } from "./surface";

function makeCanvas(w: number, h: number = w): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas is not available");
  return [c, ctx];
}

/** A canvas holding the given pixels (RGBA bytes). */
function canvasFromPixels(data: Uint8ClampedArray<ArrayBuffer>, w: number, h: number): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(w, h);
  ctx.putImageData(new ImageData(data, w, h), 0, 0);
  return c;
}

/** A data texture (not colour): sharp at a slant thanks to anisotropic filtering, smooth from afar thanks to mipmaps. */
function dataTexture(c: HTMLCanvasElement, anisotropy: number, repeatX = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = anisotropy;
  t.colorSpace = THREE.NoColorSpace;
  if (repeatX) t.wrapS = THREE.RepeatWrapping; // the seam where the map wraps round the bottle must not show
  return t;
}

export interface SurfaceMaps {
  normal: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
  ao: THREE.CanvasTexture;
}

/**
 * The bottle's body surface, made in code:
 *  - a fine powder-coat grain (three sizes of tiny bumps), stored as a normal map so light catches each grain properly;
 *  - the RILL wordmark, slightly raised with soft edges and a touch glossier than the coating around it;
 *  - a roughness map that varies a little grain to grain, so the highlight sparkles softly instead of looking painted;
 *  - an ambient-occlusion strip: darker in the creases at the foot and under the cap.
 * Each map wraps once around the bottle (u) and runs bottom to top (v).
 */
export function makeSurfaceMaps(size: number, anisotropy: number): SurfaceMaps {
  const grain = fbm(size, 7, [[size / 4, 1], [size / 2, 0.8], [size, 0.5]]);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let i = 0; i < height.length; i++) {
    height[i] = grain[i];
    rough[i] = 0.56 + (grain[i] - 0.5) * 0.3;
  }

  // The wordmark is drawn into a small canvas around where it sits, blurred so the edges are soft, then added in.
  const cx = size * 0.25;
  const cy = size * 0.42;
  const rx = Math.round(size * 0.18);
  const ry = Math.round(size * 0.22);
  const rw = Math.round(size * 0.14);
  const rh = Math.round(size * 0.4);
  const [, wctx] = makeCanvas(rw, rh);
  wctx.fillStyle = "#000";
  wctx.fillRect(0, 0, rw, rh);
  wctx.translate(cx - rx, cy - ry);
  wctx.rotate(-Math.PI / 2); // reads bottom to top along the body
  wctx.fillStyle = "#fff";
  wctx.font = `700 ${Math.round(size * 0.075)}px "Work Sans Variable", system-ui, sans-serif`;
  wctx.textAlign = "center";
  wctx.textBaseline = "middle";
  wctx.fillText("RILL", 0, 0);
  const px = wctx.getImageData(0, 0, rw, rh).data;
  let mask: Float32Array = new Float32Array(rw * rh);
  for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4] / 255;
  const blur = Math.max(1, Math.round(size / 700));
  mask = boxBlur(boxBlur(mask, rw, rh, blur), rw, rh, blur);
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const m = mask[y * rw + x];
      const i = (y + ry) * size + (x + rx);
      height[i] += m * 0.9;
      rough[i] -= m * 0.26;
    }
  }

  const normal = canvasFromPixels(heightToNormal(height, size, size, 1.3), size, size);

  const roughPx = new Uint8ClampedArray(new ArrayBuffer(size * size * 4));
  for (let i = 0; i < rough.length; i++) {
    const v = Math.max(0, Math.min(1, rough[i])) * 255;
    roughPx.set([v, v, v, 255], i * 4);
  }

  // Ambient occlusion: one narrow column is enough because it only varies with height.
  const aoH = 512;
  const aoPx = new Uint8ClampedArray(new ArrayBuffer(8 * aoH * 4));
  for (let y = 0; y < aoH; y++) {
    const v = 1 - (y + 0.5) / aoH;
    const a = aoAt(v) * 255;
    for (let x = 0; x < 8; x++) aoPx.set([a, a, a, 255], (y * 8 + x) * 4);
  }

  return {
    normal: dataTexture(normal, anisotropy),
    rough: dataTexture(canvasFromPixels(roughPx, size, size), anisotropy),
    ao: dataTexture(canvasFromPixels(aoPx, 8, aoH), anisotropy),
  };
}

/** Fine vertical grip ridges for the cap's wall, as a normal map. The rounded top edge and the cap's top stay smooth. */
export function makeGripMap(anisotropy: number): THREE.CanvasTexture {
  const w = 1024;
  const h = 256;
  const ridges = ridgeHeight(w, h, 72, 0.07, 0.9, 0.04);
  return dataTexture(canvasFromPixels(heightToNormal(ridges, w, h, 4), w, h), anisotropy);
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
