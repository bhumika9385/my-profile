"use client";
import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import SkillMap from "./SkillMap";

export default function Skills() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section ref={ref} id="skills" aria-labelledby="skills-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          id="skills-title"
          eyebrow="Skills"
          title="Technologies I"
          highlight="work with"
          subtitle="Grouped by area and connected the way they’re used together — no ratings, just the tools I build with."
        />
        <SkillMap />
      </div>
    </section>
  );
}
