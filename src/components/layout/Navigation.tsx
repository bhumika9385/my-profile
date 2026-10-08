"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { nav, site } from "@/data/site";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/scroll";
import MagneticButton from "@/components/ui/MagneticButton";
import TransitionLink from "@/components/ui/TransitionLink";

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // highlight the section currently in view
  useEffect(() => {
    if (pathname !== "/") { setActive(""); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    // observe every section, so non-nav sections (journey, education…) clear the highlight
    const t = setTimeout(() => document.querySelectorAll("main section[id]").forEach((el) => io.observe(el)), 300);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  // mobile menu
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduced ? 0 : 1;
    if (open) {
      getLenis()?.stop();
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35 * d });
      gsap.fromTo(el.querySelectorAll("[data-menu-item]"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 * d, stagger: 0.06, delay: 0.05 * d });
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    } else {
      getLenis()?.start();
      gsap.to(el, { opacity: 0, duration: 0.3 * d, onComplete: () => { gsap.set(el, { visibility: "hidden" }); } });
    }
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open ? "border-b border-line bg-ink/70 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav aria-label="Primary" className="container-x flex h-[var(--nav-h)] items-center justify-between">
          <TransitionLink href="/" transitionLabel="Home" className="text-lg font-extrabold tracking-tight" aria-label={`${site.name} — home`}>
            <span className="text-paper">Bhumika</span> <span className="text-gradient">Pandhare</span>
          </TransitionLink>

          <ul className="hidden items-center gap-1 rounded-full border border-line bg-white/[0.03] p-1 md:flex">
            {nav.map((item) => {
              const id = item.href.split("#")[1];
              const isActive = active === id;
              return (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    transitionLabel={item.label}
                    aria-current={isActive ? "true" : undefined}
                    className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                      isActive ? "bg-signal/15 text-signal" : "text-paper-2 hover:bg-white/5 hover:text-paper"
                    }`}
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:block">
            <MagneticButton strength={0.25}>
              <TransitionLink href="/resume" transitionLabel="Résumé" className="btn btn-ghost !px-4 !py-2 text-sm">
                Résumé
              </TransitionLink>
            </MagneticButton>
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="relative z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-line-strong md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden className="relative block h-3 w-4">
              <span className={`absolute left-0 h-0.5 w-full rounded bg-paper transition-all duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-[5px] h-0.5 w-full rounded bg-paper transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-0.5 w-full rounded bg-paper transition-all duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
            </span>
          </button>
        </nav>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className="fixed inset-0 z-[99] flex flex-col bg-ink/95 px-gutter pt-[calc(var(--nav-h)+2rem)] backdrop-blur-xl md:hidden"
        style={{ visibility: "hidden", opacity: 0 }}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="flex flex-col gap-2">
          {[...nav, { label: "Résumé", href: "/resume" }].map((item) => (
            <li key={item.href} data-menu-item>
              <TransitionLink
                href={item.href}
                transitionLabel={item.label}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-line bg-white/[0.03] px-5 py-4 text-2xl font-bold text-paper"
              >
                {item.label}
                <span aria-hidden className="text-gradient">→</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
