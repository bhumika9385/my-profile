"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { resolveCursor, type CursorKind } from "@/lib/cursor";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import FluidCursor from "./FluidCursor";

/**
 * Cursor layer (fine pointers only — disabled on touch):
 *  1. FluidCursor — the existing GPU ink effect
 *  2. a minimal SVG spider that follows the pointer with inertia, turns to face
 *     its direction of travel, stretches with speed and skitters its legs
 *  3. an optional thread trail while moving fast
 *  4. a frame that wraps magnetic targets (buttons / links)
 *  5. the existing "View / Visit / Drag" label pill
 *  6. a web-burst on click
 *
 * Contrast is adaptive: the spider is drawn with a halo outline and flips its
 * palette (light fill / dark fill) by sampling the background colour under the
 * pointer, so it stays legible on images, the 3D emblem and light surfaces.
 * Everything is DOM/SVG transforms in one rAF loop — no extra WebGL.
 */

type Tone = "dark" | "light";

const PALETTE: Record<Tone, { fill: string; edge: string; accent: string }> = {
  dark: { fill: "#f4f6ff", edge: "rgba(5,6,13,0.92)", accent: "#ff2e3d" },
  light: { fill: "#0b0d18", edge: "rgba(255,255,255,0.96)", accent: "#d9182a" },
};

// ── background luminance sampling ──────────────────────────────────────────
function lightnessOf(css: string): { l: number; a: number } | null {
  const rgb = css.match(/^rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b, a = 1] = rgb[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return { l: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, a };
  }
  const lab = css.match(/^ok(?:lch|lab)\(\s*([\d.]+)(%?)(?:[^/)]*\/\s*([\d.]+)(%?))?/);
  if (lab) {
    const l = parseFloat(lab[1]) / (lab[2] ? 100 : 1);
    const a = lab[3] === undefined ? 1 : parseFloat(lab[3]) / (lab[4] ? 100 : 1);
    return { l, a };
  }
  const srgb = css.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/);
  if (srgb) {
    const [r, g, b] = [srgb[1], srgb[2], srgb[3]].map(parseFloat);
    return { l: 0.2126 * r + 0.7152 * g + 0.0722 * b, a: srgb[4] === undefined ? 1 : parseFloat(srgb[4]) };
  }
  return null;
}

function toneAt(el: Element | null): Tone {
  for (let n: Element | null = el; n; n = n.parentElement) {
    // media / WebGL: unknown pixels → rely on the halo; dark palette (white fill + dark edge)
    if (n instanceof HTMLImageElement || n instanceof HTMLVideoElement || n instanceof HTMLCanvasElement) return "dark";
    const c = lightnessOf(getComputedStyle(n).backgroundColor);
    if (c && c.a > 0.6) return c.l > 0.62 ? "light" : "dark";
  }
  return "dark";
}

// ── spider artwork (head points up, centred on 0,0) ─────────────────────────
const LEGS_A = [
  "M2.2 -4.6 L8.5 -12.5 L16.5 -12", "M2.6 2 L11.5 5 L18.5 12.5", // legs 1 & 3 (right)
  "M-2.2 -4.6 L-8.5 -12.5 L-16.5 -12", "M-2.6 2 L-11.5 5 L-18.5 12.5", // mirrored
];
const LEGS_B = [
  "M3 -2 L12 -6.2 L20 -1", "M2.2 4.6 L7.5 12.5 L10.5 20.5",
  "M-3 -2 L-12 -6.2 L-20 -1", "M-2.2 4.6 L-7.5 12.5 L-10.5 20.5",
];

function Legs({ d }: { d: string[] }) {
  return (
    <>
      {d.map((p) => <path key={`h${p}`} d={p} style={{ stroke: "var(--sp-edge)", transition: "stroke .25s" }} strokeWidth="3.6" />)}
      {d.map((p) => <path key={p} d={p} style={{ stroke: "var(--sp-fill)", transition: "stroke .25s" }} strokeWidth="1.25" />)}
    </>
  );
}

