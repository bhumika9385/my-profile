"use client";
import { useRef } from "react";
import { certifications } from "@/data/certifications";
import { useReveal } from "@/lib/useReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";

/**
 * Renders certifications from data. While the list is empty it shows an
 * honest "being compiled" state rather than placeholder credentials.
 */
export default function Certifications() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section ref={ref} id="certifications" aria-labelledby="cert-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading id="cert-title" eyebrow="Certifications" title="Credentials &" highlight="courses" />
        {certifications.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c) => (
              <li key={c.title} data-reveal className="card flex flex-col p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink/15 text-pink"><Icon name="award" /></span>
                <h3 className="mt-5 font-bold leading-snug text-paper">{c.title}</h3>
                <p className="mt-1 text-sm text-mute">{c.issuer} · {c.date}</p>
                {c.credentialUrl && (
                  <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" data-cursor="visit" data-cursor-label="Verify" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-signal hover:underline">
                    View credential <Icon name="arrowUpRight" size={14} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div data-reveal className="card flex flex-col items-center gap-4 border-dashed px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink/15 text-pink"><Icon name="award" size={26} /></span>
            <p className="text-lg font-semibold text-paper">Being compiled</p>
            <p className="max-w-md text-mute">Verified certifications will be listed here with links to their credentials.</p>
          </div>
        )}
      </div>
    </section>
  );
}
