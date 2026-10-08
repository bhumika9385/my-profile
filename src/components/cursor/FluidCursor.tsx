"use client";
import { useEffect, useRef } from "react";

/**
 * Fluid ink cursor — a real-time GPU fluid simulation (stable fluids:
 * advection → vorticity confinement → pressure projection) written in raw
 * WebGL2. Pointer movement injects velocity + coloured dye that swirls and
 * dissipates. The loop sleeps a few seconds after the last input, so it costs
 * nothing while idle. Disabled on touch devices and for reduced motion.
 */

const CFG = {
  SIM_RES: 128,
  DYE_RES: 1024,
  DENSITY_DISSIPATION: 3.2,
  VELOCITY_DISSIPATION: 2.2,
  PRESSURE: 0.1,
  PRESSURE_ITERATIONS: 20,
  CURL: 3.5,
  SPLAT_RADIUS: 0.18,
  SPLAT_FORCE: 6000,
  IDLE_MS: 4500,
};

// red → blue → deep red, matching the site accents
const PALETTE: [number, number, number][] = [
  [1.0, 0.18, 0.24],
  [0.24, 0.42, 1.0],
  [0.9, 0.12, 0.2],
];

const baseVS = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const head = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
out vec4 fragColor;
`;

const FS = {
  clear: head + `uniform sampler2D uTexture; uniform float value;
void main () { fragColor = value * texture(uTexture, vUv); }`,

  splat: head + `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
void main () {
  vec2 p = vUv - point; p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  fragColor = vec4(texture(uTarget, vUv).xyz + splat, 1.0);
}`,

  advection: head + `uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  fragColor = texture(uSource, coord) / (1.0 + dissipation * dt);
}`,

  divergence: head + `uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,

  curl: head + `uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,

  vorticity: head + `uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
