import { ParsedNutrition } from "./parseNutrition";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

/**
 * Enhance OCR results using GPT-4 Vision
 * This can correct mistakes, fill in missing values, and improve confidence
 */
export async function enhanceNutritionWithVision(
  imageBase64: string,
  ocrResult?: ParsedNutrition
): Promise<ParsedNutrition> {
  if (!OPENAI_API_KEY) {
    console.log("No OpenAI API key found, skipping AI enhancement");
    throw new Error("OPENAI_API_KEY not configured");
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
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number,
  "potassium_mg": number,
  "calcium_mg": number,
  "iron_mg": number,
  "servingSize": string (e.g., "1 cup (230g)"),
  "confidence": number (0-1, based on image quality)
}`;

  try {
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
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      hasNutritionFacts: true,
      confidence: parsed.confidence || 0.8,
      rawText: content,
      servingSize: parsed.servingSize,
      calories: parsed.calories,
      protein_g: parsed.protein_g,
      carbs_g: parsed.carbs_g,
      fat_g: parsed.fat_g,
      fiber_g: parsed.fiber_g,
      sugar_g: parsed.sugar_g,
      sodium_mg: parsed.sodium_mg,
      potassium_mg: parsed.potassium_mg,
      calcium_mg: parsed.calcium_mg,
      iron_mg: parsed.iron_mg,
    };
  } catch (error) {
    console.error("AI enhancement error:", error);
    throw error;
  }
}

