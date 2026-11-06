import * as THREE from "three";
import { TITLE_TRACKING_EM, TITLE_WEIGHT, createReveal, heroTitleLayout, revealValues, stepReveal } from "../scroll/heroTitle";

/**
 * The hero headline, drawn inside the WebGL scene so every browser renders it the same way. (As a DOM element with
 * mix-blend-mode over a live canvas it flickered to plain white in Safari.)
 *
 * The bottle writes 1 into the stencil buffer wherever it is drawn. The headline is then drawn twice from one texture:
 * dark where the stencil is not 1 (on the page's ground) and white where it is 1 (across the bottle).
 */
export interface HeroTitle {
  resize(width: number, height: number, compact: boolean, pixelRatio: number): void;
  setActive(on: boolean): void;
  /** Draw after the bottle, keeping its stencil mask. `dt` is the frame time in seconds. */
  render(renderer: THREE.WebGLRenderer, dt: number): void;
  dispose(): void;
}

const INK = 0x0f0d0c; // --ink in tokens.css
const FONT = '"Work Sans Variable", system-ui, -apple-system, "Segoe UI", sans-serif';

export function createHeroTitle(): HeroTitle {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is not available");

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1); // one unit = one CSS pixel, y points up
  const geometry = new THREE.PlaneGeometry(1, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const shared = {
    map: texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    stencilWrite: true, stencilRef: 1, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp,
  };
  const dark = new THREE.MeshBasicMaterial({ ...shared, color: INK, stencilFunc: THREE.NotEqualStencilFunc });
  const light = new THREE.MeshBasicMaterial({ ...shared, color: 0xffffff, stencilFunc: THREE.EqualStencilFunc });
  const onGround = new THREE.Mesh(geometry, dark);
  const onBottle = new THREE.Mesh(geometry, light);
  scene.add(onGround, onBottle);

  const reveal = createReveal();
  let want = false;
  let fontReady = false;
  let size = { width: 1, height: 1, compact: false, pixelRatio: 1 };
  let regionHeight = 1; // the headline only needs the top part of the screen

  /** Draw both lines into the canvas (white on transparent; the materials colour it). */
  const draw = (): void => {
    const { width, height, compact, pixelRatio } = size;
    const layout = heroTitleLayout(width, height, compact);
    regionHeight = Math.min(height, layout.lines[1].top + layout.fontPx * 1.35);
    canvas.width = Math.max(1, Math.ceil(width * pixelRatio));
    canvas.height = Math.max(1, Math.ceil(regionHeight * pixelRatio));
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, regionHeight);
    ctx.font = `${TITLE_WEIGHT} ${layout.fontPx}px ${FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "alphabetic";
    const track = TITLE_TRACKING_EM * layout.fontPx;
    // older Safari has no canvas letterSpacing (the type definitions say it always exists, so ask at runtime)
    const hasTracking = typeof (ctx as { letterSpacing?: unknown }).letterSpacing === "string";
    const m = ctx.measureText("Hg");
    const ascent = m.fontBoundingBoxAscent ?? layout.fontPx * 0.93;
    const descent = m.fontBoundingBoxDescent ?? layout.fontPx * 0.243;
    for (const line of layout.lines) {
      // line-height 1 in CSS centres the font's ascent+descent in a box one font-size tall; do the same here
      const baseline = line.top + (layout.fontPx - (ascent + descent)) / 2 + ascent;
      if (hasTracking) {
        ctx.letterSpacing = `${track}px`;
        ctx.textAlign = "center";
        ctx.fillText(line.text, width / 2, baseline);
      } else {
        // older Safari: no canvas letter spacing, so place the glyphs one by one
        ctx.textAlign = "left";
        const widths = [...line.text].map((ch) => ctx.measureText(ch).width + track);
        let x = (width - widths.reduce((a, b) => a + b, 0)) / 2;
        [...line.text].forEach((ch, i) => { ctx.fillText(ch, x, baseline); x += widths[i]; });
      }
    }
    texture.dispose(); // the canvas changed size: let three.js allocate a fresh texture
    texture.needsUpdate = true;
    camera.left = 0;
    camera.right = width;
    camera.top = height;
    camera.bottom = 0;
    camera.updateProjectionMatrix();
    for (const mesh of [onGround, onBottle]) mesh.scale.set(width, regionHeight, 1);
  };

  // wait for Work Sans before drawing, or the first frames would use a fallback font
  const loaded = (): void => { fontReady = true; draw(); };
  void document.fonts.load(`${TITLE_WEIGHT} 64px ${FONT}`).then(loaded, loaded);

  return {
    resize(width, height, compact, pixelRatio) {
      size = { width, height, compact, pixelRatio };
      draw();
    },
    setActive(on) {
      want = on;
    },
    render(renderer, dt) {
      stepReveal(reveal, want && fontReady, dt);
      const { opacity, rise } = revealValues(reveal);
      const visible = opacity > 0.002;
      onGround.visible = visible;
      onBottle.visible = visible;
      if (!visible) return;
      dark.opacity = opacity;
      light.opacity = opacity;
      const y = size.height - regionHeight / 2 - rise; // top-anchored, rising into place
      onGround.position.set(size.width / 2, y, 0);
      onBottle.position.set(size.width / 2, y, 0);
      const keep = renderer.autoClear;
      renderer.autoClear = false; // keep the stencil mask the bottle just wrote
      renderer.render(scene, camera);
      renderer.autoClear = keep;
    },
    dispose() {
      geometry.dispose();
      dark.dispose();
      light.dispose();
      texture.dispose();
    },
  };
}
