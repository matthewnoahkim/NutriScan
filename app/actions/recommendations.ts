"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  calculateTotals,
  generateBasicRecommendations,
  MealRecommendation,
} from "@/lib/recommendations";
import { getTodayEntries } from "./entries";
import { getGoals } from "./goals";

export async function getRecommendations(): Promise<MealRecommendation[]> {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const [entries, goals] = await Promise.all([getTodayEntries(), getGoals()]);

  const totals = calculateTotals(entries);
  const recommendations = generateBasicRecommendations(totals, goals);

  return recommendations;
}

export async function getAIRecommendations(): Promise<MealRecommendation[]> {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const [entries, goals] = await Promise.all([getTodayEntries(), getGoals()]);

  if (!goals || !process.env.OPENAI_API_KEY) {
    return generateBasicRecommendations(calculateTotals(entries), goals);
  }

  const totals = calculateTotals(entries);
  const remainingBudget = (goals.budget_usd || 0) - totals.cost;

  const deficits = {
    calories: (goals.calories || 0) - totals.calories,
    protein: (goals.protein_g || 0) - totals.protein_g,
    carbs: (goals.carbs_g || 0) - totals.carbs_g,
    fat: (goals.fat_g || 0) - totals.fat_g,
    fiber: (goals.fiber_g || 0) - totals.fiber_g,
  };

  const excesses = {
    sugar: totals.sugar_g - (goals.sugar_g || 50),
    sodium: totals.sodium_mg - (goals.sodium_mg || 2300),
  };

  const prompt = `Given these nutritional deficits and excesses for today, recommend 3 meals:

Deficits (need more):
- Calories: ${Math.max(0, deficits.calories).toFixed(0)} kcal
- Protein: ${Math.max(0, deficits.protein).toFixed(0)}g
- Fiber: ${Math.max(0, deficits.fiber).toFixed(0)}g

Excesses (already over goal):
- Sugar: ${Math.max(0, excesses.sugar).toFixed(0)}g over
- Sodium: ${Math.max(0, excesses.sodium).toFixed(0)}mg over

Remaining budget: $${remainingBudget.toFixed(2)}

Provide 3 meal recommendations with:
1. Meal name
2. Brief description (ingredients)
3. Estimated calories, protein, fiber
4. Estimated cost per serving
5. Brief rationale

Return as JSON array with fields: name, description, estimatedCalories, estimatedProtein, estimatedFiber, estimatedCost, rationale`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition expert providing meal recommendations. Return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    const meals = parsed.meals || parsed.recommendations || [];

    return meals.slice(0, 3);
  } catch (error) {
    console.error("AI recommendation error:", error);
    return generateBasicRecommendations(totals, goals);
  }
}

