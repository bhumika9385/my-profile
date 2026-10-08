export type Certification = {
  title: string;
  issuer: string;
  /** e.g. "2025" or "Mar 2025" */
  date: string;
  /** Optional verification URL */
  credentialUrl?: string;
};

/**
 * Add real certifications here. The section renders an honest
 * "currently being curated" state while this list is empty —
 * nothing is shown that hasn't been added deliberately.
 *
 * Example:
 * { title: "Course name", issuer: "Platform", date: "2025", credentialUrl: "https://..." }
 */
export const certifications: Certification[] = [];
