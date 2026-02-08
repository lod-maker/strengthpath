import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ imageBase64: null });
    }

    const body = await request.json();
    const { moniker, dominantDomain, topFive } = body as {
      moniker?: string;
      dominantDomain?: string;
      topFive?: string[];
    };

    if (!moniker || !dominantDomain) {
      return NextResponse.json({ imageBase64: null });
    }

    const strengthsList = topFive?.join(", ") ?? "";

    const prompt = [
      `A minimalist abstract icon representing "${moniker}".`,
      `The icon should evoke ${dominantDomain} energy and themes of ${strengthsList}.`,
      `Style: flat design, geometric shapes, modern, dark purple background (#1a0a2e) with violet (#A100FF) and soft white accents.`,
      `Suitable as a small circular profile avatar. No text, no faces, no letters, no words.`,
      `Clean, simple, symbolic. Think app icon or logo mark.`,
    ].join(" ");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
      },
    });

    const generatedImages = response.generatedImages;
    if (!generatedImages || generatedImages.length === 0) {
      return NextResponse.json({ imageBase64: null });
    }

    const imageBytes = generatedImages[0].image?.imageBytes;
    if (!imageBytes) {
      return NextResponse.json({ imageBase64: null });
    }

    return NextResponse.json({ imageBase64: imageBytes });
  } catch (err) {
    console.error("Icon generation error:", err);
    return NextResponse.json({ imageBase64: null });
  }
}
