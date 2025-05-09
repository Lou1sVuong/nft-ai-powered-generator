import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { artStyles } from "@/components/art-style-data";

// Khởi tạo OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateImageRequest {
  prompt: string;
  style: string;
  size: string;
  quality: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, size, quality } = await request.json() as GenerateImageRequest;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Map size to DALL-E dimensions
    const dimensions = {
      square: "1024x1024",
      portrait: "1024x1792",
      landscape: "1792x1024",
    }[size] || "1024x1024";

    // Map quality to DALL-E quality
    const qualitySetting = quality === "high" ? "hd" : "standard";

    // Find the selected style
    const selectedStyle = artStyles.find(s => s.id === style);
    const stylePrompt = selectedStyle ? `in ${selectedStyle.name} style` : "";
    const fullPrompt = `${prompt}${stylePrompt ? `, ${stylePrompt}` : ""}`;

    const response = await openai.images.generate({
      prompt: fullPrompt,
      n: 1,
      size: dimensions as "1024x1024" | "1024x1792" | "1792x1024",
      response_format: "b64_json",
    });

    if (!response.data?.[0]?.b64_json) {
      throw new Error("No image data received from OpenAI");
    }

    return NextResponse.json({
      image: `data:image/png;base64,${response.data[0].b64_json}`,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate image",
      },
      { status: 500 }
    );
  }
}
