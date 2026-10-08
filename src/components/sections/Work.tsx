"use client";
import { useRef } from "react";
import { projects } from "@/data/projects";
import { useReveal } from "@/lib/useReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectPreview from "@/components/project/ProjectPreview";

export default function Work() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section ref={ref} id="work" aria-labelledby="work-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          id="work-title"
          eyebrow="Projects"
          title="Things I’ve"
          highlight="built"
          subtitle="Four projects across full-stack platforms and applied AI — each with a detailed case study."
        />
        <div className="space-y-8 md:space-y-10">
          {projects.map((p, i) => <ProjectPreview key={p.slug} project={p} flip={i % 2 === 1} />)}
        </div>
      </div>
    </section>
  );
}
