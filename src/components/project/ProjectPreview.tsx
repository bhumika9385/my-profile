"use client";
import { useEffect, useRef } from "react";
import type { Project } from "@/data/projects";
import { skillById } from "@/data/skills";
import TransitionLink from "@/components/ui/TransitionLink";
import MagneticButton from "@/components/ui/MagneticButton";
import Icon from "@/components/ui/Icon";
import ProjectPoster from "./ProjectPoster";

/**
 * Large interactive project preview. The visual tilts in 3D toward the
 * pointer, its inner layers parallax (via --px/--py), and a glare follows
 * the cursor. Touch devices get the static layout.
 */
export default function ProjectPreview({ project, flip }: { project: Project; flip: boolean }) {
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = visualRef.current!;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const inner = el.querySelector<HTMLElement>("[data-tilt]")!;
    const glare = el.querySelector<HTMLElement>("[data-glare]")!;
    let raf = 0;
    const cur = { x: 0, y: 0 }, tgt = { x: 0, y: 0 };
    let hovering = false;
    const loop = () => {
      cur.x += (tgt.x - cur.x) * 0.1;
      cur.y += (tgt.y - cur.y) * 0.1;
      inner.style.transform = `perspective(1100px) rotateX(${-cur.y * 7}deg) rotateY(${cur.x * 9}deg) scale(${hovering ? 1.02 : 1})`;
      inner.style.setProperty("--px", cur.x.toFixed(3));
      inner.style.setProperty("--py", cur.y.toFixed(3));
      if (Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.001 || hovering) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tgt.x = (e.clientX - r.left) / r.width - 0.5;
      tgt.y = (e.clientY - r.top) / r.height - 0.5;
      glare.style.background = `radial-gradient(500px circle at ${(tgt.x + 0.5) * 100}% ${(tgt.y + 0.5) * 100}%, rgb(255 255 255 / 0.09), transparent 45%)`;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const enter = () => { hovering = true; glare.style.opacity = "1"; if (!raf) raf = requestAnimationFrame(loop); };
    const leave = () => { hovering = false; tgt.x = tgt.y = 0; glare.style.opacity = "0"; if (!raf) raf = requestAnimationFrame(loop); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const href = `/work/${project.slug}`;

  return (
    <article data-reveal className="grad-border card grid items-center gap-8 p-5 md:p-8 lg:grid-cols-2 lg:gap-12">
      <div ref={visualRef} className={flip ? "lg:order-2" : ""}>
        <TransitionLink href={href} transitionLabel={project.title} data-cursor="view" data-cursor-label="View project" aria-label={`${project.title} case study`} className="block">
          <div data-tilt className="relative overflow-hidden rounded-2xl border border-line transition-transform duration-300 will-change-transform">
            <ProjectPoster project={project} className="aspect-[4/3] w-full" />
            <div data-glare aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500" />
          </div>
        </TransitionLink>
      </div>

      <div className={flip ? "lg:order-1" : ""}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gradient text-sm font-bold">{project.index}</span>
          <span className="chip !text-xs">{project.category}</span>
        </div>
        <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight text-paper">{project.title}</h3>
        <p className="mt-2 text-lg font-medium text-signal">{project.kicker}</p>
        <p className="mt-4 leading-relaxed text-mute">{project.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
          {project.stack.map((id) => <li key={id} className="chip !py-1 !text-xs">{skillById(id)?.label}</li>)}
        </ul>
        <div className="mt-8">
          <MagneticButton>
            <TransitionLink href={href} transitionLabel={project.title} className="btn btn-ghost group">
              Read case study
              <Icon name="arrow" size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </TransitionLink>
          </MagneticButton>
        </div>
      </div>
    </article>
  );
}
