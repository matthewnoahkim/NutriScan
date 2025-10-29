import { z } from "zod";

// Nutrition schema shared across client and server
export const nutritionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  servingSize: z.string().optional(),
  servings: z.number().positive().default(1),
  price_usd: z.number().nonnegative().optional(),
  calories: z.number().nonnegative().optional(),
  protein_g: z.number().nonnegative().optional(),
  carbs_g: z.number().nonnegative().optional(),
  fat_g: z.number().nonnegative().optional(),
  saturated_fat_g: z.number().nonnegative().optional(),
  fiber_g: z.number().nonnegative().optional(),
  sugar_g: z.number().nonnegative().optional(),
  cholesterol_mg: z.number().nonnegative().optional(),
  sodium_mg: z.number().nonnegative().optional(),
  potassium_mg: z.number().nonnegative().optional(),
  calcium_mg: z.number().nonnegative().optional(),
  iron_mg: z.number().nonnegative().optional(),
});

export type NutritionData = z.infer<typeof nutritionSchema>;

// Goals schema
export const goalsSchema = z.object({
  calories: z.number().int().positive().optional(),
  protein_g: z.number().positive().optional(),
  carbs_g: z.number().positive().optional(),
  fat_g: z.number().positive().optional(),
  saturated_fat_g: z.number().positive().optional(),
  fiber_g: z.number().positive().optional(),
  sugar_g: z.number().positive().optional(),
  cholesterol_mg: z.number().positive().optional(),
  sodium_mg: z.number().positive().optional(),
  potassium_mg: z.number().positive().optional(),
  calcium_mg: z.number().positive().optional(),
  iron_mg: z.number().positive().optional(),
  budget_usd: z.number().positive().optional(),
});

export type GoalsData = z.infer<typeof goalsSchema>;

// AI estimation schema
export const aiEstimationSchema = z.object({
  name: z.string(),
  servingSize: z.string(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  saturated_fat_g: z.number().optional(),
  fiber_g: z.number().optional(),
  sugar_g: z.number().optional(),
  cholesterol_mg: z.number().optional(),
  sodium_mg: z.number().optional(),
  potassium_mg: z.number().optional(),
  calcium_mg: z.number().optional(),
  iron_mg: z.number().optional(),
  confidence: z.number().min(0).max(1),
});

export type AIEstimation = z.infer<typeof aiEstimationSchema>;

