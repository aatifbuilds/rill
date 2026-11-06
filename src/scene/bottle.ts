import * as THREE from "three";
import type { Pose } from "../scroll/timeline";
import { BODY, CAP, CAP_RING, DIFFUSER, FOOT, HEIGHT, SEAL } from "./shapes";
import { makeGlowTexture, makeGripMap, makeSurfaceMaps } from "./textures";

export { bodyRadiusAt } from "./shapes";

/** A solid of revolution from an outline. Its texture height (v) follows the real height, so maps do not stretch on the curved parts. */
function lathe(outline: [number, number][], segments: number): THREE.LatheGeometry {
  const g = new THREE.LatheGeometry(outline.map(([x, y]) => new THREE.Vector2(x, y)), segments);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    lo = Math.min(lo, pos.getY(i));
    hi = Math.max(hi, pos.getY(i));
  }
  for (let i = 0; i < pos.count; i++) uv.setY(i, (pos.getY(i) - lo) / (hi - lo || 1));
  return g;
}

export interface Bottle {
  root: THREE.Group; // tilt and spin applied here
  update(pose: Pose): void;
  dispose(): void;
}

export function createBottle(textureSize: number, anisotropy = 4): Bottle {
  const root = new THREE.Group();
  root.rotation.order = "ZYX"; // spin about its own axis first, then tilt
  const pivot = new THREE.Group();
  pivot.position.y = -HEIGHT / 2; // so it rotates about its middle
  root.add(pivot);

  const { normal, rough, ao } = makeSurfaceMaps(textureSize, anisotropy);
  const grip = makeGripMap(anisotropy);
  const steel = new THREE.MeshPhysicalMaterial({
    color: 0x141211, metalness: 0.15, roughness: 1, roughnessMap: rough, normalMap: normal, normalScale: new THREE.Vector2(1, 1),
    aoMap: ao, aoMapIntensity: 1, clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 1.3,
  });
  const capSteel = new THREE.MeshPhysicalMaterial({ color: 0x0e0c0b, metalness: 0.85, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.2 });
  const capGrip = new THREE.MeshPhysicalMaterial({
    color: 0x0e0c0b, metalness: 0.85, roughness: 0.42, normalMap: grip, normalScale: new THREE.Vector2(1, 1), clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.2,
  });
  // brushed steel: anisotropy stretches the highlight along the brushing, so the ring shows a band of light, not a dot
  const brushed = new THREE.MeshPhysicalMaterial({ color: 0xc8c8cd, metalness: 1, roughness: 0.34, anisotropy: 0.85, envMapIntensity: 1.25 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1c1b1a, metalness: 0, roughness: 0.96 });
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xb89cff, toneMapped: false });
  // Everything solid on the bottle writes 1 into the stencil buffer, so the hero headline can turn white where it crosses the bottle.
  for (const m of [steel, capSteel, capGrip, brushed, rubber, ledMat]) Object.assign(m, { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
  const glowTex = makeGlowTexture();
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 });

  const sides = textureSize >= 2048 ? 192 : 128; // phones get fewer sides: still round to the eye, cheaper to draw
  const bodyGeo = lathe(BODY, sides);
  const footGeo = lathe(FOOT, sides);
  const capGeo = lathe(CAP, sides);
  const ringGeo = lathe(CAP_RING, sides);
  const sealGeo = lathe(SEAL, sides);
  const diffuserGeo = lathe(DIFFUSER, sides);
  const discGeo = new THREE.CircleGeometry(0.03, 32);

  pivot.add(new THREE.Mesh(bodyGeo, steel), new THREE.Mesh(footGeo, rubber));

  // the cap is its own group so it can float off in the last scene
  const cap = new THREE.Group();
  cap.add(new THREE.Mesh(capGeo, capGrip), new THREE.Mesh(ringGeo, brushed), new THREE.Mesh(sealGeo, rubber));
  const strip = new THREE.Mesh(diffuserGeo, ledMat);
  const disc = new THREE.Mesh(discGeo, ledMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 2.4305;
  const halo = new THREE.Sprite(glowMat);
  halo.position.y = 2.46;
  const light = new THREE.PointLight(0x9b6cff, 0, 5, 2);
  light.position.y = 2.6;
  cap.add(strip, disc, halo, light);
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
      for (const g of [bodyGeo, footGeo, capGeo, ringGeo, sealGeo, diffuserGeo, discGeo]) g.dispose();
      for (const m of [steel, capSteel, capGrip, brushed, rubber, ledMat, glowMat]) m.dispose();
      for (const t of [normal, rough, ao, grip, glowTex]) t.dispose();
    },
  };
}
