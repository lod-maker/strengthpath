import { ExtractedStrengths } from "./types";

// Known Gallup CliftonStrengths themes (all 34)
const GALLUP_STRENGTHS = [
  "Achiever", "Activator", "Adaptability", "Analytical", "Arranger",
  "Belief", "Command", "Communication", "Competition", "Connectedness",
  "Consistency", "Context", "Deliberative", "Developer", "Discipline",
  "Empathy", "Focus", "Futuristic", "Harmony", "Ideation",
  "Includer", "Individualization", "Input", "Intellection", "Learner",
  "Maximizer", "Positivity", "Relator", "Responsibility", "Restorative",
  "Self-Assurance", "Significance", "Strategic", "Woo"
];

export async function parseGallupPDF(fileBuffer: Buffer): Promise<ExtractedStrengths> {
  // Dynamic import for pdf-parse (works better with Next.js server-side)
  const pdfParse = (await import("pdf-parse")).default;

  let pdfData;
  try {
    pdfData = await pdfParse(fileBuffer);
  } catch {
    throw new Error(
      "Failed to parse the uploaded file. Please make sure it is a valid PDF document."
    );
  }

  const text = pdfData.text;

  if (!text || text.trim().length < 50) {
    throw new Error(
      "The PDF appears to be empty or contains very little text. Please upload your Gallup CliftonStrengths PDF report."
    );
  }

  // Try to detect if this is a Gallup report
  const lowerText = text.toLowerCase();
  const isLikelyGallup =
    lowerText.includes("cliftonstrengths") ||
    lowerText.includes("strengthsfinder") ||
    lowerText.includes("gallup") ||
    lowerText.includes("signature theme") ||
    lowerText.includes("your top") ||
    lowerText.includes("dominant theme");

  // Count how many known strengths appear in the text
  const foundStrengths = GALLUP_STRENGTHS.filter((s) =>
    text.includes(s)
  );

  if (!isLikelyGallup && foundStrengths.length < 3) {
    throw new Error(
      "This doesn't appear to be a Gallup CliftonStrengths report. Please upload the PDF you received from Gallup after completing the CliftonStrengths assessment."
    );
  }

  const strengths: ExtractedStrengths = [];

  // ── Strategy 1: Look for numbered list patterns ──
  // Pattern: "1. Strategic" or "1  Strategic" etc.
  const numberedPattern = /(?:^|\n)\s*(\d{1,2})\s*[.\-\)]\s*([\w\-]+)/gm;
  let match;
  while ((match = numberedPattern.exec(text)) !== null) {
    const rank = parseInt(match[1]);
    const name = match[2].trim();
    if (GALLUP_STRENGTHS.includes(name) && rank >= 1 && rank <= 34) {
      if (!strengths.find((s) => s.name === name)) {
        strengths.push({ rank, name, description: "" });
      }
    }
  }

  // ── Strategy 2: Look for strengths by order of appearance ──
  if (strengths.length < 5) {
    const orderedMatches: { name: string; index: number }[] = [];
    for (const strength of GALLUP_STRENGTHS) {
      const idx = text.indexOf(strength);
      if (idx !== -1) {
        orderedMatches.push({ name: strength, index: idx });
      }
    }
    orderedMatches.sort((a, b) => a.index - b.index);

    let rank = 1;
    for (const m of orderedMatches) {
      if (!strengths.find((s) => s.name === m.name)) {
        strengths.push({ rank, name: m.name, description: "" });
        rank++;
      }
    }
  }

  // Sort by rank
  strengths.sort((a, b) => a.rank - b.rank);

  // Re-rank sequentially
  strengths.forEach((s, i) => {
    s.rank = i + 1;
  });

  // ── Extract descriptions ──
  for (const strength of strengths) {
    // Look for text following the strength name (typically the description paragraph)
    const nameIndex = text.indexOf(strength.name);
    if (nameIndex !== -1) {
      const afterName = text.substring(nameIndex + strength.name.length, nameIndex + strength.name.length + 500);
      // Get the first substantial paragraph after the name
      const descMatch = afterName.match(/[:\-—]?\s*([A-Z][^]*?)(?:\n\s*\n|\n\d+\s*[.\-)])/);
      if (descMatch) {
        strength.description = descMatch[1]
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 300);
      }
    }
  }

  if (strengths.length === 0) {
    throw new Error(
      "Could not extract any CliftonStrengths from the PDF. The file may be in an unsupported format. Please try uploading the official Gallup PDF report."
    );
  }

  // Return top strengths (up to 34, but typically 5 or 10)
  return strengths.slice(0, 34);
}
