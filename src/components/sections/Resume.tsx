"use client";
import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { education } from "@/data/education";
import { projects } from "@/data/projects";
import { skillGroups, skills } from "@/data/skills";
import { social } from "@/data/social";
import { gsap } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import MagneticButton from "@/components/ui/MagneticButton";
import TransitionLink from "@/components/ui/TransitionLink";
import Icon from "@/components/ui/Icon";

/** Miniature résumé sheet rendered from the same data files as the site. */
function Sheet() {
  const edu = education[0];
  return (
    <div className="aspect-[1/1.3] w-full rounded-xl bg-white p-[7%] text-slate-900 shadow-[0_30px_80px_-20px_rgb(255_46_61/0.45)]">
      <p className="text-[clamp(1rem,2.2vw,1.6rem)] font-extrabold leading-none tracking-tight">{site.name}</p>
      <p className="mt-1 text-[clamp(6px,0.75vw,9px)] font-semibold uppercase tracking-[0.12em] text-violet">{site.role}</p>
      <div className="mt-[5%] h-px bg-slate-200" />
      <p className="mt-[5%] text-[clamp(5px,0.65vw,8px)] font-bold uppercase tracking-[0.14em] text-slate-400">Education</p>
      <p className="mt-1 text-[clamp(6px,0.85vw,10px)] font-semibold">B.E. {edu.field} — {edu.institution}</p>
      <p className="mt-[5%] text-[clamp(5px,0.65vw,8px)] font-bold uppercase tracking-[0.14em] text-slate-400">Projects</p>
      <ul className="mt-1 space-y-[3%]">
        {projects.map((p) => (
          <li key={p.slug}>
            <p className="text-[clamp(6px,0.85vw,10px)] font-semibold leading-tight">{p.title}</p>
            <p className="text-[clamp(5px,0.7vw,8px)] leading-snug text-slate-500">{p.kicker}</p>
          </li>
        ))}
      </ul>
      <p className="mt-[5%] text-[clamp(5px,0.65vw,8px)] font-bold uppercase tracking-[0.14em] text-slate-400">Technologies</p>
      <div className="mt-1 space-y-[1.5%]">
        {skillGroups.map((g) => (
          <p key={g.id} className="text-[clamp(5px,0.68vw,8px)] leading-snug text-slate-600">
            <span className="font-semibold text-slate-900">{g.label}:</span> {skills.filter((s) => s.group === g.id).map((s) => s.label).join(", ")}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function Resume() {
  const ref = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  useReveal(ref);

  useEffect(() => {
    const el = tiltRef.current!;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3.out" });
    const parent = el.parentElement!;
    const move = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
      ry(((e.clientX - r.left) / r.width - 0.5) * 16);
    };
    const leave = () => { rx(0); ry(0); };
    parent.addEventListener("pointermove", move);
    parent.addEventListener("pointerleave", leave);
    return () => { parent.removeEventListener("pointermove", move); parent.removeEventListener("pointerleave", leave); };
  }, []);

  return (
    <section ref={ref} id="resume" aria-labelledby="resume-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="grad-border card grid items-center gap-12 overflow-hidden p-6 md:p-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="resume-title" eyebrow="Résumé" title="Everything on" highlight="one page" subtitle="Education, projects and technologies — generated from the same source as this site, so it’s always current." />
            <div data-reveal className="-mt-4 flex flex-wrap gap-3">
              <MagneticButton>
                <TransitionLink href="/resume" transitionLabel="Résumé" className="btn btn-primary">
                  <Icon name="file" size={18} /> View résumé
                </TransitionLink>
              </MagneticButton>
              {social.resumePdf && (
                <MagneticButton>
                  <a href={social.resumePdf} download className="btn btn-ghost">
                    <Icon name="download" size={18} /> Download PDF
                  </a>
                </MagneticButton>
              )}
            </div>
          </div>
          <div data-reveal className="[perspective:1400px]">
            <div ref={tiltRef} className="mx-auto max-w-[380px] [transform-style:preserve-3d]">
              <TransitionLink href="/resume" transitionLabel="Résumé" data-cursor="view" data-cursor-label="Open résumé" aria-label="Open the full résumé" className="block">
                <Sheet />
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
