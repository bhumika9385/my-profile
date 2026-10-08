import * as THREE from "three";

/**
 * Halftone spider emblem.
 *
 * A masked-head emblem with spider-leg blades swept around a circle is drawn
 * once as vector shapes into an offscreen canvas, then
 * sampled on a regular grid: one dot per grid cell, dot size and brightness
 * following the shading underneath — a flat halftone dot matrix.
 *
 * Returns world-space positions (z = 0), a 0–1 `lum` (drives dot size and
 * brightness) and an `ember` flag for the red details (eyes + hourglass).
 */
export type SpiderDot = { x: number; y: number; lum: number; ember: boolean };

const SCALE = 1.95; // emblem units (±1) → world units
const PPU = 120; // canvas pixels per world unit (supersampling for thin lines)
const W = 520, H = 520;

type P = [number, number];
const mirror = (pts: P[]): P[] => pts.map(([x, y]) => [-x, y]);

// emblem space (x right, y up, ±1) → canvas pixels
const px = (x: number) => W / 2 + x * SCALE * PPU;
const py = (y: number) => H / 2 - y * SCALE * PPU;
const len = (u: number) => u * SCALE * PPU;

const RED = "rgb(255,0,0)";
const LEG = "rgb(255,255,255)";

function drawSpider(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const path = (pts: P[], close = true) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))));
    if (close) ctx.closePath();
  };
  const smooth = (pts: P[], closed = true) => {
    const c = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), closed, "centripetal");
    return c.getPoints(80).map((v) => [v.x, v.y] as P);
  };
  /** tapered stroke along a smooth curve; width(t) in emblem units */
  const blade = (pts: P[], width: (t: number) => number, color = LEG) => {
    const samples = smooth(pts, false);
    ctx.strokeStyle = color;
    for (let i = 1; i < samples.length; i++) {
      ctx.lineWidth = len(width(i / samples.length));
      ctx.beginPath();
      ctx.moveTo(px(samples[i - 1][0]), py(samples[i - 1][1]));
      ctx.lineTo(px(samples[i][0]), py(samples[i][1]));
      ctx.stroke();
    }
  };
  const gapLine = (a: P, b: P, w = 0.016) => {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = len(w);
    ctx.beginPath();
    ctx.moveTo(px(a[0]), py(a[1]));
    ctx.lineTo(px(b[0]), py(b[1]));
    ctx.stroke();
  };
  const gapArc = (a: P, ctrl: P, b: P, w = 0.016) => {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = len(w);
    ctx.beginPath();
    ctx.moveTo(px(a[0]), py(a[1]));
    ctx.quadraticCurveTo(px(ctrl[0]), py(ctrl[1]), px(b[0]), py(b[1]));
    ctx.stroke();
  };

  // ── legs (silver-blue; black in the reference but that would vanish on a dark page)
  const taper = (w0: number, w1: number) => (t: number) => w0 + (w1 - w0) * t;
  for (const side of [1, -1]) {
    const m = (pts: P[]): P[] => (side === 1 ? pts : mirror(pts));
    // outer arc around the emblem: thick in the middle, thin at both ends
    const arc: P[] = [];
    for (let a = 74; a >= -54; a -= 4) arc.push([Math.cos((a * Math.PI) / 180) * 0.96, Math.sin((a * Math.PI) / 180) * 0.96]);
    blade(m(arc), (t) => 0.014 + 0.085 * Math.sin(Math.PI * t));
    blade(m([[0.34, 0.2], [0.5, 0.46], [0.56, 0.72], [0.47, 0.84]]), taper(0.07, 0.012));
    blade(m([[0.3, 0.08], [0.6, 0.1], [0.8, 0.0], [0.92, -0.2]]), taper(0.085, 0.012));
    blade(m([[0.26, 0.0], [0.55, -0.18], [0.72, -0.46], [0.78, -0.7]]), taper(0.08, 0.012));
    blade(m([[0.2, -0.12], [0.38, -0.36], [0.43, -0.6], [0.4, -0.8]]), taper(0.07, 0.012));
  }

  // ── torso + abdomen (red)
  const torsoR: P[] = [[0.1, 0.3], [0.14, 0.2], [0.52, 0.11], [0.56, -0.02], [0.34, -0.1], [0.16, -0.22], [0.1, -0.42], [0.03, -0.86]];
  const torso: P[] = [...torsoR, [0, -0.93], ...mirror(torsoR.slice().reverse())];
  ctx.fillStyle = RED;
  path(smooth(torso));
  ctx.fill();
  // torso web
  for (const tip of [[0.52, 0.1], [0.55, -0.03], [0.4, -0.09], [0.28, 0.15], [0.17, -0.2]] as P[]) {
    gapLine([0, 0.02], tip);
    gapLine([0, 0.02], [-tip[0], tip[1]]);
  }
  for (const f of [0.45, 0.72]) {
    const pts: P[] = [[0.52, 0.1], [0.55, -0.03], [0.4, -0.09], [0.17, -0.2]].map(([x, y]) => [x * f, 0.02 + (y - 0.02) * f] as P);
    for (let i = 1; i < pts.length; i++) {
      gapArc(pts[i - 1], [(pts[i - 1][0] + pts[i][0]) / 2 * 0.92, (pts[i - 1][1] + pts[i][1]) / 2 * 0.95 + 0.01], pts[i]);
      gapArc([-pts[i - 1][0], pts[i - 1][1]], [-(pts[i - 1][0] + pts[i][0]) / 2 * 0.92, (pts[i - 1][1] + pts[i][1]) / 2 * 0.95 + 0.01], [-pts[i][0], pts[i][1]]);
    }
  }
  // black diamond on the chest
  ctx.fillStyle = "#000";
  path([[0, -0.04], [0.055, -0.2], [0, -0.4], [-0.055, -0.2]]);
  ctx.fill();

  // ── head / mask (red)
  const headR: P[] = [[0, 0.98], [0.17, 0.94], [0.27, 0.8], [0.27, 0.63], [0.21, 0.46], [0.1, 0.33], [0, 0.29]];
  const head: P[] = [...headR, ...mirror(headR.slice(1, -1).reverse())];
  ctx.fillStyle = RED;
  path(smooth(head));
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = len(0.022);
  path(smooth(head));
  ctx.stroke();
  // mask web
  const hc: P = [0, 0.64];
  const ring = (f: number, a: number): P => [hc[0] + Math.cos((a * Math.PI) / 180) * 0.27 * f, hc[1] + Math.sin((a * Math.PI) / 180) * 0.36 * f];
  const angles = [-90, -60, -30, 0, 30, 60, 90, 120, 150, 180, 210, 240];
  for (const a of angles) gapLine(hc, ring(1, a), 0.014);
  for (const f of [0.4, 0.7]) {
    for (let i = 1; i < angles.length; i++) {
      const A = ring(f, angles[i - 1]), B = ring(f, angles[i]);
      gapArc(A, [(A[0] + B[0]) / 2 * 0.9 + hc[0] * 0.1, (A[1] + B[1]) / 2 * 0.9 + hc[1] * 0.1], B, 0.014);
    }
  }
  // eyes (white slits)
  for (const side of [1, -1]) {
    const eye: P[] = [[0.22, 0.7], [0.05, 0.6], [0.07, 0.52], [0.2, 0.58]].map(([x, y]) => [x * side, y] as P);
    ctx.fillStyle = "#000";
    ctx.lineWidth = len(0.02);
    path(eye);
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.fillStyle = "rgb(255,255,255)";
    path(eye);
    ctx.fill();
  }
}

