import type { Metadata } from "next";
import { site } from "@/data/site";
import { education } from "@/data/education";
import { projects } from "@/data/projects";
import { certifications } from "@/data/certifications";
import { skillGroups, skills } from "@/data/skills";
import { social, socialLinks } from "@/data/social";
import PrintButton from "@/components/ui/PrintButton";
import TransitionLink from "@/components/ui/TransitionLink";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${site.name} — ${site.role}.`,
};

/** lowercase the first letter, keeping acronyms like "AI" intact */
const lower = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

/** Print-ready résumé generated from the site's data files. */
export default function ResumePage() {
  const links = socialLinks();
  return (
    <main id="main" className="min-h-svh bg-ink px-gutter pb-24 pt-[calc(var(--nav-h)+3rem)] print:bg-white print:p-0">
      <div className="no-print mx-auto mb-8 flex max-w-[860px] flex-wrap items-center justify-between gap-4">
        <TransitionLink href="/#resume" transitionLabel="Index" className="label text-mute hover:text-paper">← Back to portfolio</TransitionLink>
        <div className="flex gap-3">
          {social.resumePdf && (
            <a href={social.resumePdf} download className="label border border-line-strong px-4 py-3 text-paper hover:border-signal hover:text-violet">Download PDF ↓</a>
          )}
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto max-w-[860px] bg-paper p-8 text-ink shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] md:p-14 print:max-w-none print:p-0 print:shadow-none">
        <header className="border-b border-ink/15 pb-6">
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{site.name}</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-ink/60">{site.role}</p>
          {(links.length > 0 || social.location) && (
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {social.location && <span>{social.location}</span>}
              {links.map((l) => <a key={l.id} href={l.href} className="underline decoration-ink/30 underline-offset-2">{l.handle}</a>)}
            </p>
          )}
        </header>

        <section className="mt-8">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet">Profile</h2>
          <p className="mt-2 leading-relaxed">
            Aspiring full-stack developer and B.E. Information Technology student. Interested in {site.interests.slice(0, -1).map(lower).join(", ")} and {lower(site.interests.at(-1)!)}.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet">Education</h2>
          {education.map((e) => (
            <div key={e.institution} className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-semibold">{e.degree} — {e.field}</p>
                <p className="text-ink/70">{e.institution}, {e.location}</p>
              </div>
              <p className="font-mono text-xs text-ink/60">Expected {e.graduation}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet">Projects</h2>
          <ul className="mt-2 space-y-4">
            {projects.map((p) => (
              <li key={p.slug} className="break-inside-avoid">
                <p className="font-semibold">{p.title} <span className="font-normal text-ink/60">— {p.kicker}</span></p>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">{p.summary}</p>
                <p className="mt-1 font-mono text-[11px] text-ink/55">{p.stack.map((id) => skills.find((s) => s.id === id)?.label).join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet">Technologies</h2>
          <dl className="mt-2 space-y-1 text-sm">
            {skillGroups.map((g) => (
              <div key={g.id} className="flex flex-wrap gap-x-2">
                <dt className="font-semibold">{g.label}:</dt>
                <dd className="text-ink/80">{skills.filter((s) => s.group === g.id).map((s) => s.label).join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        {certifications.length > 0 && (
          <section className="mt-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet">Certifications</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {certifications.map((c) => <li key={c.title}><span className="font-semibold">{c.title}</span> — {c.issuer}, {c.date}</li>)}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
