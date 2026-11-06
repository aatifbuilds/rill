import * as THREE from "three";
import type { Pose } from "../scroll/timeline";
import { makeGlowTexture, makeSurfaceMaps } from "./textures";

/* All measurements in scene units. The bottle is about 2.43 tall and 0.8 wide, standing on y = 0. */
const BODY: [number, number][] = [
  [0.31, 0.14], [0.31, 0.3], [0.31, 0.6], [0.31, 0.9], [0.31, 1.2], [0.31, 1.5], [0.3, 1.6], [0.27, 1.7], [0.22, 1.78], [0.16, 1.84], [0.15, 1.9],
];
const CAP: [number, number][] = [
  [0.15, 1.9], [0.18, 1.915], [0.18, 2.1], [0.18, 2.28], [0.172, 2.34], [0.155, 2.385], [0.12, 2.415], [0.065, 2.428], [0, 2.43],
];
const BASE: [number, number][] = [[0, 0], [0.22, 0], [0.3, 0.015], [0.325, 0.06], [0.325, 0.12], [0.31, 0.145]];
const HEIGHT = 2.43;

const smooth = (pts: [number, number][], n: number): THREE.Vector2[] =>
  new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(n);

/** Radius of the body at a given height (used to put the sparkles exactly on the surface). */
export function bodyRadiusAt(y: number): number {
  for (let i = 1; i < BODY.length; i++) {
    const [r0, y0] = BODY[i - 1];
    const [r1, y1] = BODY[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0 || 1);
  }
  return BODY[BODY.length - 1][0];
}

export interface Bottle {
  root: THREE.Group; // tilt and spin applied here
  update(pose: Pose): void;
  dispose(): void;
}

export function createBottle(textureSize: number): Bottle {
  const root = new THREE.Group();
  root.rotation.order = "ZYX"; // spin about its own axis first, then tilt
  const pivot = new THREE.Group();
  pivot.position.y = -HEIGHT / 2; // so it rotates about its middle
  root.add(pivot);

  const { bump, rough } = makeSurfaceMaps(textureSize);
  const steel = new THREE.MeshPhysicalMaterial({
    color: 0x151210, metalness: 0.9, roughness: 1, roughnessMap: rough, bumpMap: bump, bumpScale: 1.2,
    clearcoat: 0.2, clearcoatRoughness: 0.45, envMapIntensity: 1.15,
  });
  const capSteel = new THREE.MeshPhysicalMaterial({ color: 0x0e0c0b, metalness: 0.85, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.2 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1c1b1a, metalness: 0, roughness: 0.96 });
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xb89cff, toneMapped: false });
  const glowTex = makeGlowTexture();
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 });

  const bodyGeo = new THREE.LatheGeometry(smooth(BODY, 60), 128);
  const baseGeo = new THREE.LatheGeometry(BASE.map(([x, y]) => new THREE.Vector2(x, y)), 96);
  const capGeo = new THREE.LatheGeometry(smooth(CAP, 40), 96);
  const ringGeo = new THREE.TorusGeometry(0.115, 0.009, 16, 96);
  const discGeo = new THREE.CircleGeometry(0.035, 32);
  const underGeo = new THREE.CircleGeometry(0.15, 48); // closes the cap's underside so it is not see-through

  pivot.add(new THREE.Mesh(bodyGeo, steel), new THREE.Mesh(baseGeo, rubber));

  // the cap is its own group so it can float off in the last scene
  const cap = new THREE.Group();
  cap.add(new THREE.Mesh(capGeo, capSteel));
  const under = new THREE.Mesh(underGeo, capSteel);
  under.rotation.x = Math.PI / 2;
  under.position.y = 1.9;
  cap.add(under);
  const ring = new THREE.Mesh(ringGeo, ledMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 2.41;
  const disc = new THREE.Mesh(discGeo, ledMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 2.432;
  const halo = new THREE.Sprite(glowMat);
  halo.position.y = 2.46;
  const light = new THREE.PointLight(0x9b6cff, 0, 5, 2);
  light.position.y = 2.6;
  cap.add(ring, disc, halo, light);
  pivot.add(cap);

  return {
    root,
    update(p) {
      root.position.y = p.offsetY;
      root.rotation.set(0, p.rotY, p.rotZ);
      cap.position.y = p.capLift;
      cap.rotation.y = p.capLift * 1.4;
      light.intensity = 5 * p.glow;
      glowMat.opacity = Math.min(1, 0.45 * p.glow);
      const s = 0.7 + 0.5 * p.glow;
      halo.scale.set(s, s, 1);
    },
    dispose() {
      for (const g of [bodyGeo, baseGeo, capGeo, ringGeo, discGeo, underGeo]) g.dispose();
      for (const m of [steel, capSteel, rubber, ledMat, glowMat]) m.dispose();
      for (const t of [bump, rough, glowTex]) t.dispose();
    },
  };
}
