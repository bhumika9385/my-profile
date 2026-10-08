export type Education = {
  degree: string;
  field: string;
  institution: string;
  shortName: string;
  location: string;
  /** Expected graduation year */
  graduation: number;
  status: "In progress" | "Completed";
  focus: string[];
};

export const education: Education[] = [
  {
    degree: "Bachelor of Engineering",
    field: "Information Technology",
    institution: "A. P. Shah Institute of Technology",
    shortName: "APSIT",
    location: "Thane, Maharashtra",
    graduation: 2027,
    status: "In progress",
    // Areas of interest pursued alongside the degree (from stated interests).
    focus: ["Full-stack development", "AI-powered applications", "Software development"],
  },
];
