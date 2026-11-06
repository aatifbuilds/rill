import * as THREE from "three";
import { bodyRadiusAt } from "./shapes";

/**
 * Sparkles that glint on the speckled steel. They sit on the bottle's surface (a child of the bottle, so they turn with it)
 * and each twinkles on its own phase. Drawn with a tiny shader so a thousand points cost almost nothing.
 */
export interface Sparkles {
  points: THREE.Points;
  update(timeSec: number, strength: number, viewportPx: number, fovDeg: number): void;
  dispose(): void;
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uScale;
  varying float vPhase;
  varying float vSpeed;
  varying float vFacing;
  void main() {
    vPhase = aPhase;
    vSpeed = aSpeed;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 outward = normalize(normalMatrix * vec3(position.x, 0.0, position.z));
    vFacing = max(dot(outward, normalize(-mv.xyz)), 0.0);
    gl_PointSize = max(1.0, aSize * uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  varying float vPhase;
  varying float vSpeed;
  varying float vFacing;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float glint = pow(max(0.0, sin(uTime * vSpeed + vPhase)), 10.0);
    float a = smoothstep(0.5, 0.0, d) * glint * uStrength * smoothstep(0.15, 0.5, vFacing);
    if (a < 0.01) discard;
    vec3 col = mix(vec3(1.0, 0.97, 1.0), vec3(0.72, 0.58, 1.0), fract(vPhase * 3.0));
    gl_FragColor = vec4(col * a, a);
  }
`;

export function createSparkles(count: number): Sparkles {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);
  // fixed pseudo-random sequence so the sparkle layout is the same every load
  let seed = 11;
  const rand = (): number => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    const y = 0.3 + rand() * 1.6; // along the body, in the same space as the bottle's pivot
    const a = rand() * Math.PI * 2;
    const r = bodyRadiusAt(y) + 0.004;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r;
    size[i] = 0.012 + rand() * 0.02;
    phase[i] = rand() * Math.PI * 2;
    speed[i] = 0.8 + rand() * 2.2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  geo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uStrength: { value: 0 }, uScale: { value: 800 } },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return {
    points,
    update(t, strength, viewportPx, fovDeg) {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uStrength.value = strength;
      mat.uniforms.uScale.value = viewportPx / (2 * Math.tan((fovDeg * Math.PI) / 360));
      points.visible = strength > 0.01;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
