import { AccentureRole, RoleDomain, Track, TrackId } from "./types";

// ─── The 3 Analyst Tracks ────────────────────────────────────────────────────

export const TRACKS: Record<TrackId, Track> = {
  tech_transformation: {
    id: "tech_transformation",
    title: "Tech Transformation",
    summary:
      "Client-facing business transformation through technology. You develop the skills to work directly with clients, translate requirements to delivery teams, and coordinate projects.",
    accessibleRoles: [
      "Program/Project Management",
      "Business Analyst",
      "Delivery Lead",
      "Technology Delivery Lead",
      "Scrum Master",
      "Project Control Services Practitioner",
      "Product Owner",
      "Service Management",
      "Solution Architect",
      "Technology Architect",
    ],
  },
  tech_delivery: {
    id: "tech_delivery",
    title: "Tech Delivery",
    summary:
      "End-to-end technology solution design and delivery. You design and deliver solutions, define new business models, and collaborate on proof of concepts for emerging technologies.",
    accessibleRoles: [
      "Technology Architect",
      "Solution Architect",
      "Quality Engineer (Tester)",
      "Test Automation Engineer",
      "Business Analyst",
      "Program/Project Management",
      "Delivery Lead",
      "Scrum Master",
      "DevOps",
      "Cloud Platform Engineer",
      "Application Automation Engineer",
      "Service Management",
      "Product Owner",
    ],
  },
  modern_engineering: {
    id: "modern_engineering",
    title: "Modern Engineering",
    summary:
      "Hands-on software engineering and platform building. You use programming skills to design and build client applications and identify vulnerabilities or security flaws.",
    accessibleRoles: [
      "Front End Developer",
      "Web Developer",
      "Application Developer",
      "Full Stack Engineer",
      "Infrastructure Engineer",
      "DevOps",
      "Data Engineer",
      "Data Architect",
      "AI / ML Engineer",
      "Cloud Platform Engineer",
      "Application Automation Engineer",
      "Test Automation Engineer",
      "User Experience Engineer",
      "Technology Architect",
    ],
  },
};

export const TRACK_IDS = Object.keys(TRACKS) as TrackId[];

// ─── All 27 Roles ────────────────────────────────────────────────────────────