void main () {
  float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C; force.y *= -1.0;
  vec2 vel = texture(uVelocity, vUv).xy + force * dt;
  fragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
}`,

  pressure: head + `uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main () {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  float div = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`,

  gradient: head + `uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main () {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  vec2 vel = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  fragColor = vec4(vel, 0.0, 1.0);
}`,

  display: head + `uniform sampler2D uTexture;
void main () {
  vec3 c = texture(uTexture, vUv).rgb;
  float a = max(c.r, max(c.g, c.b));
  fragColor = vec4(c, a);
}`,
};

type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation> };
type FBO = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; texel: [number, number]; attach: (id: number) => number };
type DoubleFBO = { width: number; height: number; texel: [number, number]; read: FBO; write: FBO; swap: () => void };

export default function FluidCursor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl2", { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false });
    // context may have been lost earlier (GPU reset) — never draw with a dead one
    if (!gl || gl.isContextLost() || !gl.getExtension("EXT_color_buffer_float")) return; // graceful: no fluid
    gl.getExtension("OES_texture_float_linear");

    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const dyeRes = lowPower ? 512 : CFG.DYE_RES;

    // ── GL helpers
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, baseVS);
    const makeProgram = (fs: string): Program => {
      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(program, 0, "aPosition");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
      const uniforms: Record<string, WebGLUniformLocation> = {};
      const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(program, i)!.name;
        uniforms[name] = gl.getUniformLocation(program, name)!;
      }
      return { program, uniforms };
    };

    let P: Record<keyof typeof FS, Program>;
    try {
      P = Object.fromEntries(Object.entries(FS).map(([k, src]) => [k, makeProgram(src)])) as Record<keyof typeof FS, Program>;
    } catch {
      return;
    }

    // fullscreen quad
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const blit = (target: FBO | null) => {
      if (target) {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    const createFBO = (w: number, h: number, internal: number, format: number): FBO => {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture, fbo, width: w, height: h, texel: [1 / w, 1 / h],
        attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; },
      };
    };
    const createDouble = (w: number, h: number, internal: number, format: number): DoubleFBO => {
      let a = createFBO(w, h, internal, format), b = createFBO(w, h, internal, format);
      return {
        width: w, height: h, texel: [1 / w, 1 / h],
        get read() { return a; }, get write() { return b; },
        swap() { const t = a; a = b; b = t; },
      };
    };
    const resolution = (res: number) => {
      let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspect < 1) aspect = 1 / aspect;
      const min = Math.round(res), max = Math.round(res * aspect);
      return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: max, h: min } : { w: min, h: max };
    };

    let dye: DoubleFBO, velocity: DoubleFBO, pressure: DoubleFBO, divergence: FBO, curl: FBO;
    const initFramebuffers = () => {
      const sim = resolution(CFG.SIM_RES), d = resolution(dyeRes);
      dye = createDouble(d.w, d.h, gl.RGBA16F, gl.RGBA);
      velocity = createDouble(sim.w, sim.h, gl.RG16F, gl.RG);
      divergence = createFBO(sim.w, sim.h, gl.R16F, gl.RED);
      curl = createFBO(sim.w, sim.h, gl.R16F, gl.RED);
      pressure = createDouble(sim.w, sim.h, gl.R16F, gl.RED);
    };

    const resize = (force = false) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr), h = Math.floor(canvas.clientHeight * dpr);
      if (force || canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        initFramebuffers();
      }
    };
    // always build framebuffers on mount (StrictMode re-mounts reuse a sized canvas)
    resize(true);

    const use = (p: Program) => { gl.useProgram(p.program); return p.uniforms; };

    // ── simulation
    const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number]) => {
      const aspect = canvas.width / canvas.height;
      let u = use(P.splat);
      gl.uniform1i(u.uTarget, velocity.read.attach(0));
      gl.uniform1f(u.aspectRatio, aspect);
      gl.uniform2f(u.point, x, y);
      gl.uniform3f(u.color, dx, dy, 0);
      gl.uniform1f(u.radius, (CFG.SPLAT_RADIUS / 100) * (aspect > 1 ? aspect : 1));
      blit(velocity.write);
      velocity.swap();
      u = use(P.splat);
      gl.uniform1i(u.uTarget, dye.read.attach(0));
      gl.uniform3f(u.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    };

    const step = (dt: number) => {
      gl.disable(gl.BLEND);
      let u = use(P.curl);
      gl.uniform2f(u.texelSize, ...velocity.texel);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(curl);

      u = use(P.vorticity);
      gl.uniform2f(u.texelSize, ...velocity.texel);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uCurl, curl.attach(1));
      gl.uniform1f(u.curl, CFG.CURL);
      gl.uniform1f(u.dt, dt);
      blit(velocity.write);
      velocity.swap();

      u = use(P.divergence);
      gl.uniform2f(u.texelSize, ...velocity.texel);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(divergence);

      u = use(P.clear);
      gl.uniform1i(u.uTexture, pressure.read.attach(0));
      gl.uniform1f(u.value, CFG.PRESSURE);
      blit(pressure.write);
      pressure.swap();

      u = use(P.pressure);
      gl.uniform2f(u.texelSize, ...velocity.texel);
      gl.uniform1i(u.uDivergence, divergence.attach(0));
      for (let i = 0; i < CFG.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(u.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      u = use(P.gradient);
      gl.uniform2f(u.texelSize, ...velocity.texel);
      gl.uniform1i(u.uPressure, pressure.read.attach(0));
      gl.uniform1i(u.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      u = use(P.advection);
      gl.uniform2f(u.texelSize, ...velocity.texel);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uSource, velocity.read.attach(0));
      gl.uniform1f(u.dt, dt);
      gl.uniform1f(u.dissipation, CFG.VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uSource, dye.read.attach(1));
      gl.uniform1f(u.dissipation, CFG.DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    };

    const render = () => {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const u = use(P.display);
      gl.uniform1i(u.uTexture, dye.read.attach(0));
      blit(null);
    };

    // ── input
    const pointer = { x: 0, y: 0, px: 0, py: 0, moved: false, first: true };
    let lastInput = 0;
    let colorT = Math.random() * 3;
    const currentColor = (boost = 1): [number, number, number] => {
      const i = Math.floor(colorT) % PALETTE.length, j = (i + 1) % PALETTE.length, f = colorT % 1;
      const a = PALETTE[i], b = PALETTE[j];
      const k = 0.12 * boost;
      return [(a[0] + (b[0] - a[0]) * f) * k, (a[1] + (b[1] - a[1]) * f) * k, (a[2] + (b[2] - a[2]) * f) * k];
    };

    // the hero emblem has its own cursor effect — keep the ink off it
    const overEmblem = (e: PointerEvent) => !!(e.target as Element | null)?.closest?.("[data-hero-visual]");
    const onMove = (e: PointerEvent) => {
      if (overEmblem(e)) { pointer.first = true; return; }
      const x = e.clientX / canvas.clientWidth, y = 1 - e.clientY / canvas.clientHeight;
      if (pointer.first) { pointer.px = x; pointer.py = y; pointer.first = false; }
      pointer.x = x; pointer.y = y;
      pointer.moved = true;
      lastInput = performance.now();
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (overEmblem(e)) return;
      const x = e.clientX / canvas.clientWidth, y = 1 - e.clientY / canvas.clientHeight;
      splat(x, y, (Math.random() - 0.5) * 900, (Math.random() - 0.5) * 900, currentColor(5));
      lastInput = performance.now();
      wake();
    };

    let raf = 0;
    let running = false;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.016666);
      last = now;
      resize();
      colorT += dt * 0.35;
      if (pointer.moved) {
        pointer.moved = false;
        const aspect = canvas.width / canvas.height;
        let dx = pointer.x - pointer.px, dy = pointer.y - pointer.py;
        if (aspect < 1) dx *= aspect;
        if (aspect > 1) dy /= aspect;
        pointer.px = pointer.x; pointer.py = pointer.y;
        if (Math.abs(dx) + Math.abs(dy) > 0) splat(pointer.x, pointer.y, dx * CFG.SPLAT_FORCE, dy * CFG.SPLAT_FORCE, currentColor());
      }
      step(dt);
      render();
      if (now - lastInput > CFG.IDLE_MS) {
        running = false;
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (running || gl.isContextLost()) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // if the browser drops the GPU context, stop quietly (page stays usable)
    let dead = false;
    const onLost = (e: Event) => { e.preventDefault(); dead = true; cancelAnimationFrame(raf); running = false; canvas.style.display = "none"; };
    canvas.addEventListener("webglcontextlost", onLost);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      // note: don't call loseContext() here — React StrictMode re-runs effects
      // on the same canvas, and a lost context can't be recovered.
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (!dead) {
        Object.values(P).forEach((p) => gl.deleteProgram(p.program));
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="no-print pointer-events-none fixed inset-0 z-[140] h-full w-full" />;
}
