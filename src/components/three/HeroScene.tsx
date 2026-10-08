"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import SceneCanvas from "./SceneCanvas";
import { spiderFragment, spiderVertex } from "./shaders/spider";
import { sampleSpider } from "./spiderGeometry";
import { tierConfig, type Tier } from "@/lib/device";
import { bindPointer, pointer, samplePointer } from "@/lib/pointer";

type Progress = { current: number };

const TRAIL = 12; // must match TRAIL in shaders/spider.ts
const TRAIL_STEP = 0.4; // world units between burst points
const TRAIL_DECAY = 0.9; // life per second (~0.9s per burst)

/** Build the halftone spider + horizon targets once on the CPU. */
function buildGeometry(target: number) {
  const dots = sampleSpider(target);
  const n = dots.length;
  const shape = new Float32Array(n * 4);
  const horizon = new Float32Array(n * 3);
  const rand = new Float32Array(n * 4);

  const cols = Math.ceil(Math.sqrt(n * 2.2));
  const rows = Math.ceil(n / cols);
  for (let i = 0; i < n; i++) {
    const d = dots[i];
    shape.set([d.x, d.y, 0, 0], i * 4);

    // horizon: a wide grid receding into depth, slightly jittered
    const gx = i % cols, gz = Math.floor(i / cols) % rows;
    horizon.set(
      [
        (gx / cols - 0.5) * 20 + (Math.random() - 0.5) * 0.05,
        -1.9,
        (gz / rows) * -14 + 3 + (Math.random() - 0.5) * 0.05,
      ],
      i * 3,
    );
    // x = morph delay, y = dot size (halftone), z = unused, w = brightness (≥ 0.985 renders as an accent "ember")
    rand.set([Math.random(), d.lum, 0, d.ember ? 0.99 : 0.4 + d.lum * 0.56], i * 4);
  }

  const g = new THREE.BufferGeometry();
  // `position` is required by three for bounds; real positions are computed in the shader
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute("aFiber", new THREE.BufferAttribute(shape, 4));
  g.setAttribute("aTarget", new THREE.BufferAttribute(horizon, 3));
  g.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
  return g;
}

function SpiderField({ count, progress }: { count: number; progress: Progress }) {
  const { camera, gl } = useThree();
  // halftone: ~1 dot per 10 "particles" of the tier budget keeps a visible grid
  // R3F hands the material its own uniforms object, so per-frame writes must go through it
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => buildGeometry(count * 0.07), [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uVel: { value: 0 },
      uSize: { value: 24 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uMouseActive: { value: 0 },
      uColorA: { value: new THREE.Color("#7f9dff") },
      uColorB: { value: new THREE.Color("#ff3b47") },
      // burst trail: xy = world position, z = life (1 → 0)
      uTrail: { value: Array.from({ length: TRAIL }, () => new THREE.Vector3(99, 99, 0)) },
    }),
    [],
  );
  const trail = useMemo(() => ({ head: 0, last: new THREE.Vector2(99, 99) }), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), dir: new THREE.Vector3() }), []);

  useFrame((state, delta) => {
    const u = material.current?.uniforms as typeof uniforms | undefined;
    if (!u) return;
    const speed = samplePointer(delta);
    u.uTime.value += delta;
    u.uVel.value = speed;
    u.uPixelRatio.value = gl.getPixelRatio();
    const p = progress.current;
    u.uMorph.value += (p - u.uMorph.value) * (1 - Math.exp(-delta * 5));

    // pointer → world point on the z = 0 plane
    // pointer relative to this canvas (it sits in a column, not full-screen)
    const r = gl.domElement.getBoundingClientRect();
    const nx = ((pointer.cx - r.left) / r.width) * 2 - 1;
    const ny = -((pointer.cy - r.top) / r.height) * 2 + 1;
    tmp.v.set(nx, ny, 0.5).unproject(camera);
    tmp.dir.copy(tmp.v).sub(camera.position).normalize();
    const dist = -camera.position.z / tmp.dir.z;
    const target = tmp.v.copy(camera.position).addScaledVector(tmp.dir, dist);
    u.uMouse.value.lerp(target, 0.15);
    u.uMouseActive.value += ((pointer.moved ? pointer.active : 0) * (1 - p) - u.uMouseActive.value) * 0.08;

    // burst trail — only while the pointer is over (or right around) the ring
    const pts = u.uTrail.value;
    for (const t of pts) t.z = Math.max(0, t.z - TRAIL_DECAY * delta);
    const over = Math.abs(nx) < 1.1 && Math.abs(ny) < 1.1 && pointer.moved && pointer.active && p < 0.5;
    if (over && Math.hypot(target.x - trail.last.x, target.y - trail.last.y) > TRAIL_STEP) {
      pts[trail.head].set(target.x, target.y, 1);
      trail.head = (trail.head + 1) % TRAIL;
      trail.last.set(target.x, target.y);
    }

    // the spider itself never rotates — only the camera glides with scroll
    state.camera.position.y = -u.uMorph.value * 0.6;
    state.camera.position.z = 6.5 - u.uMorph.value * 1.5;
    state.camera.lookAt(0, -u.uMorph.value * 1.6, 0);
  });

  return (
    <group>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={material}
          vertexShader={spiderVertex}
          fragmentShader={spiderFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function HeroScene({ tier, active, progress }: { tier: Tier; active: boolean; progress: Progress }) {
  useEffect(bindPointer, []);
  const cfg = tierConfig[tier];
  return (
    <SceneCanvas tier={tier} active={active} className="!absolute inset-0">
      <SpiderField count={cfg.particles} progress={progress} />
    </SceneCanvas>
  );
}