export const ACCENTURE_ROLES: AccentureRole[] = [
  // Research & Design
  {
    name: "Researcher",
    domain: "Research & Design",
    description:
      "Conducts user research, interviews, surveys, and usability testing to generate insights that inform product and service design.",
    strengthsFit: ["Analytical", "Input", "Empathy", "Communication", "Learner"],
  },
  {
    name: "Interaction Designer",
    domain: "Research & Design",
    description:
      "Designs how users interact with digital products — wireframes, prototypes, interaction flows. Focuses on usability, accessibility, and intuitive navigation.",
    strengthsFit: ["Ideation", "Empathy", "Deliberative", "Strategic", "Individualization"],
  },
  {
    name: "Content Designer",
    domain: "Research & Design",
    description:
      "Crafts clear, user-centred content across digital services. Structures information architecture, writes UX copy, and ensures consistency.",
    strengthsFit: ["Communication", "Empathy", "Discipline", "Analytical", "Consistency"],
  },
  {
    name: "User Experience Designer",
    domain: "Research & Design",
    description:
      "End-to-end UX — research, personas, journey maps, wireframes, prototypes, usability testing. Bridges user needs and business goals.",
    strengthsFit: ["Empathy", "Ideation", "Strategic", "Communication", "Input"],
  },
  {
    name: "User Experience Engineer",
    domain: "Research & Design",
    description:
      "Hybrid role bridging UX design and front-end development. Translates designs into functional prototypes and production code.",
    strengthsFit: ["Analytical", "Learner", "Adaptability", "Ideation", "Achiever"],
  },

  // Development & Engineering
  {
    name: "Front End Developer",
    domain: "Development & Engineering",
    description:
      "Builds the client-side of web applications using HTML, CSS, JavaScript and frameworks (React, Angular, Vue). Focuses on performance, responsiveness, and accessibility.",
    strengthsFit: ["Achiever", "Learner", "Discipline", "Analytical", "Focus"],
  },
  {
    name: "Web Developer",
    domain: "Development & Engineering",
    description:
      "Designs, builds, and maintains websites and web applications. Works across front-end and basic back-end.",
    strengthsFit: ["Achiever", "Learner", "Responsibility", "Adaptability", "Restorative"],
  },
  {
    name: "Application Developer",
    domain: "Development & Engineering",
    description:
      "Designs, codes, tests, and maintains software applications across platforms (web, mobile, desktop).",
    strengthsFit: ["Analytical", "Achiever", "Learner", "Responsibility", "Restorative"],
  },
  {
    name: "Full Stack Engineer",
    domain: "Development & Engineering",
    description:
      "Works across front-end and back-end — APIs, databases, server logic, UI. Owns features end-to-end.",
    strengthsFit: ["Learner", "Strategic", "Achiever", "Self-Assurance", "Adaptability"],
  },
  {
    name: "Infrastructure Engineer",
    domain: "Development & Engineering",
    description:
      "Designs, builds, and manages the underlying IT infrastructure — servers, networks, storage, virtualisation.",
    strengthsFit: ["Analytical", "Responsibility", "Restorative", "Discipline", "Deliberative"],
  },
  {
    name: "DevOps",
    domain: "Development & Engineering",
    description:
      "Bridges development and operations — CI/CD pipelines, infrastructure as code, monitoring, automation. Focuses on reliability, speed, and collaboration.",
    strengthsFit: ["Analytical", "Arranger", "Adaptability", "Achiever", "Learner"],
  },
  {
    name: "AI / ML Engineer",
    domain: "Development & Engineering",
    description:
      "Builds and deploys machine learning models and AI systems. Works with data pipelines, model training, evaluation, and production deployment.",
    strengthsFit: ["Learner", "Analytical", "Ideation", "Futuristic", "Strategic"],
  },

  // Data
  {
    name: "Data Engineer",
    domain: "Data",
    description:
      "Builds and maintains data pipelines, ETL processes, and data infrastructure. Ensures data is clean, accessible, and reliable.",
    strengthsFit: ["Analytical", "Discipline", "Responsibility", "Arranger", "Focus"],
  },
  {
    name: "Data Architect",
    domain: "Data",
    description:
      "Designs the overall data strategy, data models, schemas, and governance frameworks. Defines how data flows across systems.",
    strengthsFit: ["Strategic", "Analytical", "Discipline", "Futuristic", "Arranger"],
  },

  // Automation & Cloud
  {
    name: "Application Automation Engineer",
    domain: "Automation & Cloud",
    description:
      "Automates business processes and application workflows using RPA, scripting, and automation platforms.",
    strengthsFit: ["Analytical", "Achiever", "Learner", "Strategic", "Focus"],
  },
  {
    name: "Cloud Platform Engineer",
    domain: "Automation & Cloud",
    description:
      "Designs, deploys, and manages cloud infrastructure (AWS, Azure, GCP). Handles scalability, security, and cost optimisation.",
    strengthsFit: ["Learner", "Analytical", "Responsibility", "Adaptability", "Futuristic"],
  },

  // Architecture
  {
    name: "Technology Architect",
    domain: "Architecture",
    description:
      "Defines the overall technical vision and architecture for solutions. Makes high-level design choices, sets technical standards, and ensures alignment with business goals.",
    strengthsFit: ["Strategic", "Futuristic", "Command", "Analytical", "Communication"],
  },
  {
    name: "Solution Architect",
    domain: "Architecture",
    description:
      "Designs end-to-end technical solutions for specific client problems. Bridges business requirements and technical implementation.",
    strengthsFit: ["Strategic", "Analytical", "Communication", "Ideation", "Arranger"],
  },

  // Quality & Testing
  {
    name: "Quality Engineer (Tester)",
    domain: "Quality & Testing",
    description:
      "Plans and executes testing strategies — functional, regression, performance, security. Ensures solutions meet quality standards.",
    strengthsFit: ["Responsibility", "Analytical", "Discipline", "Restorative", "Deliberative"],
  },
  {
    name: "Test Automation Engineer",
    domain: "Quality & Testing",
    description:
      "Builds automated testing frameworks and scripts. Reduces manual testing effort and increases coverage and reliability.",
    strengthsFit: ["Analytical", "Achiever", "Discipline", "Learner", "Focus"],
  },

  // Delivery & Management
  {
    name: "Program/Project Management",
    domain: "Delivery & Management",
    description:
      "Plans, coordinates, and oversees technology projects end-to-end. Manages scope, timelines, budgets, risks, and stakeholder expectations.",
    strengthsFit: ["Arranger", "Responsibility", "Communication", "Achiever", "Strategic"],
  },
  {
    name: "Business Analyst",
    domain: "Delivery & Management",
    description:
      "Bridges business needs and technical solutions. Gathers requirements, maps processes, writes specifications, and facilitates stakeholder alignment.",
    strengthsFit: ["Analytical", "Communication", "Empathy", "Strategic", "Input"],
  },
  {
    name: "Delivery Lead",
    domain: "Delivery & Management",
    description:
      "Accountable for end-to-end delivery of technology solutions. Leads teams, removes blockers, manages client relationships, and ensures quality and pace.",
    strengthsFit: ["Command", "Responsibility", "Arranger", "Communication", "Achiever"],
  },
  {
    name: "Technology Delivery Lead",
    domain: "Delivery & Management",
    description:
      "Similar to Delivery Lead but with deeper technical oversight. Ensures technical decisions are sound while managing delivery.",
    strengthsFit: ["Command", "Strategic", "Analytical", "Responsibility", "Communication"],
  },
  {
    name: "Scrum Master",
    domain: "Delivery & Management",
    description:
      "Facilitates agile ceremonies, coaches teams on agile practices, removes impediments, and shields the team from distractions.",
    strengthsFit: ["Empathy", "Harmony", "Developer", "Communication", "Adaptability"],
  },
  {
    name: "Project Control Services Practitioner",
    domain: "Delivery & Management",
    description:
      "Manages project financials, forecasting, reporting, risk tracking, and governance. The analytical backbone of project delivery.",
    strengthsFit: ["Analytical", "Discipline", "Responsibility", "Consistency", "Focus"],
  },
  {
    name: "Service Management",
    domain: "Delivery & Management",
    description:
      "Manages live services and operations — incident management, service levels, continuous improvement. Ensures systems run smoothly post-deployment.",
    strengthsFit: ["Responsibility", "Restorative", "Consistency", "Discipline", "Arranger"],
  },
  {
    name: "Product Owner",
    domain: "Delivery & Management",
    description:
      "Defines product vision and backlog priorities. Represents the voice of the user/business to the delivery team. Makes trade-off decisions.",
    strengthsFit: ["Strategic", "Communication", "Command", "Futuristic", "Maximizer"],
  },
];

