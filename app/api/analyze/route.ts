import { NextRequest, NextResponse } from "next/server";
import { analyzeStrengths } from "@/lib/analyzeStrengths";
import { TrackId, ExtractedStrengths } from "@/lib/types";

const VALID_TRACKS: TrackId[] = [
  "tech_transformation",
  "tech_delivery",
  "modern_engineering",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strengths, name, trackId } = body as {
      strengths: ExtractedStrengths;
      name: string;
      trackId: string;
    };

    if (!strengths || !Array.isArray(strengths) || strengths.length === 0) {
      return NextResponse.json(
        { error: "No strengths provided for analysis." },
        { status: 400 }
      );
    }

    if (!trackId || !VALID_TRACKS.includes(trackId as TrackId)) {
      return NextResponse.json(
        { error: "Please select a valid career track." },
        { status: 400 }
      );
    }

    let analysis;
    try {
      analysis = await analyzeStrengths(
        strengths,
        trackId as TrackId,
        name || "Team Member"
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "AI analysis failed. Please try again.";

      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        return NextResponse.json(
          { error: "The AI service is currently busy. Please wait a moment and try again." },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
