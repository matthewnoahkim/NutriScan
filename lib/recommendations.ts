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
  if (!goals) return getDefaultMeals();

  const recommendations: MealRecommendation[] = [];
  const remainingBudget = (goals.budget_usd || 0) - totals.cost;

  // Calculate deficits
  const proteinDeficit = (goals.protein_g || 0) - totals.protein_g;
  const fiberDeficit = (goals.fiber_g || 0) - totals.fiber_g;
  const calorieDeficit = (goals.calories || 0) - totals.calories;

  // Protein-rich meals
  if (proteinDeficit > 20 && remainingBudget > 3) {
    recommendations.push(
      {
        name: "Grilled Chicken Breast with Brown Rice",
        description: "6 oz grilled chicken breast, 1 cup brown rice, steamed broccoli",
        estimatedCalories: 420,
        estimatedProtein: 53,
        estimatedFiber: 4,
        estimatedCost: 5.5,
        rationale: `High protein to meet your goal (${proteinDeficit.toFixed(0)}g remaining)`,
      },
      {
        name: "Tuna Salad Bowl",
        description: "Canned tuna, mixed greens, cherry tomatoes, olive oil",
        estimatedCalories: 280,
        estimatedProtein: 30,
        estimatedFiber: 3,
        estimatedCost: 3.5,
        rationale: "Budget-friendly high-protein meal",
      },
      {
        name: "Greek Yogurt Parfait",
        description: "Plain Greek yogurt, berries, granola, honey",
        estimatedCalories: 320,
        estimatedProtein: 20,
        estimatedFiber: 5,
        estimatedCost: 3.0,
        rationale: "Protein-rich breakfast or snack",
      }
    );
  }

  // Fiber-rich meals
  if (fiberDeficit > 10 && remainingBudget > 2) {
    recommendations.push(
      {
        name: "Black Bean and Sweet Potato Bowl",
        description: "Black beans, roasted sweet potato, quinoa, avocado",
        estimatedCalories: 380,
        estimatedProtein: 15,
        estimatedFiber: 16,
        estimatedCost: 4.0,
        rationale: `Excellent fiber source (${fiberDeficit.toFixed(0)}g remaining)`,
      },
      {
        name: "Oatmeal with Fruit and Nuts",
        description: "Steel-cut oats, banana, berries, almonds, cinnamon",
        estimatedCalories: 350,
        estimatedProtein: 10,
        estimatedFiber: 10,
        estimatedCost: 2.5,
        rationale: "High-fiber breakfast to meet your goal",
      },
      {
        name: "Lentil Vegetable Soup",
        description: "Lentils, carrots, celery, tomatoes, spinach",
        estimatedCalories: 280,
        estimatedProtein: 18,
        estimatedFiber: 12,
        estimatedCost: 3.0,
        rationale: "Budget-friendly fiber and protein",
      }
    );
  }

  // Balanced meals
  recommendations.push(
    {
      name: "Salmon with Quinoa and Vegetables",
      description: "Baked salmon, quinoa, roasted Brussels sprouts, lemon",
      estimatedCalories: 520,
      estimatedProtein: 38,
      estimatedFiber: 8,
      estimatedCost: 7.5,
      rationale: "Balanced omega-3 rich meal",
    },
    {
      name: "Turkey and Veggie Stir-Fry",
      description: "Ground turkey, bell peppers, snap peas, brown rice, soy sauce",
      estimatedCalories: 410,
      estimatedProtein: 32,
      estimatedFiber: 5,
      estimatedCost: 5.0,
      rationale: "Quick and nutritious dinner",
    },
    {
      name: "Egg and Veggie Scramble",
      description: "3 eggs, spinach, tomatoes, mushrooms, whole wheat toast",
      estimatedCalories: 320,
      estimatedProtein: 24,
      estimatedFiber: 6,
      estimatedCost: 2.5,
      rationale: "Affordable complete breakfast",
    },
    {
      name: "Chicken and Bean Burrito Bowl",
      description: "Chicken breast, pinto beans, rice, salsa, lettuce, cheese",
      estimatedCalories: 480,
      estimatedProtein: 36,
      estimatedFiber: 10,
      estimatedCost: 5.5,
      rationale: "Satisfying and nutritious meal",
    }
  );

  return recommendations.slice(0, 10);
}

function getDefaultMeals(): MealRecommendation[] {
  return [
    {
      name: "Grilled Chicken Breast with Brown Rice",
      description: "6 oz grilled chicken breast, 1 cup brown rice, steamed broccoli",
      estimatedCalories: 420,
      estimatedProtein: 53,
      estimatedFiber: 4,
      estimatedCost: 5.5,
      rationale: "High-protein balanced meal",
    },
    {
      name: "Black Bean and Sweet Potato Bowl",
      description: "Black beans, roasted sweet potato, quinoa, avocado",
      estimatedCalories: 380,
      estimatedProtein: 15,
      estimatedFiber: 16,
      estimatedCost: 4.0,
      rationale: "Plant-based fiber-rich option",
    },
    {
      name: "Salmon with Quinoa and Vegetables",
      description: "Baked salmon, quinoa, roasted Brussels sprouts, lemon",
      estimatedCalories: 520,
      estimatedProtein: 38,
      estimatedFiber: 8,
      estimatedCost: 7.5,
      rationale: "Omega-3 rich balanced meal",
    },
    {
      name: "Tuna Salad Bowl",
      description: "Canned tuna, mixed greens, cherry tomatoes, olive oil",
      estimatedCalories: 280,
      estimatedProtein: 30,
      estimatedFiber: 3,
      estimatedCost: 3.5,
      rationale: "Budget-friendly protein source",
    },
    {
      name: "Turkey and Veggie Stir-Fry",
      description: "Ground turkey, bell peppers, snap peas, brown rice, soy sauce",
      estimatedCalories: 410,
      estimatedProtein: 32,
      estimatedFiber: 5,
      estimatedCost: 5.0,
      rationale: "Quick nutritious dinner",
    },
    {
      name: "Egg and Veggie Scramble",
      description: "3 eggs, spinach, tomatoes, mushrooms, whole wheat toast",
      estimatedCalories: 320,
      estimatedProtein: 24,
      estimatedFiber: 6,
      estimatedCost: 2.5,
      rationale: "Complete breakfast option",
    },
    {
      name: "Greek Yogurt Parfait",
      description: "Plain Greek yogurt, berries, granola, honey",
      estimatedCalories: 320,
      estimatedProtein: 20,
      estimatedFiber: 5,
      estimatedCost: 3.0,
      rationale: "Protein-rich breakfast",
    },
    {
      name: "Lentil Vegetable Soup",
      description: "Lentils, carrots, celery, tomatoes, spinach",
      estimatedCalories: 280,
      estimatedProtein: 18,
      estimatedFiber: 12,
      estimatedCost: 3.0,
      rationale: "Budget-friendly complete meal",
    },
    {
      name: "Chicken and Bean Burrito Bowl",
      description: "Chicken breast, pinto beans, rice, salsa, lettuce, cheese",
      estimatedCalories: 480,
      estimatedProtein: 36,
      estimatedFiber: 10,
      estimatedCost: 5.5,
      rationale: "Satisfying balanced meal",
    },
    {
      name: "Oatmeal with Fruit and Nuts",
      description: "Steel-cut oats, banana, berries, almonds, cinnamon",
      estimatedCalories: 350,
      estimatedProtein: 10,
      estimatedFiber: 10,
      estimatedCost: 2.5,
      rationale: "High-fiber breakfast",
    },
  ];
}

