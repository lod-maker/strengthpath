import { NextRequest, NextResponse } from "next/server";
import { parseGallupPDF } from "@/lib/parseGallupPDF";
import { extractStrengthsViaVision } from "@/lib/extractStrengthsVision";
import { analyzeStrengths } from "@/lib/analyzeStrengths";
import { TrackId } from "@/lib/types";

const VALID_TRACKS: TrackId[] = [
  "tech_transformation",
  "tech_delivery",
  "modern_engineering",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;
    const trackId = formData.get("trackId") as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: "No PDF file uploaded." },
        { status: 400 }
      );
    }

    if (!trackId || !VALID_TRACKS.includes(trackId as TrackId)) {
      return NextResponse.json(
        { error: "Please select a valid career track." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Please upload a PDF file." },
        { status: 400 }
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is too large. Please upload a PDF under 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Extract strengths — try fast text parsing first, fall back to vision
    let strengths;
    let extractedName = "";
    let visionUsed = false;

    try {
      const textResult = await parseGallupPDF(buffer);
      strengths = textResult.strengths;
      extractedName = textResult.extractedName;
    } catch (textErr) {
      console.warn(
        "Text parsing failed, trying vision extraction:",
        textErr instanceof Error ? textErr.message : textErr
      );
    }

    // If text parsing found fewer than 5 strengths, try vision extraction
    if (!strengths || strengths.length < 5) {
      try {
        const visionResult = await extractStrengthsViaVision(buffer);
        strengths = visionResult.strengths;
        extractedName = visionResult.extractedName || extractedName;
        visionUsed = true;
      } catch (visionErr) {
        console.warn(
          "Vision extraction also failed:",
          visionErr instanceof Error ? visionErr.message : visionErr
        );
        // If we have no strengths at all from either method, fail
        if (!strengths || strengths.length === 0) {
          return NextResponse.json(
            { error: "Failed to parse the PDF. Please check the file and try again." },
            { status: 422 }
          );
        }
      }
    }

    // Use extracted name or fallback to "Team Member"
    const name = extractedName || "Team Member";

    if (!strengths || strengths.length === 0) {
      return NextResponse.json(
        {
          error:
            "No CliftonStrengths were found in the PDF. Please upload your official Gallup report.",
        },
        { status: 422 }
      );
    }

    // Step 2: Analyze against all 28 roles (PDF no longer needed)
    let analysis;
    try {
      analysis = await analyzeStrengths(strengths, trackId as TrackId, name);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "AI analysis failed. Please try again.";

      // Check for rate limiting
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        return NextResponse.json(
          {
            error:
              "The AI service is currently busy. Please wait a moment and try again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      name,
      strengths,
      analysis,
      visionExtraction: visionUsed,
    });
  } catch (err) {
    console.error("Analysis API error:", err);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
