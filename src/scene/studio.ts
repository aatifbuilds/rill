import * as THREE from "three";

/** A glowing rectangle (a light panel as seen in a mirror), `power` times brighter than white paper. */
function panel(w: number, h: number, d: number, power: number, tint: number, at: [number, number, number]): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(power), toneMapped: false });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(...at);
  m.lookAt(0, 0, 0);
  return m;
}

/**
 * A photo studio to reflect: a dim neutral room lit by long strip lights, the way product photographers light a bottle.
 * A shiny round object turns each strip into a clean, thin vertical highlight line, which is what reads as "real".
 * Only used to make reflections (it is never drawn on screen), so it needs no floor and no camera.
 */
export function createStudio(): THREE.Scene {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 14), new THREE.MeshBasicMaterial({ color: 0x2b2b2e, side: THREE.BackSide, toneMapped: false }));
  scene.add(room);
  scene.add(panel(1.0, 7, 0.1, 9, 0xfff6ec, [-4.2, 0.4, 3.4])); // tall warm key strip, front left
  scene.add(panel(0.35, 7, 0.1, 7, 0xdfe8ff, [4.6, 0.4, -2.2])); // thin cool rim strip, back right
  scene.add(panel(0.5, 6, 0.1, 3.5, 0xffffff, [2.6, 0.2, 4.2])); // soft second strip, front right
  scene.add(panel(5, 0.1, 5, 2.6, 0xffffff, [0, 4.6, 0])); // overhead softbox
  scene.add(panel(7, 1.4, 0.1, 0.9, 0xffffff, [0, -3.4, 4])); // dim low fill so the underside is not a black hole
  return scene;
}
