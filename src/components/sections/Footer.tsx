import { nav, site } from "@/data/site";
import { socialLinks } from "@/data/social";
import TransitionLink from "@/components/ui/TransitionLink";

export default function Footer() {
  const links = socialLinks();
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-extrabold tracking-tight">
            <span className="text-paper">Bhumika</span> <span className="text-gradient">Pandhare</span>
          </p>
          <p className="mt-1 text-sm text-mute">{site.role} · B.E. Information Technology, 2027</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[...nav, { label: "Résumé", href: "/resume" }].map((n) => (
              <li key={n.href}>
                <TransitionLink href={n.href} transitionLabel={n.label} className="text-paper-2 transition-colors hover:text-signal">{n.label}</TransitionLink>
              </li>
            ))}
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.href} target={l.id === "email" ? undefined : "_blank"} rel="noopener noreferrer" className="text-paper-2 transition-colors hover:text-signal">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-x border-t border-line py-5 text-xs text-dim">
        © {new Date().getFullYear()} {site.name}. Built with Next.js, React Three Fiber &amp; GSAP.
      </div>
    </footer>
  );
}