// ── click feedback: a small web that blooms and fades ───────────────────────
const NS = "http://www.w3.org/2000/svg";
function webBurst(root: HTMLElement, x: number, y: number, tone: Tone) {
  const { fill, edge, accent } = PALETTE[tone];
  const oct = (r: number) =>
    Array.from({ length: 8 }, (_, i) => `${(Math.cos((i * Math.PI) / 4) * r).toFixed(1)},${(Math.sin((i * Math.PI) / 4) * r).toFixed(1)}`).join(" ");
  const spokes = Array.from({ length: 8 }, (_, i) => `M0 0 L${(Math.cos((i * Math.PI) / 4) * 28).toFixed(1)} ${(Math.sin((i * Math.PI) / 4) * 28).toFixed(1)}`).join(" ");
  const art = (stroke: string, w: number, ring: string) =>
    `<path d="${spokes}" stroke="${stroke}" stroke-width="${w}"/><polygon points="${oct(11)}" stroke="${ring}" stroke-width="${w}"/><polygon points="${oct(20)}" stroke="${stroke}" stroke-width="${w}"/>`;
  const el = document.createElementNS(NS, "svg");
  el.setAttribute("viewBox", "-30 -30 60 60");
  el.setAttribute("width", "92");
  el.setAttribute("height", "92");
  el.setAttribute("fill", "none");
  el.setAttribute("stroke-linejoin", "round");
  el.setAttribute("stroke-linecap", "round");
  el.style.cssText = `position:absolute;left:${x - 46}px;top:${y - 46}px;overflow:visible;`;
  el.innerHTML = art(edge, 3, edge) + art(fill, 1, accent);
  root.appendChild(el);
  const anim = el.animate(
    [
      { transform: "scale(0.35) rotate(-14deg)", opacity: 0.95 },
      { transform: "scale(1.2) rotate(6deg)", opacity: 0 },
    ],
    { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );
  anim.onfinish = () => el.remove();
}

const HIST = 16;

export default function CustomCursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const pathname = usePathname();

  const rootRef = useRef<HTMLDivElement>(null);
  const spiderRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const legsARef = useRef<SVGGElement>(null);
  const legsBRef = useRef<SVGGElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);

  const [label, setLabel] = useState<string | null>(null);
  const live = useRef({ kind: "default" as CursorKind, label: null as string | null, target: null as HTMLElement | null, tone: "dark" as Tone });

  useEffect(() => {
    if (!fine) return;
    const root = rootRef.current!;
    const live_ = live.current;
    const mouse = { x: -300, y: -300 };
    const pos = { x: -300, y: -300, vx: 0, vy: 0 };
    const pill = { s: 0, vs: 0 };
    const frame = { x: 0, y: 0, w: 30, h: 30 };
    const hist: { x: number; y: number }[] = [];
    let rot = 0, phase = 0, press = 0, seen = false, raf = 0, lastT = performance.now();
    let lastEl: Element | null = null;

    const setTone = (tone: Tone) => {
      live_.tone = tone;
      const p = PALETTE[tone];
      root.style.setProperty("--sp-fill", p.fill);
      root.style.setProperty("--sp-edge", p.edge);
      root.style.setProperty("--sp-accent", p.accent);
    };
    setTone("dark");

    const resolve = (el: Element | null, force = false) => {
      if (!force && el === lastEl) return;
      lastEl = el;
      const r = resolveCursor(el);
      const text = r.kind === "view" || r.kind === "visit" || r.kind === "drag" ? r.label : null;
      live_.kind = r.kind;
      live_.target = r.target;
      if (text !== live_.label) {
        live_.label = text;
        setLabel(text);
      }
      const tone = toneAt(el);
      if (tone !== live_.tone) setTone(tone);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!seen) {
        seen = true;
        pos.x = mouse.x; pos.y = mouse.y;
        document.documentElement.classList.add("has-spider-cursor");
      }
      resolve(e.target as Element);
    };
    const onScroll = () => seen && resolve(document.elementFromPoint(mouse.x, mouse.y), true);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      press = 1;
      if (!reduced) webBurst(root, e.clientX, e.clientY, live_.tone);
    };
    const onUp = () => { press = 0; };
    const onLeave = () => { seen = false; document.documentElement.classList.remove("has-spider-cursor"); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((t - lastT) / 16.667, 3);
      lastT = t;

      // aim: the pointer, pulled toward the centre of a magnetic target
      let ax = mouse.x, ay = mouse.y;
      const magnetic = live_.kind === "magnetic" && live_.target?.isConnected;
      let rect: DOMRect | null = null;
      if (magnetic) {
        rect = live_.target!.getBoundingClientRect();
        ax += (rect.left + rect.width / 2 - ax) * 0.28;
        ay += (rect.top + rect.height / 2 - ay) * 0.28;
      }

      // inertia: a damped spring → slight lag, soft settle
      if (reduced) {
        pos.vx = ax - pos.x; pos.vy = ay - pos.y; pos.x = ax; pos.y = ay;
      } else {
        const damp = Math.pow(0.7, dt);
        pos.vx = (pos.vx + (ax - pos.x) * 0.2 * dt) * damp;
        pos.vy = (pos.vy + (ay - pos.y) * 0.2 * dt) * damp;
        pos.x += pos.vx * dt; pos.y += pos.vy * dt;
      }
      const speed = Math.hypot(pos.vx, pos.vy);

      // heading: face the direction of travel (shortest-arc smoothing)
      if (!reduced && speed > 1.2) {
        const target = Math.atan2(pos.vy, pos.vx) + Math.PI / 2;
        let d = target - rot;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        rot += d * Math.min(0.2 * dt * (speed > 4 ? 1.4 : 1), 1);
      }

      const isLabel = live_.kind === "view" || live_.kind === "visit" || live_.kind === "drag";
      const hidden = !seen || live_.kind === "text" || live_.kind === "hide";
      const stretch = reduced ? 0 : Math.min(speed / 38, 0.55);
      const baseScale = (magnetic ? 1.12 : isLabel ? 0.78 : 1) * (press ? 0.82 : 1);

      if (spiderRef.current) {
        spiderRef.current.style.transform =
          `translate3d(${pos.x - 24}px, ${pos.y - 24}px, 0) rotate(${rot}rad) scale(${(baseScale * (1 - stretch * 0.28)).toFixed(3)}, ${(baseScale * (1 + stretch)).toFixed(3)})`;
        spiderRef.current.style.opacity = hidden ? "0" : "1";
      }

      // legs skitter with distance travelled; a faint idle breath otherwise
      if (!reduced) {
        phase += (speed * 0.16 + 0.03) * dt;
        const amp = Math.min(speed * 1.1, 11) + (magnetic ? 7 : 1.2);
        legsARef.current?.setAttribute("transform", `rotate(${(Math.sin(phase) * amp).toFixed(2)})`);
        legsBRef.current?.setAttribute("transform", `rotate(${(-Math.sin(phase) * amp).toFixed(2)})`);
      }

      // magnetic frame — wraps the hovered button / link
      if (frameRef.current) {
        const k = 1 - Math.pow(1 - 0.26, dt);
        if (rect && !hidden) {
          const pad = 8;
          frame.x += (rect.left - pad - frame.x) * k;
          frame.y += (rect.top - pad - frame.y) * k;
          frame.w += (rect.width + pad * 2 - frame.w) * k;
          frame.h += (rect.height + pad * 2 - frame.h) * k;
          frameRef.current.style.opacity = "1";
        } else {
          frame.x += (mouse.x - 15 - frame.x) * k; frame.y += (mouse.y - 15 - frame.y) * k;
          frame.w += (30 - frame.w) * k; frame.h += (30 - frame.h) * k;
          frameRef.current.style.opacity = "0";
        }
        frameRef.current.style.transform = `translate3d(${frame.x}px, ${frame.y}px, 0)`;
        frameRef.current.style.width = `${frame.w}px`;
        frameRef.current.style.height = `${frame.h}px`;
      }

      // label pill follows the spider with its own springy scale
      if (pillRef.current) {
        pill.vs = (pill.vs + ((isLabel && !hidden ? 1 : 0) - pill.s) * 0.2 * dt) * Math.pow(0.65, dt);
        pill.s += pill.vs * dt;
        pillRef.current.style.transform = `translate3d(${pos.x + 22}px, ${pos.y + 22}px, 0) scale(${Math.max(pill.s, 0)})`;
      }

      // thread trail — only while moving fast
      if (trailRef.current) {
        if (!reduced) {
          hist.push({ x: pos.x, y: pos.y });
          if (hist.length > HIST) hist.shift();
        }
        const a = reduced || hidden ? 0 : Math.min(Math.max((speed - 5) / 22, 0), 1) * 0.55;
        if (a > 0.02 && hist.length > 2) {
          trailRef.current.setAttribute("points", hist.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
          trailRef.current.style.opacity = a.toFixed(2);
        } else {
          trailRef.current.style.opacity = "0";
        }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-spider-cursor");
    };
  }, [fine, reduced]);

  // a route change removes whatever was hovered
  useEffect(() => {
    live.current.kind = "default";
    live.current.target = null;
    live.current.label = null;
    setLabel(null);
  }, [pathname]);

  if (!fine) return null;

  return (
    <>
      <FluidCursor />
      <div ref={rootRef} aria-hidden className="no-print pointer-events-none fixed inset-0 z-[150] overflow-hidden">
        <svg className="absolute inset-0 h-full w-full">
          <polyline
            ref={trailRef}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            style={{ stroke: "var(--sp-fill)", opacity: 0, filter: "drop-shadow(0 0 2px var(--sp-edge))" }}
          />
        </svg>

        <div
          ref={frameRef}
          className="absolute left-0 top-0 rounded-xl"
          style={{ opacity: 0, border: "1px solid var(--sp-fill)", boxShadow: "0 0 0 1px var(--sp-edge), inset 0 0 0 1px var(--sp-edge)", willChange: "transform, width, height" }}
        />

        <div ref={spiderRef} className="absolute left-0 top-0 h-12 w-12" style={{ opacity: 0, willChange: "transform" }}>
          <svg viewBox="-24 -24 48 48" width="48" height="48" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: "visible", filter: "drop-shadow(0 0 5px rgb(255 46 61 / 0.35))" }}>
            <g ref={legsARef}><Legs d={LEGS_A} /></g>
            <g ref={legsBRef}><Legs d={LEGS_B} /></g>
            <g ref={bodyRef}>
              {/* abdomen + head with a halo, then a small red diamond mark */}
              <ellipse cx="0" cy="3.4" rx="4.1" ry="5.6" style={{ fill: "var(--sp-fill)", stroke: "var(--sp-edge)", transition: "fill .25s, stroke .25s" }} strokeWidth="1.6" />
              <ellipse cx="0" cy="-4.2" rx="2.7" ry="3" style={{ fill: "var(--sp-fill)", stroke: "var(--sp-edge)", transition: "fill .25s, stroke .25s" }} strokeWidth="1.6" />
              <path d="M0 0.4 L1.7 3.2 L0 6.4 L-1.7 3.2 Z" style={{ fill: "var(--sp-accent)", stroke: "none" }} />
            </g>
          </svg>
        </div>

        <div ref={pillRef} className="absolute left-0 top-0 origin-top-left" style={{ transform: "scale(0)", willChange: "transform" }}>
          <span className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_30px_-6px_rgb(255_46_61/0.8)] ring-1 ring-black/40" style={{ background: "var(--grad)" }}>
            {label}
            {label && <span aria-hidden>{label === "Drag" ? "↔" : "↗"}</span>}
          </span>
        </div>
      </div>
    </>
  );
}
