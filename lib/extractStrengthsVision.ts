import { GoogleGenAI } from "@google/genai";
import { ExtractedStrengths } from "./types";

// All 34 official CliftonStrengths theme names
const VALID_THEMES = [
  "Achiever", "Activator", "Adaptability", "Analytical", "Arranger",
  "Belief", "Command", "Communication", "Competition", "Connectedness",
  "Consistency", "Context", "Deliberative", "Developer", "Discipline",
  "Empathy", "Focus", "Futuristic", "Harmony", "Ideation",
  "Includer", "Individualization", "Input", "Intellection", "Learner",
  "Maximizer", "Positivity", "Relator", "Responsibility", "Restorative",
  "Self-Assurance", "Significance", "Strategic", "Woo",
];

// Domain mapping for validation
const THEME_DOMAINS: Record<string, string> = {
  Achiever: "Executing", Arranger: "Executing", Belief: "Executing",
  Consistency: "Executing", Deliberative: "Executing", Discipline: "Executing",
  Focus: "Executing", Responsibility: "Executing", Restorative: "Executing",
  Activator: "Influencing", Command: "Influencing", Communication: "Influencing",
  Competition: "Influencing", Maximizer: "Influencing", "Self-Assurance": "Influencing",
  Significance: "Influencing", Woo: "Influencing",
  Adaptability: "Relationship Building", Connectedness: "Relationship Building",
  Developer: "Relationship Building", Empathy: "Relationship Building",
  Harmony: "Relationship Building", Includer: "Relationship Building",
  Individualization: "Relationship Building", Positivity: "Relationship Building",
  Relator: "Relationship Building",
  Analytical: "Strategic Thinking", Context: "Strategic Thinking",
  Futuristic: "Strategic Thinking", Ideation: "Strategic Thinking",
  Input: "Strategic Thinking", Intellection: "Strategic Thinking",
  Learner: "Strategic Thinking", Strategic: "Strategic Thinking",
};

const EXTRACTION_PROMPT = `Extract ALL CliftonStrengths themes from this Gallup report.

Return ONLY valid JSON, no markdown, no backticks, no preamble:
{
  "candidateName": "the person's name if visible on the report, otherwise null",
  "themes": [
    { "rank": 1, "name": "Achiever", "domain": "Executing" },
    { "rank": 2, "name": "Strategic", "domain": "Strategic Thinking" }
  ]
}

Rules:
- Include ALL themes visible in the report, ranked from 1 to however many are shown (could be 5, 10, or 34)
- Use the exact official CliftonStrengths theme names
- Map each theme to its correct domain: Executing, Influencing, Relationship Building, or Strategic Thinking
- If the report shows the full 34, include all 34
- If it only shows top 5 or top 10, include only what's visible`;

interface VisionExtractionResult {
  strengths: ExtractedStrengths;
  extractedName: string;
}

export async function extractStrengthsViaVision(
  pdfBuffer: Buffer
): Promise<VisionExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const pdfBase64 = pdfBuffer.toString("base64");

  let text: string | undefined;
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64,
                },
              },
              { text: EXTRACTION_PROMPT },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 4000,
          responseMimeType: "application/json",
        },
      });
      text = result.text;
      if (text) break;
    } catch (err) {
      lastError = err;
      if (attempt < 1) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
    }
  }

  if (!text) {
    throw new Error(
      lastError instanceof Error
        ? lastError.message
        : "Failed to extract strengths via vision. Empty response."
    );
  }

  // Parse JSON response
  let parsed: { candidateName?: string | null; themes?: { rank: number; name: string; domain: string }[] };
  try {
    let jsonText = text.trim();
    const fencePattern = /```(?:json)?\s*([\s\S]*?)```/;
    const jsonMatch = jsonText.match(fencePattern);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Failed to parse vision extraction response as JSON.");
  }

  if (!parsed.themes || !Array.isArray(parsed.themes) || parsed.themes.length === 0) {
    throw new Error("No themes found in vision extraction response.");
  }

  // Validate theme names against the official list
  const validThemes = parsed.themes.filter((t) => VALID_THEMES.includes(t.name));
  const invalidCount = parsed.themes.length - validThemes.length;

  if (validThemes.length === 0) {
    throw new Error("Vision extraction returned no valid CliftonStrengths theme names.");
  }

  if (invalidCount > 0 && validThemes.length < 5) {
    throw new Error(
      `Vision extraction found ${invalidCount} unrecognised theme names and only ${validThemes.length} valid ones.`
    );
  }

  // Build ExtractedStrengths — correct domains from our mapping if needed
  const strengths: ExtractedStrengths = validThemes.map((t, i) => ({
    rank: t.rank || i + 1,
    name: t.name,
    description: "", // Vision extraction doesn't need descriptions — the analysis prompt generates its own
  }));

  // Sort by rank and re-rank sequentially
  strengths.sort((a, b) => a.rank - b.rank);
  strengths.forEach((s, i) => {
    s.rank = i + 1;
  });

  const extractedName =
    parsed.candidateName && typeof parsed.candidateName === "string"
      ? parsed.candidateName.trim()
      : "";

  return {
    strengths: strengths.slice(0, 34),
    extractedName,
  };
}
