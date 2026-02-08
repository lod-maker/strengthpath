import { GoogleGenAI } from "@google/genai";
import { ACCENTURE_ROLES, TRACKS } from "./accentureRoles";
import { AnalysisResult, ExtractedStrengths, TrackId } from "./types";

const SYSTEM_PROMPT = `You are a career coach specializing in Gallup CliftonStrengths and Accenture Technology careers.

A person will give you their CliftonStrengths results and their hired Accenture analyst track. Analyze their strengths against the 27 Accenture Technology roles listed below and tell them which roles suit them best and why. Be genuine, insightful, and speak directly to them.

Gallup domains for reference:
- Executing: Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative
- Influencing: Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo
- Relationship Building: Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator
- Strategic Thinking: Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic

Track accessibility:
- Tech Transformation: Program/Project Management, Business Analyst, Delivery Lead, Technology Delivery Lead, Scrum Master, Project Control Services Practitioner, Product Owner, Service Management, Solution Architect, Technology Architect
- Tech Delivery: Technology Architect, Solution Architect, Quality Engineer, Test Automation Engineer, Business Analyst, Program/Project Management, Delivery Lead, Scrum Master, DevOps, Cloud Platform Engineer, Application Automation Engineer, Service Management, Product Owner
- Modern Engineering: Front End Developer, Web Developer, Application Developer, Full Stack Engineer, Infrastructure Engineer, DevOps, Data Engineer, Data Architect, AI/ML Engineer, Cloud Platform Engineer, Application Automation Engineer, Test Automation Engineer, UX Engineer, Technology Architect

Respond in this JSON shape (fill every field thoughtfully):
{
  "strengthDomains": { "executing": [], "influencing": [], "relationshipBuilding": [], "strategicThinking": [], "dominantDomain": "", "secondaryDomain": "" },
  "topRoleMatches": [{ "rank": 1, "role": "", "fitScore": 0, "fitTier": "Exceptional Fit|Strong Fit|Good Fit|Moderate Fit|Developing Fit", "withinCurrentTrack": true, "matchReason": "", "strengthAlignments": [{ "strength": "", "relevance": "" }], "dayInTheLife": "", "growthTip": "" }],
  "topRolesOutsideTrack": [{ "role": "", "fitScore": 0, "fitTier": "", "currentTrack": "", "naturalTrack": "", "explanation": "" }],
  "teamComplementarity": { "yourContribution": "", "seekInTeammates": [], "idealTeamComposition": "" },
  "developmentPlan": [{ "gap": "", "risk": "", "action": "" }],
  "quickSummary": ""
}`;

export async function analyzeStrengths(
  strengths: ExtractedStrengths,
  trackId: TrackId
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const track = TRACKS[trackId];
  if (!track) {
    throw new Error("Invalid track ID: " + trackId);
  }

  // Build the user message
  const strengthsText = strengths
    .map(function (s) {
      return s.rank + ". " + s.name + (s.description ? ": " + s.description : "");
    })
    .join("\n");

  const rolesText = ACCENTURE_ROLES.map(function (r) {
    return "- **" + r.name + "** [" + r.domain + "]: " + r.description + " (Key strengths: " + r.strengthsFit.join(", ") + ")";
  }).join("\n");

  const userMessage = [
    "My CliftonStrengths:",
    strengthsText,
    "",
    "My track: " + track.title,
    "",
    "The 27 roles:",
    rolesText,
  ].join("\n");

  // Token limit check
  if (userMessage.length > 50000) {
    throw new Error(
      "The input data is too large. Please try with fewer strengths."
    );
  }

  const result = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: SYSTEM_PROMPT + "\n\n---\n\n" + userMessage,
    config: {
      temperature: 1,
      maxOutputTokens: 40000,
      responseMimeType: "application/json",
    },
  });

  const text = result.text;

  if (!text) {
    throw new Error("Empty response from AI. Please try again.");
  }

  let parsed: AnalysisResult;
  try {
    let jsonText = text.trim();
    // Handle possible markdown code fence wrapping
    const fencePattern = /```(?:json)?\s*([\s\S]*?)```/;
    const jsonMatch = jsonText.match(fencePattern);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    parsed = JSON.parse(jsonText) as AnalysisResult;
  } catch {
    throw new Error(
      "Failed to parse AI response. The analysis may have been too complex. Please try again."
    );
  }

  // Validate essential fields
  if (
    !parsed.strengthDomains ||
    !parsed.topRoleMatches ||
    !parsed.teamComplementarity
  ) {
    throw new Error("The AI response was incomplete. Please try again.");
  }

  return parsed;
}
