"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { site } from "@/data/site";
import { education } from "@/data/education";
import { getTier, type Tier } from "@/lib/device";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useInView, useIsoLayoutEffect } from "@/lib/hooks";
import HeroFallback from "@/components/three/HeroFallback";
import MagneticButton from "@/components/ui/MagneticButton";
import TransitionLink from "@/components/ui/TransitionLink";
import Icon from "@/components/ui/Icon";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

// Gradient text can't paint through individually transformed letters,
// so the gradient line reveals as one word.
const Letters = ({ word, className = "", gradient = false }: { word: string; className?: string; gradient?: boolean }) => (
  <span className={`block overflow-hidden pb-[0.08em] ${className}`} aria-hidden>
    {gradient ? (
      <span data-letter className="text-gradient inline-block pr-[0.04em]">{word}</span>
    ) : (
      word.split("").map((ch, i) => <span key={i} data-letter className="inline-block">{ch}</span>)
    )}
  </span>
);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [tier, setTier] = useState<Tier | null>(null);
  const inView = useInView(sectionRef, "100px");
  const edu = education[0];

  useEffect(() => setTier(getTier()), []);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section, start: "top top", end: "bottom top", scrub: true,
        onUpdate: (st) => { progress.current = st.progress; },
      });
      if (reduced) return;
      gsap.timeline({ delay: 0.1 })
        .from("[data-letter]", { yPercent: 110, duration: 1.2, stagger: 0.035, ease: "expo" })
        .from("[data-hero-fade]", { opacity: 0, y: 24, duration: 0.9, stagger: 0.08 }, 0.35)
        .from("[data-hero-visual]", { opacity: 0, scale: 0.9, duration: 2, ease: "power2.out" }, 0);
      // gentle parallax as the hero leaves
      gsap.to("[data-hero-copy]", { y: -80, opacity: 0.2, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="top" aria-label="Introduction" className="relative flex min-h-svh items-center overflow-hidden pb-16 pt-[calc(var(--nav-h)+2rem)]">
      <div className="container-x grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]">
        {/* copy */}
        <div data-hero-copy className="relative z-[2] order-2 lg:order-1">
          <p data-hero-fade className="chip">
            <Icon name="cap" size={15} className="text-signal" />
            B.E. {edu.field} · {edu.shortName} · {edu.graduation}
          </p>

          <h1 className="mt-6 font-extrabold leading-[0.95] tracking-[-0.04em]">
            <span data-hero-fade className="mb-3 block text-xl font-semibold tracking-normal text-paper-2 md:text-2xl">Hi, I’m</span>
            <span className="sr-only">{site.name}</span>
            <Letters word={site.firstName} className="text-[clamp(3.4rem,9vw,7.5rem)] text-paper" />
            <Letters word={site.lastName} gradient className="text-[clamp(3.4rem,9vw,7.5rem)]" />
          </h1>

          <p data-hero-fade className="mt-6 text-xl font-semibold text-paper md:text-2xl">{site.role}</p>
          <ul data-hero-fade className="mt-4 flex flex-wrap gap-2" aria-label="Focus">
            {site.tagline.map((t) => <li key={t} className="chip">{t}</li>)}
          </ul>
          <p data-hero-fade className="mt-6 max-w-xl text-lg leading-relaxed text-mute">
            I build full-stack web platforms, AI-powered applications and interactive web experiences — from the database to the details people actually touch.
          </p>

          <div data-hero-fade className="mt-9 flex flex-wrap gap-3">
            <MagneticButton>
              <TransitionLink href="/#work" transitionLabel="Work" className="btn btn-primary">
                View projects <Icon name="arrow" size={18} />
              </TransitionLink>
            </MagneticButton>
            <MagneticButton>
              <TransitionLink href="/#contact" transitionLabel="Contact" className="btn btn-ghost">
                <Icon name="mail" size={18} /> Contact me
              </TransitionLink>
            </MagneticButton>
            <MagneticButton>
              <TransitionLink href="/resume" transitionLabel="Résumé" className="btn btn-ghost">
                <Icon name="file" size={18} /> Résumé
              </TransitionLink>
            </MagneticButton>
          </div>
        </div>

        {/* 3D visual */}
        <div data-hero-visual className="relative order-1 aspect-square w-full max-lg:mx-auto max-lg:max-w-[440px] lg:order-2">
          <div aria-hidden className="absolute inset-[12%] rounded-full bg-violet/25 blur-[90px]" />
          <div aria-hidden className="absolute inset-[30%] translate-x-[18%] rounded-full bg-signal/20 blur-[80px]" />
          {/* hologram projector: a faint light cone rising from a ringed base */}
          <div aria-hidden className="pointer-events-none absolute inset-x-[22%] bottom-[2%] top-[12%] opacity-70 [clip-path:polygon(36%_100%,64%_100%,100%_0,0_0)]" style={{ background: "linear-gradient(to top, rgb(120 160 255 / 0.22), transparent 70%)" }} />
          <div aria-hidden className="pointer-events-none absolute bottom-[1%] left-1/2 h-[7%] w-[46%] -translate-x-1/2 rounded-[50%] border border-[rgb(150_180_255/0.45)] shadow-[0_0_30px_rgb(61_107_255/0.45),inset_0_0_18px_rgb(61_107_255/0.35)]" />
          <div aria-hidden className="pointer-events-none absolute bottom-[2.2%] left-1/2 h-[4%] w-[30%] -translate-x-1/2 rounded-[50%] border border-[rgb(255_90_100/0.5)]" />
          <div className="absolute inset-0">
            {tier === null ? null : tier === "none" ? <HeroFallback /> : <HeroScene tier={tier} active={inView} progress={progress} />}
          </div>
        </div>
      </div>

      <div data-hero-fade aria-hidden className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-mute md:flex">
        <span className="flex h-9 w-5 justify-center rounded-full border border-line-strong pt-1.5">
          <span className="h-2 w-1 rounded-full bg-signal [animation:float-y_1.6s_ease-in-out_infinite]" />
        </span>
        Scroll
      </div>
    </section>
  );
}
