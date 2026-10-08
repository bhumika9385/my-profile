"use client";
import type Lenis from "lenis";

/** Shared Lenis instance (null when smooth scroll is disabled). */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => { lenis = l; };
export const getLenis = () => lenis;

export function scrollToTarget(target: string | number | HTMLElement, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target === "#top" ? 0 : target, { immediate, duration: 1.4 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else if (typeof target === "string") {
    if (target === "#top") window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
    else document.querySelector(target)?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  } else target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
}
