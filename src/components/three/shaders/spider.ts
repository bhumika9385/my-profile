import { simplex3 } from "./noise";

/**
 * Halftone spider particle field.
 *
 * Rest positions come from spiderGeometry.ts: a flat halftone dot grid in
 * the shape of a spider. The spider itself is static; the dots respond to the
 * pointer.
 *
 * uMorph (scroll) unravels each particle toward a flowing horizon plane,
 * with a per-particle delay so the spider dissolves rather than snaps.
 * The pointer pushes particles in world space; pointer velocity adds
 * turbulence; recent pointer positions bloom into starbursts.
 */
export const spiderVertex = /* glsl */ `
${simplex3}

uniform float uTime;
uniform float uMorph;
uniform float uVel;
uniform float uSize;
uniform float uPixelRatio;
uniform vec3 uMouse;
uniform float uMouseActive;
#define TRAIL 12
uniform vec3 uTrail[TRAIL]; // xy = world pos, z = life

attribute vec4 aFiber;   // xyz = rest position (flat grid), w = unused
attribute vec3 aTarget;  // horizon position
attribute vec4 aRand;    // random per particle

varying float vAlpha;
varying float vHeat;
varying float vEmber;
varying float vBurst;
varying float vScan;   // hologram scan-beam intensity on this dot
varying float vFlick;  // hologram flicker multiplier (global per frame)

float hash11(float n) { return fract(sin(n * 91.345) * 43758.5453); }

// Cursor burst: a circular ripple with a six-point starburst edge. Dots at the
// centre are thrown outward (leaving a hole) and pile into a bright rim; the
// burst widens and settles as its life runs out.
void stamp(inout vec2 xy, inout float z, inout float burst, vec2 c, float R, float life) {
  vec2 bd = xy - c;
  float l = length(bd);
  if (life <= 0.0 || l > R) return;
  float star = 1.0 + 0.45 * cos(atan(bd.y, bd.x) * 6.0);
  float edge = l / R;
  float bf = pow(1.0 - edge, 0.9) * life * star;
  xy += (bd / max(l, 1e-4)) * bf * 0.34;
  z += bf * 0.3;
  burst = max(burst, min(bf, 1.0));
}

void main() {
  // ── shape A: the halftone spider (static — no rotation, no sway)
  vec3 a = aFiber.xyz;

  // ── hologram: float, glitch slices, scan beam, flicker
  a.y += sin(uTime * 1.3) * 0.035;                                  // projected image hovers
  float gTick = floor(uTime * 7.0);                                  // ~7 glitch decisions / second
  float gOn = step(0.90, hash11(gTick));                             // ~10% of ticks glitch
  float slice = floor(a.y * 11.0);
  a.x += (hash11(slice + gTick * 7.31) - 0.5) * 0.3 * gOn;           // rows slide sideways
  float bandY = mix(-1.7, 1.7, fract(uTime * 0.2));                // beam travels bottom → top                // beam travels bottom → top
  float bd_ = (a.y - bandY) / 0.16;
  float scan = exp(-bd_ * bd_);
  float dip = step(0.965, hash11(floor(uTime * 24.0) + 3.0));        // brief brightness dropouts
  vFlick = (0.93 + 0.07 * sin(uTime * 53.0) * sin(uTime * 11.0)) * (1.0 - 0.45 * dip);

  // ── shape B: horizon
  vec3 b = aTarget;
  b.y += sin(b.x * 0.55 + uTime * 0.6) * 0.22 + sin(b.z * 0.9 - uTime * 0.4) * 0.16;

  float delay = aRand.x * 0.55;
  float m = smoothstep(delay, delay + 0.45, uMorph);
  vec3 p = mix(a, b, m);

  // ── turbulence: curl-ish noise, stronger with pointer velocity and mid-morph
  float amp = uVel * 0.28 + sin(m * 3.14159) * 0.55;
  vec3 np = p * 0.55 + vec3(0.0, uTime * 0.08, 0.0);
  p += vec3(snoise(np), snoise(np + 17.3), snoise(np + 41.7)) * amp;

  vec4 world = modelMatrix * vec4(p, 1.0);

  // ── cursor: the live pointer and its recent trail each stamp a circular starburst
  float f = 0.0;
  float burst = 0.0;
  stamp(world.xy, world.z, burst, uMouse.xy, 0.55, uMouseActive);
  for (int i = 0; i < TRAIL; i++) {
    vec3 tp = uTrail[i];
    stamp(world.xy, world.z, burst, tp.xy, 0.5 + (1.0 - tp.z) * 0.5, tp.z);
  }
  f = burst;
  vBurst = burst;
  vScan = scan * (1.0 - m); // fades out as the emblem dissolves into the horizon

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float depth = -mv.z;
  gl_PointSize = uSize * (0.55 + aRand.y * 0.9) * (1.0 + f * 1.4 + vScan * 0.55) * uPixelRatio / depth;

  vAlpha = smoothstep(14.0, 3.0, depth) * (0.35 + aRand.w * 0.65) * vFlick;
  vHeat = 0.0; // dots keep their own colours — the cursor effect is shape + light, not hue
  vEmber = step(0.985, aRand.w);
}
`;

export const spiderFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vHeat;
varying float vEmber;
varying float vBurst;
varying float vScan;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.36, d);
  if (a < 0.01) discard;
  vec3 col = mix(uColorA, uColorB, vEmber);
  // dots caught by the spider stamp turn bright white so the silhouette reads on any colour
  col = mix(col, vec3(1.0), clamp(vBurst * 1.2, 0.0, 1.0));
  // hologram: the scan beam lights dots icy white-blue; CRT-style scanlines carve the picture
  col = mix(col, vec3(0.78, 0.9, 1.0), clamp(vScan * 0.9, 0.0, 0.9));
  float scanline = mod(floor(gl_FragCoord.y / 2.0), 3.0) < 1.0 ? 0.5 : 1.0;
  float alpha = a * min(vAlpha * (1.0 + vBurst * 2.5 + vScan * 1.6), 1.0) * scanline;
  gl_FragColor = vec4(col * (1.0 + vScan * 0.5), alpha);
}
`;
