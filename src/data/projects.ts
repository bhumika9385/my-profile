/**
 * Projects + case-study content.
 *
 * Writing rules for this file:
 *  - Only technologies from skills.ts may appear in `stack`.
 *  - No invented metrics, users, clients or results. "Outcome" describes what
 *    the system delivers / demonstrates, not numbers.
 *  - `stack` per project should be reviewed by Bhumika and trimmed to what
 *    each project actually used.
 *  - Add `image: "/projects/<slug>.jpg"` (placed in /public) to replace the
 *    generative poster with a real screenshot.
 */
import type { SkillGroupId } from "./skills";

export type ArchNode = {
  id: string;
  label: string;
  detail: string;
  /** column in the diagram (0 = client side → n = data side) */
  col: number;
  /** row within the column */
  row: number;
  kind: "client" | "service" | "data" | "ai" | "infra";
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  summary: string;
  category: string;
  domains: SkillGroupId[];
  stack: string[];
  /** visual motif for the generative poster */
  motif: "orbit" | "lattice" | "scan" | "grid";
  hue: number;
  image?: string;
  overview: string;
  problem: string;
  solution: string;
  features: { title: string; body: string }[];
  technology: { id: string; role: string }[];
  architecture: {
    summary: string;
    nodes: ArchNode[];
    edges: [string, string, string?][];
  };
  challenges: { title: string; body: string }[];
  outcome: string;
};

