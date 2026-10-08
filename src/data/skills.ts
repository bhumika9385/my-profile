/**
 * Technologies Bhumika works with — this list is the single source of truth.
 * Only add technologies that are actually used. No proficiency levels are
 * shown anywhere on purpose.
 */
export type SkillGroupId = "frontend" | "backend" | "data" | "ai" | "tools";

export type SkillGroup = {
  id: SkillGroupId;
  label: string;
  index: string;
  blurb: string;
};

export type Skill = {
  id: string;
  label: string;
  group: SkillGroupId;
};

export const skillGroups: SkillGroup[] = [
  { id: "frontend", label: "Frontend", index: "01", blurb: "Interfaces, components and the browser." },
  { id: "backend", label: "Backend", index: "02", blurb: "Servers, APIs and application logic." },
  { id: "data", label: "Databases", index: "03", blurb: "Relational and document data stores." },
  { id: "ai", label: "AI / ML", index: "04", blurb: "Language processing and intelligent features." },
  { id: "tools", label: "Tools & Systems", index: "05", blurb: "Delivery, auth, queues and infrastructure." },
];

export const skills: Skill[] = [
  // Frontend
  { id: "html", label: "HTML", group: "frontend" },
  { id: "css", label: "CSS", group: "frontend" },
  { id: "javascript", label: "JavaScript", group: "frontend" },
  { id: "typescript", label: "TypeScript", group: "frontend" },
  { id: "react", label: "React", group: "frontend" },
  { id: "nextjs", label: "Next.js", group: "frontend" },
  { id: "tailwind", label: "Tailwind CSS", group: "frontend" },
  // Backend
  { id: "nodejs", label: "Node.js", group: "backend" },
  { id: "express", label: "Express", group: "backend" },
  { id: "python", label: "Python", group: "backend" },
  { id: "flask", label: "Flask", group: "backend" },
  { id: "java", label: "Java", group: "backend" },
  // Databases
  { id: "mongodb", label: "MongoDB", group: "data" },
  { id: "postgresql", label: "PostgreSQL", group: "data" },
  { id: "mysql", label: "MySQL", group: "data" },
  // AI / ML
  { id: "nlp", label: "spaCy / NLTK", group: "ai" },
  { id: "llm", label: "LLM APIs (Gemini / OpenAI)", group: "ai" },
  { id: "sklearn", label: "Scikit-learn", group: "ai" },
  { id: "tfidf", label: "TF-IDF", group: "ai" },
  // Tools / other
  { id: "git", label: "Git", group: "tools" },
  { id: "github", label: "GitHub", group: "tools" },
  { id: "rest", label: "REST APIs", group: "tools" },
  { id: "jwt", label: "JWT", group: "tools" },
  { id: "docker", label: "Docker", group: "tools" },
  { id: "redis", label: "Redis", group: "tools" },
  { id: "rabbitmq", label: "RabbitMQ", group: "tools" },
  { id: "prisma", label: "Prisma", group: "tools" },
  { id: "pymupdf", label: "PyMuPDF", group: "tools" },
];

/**
 * Ecosystem relationships — how these technologies naturally connect
 * (runtime, framework, language, or data-flow relationships).
 */
export const skillLinks: [string, string][] = [
  ["html", "css"],
  ["html", "javascript"],
  ["css", "tailwind"],
  ["javascript", "typescript"],
  ["javascript", "react"],
  ["javascript", "nodejs"],
  ["typescript", "nextjs"],
  ["typescript", "prisma"],
  ["react", "nextjs"],
  ["tailwind", "nextjs"],
  ["nodejs", "express"],
  ["express", "rest"],
  ["express", "jwt"],
  ["express", "mongodb"],
  ["nodejs", "redis"],
  ["nodejs", "rabbitmq"],
  ["prisma", "postgresql"],
  ["prisma", "mysql"],
  ["python", "flask"],
  ["python", "nlp"],
  ["python", "sklearn"],
  ["python", "pymupdf"],
  ["flask", "rest"],
  ["sklearn", "tfidf"],
  ["nlp", "tfidf"],
  ["llm", "rest"],
  ["llm", "nodejs"],
  ["llm", "python"],
  ["java", "mysql"],
  ["git", "github"],
  ["docker", "postgresql"],
  ["docker", "redis"],
  ["docker", "rabbitmq"],
  ["nextjs", "rest"],
];

export const skillById = (id: string) => skills.find((s) => s.id === id);
