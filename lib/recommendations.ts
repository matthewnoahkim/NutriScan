import { FoodEntry, Goal } from "@prisma/client";

export interface NutrientTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  saturated_fat_g: number;
  cholesterol_mg: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  potassium_mg: number;
  calcium_mg: number;
  iron_mg: number;
  cost: number;
}

export interface NutrientDeficit {
  nutrient: string;
  deficit: number;
  unit: string;
  isExcess: boolean;
}

export function calculateTotals(entries: FoodEntry[]): NutrientTotals {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + (entry.calories || 0) * entry.servings,
      protein_g: totals.protein_g + (entry.protein_g || 0) * entry.servings,
      carbs_g: totals.carbs_g + (entry.carbs_g || 0) * entry.servings,
      fat_g: totals.fat_g + (entry.fat_g || 0) * entry.servings,
      saturated_fat_g: totals.saturated_fat_g + (entry.saturated_fat_g || 0) * entry.servings,
      cholesterol_mg: totals.cholesterol_mg + (entry.cholesterol_mg || 0) * entry.servings,
      fiber_g: totals.fiber_g + (entry.fiber_g || 0) * entry.servings,
      sugar_g: totals.sugar_g + (entry.sugar_g || 0) * entry.servings,
      sodium_mg: totals.sodium_mg + (entry.sodium_mg || 0) * entry.servings,
      potassium_mg:
        totals.potassium_mg + (entry.potassium_mg || 0) * entry.servings,
      calcium_mg: totals.calcium_mg + (entry.calcium_mg || 0) * entry.servings,
      iron_mg: totals.iron_mg + (entry.iron_mg || 0) * entry.servings,
      cost: totals.cost + (entry.price_usd || 0) * entry.servings,
    }),
    {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      saturated_fat_g: 0,
      cholesterol_mg: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
      potassium_mg: 0,
      calcium_mg: 0,
      iron_mg: 0,
      cost: 0,
    }
  );
}

export function calculateDeficits(
  totals: NutrientTotals,
  goals: Goal | null
): NutrientDeficit[] {
  if (!goals) return [];

  const deficits: NutrientDeficit[] = [];

  if (goals.calories) {
    const deficit = goals.calories - totals.calories;
    deficits.push({
      nutrient: "Calories",
      deficit: Math.abs(deficit),
      unit: "kcal",
      isExcess: deficit < 0,
    });
  }

  if (goals.protein_g) {
    const deficit = goals.protein_g - totals.protein_g;
    deficits.push({
      nutrient: "Protein",
      deficit: Math.abs(deficit),
      unit: "g",
      isExcess: deficit < 0,
    });
  }

  if (goals.carbs_g) {
    const deficit = goals.carbs_g - totals.carbs_g;
    deficits.push({
      nutrient: "Carbs",
      deficit: Math.abs(deficit),
      unit: "g",
      isExcess: deficit < 0,
    });
  }

  if (goals.fat_g) {
    const deficit = goals.fat_g - totals.fat_g;
    deficits.push({
      nutrient: "Fat",
      deficit: Math.abs(deficit),
      unit: "g",
      isExcess: deficit < 0,
    });
  }

  if (goals.saturated_fat_g) {
    const deficit = goals.saturated_fat_g - totals.saturated_fat_g;
    if (deficit < 0) {
      deficits.push({
        nutrient: "Saturated Fat",
        deficit: Math.abs(deficit),
        unit: "g",
        isExcess: true,
      });
    }
  }

  if (goals.cholesterol_mg) {
    const deficit = goals.cholesterol_mg - totals.cholesterol_mg;
    if (deficit < 0) {
      deficits.push({
        nutrient: "Cholesterol",
        deficit: Math.abs(deficit),
        unit: "mg",
        isExcess: true,
      });
    }
  }

  if (goals.fiber_g) {
    const deficit = goals.fiber_g - totals.fiber_g;
    deficits.push({
      nutrient: "Dietary Fiber",
      deficit: Math.abs(deficit),
      unit: "g",
      isExcess: deficit < 0,
    });
  }

  if (goals.sugar_g) {
    const deficit = goals.sugar_g - totals.sugar_g;
    if (deficit < 0) {
      deficits.push({
        nutrient: "Added Sugars",
        deficit: Math.abs(deficit),
        unit: "g",
        isExcess: true,
      });
    }
  }

  if (goals.sodium_mg) {
    const deficit = goals.sodium_mg - totals.sodium_mg;
    if (deficit < 0) {
      deficits.push({
        nutrient: "Sodium",
        deficit: Math.abs(deficit),
        unit: "mg",
        isExcess: true,
      });
    }
  }

  return deficits.filter((d) => d.deficit > 0.1);
}

export interface MealRecommendation {
  name: string;
  description: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedFiber: number;
  estimatedCost: number;
  rationale: string;
}

export function generateBasicRecommendations(
  totals: NutrientTotals,
  goals: Goal | null
): MealRecommendation[] {
  if (!goals) return [];

  const recommendations: MealRecommendation[] = [];
  const remainingBudget = (goals.budget_usd || 0) - totals.cost;

  // Calculate deficits
  const proteinDeficit = (goals.protein_g || 0) - totals.protein_g;
  const fiberDeficit = (goals.fiber_g || 0) - totals.fiber_g;
  const calorieDeficit = (goals.calories || 0) - totals.calories;

  // Recommend protein if deficit
  if (proteinDeficit > 20 && remainingBudget > 3) {
    recommendations.push({
      name: "Grilled Chicken Breast",
      description: "6 oz grilled chicken breast with herbs",
      estimatedCalories: 280,
      estimatedProtein: 53,
      estimatedFiber: 0,
      estimatedCost: 4.5,
      rationale: `Helps meet your protein goal (${proteinDeficit.toFixed(0)}g remaining)`,
    });
  }

  // Recommend fiber if deficit
  if (fiberDeficit > 10 && remainingBudget > 2) {
    recommendations.push({
      name: "Black Bean Salad",
      description: "Mixed greens with black beans, corn, and avocado",
      estimatedCalories: 320,
      estimatedProtein: 15,
      estimatedFiber: 14,
      estimatedCost: 3.5,
      rationale: `High in fiber to help meet your goal (${fiberDeficit.toFixed(0)}g remaining)`,
    });
  }

  // Recommend balanced meal if calorie deficit
  if (calorieDeficit > 400 && remainingBudget > 5) {
    recommendations.push({
      name: "Salmon with Quinoa and Vegetables",
      description: "Baked salmon fillet with quinoa and roasted vegetables",
      estimatedCalories: 520,
      estimatedProtein: 38,
      estimatedFiber: 8,
      estimatedCost: 7.5,
      rationale: `Balanced meal to help reach your calorie goal (${calorieDeficit.toFixed(0)} kcal remaining)`,
    });
  }

  // If sodium excess, recommend low-sodium option
  const sodiumExcess = totals.sodium_mg - (goals.sodium_mg || 2300);
  if (sodiumExcess > 500 && remainingBudget > 2) {
    recommendations.push({
      name: "Fresh Fruit Bowl",
      description: "Mixed berries, melon, and citrus fruits",
      estimatedCalories: 150,
      estimatedProtein: 2,
      estimatedFiber: 6,
      estimatedCost: 3.0,
      rationale: "Low-sodium option to balance your daily intake",
    });
  }

  return recommendations.slice(0, 3);
}