export const projects: Project[] = [
  {
    slug: "vyoma",
    index: "01",
    title: "Vyoma",
    kicker: "AI-powered Career Development & Placement Platform",
    summary:
      "A platform that brings career preparation, placement activity and AI guidance into one place for students and placement teams.",
    category: "Full-stack · AI platform",
    domains: ["frontend", "backend", "data", "ai", "tools"],
    stack: ["nextjs", "typescript", "tailwind", "nodejs", "express", "postgresql", "prisma", "redis", "rabbitmq", "docker", "jwt", "llm", "rest"],
    motif: "orbit",
    hue: 356,
    overview:
      "Vyoma is a career development and placement platform. It is designed around two audiences at once: students preparing for opportunities, and the people coordinating placements. AI capabilities sit inside the workflow rather than beside it.",
    problem:
      "Career preparation and placement processes are often spread across spreadsheets, notice boards, messaging groups and separate tools. Students struggle to see which opportunities fit them and what to improve, while coordinators spend effort on manual tracking and communication.",
    solution:
      "A single web platform with role-aware dashboards, a structured opportunity pipeline and AI-assisted guidance. Heavy or slow work — such as AI requests and notifications — is moved off the request path into background processing so the interface stays responsive.",
    features: [
      { title: "Role-aware dashboards", body: "Separate experiences for students and placement coordinators, protected with token-based authentication." },
      { title: "Opportunity pipeline", body: "Structured listings and application tracking so every stage of a placement drive is visible in one place." },
      { title: "AI career guidance", body: "LLM-powered assistance that helps students reflect on their profile and prepare for opportunities." },
      { title: "Background processing", body: "Queue-based jobs for slower tasks so user-facing pages are not blocked." },
    ],
    technology: [
      { id: "nextjs", role: "Application framework for the web client and routing" },
      { id: "typescript", role: "Shared types across client and server code" },
      { id: "nodejs", role: "Server runtime for the API" },
      { id: "express", role: "REST API layer" },
      { id: "postgresql", role: "Primary relational datastore" },
      { id: "prisma", role: "Typed data access and schema migrations" },
      { id: "redis", role: "Caching and fast-access data" },
      { id: "rabbitmq", role: "Message queue for background jobs" },
      { id: "llm", role: "AI guidance features" },
      { id: "jwt", role: "Stateless authentication and role checks" },
      { id: "docker", role: "Containerised services for consistent environments" },
    ],
    architecture: {
      summary:
        "A web client talks to a REST API. The API reads and writes through a typed data layer, caches hot data, and hands slow work to a queue consumed by background workers — including AI requests.",
      nodes: [
        { id: "client", label: "Web Client", detail: "Next.js · role-based UI", col: 0, row: 1, kind: "client" },
        { id: "api", label: "REST API", detail: "Node.js · Express · JWT", col: 1, row: 1, kind: "service" },
        { id: "cache", label: "Cache", detail: "Redis", col: 2, row: 0, kind: "infra" },
        { id: "queue", label: "Job Queue", detail: "RabbitMQ", col: 2, row: 2, kind: "infra" },
        { id: "db", label: "Database", detail: "PostgreSQL · Prisma", col: 3, row: 1, kind: "data" },
        { id: "ai", label: "AI Worker", detail: "LLM API calls", col: 3, row: 2, kind: "ai" },
      ],
      edges: [
        ["client", "api", "HTTPS / JSON"],
        ["api", "cache"],
        ["api", "db", "Prisma"],
        ["api", "queue", "publish"],
        ["queue", "ai", "consume"],
        ["ai", "db"],
      ],
    },
    challenges: [
      { title: "Keeping AI off the critical path", body: "AI responses can be slow and variable. Routing them through a queue keeps the core experience fast and lets failures be retried instead of surfacing as broken pages." },
      { title: "Two audiences, one system", body: "Students and coordinators need different views of the same data. Role checks have to be enforced on the server, not just hidden in the interface." },
      { title: "Coordinating many services", body: "A database, cache, queue and API need to run together reliably; containerising them keeps local and deployed environments consistent." },
    ],
    outcome:
      "Vyoma brings career preparation and placement coordination into a single, role-aware system, and demonstrates an end-to-end architecture: typed full-stack code, relational data modelling, caching, asynchronous job processing and AI integration.",
  },
  {
    slug: "lifeskillsphere",
    index: "02",
    title: "LifeSkillSphere",
    kicker: "Life Skills & Holistic Development Web Portal",
    summary:
      "A web portal focused on life skills and holistic development — learning beyond the academic syllabus, organised and accessible.",
    category: "Web portal",
    domains: ["frontend", "backend", "data"],
    stack: ["react", "javascript", "tailwind", "nodejs", "express", "mongodb", "jwt", "rest"],
    motif: "lattice",
    hue: 222,
    overview:
      "LifeSkillSphere is a web portal for life skills and holistic development. It gives learners a structured place to explore areas such as communication, wellbeing and personal growth alongside their academic work.",
    problem:
      "Life-skills content is usually scattered, unstructured and easy to ignore next to academic priorities. Without a clear home, learners have no sense of what to explore next or how far they have come.",
    solution:
      "A dedicated portal that organises life-skills content into clear categories, gives each learner an account and a personal space, and keeps the experience simple enough to return to regularly.",
    features: [
      { title: "Categorised skill areas", body: "Content organised into distinct life-skill areas so learners can browse with intent." },
      { title: "Learner accounts", body: "Sign-up and sign-in with token-based authentication and a personal space per user." },
      { title: "Content management", body: "Structured content stored in a document database so new modules can be added without schema changes." },
      { title: "Responsive interface", body: "A component-based UI that works across desktop and mobile screens." },
    ],
    technology: [
      { id: "react", role: "Component-based interface" },
      { id: "tailwind", role: "Responsive styling system" },
      { id: "nodejs", role: "Server runtime" },
      { id: "express", role: "REST API for content and users" },
      { id: "mongodb", role: "Flexible document storage for modules and users" },
      { id: "jwt", role: "Authentication" },
    ],
    architecture: {
      summary:
        "A single-page React client consumes a REST API. The API authenticates requests and stores users and content modules as documents.",
      nodes: [
        { id: "client", label: "Portal UI", detail: "React · Tailwind", col: 0, row: 1, kind: "client" },
        { id: "auth", label: "Auth", detail: "JWT", col: 1, row: 0, kind: "service" },
        { id: "api", label: "REST API", detail: "Node.js · Express", col: 1, row: 2, kind: "service" },
        { id: "db", label: "Database", detail: "MongoDB", col: 2, row: 1, kind: "data" },
      ],
      edges: [
        ["client", "auth", "sign in"],
        ["client", "api", "JSON"],
        ["auth", "api", "token"],
        ["api", "db"],
      ],
    },
    challenges: [
      { title: "Structuring open-ended content", body: "Life skills don't fit a rigid syllabus. A document model lets modules vary in shape while still being browsable by category." },
      { title: "Designing for return visits", body: "A portal like this only works if it's easy to come back to — navigation and layout need to stay simple and predictable." },
    ],
    outcome:
      "LifeSkillSphere gives life-skills learning a clear, organised home on the web, and demonstrates a complete full-stack flow: authentication, a REST API, document data modelling and a responsive component-based interface.",
  },
  {
    slug: "resume-analyzer",
    index: "03",
    title: "Resume Analyzer",
    kicker: "AI / NLP Resume Analysis System",
    summary:
      "A system that reads resumes, extracts their content with NLP and compares them against job descriptions to surface relevance and gaps.",
    category: "AI · NLP",
    domains: ["ai", "backend"],
    stack: ["python", "flask", "pymupdf", "nlp", "tfidf", "sklearn", "rest"],
    motif: "scan",
    hue: 4,
    overview:
      "Resume Analyzer is an NLP-based system that turns an unstructured resume PDF into structured information and measures how closely it matches a given job description.",
    problem:
      "Resumes arrive as PDFs with inconsistent layouts. Reading them manually against a job description is slow, and candidates rarely get clear feedback on which skills or keywords their resume is missing.",
    solution:
      "A Python pipeline: extract text from the PDF, clean and process it with NLP, vectorise both the resume and the job description with TF-IDF, and compare them to produce a relevance score and a list of missing terms — served through a lightweight web API.",
    features: [
      { title: "PDF text extraction", body: "Reliable text extraction from resume PDFs, independent of visual layout." },
      { title: "NLP preprocessing", body: "Tokenisation, stop-word removal and lemmatisation to normalise resume language." },
      { title: "Job-description matching", body: "TF-IDF vectors and similarity scoring to measure how well a resume aligns with a role." },
      { title: "Gap highlighting", body: "Terms that are important in the job description but absent from the resume are surfaced as feedback." },
    ],
    technology: [
      { id: "python", role: "Core language for the pipeline" },
      { id: "pymupdf", role: "PDF parsing and text extraction" },
      { id: "nlp", role: "Tokenisation, lemmatisation and entity handling" },
      { id: "tfidf", role: "Weighting important terms in resume and job text" },
      { id: "sklearn", role: "Vectorisation and similarity computation" },
      { id: "flask", role: "Web API around the analysis pipeline" },
    ],
    architecture: {
      summary:
        "A linear analysis pipeline wrapped in a Flask API: upload → extract → preprocess → vectorise → compare → report.",
      nodes: [
        { id: "upload", label: "Upload", detail: "Resume PDF + job text", col: 0, row: 1, kind: "client" },
        { id: "extract", label: "Extract", detail: "PyMuPDF", col: 1, row: 1, kind: "service" },
        { id: "nlp", label: "Preprocess", detail: "spaCy / NLTK", col: 2, row: 1, kind: "ai" },
        { id: "vector", label: "Vectorise", detail: "TF-IDF · Scikit-learn", col: 3, row: 0, kind: "ai" },
        { id: "report", label: "Report", detail: "Score + missing terms", col: 3, row: 2, kind: "data" },
      ],
      edges: [
        ["upload", "extract", "Flask API"],
        ["extract", "nlp", "raw text"],
        ["nlp", "vector", "tokens"],
        ["vector", "report", "similarity"],
      ],
    },
    challenges: [
      { title: "Messy input", body: "PDF resumes use columns, tables and decorative layouts. Extraction has to be robust before any NLP is meaningful." },
      { title: "Meaningful similarity", body: "Raw word overlap rewards keyword stuffing. Weighting terms with TF-IDF emphasises the words that actually distinguish a role." },
      { title: "Explainable feedback", body: "A score alone isn't useful. Surfacing the missing terms makes the result something a candidate can act on." },
    ],
    outcome:
      "Resume Analyzer turns an unstructured PDF into a structured, explainable comparison against a job description, and demonstrates a practical NLP pipeline — from document parsing through text processing to vector-based similarity.",
  },
  {
    slug: "event-internship-management",
    index: "04",
    title: "Event & Internship Management",
    kicker: "Role-based Management Platform",
    summary:
      "A role-based platform for publishing and managing events and internship opportunities, with different capabilities for each type of user.",
    category: "Full-stack · Role-based system",
    domains: ["frontend", "backend", "data", "tools"],
    stack: ["react", "javascript", "nodejs", "express", "mysql", "jwt", "rest"],
    motif: "grid",
    hue: 232,
    overview:
      "Event & Internship Management is a role-based web platform. Administrators, organisers and students each get the capabilities they need — from publishing an event or internship to registering and tracking participation.",
    problem:
      "Events and internship opportunities are often announced through scattered channels, with registrations tracked by hand. It's hard to know who has applied, who is attending, and who is allowed to change what.",
    solution:
      "A central platform with clearly separated roles. Each role sees its own dashboard and actions, permissions are enforced on the server, and registrations are stored relationally so they can be queried and managed cleanly.",
    features: [
      { title: "Role-based access", body: "Distinct permissions for each role, enforced by the API with token-based authentication." },
      { title: "Event & internship listings", body: "Create, edit and publish opportunities with the details participants need." },
      { title: "Registrations & applications", body: "Students register or apply in one place; organisers see who has signed up." },
      { title: "Management dashboards", body: "Role-specific views for reviewing and managing listings and participants." },
    ],
    technology: [
      { id: "react", role: "Role-specific dashboards and forms" },
      { id: "nodejs", role: "Server runtime" },
      { id: "express", role: "REST API with permission middleware" },
      { id: "mysql", role: "Relational storage for users, listings and registrations" },
      { id: "jwt", role: "Authentication carrying the user's role" },
    ],
    architecture: {
      summary:
        "A React client sends authenticated requests to an Express API. Middleware checks the role inside each token before the request reaches business logic and the relational database.",
      nodes: [
        { id: "client", label: "Dashboards", detail: "React · per-role views", col: 0, row: 1, kind: "client" },
        { id: "auth", label: "Auth + Roles", detail: "JWT middleware", col: 1, row: 1, kind: "service" },
        { id: "api", label: "REST API", detail: "Node.js · Express", col: 2, row: 1, kind: "service" },
        { id: "db", label: "Database", detail: "MySQL", col: 3, row: 1, kind: "data" },
      ],
      edges: [
        ["client", "auth", "Bearer token"],
        ["auth", "api", "role check"],
        ["api", "db", "SQL"],
      ],
    },
    challenges: [
      { title: "Permissions that actually hold", body: "Hiding a button isn't security. Every protected route checks the role on the server before doing any work." },
      { title: "Relational integrity", body: "Users, listings and registrations reference each other. A relational schema keeps those relationships consistent." },
    ],
    outcome:
      "The platform replaces scattered announcements and manual tracking with a single system, and demonstrates role-based access control, relational data modelling and a full client–API–database flow.",
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
