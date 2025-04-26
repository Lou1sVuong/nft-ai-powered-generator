import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Khởi tạo OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateImageRequest {
  prompt: string;
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
  size?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Đọc dữ liệu từ request body
    const data = await request.json() as GenerateImageRequest;
    const { prompt, size = 'square' } = data;
    console.log("prompt", prompt);
    
    // Dynamically set size based on user selection
    let imageSize = '1024x1024'; // Default square
    
    if (size === 'portrait') {
      imageSize = '1024x1792';
    } else if (size === 'landscape') {
      imageSize = '1792x1024';
    } else if (size === 'wide') {
      imageSize = '1792x1024';
    }

    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt content is required' },
        { status: 400 }
      );
    }

    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: imageSize as '1024x1024' | '1792x1024' | '1024x1792',
      response_format: "b64_json",
    });

    console.log("response", response);
    const imageData = response.data?.[0].b64_json;

    if (!imageData) {
      throw new Error('No image data received from OpenAI');
    }

    return NextResponse.json({
      success: true,
      image: imageData,
      prompt,
    });

  } catch (error: unknown) {
    console.error('Error generating image:', error);
    
    // Log more details if it's an OpenAI error
    if (typeof error === 'object' && error !== null && 'response' in error) {
      console.error('OpenAI API error details:', JSON.stringify(error, null, 2));
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      { message: 'Error generating image', error: errorMessage },
      { status: 500 }
    );
  }
}
