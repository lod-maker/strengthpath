import { NextRequest, NextResponse } from "next/server";
import { parseGallupPDF } from "@/lib/parseGallupPDF";
import { extractStrengthsViaVision } from "@/lib/extractStrengthsVision";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is too large. Please upload a PDF under 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Try fast text parsing first (~1-2s, no API calls)
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

    // Fall back to vision only if text parsing found fewer than 5 strengths
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
        if (!strengths || strengths.length === 0) {
          return NextResponse.json(
            { error: "Failed to parse the PDF. Please check the file and try again." },
            { status: 422 }
          );
        }
      }
    }

    if (!strengths || strengths.length === 0) {
      return NextResponse.json(
        { error: "No CliftonStrengths were found in the PDF. Please upload your official Gallup report." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      strengths,
      name: extractedName || "Team Member",
      visionUsed,
    });
  } catch (err) {
    console.error("Extract API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
