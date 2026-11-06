import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Pose } from "../scroll/timeline";
import { createBottle } from "./bottle";
import { createSparkles } from "./particles";

export interface Stage {
  resize(): void;
  setPixelRatioCap(cap: number): void;
  maxPixelRatio: number;
  render(pose: Pose, timeSec: number): void;
  dispose(): void;
}

/** The three.js world: renderer, soft studio light, camera, the bottle and its sparkles. Throws if WebGL is unavailable. */
export function createStage(canvas: HTMLCanvasElement): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0); // transparent: the page's ground colour shows through
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 4, 4);
  const rim = new THREE.DirectionalLight(0xdfe6ff, 1.2);
  rim.position.set(4, 2, -3);
  scene.add(key, rim);

  const bottle = createBottle(small ? 1024 : 2048);
  const sparkles = createSparkles(small ? 500 : 1400);
  // sparkles are positioned in the bottle's pivot space, so they must share that parent
  bottle.root.children[0].add(sparkles.points);
  scene.add(bottle.root);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  let width = 1;
  let height = 1;
  const maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2); // never more than 2x: a 3x phone screen gains nothing visible
  let cap = maxPixelRatio;

  const resize = (): void => {
    width = canvas.clientWidth || 1;
    height = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); // keep the aspect fresh, or the bottle stretches on resize
  };
  resize();

  return {
    resize,
    maxPixelRatio,
    setPixelRatioCap(next) {
      cap = next;
      resize();
    },
    render(p, t) {
      // on a tall, narrow screen pull the camera back so the bottle's width still fits
      const portrait = camera.aspect < 0.8;
      const fit = portrait ? Math.pow(0.8 / camera.aspect, 0.55) : 1;
      // on a phone there is no room beside the bottle for text, so a sideways offset becomes a lift: bottle above, text below
      const shift = portrait ? p.camTarget[0] : 0;
      const tx = p.camTarget[0] - shift;
      const ty = p.camTarget[1] - shift * 0.8;
      const tz = p.camTarget[2];
      const rx = p.camPos[0] - p.camTarget[0];
      const ry = p.camPos[1] - p.camTarget[1];
      const rz = p.camPos[2] - p.camTarget[2];
      camera.position.set(tx + rx * fit, ty + ry * fit, tz + rz * fit);
      camera.lookAt(tx, ty, tz);
      if (camera.fov !== p.fov) {
        camera.fov = p.fov;
        camera.updateProjectionMatrix();
      }
      bottle.update(p);
      sparkles.update(t, p.sparkle, height * renderer.getPixelRatio(), p.fov);
      renderer.render(scene, camera);
    },
    dispose() {
      sparkles.dispose();
      bottle.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
