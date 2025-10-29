import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 503 }
      );
    }

    const { imageBase64, ocrResult } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const prompt = ocrResult
      ? `I performed OCR on this nutrition label and got the following results:
${JSON.stringify(ocrResult, null, 2)}

Please analyze the nutrition label in the image and:
1. Correct any OCR errors
2. Fill in any missing values you can see
3. Provide accurate nutrition information per serving

Return the data in this exact JSON format:
{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "saturated_fat_g": number,
  "cholesterol_mg": number,
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number,
  "potassium_mg": number,
  "calcium_mg": number,
  "iron_mg": number,
  "servingSize": string (e.g., "1 cup (230g)"),
  "confidence": number (0-1)
}`
      : `Please analyze the nutrition label in this image and extract all nutrition facts per serving.

Return the data in this exact JSON format:
{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "saturated_fat_g": number,
  "cholesterol_mg": number,
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number,
  "potassium_mg": number,
  "calcium_mg": number,
  "iron_mg": number,
  "servingSize": string (e.g., "1 cup (230g)"),
  "confidence": number (0-1, based on image quality)
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition label analyzer. Extract nutrition facts accurately from images. Return only valid JSON.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: `OpenAI API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse JSON from response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      hasNutritionFacts: true,
      confidence: parsed.confidence || 0.8,
      rawText: content,
      servingSize: parsed.servingSize,
      calories: parsed.calories,
      protein_g: parsed.protein_g,
      carbs_g: parsed.carbs_g,
      fat_g: parsed.fat_g,
      saturated_fat_g: parsed.saturated_fat_g,
      cholesterol_mg: parsed.cholesterol_mg,
      fiber_g: parsed.fiber_g,
      sugar_g: parsed.sugar_g,
      sodium_mg: parsed.sodium_mg,
      potassium_mg: parsed.potassium_mg,
      calcium_mg: parsed.calcium_mg,
      iron_mg: parsed.iron_mg,
    });
  } catch (error) {
    console.error("AI enhancement error:", error);
    return NextResponse.json(
      {
        error: "Failed to enhance with AI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

