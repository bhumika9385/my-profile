"use client";
import { useMemo, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect, useMediaQuery, useReducedMotion } from "@/lib/hooks";

/**
 * Data-driven system diagram. Nodes are placed on a col/row grid from
 * projects.ts; edges are drawn as curves that "write" themselves in when
 * scrolled into view, with packets travelling along them. Hovering or
 * focusing a node isolates its connections. On narrow screens the diagram
 * rotates to flow top → bottom.
 */
export default function ArchitectureDiagram({ architecture }: { architecture: Project["architecture"] }) {
  const ref = useRef<SVGSVGElement>(null);
  const vertical = useMediaQuery("(max-width: 767px)");
  const reduced = useReducedMotion();
  const [focus, setFocus] = useState<string | null>(null);

  const { nodes, edges } = architecture;
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = 3;
  const NW = vertical ? 132 : 170, NH = 64;
  const W = vertical ? 440 : Math.max(cols * 265, 760);
  const H = vertical ? cols * 150 + 40 : 380;

  const pos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => {
      const main = (n.col + 0.5) / cols;
      const cross = (n.row + 0.5) / rows;
      m.set(n.id, vertical ? { x: 20 + cross * (W - 40), y: 20 + main * (H - 40) } : { x: main * W, y: 20 + cross * (H - 40) });
    });
    return m;
  }, [nodes, cols, vertical, W, H]);

  const paths = edges.map(([a, b, label]) => {
    const p = pos.get(a)!, q = pos.get(b)!;
    let d: string;
    if (vertical) {
      const y1 = p.y + NH / 2, y2 = q.y - NH / 2;
      const sameRow = Math.abs(p.y - q.y) < 1;
      d = sameRow
        ? `M ${p.x + (q.x > p.x ? NW / 4 : -NW / 4)} ${p.y} L ${q.x + (q.x > p.x ? -NW / 4 : NW / 4)} ${q.y}`
        : `M ${p.x} ${y1} C ${p.x} ${(y1 + y2) / 2}, ${q.x} ${(y1 + y2) / 2}, ${q.x} ${y2}`;
    } else {
      const sameCol = Math.abs(p.x - q.x) < 1;
      if (sameCol) {
        const dir = q.y > p.y ? 1 : -1;
        d = `M ${p.x} ${p.y + (dir * NH) / 2} L ${q.x} ${q.y - (dir * NH) / 2}`;
      } else {
        const x1 = p.x + NW / 2, x2 = q.x - NW / 2;
        d = `M ${x1} ${p.y} C ${(x1 + x2) / 2} ${p.y}, ${(x1 + x2) / 2} ${q.y}, ${x2} ${q.y}`;
      }
    }
    return { a, b, label, d, mid: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 } };
  });

  useIsoLayoutEffect(() => {
    if (reduced) return;
    const svg = ref.current!;
    const ctx = gsap.context(() => {
      const lines = svg.querySelectorAll<SVGPathElement>("[data-arch-path]");
      lines.forEach((l) => {
        const len = l.getTotalLength();
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 75%" } });
      tl.from("[data-arch-node]", { opacity: 0, y: 16, duration: 0.9, stagger: 0.08 })
        .to(lines, { strokeDashoffset: 0, duration: 1.2, stagger: 0.1, ease: "cine" }, 0.3)
        .from("[data-arch-label], [data-arch-packet]", { opacity: 0, duration: 0.6 }, "-=0.4");
    }, svg);
    return () => ctx.revert();
  }, [vertical, reduced]);

  const connected = (e: { a: string; b: string }) => !focus || e.a === focus || e.b === focus;
  const color = (kind: string) => (kind === "ai" ? "var(--color-pink)" : kind === "data" ? "var(--color-violet)" : "var(--color-signal)");

  return (
    <div className="overflow-x-auto" data-lenis-prevent-wheel>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full min-w-[320px] max-w-[1100px]" role="img" aria-label={architecture.summary}>
        {paths.map((p, i) => (
          <g key={i} style={{ opacity: connected(p) ? 1 : 0.12, transition: "opacity .4s" }}>
            <path data-arch-path d={p.d} fill="none" stroke="var(--color-line-strong)" strokeWidth="1" />
            {!reduced && (
              <circle data-arch-packet r="3" fill="var(--color-signal)">
                <animateMotion dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" path={p.d} />
              </circle>
            )}
            {p.label && (
              <text data-arch-label x={p.mid.x} y={p.mid.y - 8} textAnchor="middle" className="fill-mute font-mono text-[9px] uppercase tracking-[0.1em]">
                {p.label}
              </text>
            )}
          </g>
        ))}
        {nodes.map((n) => {
          const p = pos.get(n.id)!;
          const dim = focus && focus !== n.id && !edges.some(([a, b]) => (a === focus && b === n.id) || (b === focus && a === n.id));
          return (
            <g
              key={n.id}
              data-arch-node
              tabIndex={0}
              aria-label={`${n.label}: ${n.detail}`}
              onPointerEnter={() => setFocus(n.id)}
              onPointerLeave={() => setFocus(null)}
              onFocus={() => setFocus(n.id)}
              onBlur={() => setFocus(null)}
              transform={`translate(${p.x - NW / 2} ${p.y - NH / 2})`}
              style={{ opacity: dim ? 0.25 : 1, transition: "opacity .4s" }}
              className="outline-none [&:focus-visible>rect]:stroke-signal"
            >
              <rect width={NW} height={NH} rx="12" fill="var(--color-ink-2)" stroke={focus === n.id ? "var(--color-signal)" : "var(--color-line-strong)"} />
              <rect x="8" y="14" width="3" height={NH - 28} rx="1.5" fill={color(n.kind)} fillOpacity={n.kind === "ai" ? 1 : 0.5} />
              <text x="16" y="27" className="fill-paper font-display text-[15px] font-semibold tracking-tight">{n.label}</text>
              <text x="16" y="46" className="fill-mute font-mono text-[9.5px] tracking-[0.04em]">{n.detail}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
