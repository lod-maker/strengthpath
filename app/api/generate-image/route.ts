import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { moniker, dominantDomain, topFive } = await req.json();

    if (!moniker || !dominantDomain || !topFive) {
      return NextResponse.json(
        { error: "Missing required fields: moniker, dominantDomain, topFive" },
        { status: 400 }
      );
    }

    const domainName =
      typeof dominantDomain === "string"
        ? dominantDomain
        : dominantDomain?.name || "Unknown Domain";

    const topFiveString = Array.isArray(topFive) ? topFive.join(", ") : topFive;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Create a minimalist, abstract, professional illustration representing a persona called '${moniker}'. Their dominant strength is '${domainName}' and their top strengths are ${topFiveString}. Style: modern, dark theme compatible, abstract geometric shapes, Accenture brand colors (purple #A100FF, blue, black), no text, no words, no letters.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    // Check for image data in the response
    const candidates = result.candidates;
    if (!candidates || candidates.length === 0) {
        console.error("No candidates returned from the model. Result:", JSON.stringify(result, null, 2));
        throw new Error("No candidates returned from the model.");
    }

    const firstCandidate = candidates[0];
    const parts = firstCandidate.content?.parts;
    
    if (!parts || parts.length === 0) {
         throw new Error("No content parts returned from the model.");
    }

    let base64Image = "";
    
    // Look for inlineData in parts
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
        // If no image found, log the response structure for debugging (optional)
        console.error("Model response did not contain inlineData image:", JSON.stringify(result, null, 2));
        throw new Error("Failed to generate image: No image data received.");
    }

    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ imageUrl: dataUrl });

  } catch (error: any) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: error.message },
      { status: 500 }
    );
  }
}
