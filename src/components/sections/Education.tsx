"use client";
import { useRef } from "react";
import { education } from "@/data/education";
import { useReveal } from "@/lib/useReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";

export default function Education() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section ref={ref} id="education" aria-labelledby="education-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading id="education-title" eyebrow="Education" title="Where I’m" highlight="learning" />
        {education.map((e) => (
          <article key={e.institution} data-reveal className="grad-border card relative overflow-hidden p-6 md:p-10">
            <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet/20 blur-[90px]" />
            <div className="relative grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl text-white" style={{ background: "var(--grad)" }}>
                <Icon name="cap" size={30} />
              </span>
              <div>
                <h3 className="text-2xl font-extrabold leading-tight text-paper md:text-3xl">{e.degree} in {e.field}</h3>
                <p className="mt-2 text-lg text-paper-2">{e.institution} ({e.shortName})</p>
                <p className="mt-1 text-sm text-mute">{e.location}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {e.focus.map((f) => <li key={f} className="chip !text-xs">{f}</li>)}
                </ul>
              </div>
              <div className="md:text-right">
                <p className="text-gradient text-6xl font-extrabold leading-none tracking-tight md:text-7xl">{e.graduation}</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-mute">
                  <span className="h-2 w-2 rounded-full bg-signal [animation:pulse-dot_2s_ease-in-out_infinite]" />
                  {e.status} · expected graduation
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
