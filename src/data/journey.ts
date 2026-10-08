/**
 * Journey chapters. These are thematic chapters, not dated claims — add
 * dates/details only when they are real.
 */
export type Chapter = {
  index: string;
  label: string;
  title: string;
  body: string;
  marker: string;
  projects?: string[];
};

export const journey: Chapter[] = [
  {
    index: "01",
    label: "Foundation",
    title: "Studying Information Technology",
    body: "Pursuing a B.E. in Information Technology at A. P. Shah Institute of Technology — the grounding in software, systems and problem solving everything else builds on.",
    marker: "APSIT",
  },
  {
    index: "02",
    label: "Building for the web",
    title: "From pages to full-stack platforms",
    body: "Moving from interfaces to complete systems: authentication, REST APIs, databases and role-based access, shipped as working web platforms.",
    marker: "Full-stack",
    projects: ["lifeskillsphere", "event-internship-management"],
  },
  {
    index: "03",
    label: "Applying AI",
    title: "Making software understand text",
    body: "Bringing NLP and LLM APIs into real workflows — parsing resumes, measuring relevance and adding AI guidance where it genuinely helps.",
    marker: "AI · NLP",
    projects: ["resume-analyzer", "vyoma"],
  },
  {
    index: "04",
    label: "Next",
    title: "Graduating in 2027",
    body: "Looking for opportunities to grow as a full-stack developer — building useful products, AI-powered applications and interactive web experiences.",
    marker: "2027",
  },
];
