/**
 * Contact + social links.
 *
 * Leave a value as an empty string if you don't want it shown — the UI hides
 * empty entries automatically (and flags them in development only).
 */
export type SocialLink = {
  id: "email" | "github" | "linkedin" | "resume";
  label: string;
  href: string;
  handle: string;
};

export const social = {
  /** e.g. "bhumika@example.com" — used for the contact CTA + mailto links */
  email: "",
  /** full URL, e.g. "https://github.com/your-handle" */
  github: "",
  /** full URL, e.g. "https://www.linkedin.com/in/your-handle" */
  linkedin: "",
  /** path to a PDF placed in /public, e.g. "/Bhumika_Pandhare_Resume.pdf" */
  resumePdf: "",
  /** optional, e.g. "Mumbai, India" — hidden when empty */
  location: "",
};

export function socialLinks(): SocialLink[] {
  const handleOf = (url: string) =>
    url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  const links: SocialLink[] = [
    { id: "email", label: "Email", href: social.email ? `mailto:${social.email}` : "", handle: social.email },
    { id: "github", label: "GitHub", href: social.github, handle: handleOf(social.github) },
    { id: "linkedin", label: "LinkedIn", href: social.linkedin, handle: handleOf(social.linkedin) },
  ];
  return links.filter((l) => l.href);
}

/** Fields still empty — surfaced as a small dev-only notice. */
export function missingSocial(): string[] {
  return (["email", "github", "linkedin", "resumePdf"] as const).filter((k) => !social[k]);
}
