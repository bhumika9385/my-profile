"use client";
import { useRef } from "react";
import { site } from "@/data/site";
import { education } from "@/data/education";
import { useReveal } from "@/lib/useReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon, { type IconName } from "@/components/ui/Icon";

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const edu = education[0];

  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: "cap", label: "Degree", value: `B.E. ${edu.field}` },
    { icon: "building", label: "Institute", value: edu.institution },
    { icon: "calendar", label: "Graduating", value: `${edu.graduation} (expected)` },
    { icon: "target", label: "Focus", value: "Full-stack · AI · Interactive web" },
  ];

  return (
    <section ref={ref} id="about" aria-labelledby="about-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading id="about-title" eyebrow="About me" title="Who I am &" highlight="what drives me" />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="space-y-6 text-lg leading-relaxed text-paper-2">
            <p data-reveal className="text-2xl font-semibold leading-snug text-paper md:text-[1.75rem]">
              I’m Bhumika — an aspiring full-stack developer studying Information Technology at {edu.institution}.
            </p>
            <p data-reveal>
              I like building things end to end: designing the data, writing the APIs and shaping the interface people
              actually use. That means web platforms with authentication, role-based access and
              AI where it genuinely helps — from parsing resumes with NLP to career guidance powered by LLMs.
            </p>
            <p data-reveal>
              I care about software that feels considered: fast, clear and a little bit alive.
            </p>

            <div data-reveal className="pt-4">
              <p className="mb-3 text-sm font-semibold text-paper">What I’m drawn to</p>
              <ul className="flex flex-wrap gap-2">
                {site.interests.map((i) => (
                  <li key={i} className="chip transition-colors hover:border-signal/50 hover:text-paper">{i}</li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="grid content-start gap-4 sm:grid-cols-2">
            {facts.map((f) => (
              <li key={f.label} data-reveal className="card group p-6 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-signal/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal/10 text-signal transition-colors group-hover:bg-signal/20">
                  <Icon name={f.icon} />
                </span>
                <p className="mt-5 text-sm text-mute">{f.label}</p>
                <p className="mt-1 font-semibold leading-snug text-paper">{f.value}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
