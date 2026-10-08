/**
 * Static fallback for the hero emblem (no WebGL / reduced motion):
 * a line-drawn version of the dot-matrix emblem.
 */
export default function HeroFallback() {
  const legs = [
    "M 40 -30 Q 120 10 150 90", "M 36 -4 Q 100 50 118 130", "M 28 24 Q 64 78 70 140",
  ];
  return (
    <svg aria-hidden viewBox="-190 -190 380 380" className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 opacity-90">
      <circle r="176" fill="none" stroke="var(--color-violet)" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="520 600" />
      <g fill="none" stroke="var(--color-violet)" strokeWidth="1.8" strokeLinecap="round">
        {legs.flatMap((d, i) => [1, -1].map((s) => <path key={`${i}${s}`} d={d} transform={`scale(${s} 1)`} />))}
      </g>
      <path d="M -26 -40 L 26 -40 L 100 -2 L 20 40 L 0 160 L -20 40 L -100 -2 Z" fill="rgb(255 46 61 / 0.85)" />
      <ellipse cx="0" cy="-104" rx="36" ry="50" fill="rgb(255 46 61 / 0.9)" />
      <g fill="#eef1f8">
        <path d="M -32 -112 L -8 -98 L -12 -88 L -30 -98 Z" />
        <path d="M 32 -112 L 8 -98 L 12 -88 L 30 -98 Z" />
      </g>
    </svg>
  );
}
