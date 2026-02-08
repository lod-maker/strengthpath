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
      return "#3B82F6";
    case "Influencing":
      return "#F59E0B";
    case "Relationship Building":
      return "#10B981";
    case "Strategic Thinking":
      return "#8B5CF6";
    default:
      return "#6B7280";
  }
}