// ─── Helper: Get roles grouped by domain ─────────────────────────────────────

export function getRolesByDomain(): Record<RoleDomain, AccentureRole[]> {
  const grouped: Record<string, AccentureRole[]> = {};
  for (const role of ACCENTURE_ROLES) {
    if (!grouped[role.domain]) grouped[role.domain] = [];
    grouped[role.domain].push(role);
  }
  return grouped as Record<RoleDomain, AccentureRole[]>;
}

// ─── Helper: Domain colour for UI ────────────────────────────────────────────

export function getRoleDomainColor(domain: RoleDomain): string {
  switch (domain) {
    case "Research & Design":
      return "#E879F9";
    case "Development & Engineering":
      return "#60A5FA";
    case "Data":
      return "#34D399";
    case "Automation & Cloud":
      return "#F97316";
    case "Architecture":
      return "#A78BFA";
    case "Quality & Testing":
      return "#FBBF24";
    case "Delivery & Management":
      return "#F472B6";
    default:
      return "#9CA3AF";
  }
}

// ─── Helper: Domain icon label ───────────────────────────────────────────────

export function getRoleDomainIcon(domain: RoleDomain): string {
  switch (domain) {
    case "Research & Design":
      return "palette";
    case "Development & Engineering":
      return "code";
    case "Data":
      return "database";
    case "Automation & Cloud":
      return "cloud";
    case "Architecture":
      return "building";
    case "Quality & Testing":
      return "shield-check";
    case "Delivery & Management":
      return "users";
    default:
      return "briefcase";
  }
}
