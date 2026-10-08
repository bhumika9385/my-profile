"use client";
import { gsap, ScrollTrigger } from "./gsap";
import { useIsoLayoutEffect } from "./hooks";

/**
 * Fade-up reveal for every `[data-reveal]` inside the given section.
 * Elements entering together are staggered; reduced motion shows everything.
 */
export function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
      gsap.set(items, { opacity: 0, y: 32 });
      ScrollTrigger.batch(items, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "expo", overwrite: true }),
      });
    }, root);
    return () => ctx.revert();
  }, []);
}
