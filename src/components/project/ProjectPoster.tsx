import Image from "next/image";
import type { Project } from "@/data/projects";

/**
 * Generative project visual (SVG, ~2KB each, crisp at any size).
 * Each motif is drawn from what the project does:
 *   orbit   — Vyoma ("sky / space"): trajectories around a centre
 *   lattice — LifeSkillSphere: a wireframe sphere of interlinked skills
 *   scan    — Resume Analyzer: a document being read, keywords lit
 *   grid    — Event & Internship Mgmt: a schedule grid split by role
 *
 * Layers carry `data-depth`; parents can set --px / --py (−1..1) to parallax them.
 * If `project.image` is set, a real screenshot is shown instead.
 */
export default function ProjectPoster({ project, className = "", priority = false, fit = "slice" }: { project: Project; className?: string; priority?: boolean; fit?: "slice" | "meet" }) {
  if (project.image) {
    return (
      <div className={`relative overflow-hidden bg-ink-2 ${className}`}>
        <Image src={project.image} alt={`${project.title} screenshot`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority={priority} />
      </div>
    );
  }

  const layer = (depth: number): React.CSSProperties => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)`,
    transition: "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
  });

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ "--poster-accent": `hsl(${project.hue} 85% 66%)`, background: `radial-gradient(120% 90% at 50% 40%, hsl(${project.hue} 60% 14%), #06070f 70%)` } as React.CSSProperties}
      aria-hidden
    >
      <svg viewBox="0 0 400 500" preserveAspectRatio={`xMidYMid ${fit}`} overflow="visible" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={`g-${project.slug}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgb(235 231 222 / 0.05)" strokeWidth="1" />
          </pattern>
          <radialGradient id={`r-${project.slug}`} cx="50%" cy="48%" r="55%">
            <stop offset="0%" stopColor={`hsl(${project.hue} 90% 60% / 0.22)`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {/* backgrounds extend past the viewBox so "meet" layouts stay filled */}
        <rect x="-1200" y="-600" width="2800" height="1700" fill={`url(#g-${project.slug})`} />
        <rect x="-200" y="-100" width="800" height="700" fill={`url(#r-${project.slug})`} />
        <g style={layer(-10)}>{motifs[project.motif].back}</g>
        <g style={layer(18)}>{motifs[project.motif].front}</g>
      </svg>
      
    </div>
  );
}

const P = "var(--color-paper)";
const S = "var(--poster-accent)";

const spin = (dur: number, reverse = false): React.CSSProperties => ({
  transformOrigin: "200px 250px",
  transformBox: "view-box",
  animation: `spin-slow ${dur}s linear infinite${reverse ? " reverse" : ""}`,
});

const motifs: Record<Project["motif"], { back: React.ReactNode; front: React.ReactNode }> = {
  orbit: {
    back: (
      <g fill="none" stroke={P} strokeOpacity="0.18">
        {[60, 95, 130, 165, 200].map((r, i) => (
          <ellipse key={r} cx="200" cy="250" rx={r} ry={r * 0.36} transform={`rotate(${-18 + i * 4} 200 250)`} />
        ))}
      </g>
    ),
    front: (
      <g>
        <g style={spin(28)}>
          <circle cx="295" cy="250" r="4" fill={P} />
          <circle cx="105" cy="250" r="2.5" fill={P} fillOpacity="0.6" />
        </g>
        <g style={spin(44, true)}>
          <circle cx="200" cy="85" r="3" fill={S} />
          <line x1="200" y1="85" x2="200" y2="250" stroke={S} strokeOpacity="0.4" strokeDasharray="2 4" />
        </g>
        <circle cx="200" cy="250" r="14" fill="none" stroke={S} />
        <circle cx="200" cy="250" r="4" fill={S} />
      </g>
    ),
  },
  lattice: {
    back: (
      <g fill="none" stroke={P} strokeOpacity="0.16">
        {[-0.8, -0.55, -0.28, 0, 0.28, 0.55, 0.8].map((k) => {
          const y = 250 + k * 140;
          const r = Math.sqrt(1 - k * k) * 140;
          return <ellipse key={k} cx="200" cy={y} rx={r} ry={r * 0.22} />;
        })}
      </g>
    ),
    front: (
      <g fill="none">
        <g style={spin(60)}>
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <ellipse key={a} cx="200" cy="250" rx={Math.abs(Math.cos((a * Math.PI) / 180)) * 140 + 2} ry="140" stroke={a === 60 ? S : P} strokeOpacity={a === 60 ? 0.9 : 0.3} transform={`rotate(${a / 6} 200 250)`} />
          ))}
        </g>
        {[[200, 110], [321, 180], [321, 320], [200, 390], [79, 320], [79, 180]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 1 ? 5 : 3} fill={i === 1 ? S : P} />
        ))}
      </g>
    ),
  },
  scan: {
    back: (
      <g>
        <rect x="90" y="70" width="220" height="360" fill="none" stroke={P} strokeOpacity="0.25" />
        {Array.from({ length: 18 }, (_, i) => {
          const w = [150, 120, 170, 90, 160, 140, 110, 175, 130][i % 9];
          return <rect key={i} x="112" y={100 + i * 17} width={w} height="5" fill={P} fillOpacity="0.14" />;
        })}
      </g>
    ),
    front: (
      <g>
        {[2, 6, 7, 12, 15].map((i) => (
          <rect key={i} x={112 + (i % 3) * 30} y={100 + i * 17} width={[46, 60, 38][i % 3]} height="5" fill={S} />
        ))}
        <g style={{ animation: "scan 3.6s cubic-bezier(0.76,0,0.24,1) infinite alternate", transformBox: "view-box" }}>
          <line x1="70" y1="70" x2="330" y2="70" stroke={S} strokeWidth="1" />
          <rect x="70" y="40" width="260" height="30" fill={S} fillOpacity="0.07" />
        </g>
        <text x="90" y="455" fill={P} fillOpacity="0.55" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5">MATCH · TF-IDF · SIMILARITY</text>
      </g>
    ),
  },
  grid: {
    back: (
      <g stroke={P} strokeOpacity="0.16" fill="none">
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 7 }, (_, c) => <rect key={`${r}-${c}`} x={60 + c * 40} y={110 + r * 46} width="40" height="46" />),
        )}
      </g>
    ),
    front: (
      <g>
        <rect x="100" y="156" width="120" height="14" fill={P} fillOpacity="0.85" />
        <rect x="180" y="248" width="160" height="14" fill={S} />
        <rect x="60" y="340" width="80" height="14" fill={P} fillOpacity="0.5" />
        <rect x="220" y="386" width="80" height="14" fill={P} fillOpacity="0.5" />
        {[["ADMIN", 82], ["ORGANISER", 92], ["STUDENT", 102]].map(([t, y], i) => (
          <text key={t as string} x="60" y={y as number} fill={i === 1 ? S : P} fillOpacity={i === 1 ? 1 : 0.6} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5">{t}</text>
        ))}
        <circle cx="340" cy="90" r="5" fill={S} style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
      </g>
    ),
  },
};
