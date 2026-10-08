"use client";
import { useRef, useState } from "react";
import { social, socialLinks } from "@/data/social";
import { useReveal } from "@/lib/useReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import DevNotice from "@/components/ui/DevNotice";
import Icon, { type IconName } from "@/components/ui/Icon";

const iconFor: Record<string, IconName> = { github: "github", linkedin: "linkedin", email: "mail" };

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  useReveal(ref);
  const links = socialLinks().filter((l) => l.id !== "email");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(social.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${social.email}`;
    }
  };

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="grad-border card relative overflow-hidden px-6 py-16 text-center md:px-12 md:py-24">
          <div aria-hidden className="absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/30 blur-[110px]" />
          <div aria-hidden className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-signal/20 blur-[90px]" />

          <div className="relative mx-auto max-w-2xl">
            <p data-reveal className="chip mx-auto !border-signal/30 !bg-signal/10 !text-signal">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden /> Contact
            </p>
            <h2 id="contact-title" data-reveal className="mt-6 text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[1.02] tracking-tight text-paper">
              Let’s build <span className="text-gradient">something</span> together
            </h2>
            <p data-reveal className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-mute">
              Have an opportunity, an idea or just a question? My inbox is open.
            </p>

            <div data-reveal className="mt-10 flex flex-col items-center gap-4">
              {social.email ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <MagneticButton>
                    <a href={`mailto:${social.email}`} className="btn btn-primary !px-7 !py-4 text-base">
                      <Icon name="mail" size={18} /> {social.email}
                    </a>
                  </MagneticButton>
                  <button type="button" onClick={copy} className="btn btn-ghost" aria-live="polite">
                    {copied ? "Copied ✓" : "Copy email"}
                  </button>
                </div>
              ) : (
                <DevNotice>Add your email in src/data/social.ts to enable the contact button.</DevNotice>
              )}

              {links.length > 0 ? (
                <ul className="mt-2 flex flex-wrap justify-center gap-3">
                  {links.map((l) => (
                    <li key={l.id}>
                      <MagneticButton>
                        <a href={l.href} target="_blank" rel="noopener noreferrer" data-cursor="visit" aria-label={l.label} className="flex h-12 w-12 items-center justify-center rounded-full border border-line-strong bg-white/[0.04] text-paper transition-colors hover:border-signal/60 hover:text-signal">
                          <Icon name={iconFor[l.id] ?? "arrowUpRight"} />
                        </a>
                      </MagneticButton>
                    </li>
                  ))}
                </ul>
              ) : (
                <DevNotice>Add GitHub / LinkedIn URLs in src/data/social.ts — they appear here automatically.</DevNotice>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
