import { AIEstimation } from "../schemas";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface EstimateNutritionParams {
  name: string;
  brand?: string;
  servingSize?: string;
}

/**
 * Estimate nutrition using OpenAI function calling
 */
export async function estimateNutrition(
  params: EstimateNutritionParams
): Promise<AIEstimation> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const prompt = `Estimate the nutritional information for the following food item per serving:
  
Name: ${params.name}
${params.brand ? `Brand: ${params.brand}` : ""}
${params.servingSize ? `Serving Size: ${params.servingSize}` : "Serving Size: 1 typical serving"}

Provide accurate estimates based on USDA nutritional databases and common nutritional values for this food. If a serving size is not specified, use a typical serving size for this food item.

Be as accurate as possible and provide your confidence level (0-1) based on how specific the food description is.`;

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
            "You are a nutrition expert. Provide accurate nutritional estimates based on USDA data and common food databases.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      functions: [
        {
          name: "estimate_nutrition",
          description: "Estimate nutrition per serving for a named food item.",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The food name",
              },
              servingSize: {
                type: "string",
                description: "The serving size (e.g., '1 cup (228g)')",
              },
              calories: {
                type: "number",
                description: "Calories per serving",
              },
              protein_g: {
                type: "number",
                description: "Protein in grams",
              },
              carbs_g: {
                type: "number",
                description: "Carbohydrates in grams",
              },
              fat_g: {
                type: "number",
                description: "Fat in grams",
              },
              fiber_g: {
                type: "number",
                description: "Fiber in grams",
              },
              sugar_g: {
                type: "number",
                description: "Sugar in grams",
              },
              sodium_mg: {
                type: "number",
                description: "Sodium in milligrams",
              },
              potassium_mg: {
                type: "number",
                description: "Potassium in milligrams",
              },
              calcium_mg: {
                type: "number",
                description: "Calcium in milligrams",
              },
              iron_mg: {
                type: "number",
                description: "Iron in milligrams",
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description:
                  "Confidence level (0-1) based on food description specificity",
              },
            },
            required: [
              "name",
              "servingSize",
              "calories",
              "protein_g",
              "carbs_g",
              "fat_g",
              "confidence",
            ],
          },
        },
      ],
      function_call: { name: "estimate_nutrition" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const functionCall = data.choices[0]?.message?.function_call;

  if (!functionCall || functionCall.name !== "estimate_nutrition") {
    throw new Error("OpenAI did not return a function call");
  }

  const result = JSON.parse(functionCall.arguments);

  return {
    name: result.name || params.name,
    servingSize: result.servingSize || "1 serving",
    calories: result.calories,
    protein_g: result.protein_g,
    carbs_g: result.carbs_g,
    fat_g: result.fat_g,
    fiber_g: result.fiber_g,
    sugar_g: result.sugar_g,
    sodium_mg: result.sodium_mg,
    potassium_mg: result.potassium_mg,
    calcium_mg: result.calcium_mg,
    iron_mg: result.iron_mg,
    confidence: result.confidence,
  };
}

