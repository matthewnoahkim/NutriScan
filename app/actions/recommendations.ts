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

export async function getShoppingListData() {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return {
      remainingBudget: 0,
      deficitNutrients: [],
      plannedMeals: [],
    };
  }

  // Get planned meals for the next 7 days
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  endDate.setHours(23, 59, 59, 999);

  const [entries, goals, plannedMeals] = await Promise.all([
    getTodayEntries(),
    getGoals(),
    prisma.plannedMeal.findMany({
      where: {
        userId: user.id,
        plannedFor: {
          gte: startDate,
          lte: endDate,
        },
        isCompleted: false,
      },
      orderBy: { plannedFor: "asc" },
    }),
  ]);

  const totals = calculateTotals(entries);
  const remainingBudget = Math.max(0, (goals?.budget_usd || 0) - totals.cost);

  // Identify deficit nutrients
  const deficitNutrients: string[] = [];
  
  if (goals?.protein_g && totals.protein_g < goals.protein_g) {
    deficitNutrients.push("Protein");
  }
  if (goals?.fiber_g && totals.fiber_g < goals.fiber_g) {
    deficitNutrients.push("Fiber");
  }
  if (goals?.calcium_mg && totals.calcium_mg < goals.calcium_mg) {
    deficitNutrients.push("Calcium");
  }
  if (goals?.iron_mg && totals.iron_mg < goals.iron_mg) {
    deficitNutrients.push("Iron");
  }
  if (goals?.potassium_mg && totals.potassium_mg < goals.potassium_mg) {
    deficitNutrients.push("Potassium");
  }

  // Extract ingredients from planned meals
  const ingredients = extractIngredientsFromMeals(
    plannedMeals.map(meal => ({
      name: meal.name,
      description: meal.description || "",
    }))
  );

  // Create shopping list from ingredients
  const shoppingIngredients = Array.from(new Set(
    Array.from(ingredients.values()).flat()
  ));

  return {
    remainingBudget,
    deficitNutrients,
    plannedMeals: plannedMeals.map(meal => ({
      id: meal.id,
      name: meal.name,
      date: meal.plannedFor,
      ingredients: meal.description || "",
    })),
    shoppingIngredients,
  };
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

  const prompt = `Given these nutritional deficits and excesses for today, recommend 10 diverse meals:

Deficits (need more):
- Calories: ${Math.max(0, deficits.calories).toFixed(0)} kcal
- Protein: ${Math.max(0, deficits.protein).toFixed(0)}g
- Fiber: ${Math.max(0, deficits.fiber).toFixed(0)}g

Excesses (already over goal):
- Sugar: ${Math.max(0, excesses.sugar).toFixed(0)}g over
- Sodium: ${Math.max(0, excesses.sodium).toFixed(0)}mg over

Remaining budget: $${remainingBudget.toFixed(2)}

Provide 10 diverse meal recommendations including breakfast, lunch, dinner, and snacks with:
1. Meal name
2. Brief description listing main ingredients
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

    return meals.slice(0, 10);
  } catch (error) {
    console.error("AI recommendation error:", error);
    return generateBasicRecommendations(totals, goals);
  }
}

// Extract ingredients from meal descriptions for shopping list (helper function)
function extractIngredientsFromMeals(meals: { name: string; description: string }[]) {
  const ingredientMap = new Map<string, string[]>();

  meals.forEach((meal) => {
    // Extract ingredients from description
    const description = meal.description.toLowerCase();
    const ingredients: string[] = [];

    // Common ingredient keywords
    const ingredientKeywords = {
      "chicken": "Chicken Breast",
      "turkey": "Ground Turkey",
      "salmon": "Salmon Fillet",
      "tuna": "Canned Tuna",
      "eggs": "Eggs",
      "yogurt": "Greek Yogurt",
      "black beans": "Black Beans",
      "pinto beans": "Pinto Beans",
      "lentils": "Lentils",
      "quinoa": "Quinoa",
      "brown rice": "Brown Rice",
      "rice": "Rice",
      "oats": "Rolled Oats",
      "sweet potato": "Sweet Potatoes",
      "broccoli": "Broccoli",
      "spinach": "Spinach",
      "bell pepper": "Bell Peppers",
      "tomato": "Tomatoes",
      "carrot": "Carrots",
      "avocado": "Avocado",
      "banana": "Bananas",
      "berries": "Mixed Berries",
      "greens": "Salad Greens",
      "cheese": "Cheese",
      "milk": "Milk",
      "almonds": "Almonds",
      "granola": "Granola",
    };

    Object.entries(ingredientKeywords).forEach(([keyword, ingredient]) => {
      if (description.includes(keyword)) {
        ingredients.push(ingredient);
      }
    });

    if (ingredients.length > 0) {
      ingredientMap.set(meal.name, ingredients);
    }
  });

  return ingredientMap;
}

