"use client";
/**
 * Device capability tiers — decides how much WebGL to run.
 *  none → static fallback (no WebGL, or reduced motion)
 *  low  → phones / weak GPUs: fewer particles, DPR 1, no post-processing
 *  mid  → tablets / integrated GPUs
 *  high → desktops: full particle counts + subtle post-processing
 */
export type Tier = "none" | "low" | "mid" | "high";

let cached: Tier | null = null;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function getTier(): Tier {
  if (cached) return cached;
  if (typeof window === "undefined") return "none";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !hasWebGL()) return (cached = "none");

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return (cached = "low");

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const w = Math.min(window.screen.width, window.innerWidth);

  if (coarse && w < 768) return (cached = "low");
  if (cores <= 4 || mem <= 4 || coarse) return (cached = "mid");
  return (cached = "high");
}

export const tierConfig: Record<Tier, { particles: number; dpr: [number, number]; post: boolean }> = {
  none: { particles: 0, dpr: [1, 1], post: false },
  low: { particles: 14000, dpr: [1, 1.25], post: false },
  mid: { particles: 28000, dpr: [1, 1.5], post: false },
  high: { particles: 50000, dpr: [1, 2], post: false },
};
