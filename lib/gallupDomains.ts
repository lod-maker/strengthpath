// Gallup domain mapping — client-safe (no PDF dependencies)

export const GALLUP_DOMAINS: Record<string, string[]> = {
  Executing: [
    "Achiever", "Arranger", "Belief", "Consistency", "Deliberative",
    "Discipline", "Focus", "Responsibility", "Restorative",
  ],
  Influencing: [
    "Activator", "Command", "Communication", "Competition",
    "Maximizer", "Self-Assurance", "Significance", "Woo",
  ],
  "Relationship Building": [
    "Adaptability", "Connectedness", "Developer", "Empathy",
    "Harmony", "Includer", "Individualization", "Positivity", "Relator",
  ],
  "Strategic Thinking": [
    "Analytical", "Context", "Futuristic", "Ideation",
    "Input", "Intellection", "Learner", "Strategic",
  ],
};

export function getDomainForStrength(strengthName: string): string {
  for (const [domain, strengths] of Object.entries(GALLUP_DOMAINS)) {
    if (strengths.includes(strengthName)) {
      return domain;
    }
  }
  return "Unknown";
}

export function getDomainColor(domain: string): string {
  switch (domain) {
    case "Executing":
      return "#7B2D8E";
    case "Influencing":
      return "#E8A838";
    case "Relationship Building":
      return "#2E86AB";
    case "Strategic Thinking":
      return "#28A745";
    default:
      return "#6B7280";
  }
}