/** `target` ≈ how many dots to aim for; the grid spacing is derived from it. */
export function sampleSpider(target: number): SpiderDot[] {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  drawSpider(ctx);
  const data = ctx.getImageData(0, 0, W, H).data;

  // covered area (world²) → spacing that yields ≈ target dots
  let covered = 0;
  for (let i = 0; i < data.length; i += 4) if (Math.max(data[i], data[i + 1], data[i + 2]) > 40) covered++;
  const area = covered / (PPU * PPU);
  const spacing = Math.max(0.035, Math.sqrt(area / Math.max(target, 1)));

  const cell = Math.max(2, Math.round(spacing * PPU)); // canvas px per grid cell
  const out: SpiderDot[] = [];
  for (let cy = 0; cy + cell <= H; cy += cell) {
    for (let cx = 0; cx + cell <= W; cx += cell) {
      let lum = 0, red = 0;
      for (let y = cy; y < cy + cell; y++) {
        for (let x = cx; x < cx + cell; x++) {
          const i = (y * W + x) * 4;
          lum += Math.max(data[i], data[i + 1], data[i + 2]) / 255;
          red += data[i] - data[i + 1] > 120 ? 1 : 0;
        }
      }
      const n = cell * cell;
      lum /= n;
      if (lum < 0.1) continue;
      out.push({
        x: ((cx + cell / 2 - W / 2) / PPU),
        y: -((cy + cell / 2 - H / 2) / PPU),
        lum: Math.min(lum, 1),
        ember: red / n > 0.45,
      });
    }
  }
  return out;
}
