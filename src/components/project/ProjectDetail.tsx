"use client";
import { useRef, useState } from "react";
import { nextProject, projects, type Project } from "@/data/projects";
import { skillById, skillGroups } from "@/data/skills";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/hooks";
import { useReveal } from "@/lib/useReveal";
import { scrollToTarget } from "@/lib/scroll";
import TransitionLink from "@/components/ui/TransitionLink";
import Icon from "@/components/ui/Icon";
import ProjectPoster from "./ProjectPoster";
import ArchitectureDiagram from "./ArchitectureDiagram";

const CHAPTERS = [
  ["overview", "Overview"],
  ["problem", "Problem"],
  ["solution", "Solution"],
  ["features", "Features"],
  ["technology", "Technology"],
  ["architecture", "Architecture"],
  ["challenges", "Challenges"],
  ["outcome", "Outcome"],
] as const;

function Chapter({ id, index, title, children }: { id: string; index: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} data-chapter={id} aria-labelledby={`${id}-h`} className="scroll-mt-28 pb-16 md:pb-20">
      <h2 id={`${id}-h`} data-reveal className="mb-6 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-paper md:text-3xl">
        <span className="text-gradient text-base font-bold">{String(index + 1).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ProjectDetail({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState<string>("overview");
  const next = nextProject(project.slug);
  useReveal(ref);

  useIsoLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      CHAPTERS.forEach(([id]) => {
        ScrollTrigger.create({
          trigger: `[data-chapter='${id}']`,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (st) => st.isActive && setCurrent(id),
        });
      });
      if (reduced) return;
      gsap.timeline({ delay: 0.2 })
        .from("[data-cs-letter]", { yPercent: 110, duration: 1.1, stagger: 0.025 })
        .from("[data-cs-fade]", { opacity: 0, y: 20, duration: 0.9, stagger: 0.07 }, 0.3);
      gsap.fromTo("[data-cs-banner-inner]", { scale: 1.12 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: "[data-cs-banner]", start: "top bottom", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, [project.slug]);

  const domains = project.domains.map((d) => skillGroups.find((g) => g.id === d)!.label);

  return (
    <article ref={ref} aria-labelledby="cs-title">
      {/* hero */}
      <header className="container-x pb-12 pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
        <div data-cs-fade className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <TransitionLink href="/#work" transitionLabel="Projects" className="btn btn-ghost !px-4 !py-2 text-sm">
            <Icon name="arrow" size={16} className="rotate-180" /> All projects
          </TransitionLink>
          <p className="text-sm text-mute">
            Case study <span className="text-gradient font-bold">{project.index}</span> of {String(projects.length).padStart(2, "0")}
          </p>
        </div>
        <h1 id="cs-title" className="text-[clamp(2.8rem,8vw,6.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-paper">
          <span className="sr-only">{project.title}</span>
          <span aria-hidden className="block overflow-hidden pb-[0.08em]">
            {project.title.split(" ").map((word, wi) => (
              <span key={wi} className="mr-[0.25em] inline-block whitespace-nowrap last:mr-0">
                {word.split("").map((ch, i) => <span key={i} data-cs-letter className="inline-block">{ch}</span>)}
              </span>
            ))}
          </span>
        </h1>
        <p data-cs-fade className="text-gradient mt-4 text-xl font-semibold md:text-2xl">{project.kicker}</p>
        <p data-cs-fade className="mt-5 max-w-2xl text-lg leading-relaxed text-mute">{project.summary}</p>
        <div data-cs-fade className="mt-8 flex flex-wrap gap-2">
          <span className="chip">{project.category}</span>
          {domains.map((d) => <span key={d} className="chip">{d}</span>)}
        </div>
      </header>

      {/* banner */}
      <div className="container-x">
        <div data-cs-banner className="grad-border overflow-hidden rounded-[1.75rem]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] sm:aspect-[16/8]">
            <div data-cs-banner-inner className="absolute inset-0">
              <ProjectPoster project={project} className="h-full w-full" fit="meet" priority />
            </div>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="container-x grid gap-10 pt-16 md:pt-24 lg:grid-cols-[220px_1fr] lg:gap-16">
        <nav aria-label="Case study chapters" className="hidden lg:block">
          <ol className="card sticky top-28 space-y-1 p-3">
            {CHAPTERS.map(([id, label], i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => { e.preventDefault(); scrollToTarget(`#${id}`); }}
                  aria-current={current === id ? "true" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-300 ${
                    current === id ? "bg-signal/10 font-semibold text-signal" : "text-mute hover:bg-white/5 hover:text-paper"
                  }`}
                >
                  <span className="text-xs opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0">
          <Chapter id="overview" index={0} title="Overview">
            <p data-reveal className="text-xl leading-relaxed text-paper-2 md:text-2xl md:leading-relaxed">{project.overview}</p>
          </Chapter>

          <div className="grid gap-5 pb-16 md:grid-cols-2 md:pb-20">
            <section id="problem" data-chapter="problem" aria-labelledby="problem-h" className="card scroll-mt-28 p-6 md:p-8" data-reveal>
              <h2 id="problem-h" className="flex items-center gap-3 text-xl font-extrabold text-paper">
                <span className="text-gradient text-sm font-bold">02</span> Problem
              </h2>
              <p className="mt-4 leading-relaxed text-mute">{project.problem}</p>
            </section>
            <section id="solution" data-chapter="solution" aria-labelledby="solution-h" className="card scroll-mt-28 border-signal/30 p-6 md:p-8" data-reveal>
              <h2 id="solution-h" className="flex items-center gap-3 text-xl font-extrabold text-paper">
                <span className="text-gradient text-sm font-bold">03</span> Solution
              </h2>
              <p className="mt-4 leading-relaxed text-paper-2">{project.solution}</p>
            </section>
          </div>

          <Chapter id="features" index={3} title="Features">
            <ul className="grid gap-4 sm:grid-cols-2">
              {project.features.map((f, i) => (
                <li key={f.title} data-reveal className="card p-6 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-signal/40">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/15 text-sm font-bold text-violet">{i + 1}</span>
                  <h3 className="mt-4 text-lg font-bold text-paper">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-mute">{f.body}</p>
                </li>
              ))}
            </ul>
          </Chapter>

          <Chapter id="technology" index={4} title="Technology">
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.technology.map((t) => (
                <li key={t.id} data-reveal className="card flex items-start gap-4 p-5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-signal" aria-hidden />
                  <div>
                    <p className="font-bold text-paper">{skillById(t.id)?.label}</p>
                    <p className="mt-1 text-sm text-mute">{t.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Chapter>

          <Chapter id="architecture" index={5} title="Architecture">
            <p data-reveal className="mb-6 text-lg leading-relaxed text-mute">{project.architecture.summary}</p>
            <div data-reveal className="card p-4 md:p-8">
              <ArchitectureDiagram architecture={project.architecture} />
            </div>
            <p className="mt-3 text-xs text-dim">Hover or focus a component to isolate its connections.</p>
          </Chapter>

          <Chapter id="challenges" index={6} title="Challenges">
            <ul className="space-y-4">
              {project.challenges.map((c) => (
                <li key={c.title} data-reveal className="card p-6">
                  <h3 className="text-lg font-bold text-paper">{c.title}</h3>
                  <p className="mt-2 leading-relaxed text-mute">{c.body}</p>
                </li>
              ))}
            </ul>
          </Chapter>

          <Chapter id="outcome" index={7} title="Outcome">
            <p data-reveal className="grad-border card p-6 text-xl leading-relaxed text-paper md:p-8 md:text-2xl md:leading-relaxed">{project.outcome}</p>
          </Chapter>
        </div>
      </div>

      {/* next project */}
      <div className="container-x pb-24">
        <TransitionLink href={`/work/${next.slug}`} transitionLabel={next.title} data-cursor="view" data-cursor-label="Next project" className="group grad-border card flex items-center justify-between gap-6 overflow-hidden p-6 md:p-10">
          <div>
            <p className="text-sm text-mute">Next project</p>
            <p className="mt-2 text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-none tracking-tight text-paper transition-colors group-hover:text-signal">{next.title}</p>
            <p className="mt-2 text-mute">{next.kicker}</p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-500 group-hover:translate-x-1" style={{ background: "var(--grad)" }}>
            <Icon name="arrow" size={22} />
          </span>
        </TransitionLink>
      </div>
    </article>
  );
}
