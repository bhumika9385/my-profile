"use client";
import { useRef } from "react";
import { journey } from "@/data/journey";
import { projectBySlug } from "@/data/projects";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/hooks";
import { useReveal } from "@/lib/useReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import TransitionLink from "@/components/ui/TransitionLink";
import Icon from "@/components/ui/Icon";

export default function Timeline() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  // the timeline line fills with the gradient as you scroll through it
  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-tl-fill]", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: "[data-tl-list]", start: "top 65%", end: "bottom 65%", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="journey" aria-labelledby="journey-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          id="journey-title"
          eyebrow="Journey"
          title="How I got"
          highlight="here"
          subtitle="Chapters grouped by what I was learning to build — from fundamentals to full-stack systems to applied AI."
          align="center"
        />

        <ol data-tl-list className="relative mx-auto max-w-5xl">
          <span aria-hidden className="absolute bottom-0 left-[19px] top-0 w-0.5 bg-line md:left-1/2 md:-translate-x-1/2" />
          <span aria-hidden data-tl-fill className="absolute bottom-0 left-[19px] top-0 w-0.5 origin-top md:left-1/2 md:-translate-x-1/2" style={{ background: "var(--grad)" }} />

          {journey.map((c, i) => {
            const right = i % 2 === 1;
            return (
              <li key={c.index} className="relative pb-12 pl-14 last:pb-0 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                {/* node */}
                <span aria-hidden className="absolute left-[8px] top-6 flex h-6 w-6 items-center justify-center rounded-full border border-signal/50 bg-ink md:left-1/2 md:-translate-x-1/2">
                  <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_12px_2px_rgb(255_59_71/0.7)]" />
                </span>

                <div className={right ? "md:col-start-2" : "md:text-right"}>
                  <article data-reveal className="card p-6 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-signal/40 md:p-7">
                    <div className={`flex items-center gap-3 ${right ? "" : "md:justify-end"}`}>
                      <span className="text-gradient text-sm font-bold">{c.index}</span>
                      <span className="chip !py-1 !text-xs">{c.label}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold leading-tight text-paper">{c.title}</h3>
                    <p className="mt-3 leading-relaxed text-mute">{c.body}</p>
                    {c.projects && (
                      <ul className={`mt-5 flex flex-wrap gap-2 ${right ? "" : "md:justify-end"}`}>
                        {c.projects.map((slug) => {
                          const p = projectBySlug(slug)!;
                          return (
                            <li key={slug}>
                              <TransitionLink href={`/work/${slug}`} transitionLabel={p.title} className="chip !text-xs text-signal transition-colors hover:border-signal/60">
                                {p.title} <Icon name="arrowUpRight" size={13} />
                              </TransitionLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </article>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
