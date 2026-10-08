"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";

type Ctx = { navigate: (href: string, label?: string) => void };
const TransitionCtx = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionCtx);

/**
 * Cinematic route transition:
 *   cover  — a panel wipes up with a clip-path while the destination title rises
 *   swap   — route changes behind the panel
 *   reveal — panel clips away upward, the new page de-blurs and settles
 * ~1.2s total; reduced-motion users get an instant navigation.
 */
export default function PageTransition({ children, chrome }: { children: React.ReactNode; chrome?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pendingHash = useRef<string | null>(null);
  const busy = useRef(false);
  const covered = useRef(false);
  const firstRender = useRef(true);
  const [title, setTitle] = useState("");

  const navigate = useCallback(
    (href: string, label?: string) => {
      const url = new URL(href, window.location.href);
      const hash = url.hash;

      if (url.pathname === window.location.pathname) {
        if (hash) {
          scrollToTarget(hash);
          history.replaceState(null, "", hash);
        } else scrollToTarget("#top");
        return;
      }
      if (busy.current) return;
      busy.current = true;
      pendingHash.current = hash || null;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !panelRef.current) {
        router.push(url.pathname, { scroll: !hash });
        return;
      }

      setTitle(label ?? "");
      gsap
        .timeline({
          onComplete: () => {
            covered.current = true;
            router.push(url.pathname, { scroll: false });
          },
        })
        .set(panelRef.current, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" })
        .to(panelRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "cine" })
        .to(contentRef.current, { y: -80, opacity: 0.4, filter: "blur(6px)", duration: 0.6, ease: "cine" }, 0)
        .fromTo(titleRef.current, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: "expo" }, 0.2);
    },
    [router],
  );

  // Route changed → position the new page, then reveal it
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const hash = pendingHash.current;
    pendingHash.current = null;

    const id = requestAnimationFrame(() => {
      const target = hash ? document.querySelector<HTMLElement>(hash) : null;
      scrollToTarget(target ?? 0, true);
      ScrollTrigger.refresh();

      if (!covered.current || !panelRef.current) {
        // browser back/forward, or reduced motion
        busy.current = false;
        gsap.fromTo(contentRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, clearProps: "all" });
        return;
      }
      covered.current = false;
      gsap
        .timeline({ onComplete: () => { busy.current = false; } })
        .set(contentRef.current, { y: 100, opacity: 1, filter: "blur(10px)", scale: 0.98 })
        .to(titleRef.current, { yPercent: -110, duration: 0.45, ease: "power3.in" })
        .to(panelRef.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "cine" }, 0.15)
        .to(contentRef.current, { y: 0, filter: "blur(0px)", scale: 1, duration: 0.9, ease: "expo", clearProps: "transform,filter" }, 0.25)
        .set(panelRef.current, { visibility: "hidden" });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <TransitionCtx.Provider value={{ navigate }}>
      {chrome}
      <div ref={contentRef}>{children}</div>
      <div
        ref={panelRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-ink"
        style={{ visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" }}
      >
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: "var(--grad)" }} />
        <div className="absolute left-1/2 top-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/20 blur-[100px]" />
        <span className="relative block overflow-hidden pb-2">
          <span ref={titleRef} className="text-gradient block text-[clamp(2.5rem,8vw,6rem)] font-extrabold tracking-tight">{title}</span>
        </span>
      </div>
    </TransitionCtx.Provider>
  );
}
