import { NextRequest, NextResponse } from "next/server";
import { parseGallupPDF } from "@/lib/parseGallupPDF";
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
    const name = (formData.get("name") as string | null)?.trim() || "";

    // Validate inputs
    if (!name) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

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

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Step 1: Parse the PDF
    let strengths;
    try {
      strengths = await parseGallupPDF(buffer);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to parse the PDF. Please check the file and try again.";
      return NextResponse.json({ error: message }, { status: 422 });
    }

    if (strengths.length === 0) {
      return NextResponse.json(
        {
          error:
            "No CliftonStrengths were found in the PDF. Please upload your official Gallup report.",
        },
        { status: 422 }
      );
    }

    // Step 2: Analyze with Claude against all 27 roles
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
