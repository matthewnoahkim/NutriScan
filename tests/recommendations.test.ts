import { describe, it, expect } from "vitest";
import {
  calculateTotals,
  calculateDeficits,
  generateBasicRecommendations,
} from "@/lib/recommendations";
import { FoodEntry, Goal } from "@prisma/client";

describe("Recommendations", () => {
  const mockEntries: FoodEntry[] = [
    {
      id: "1",
      userId: "user1",
      name: "Chicken",
      source: "manual",
      servingSize: "6 oz",
      servings: 1,
      price_usd: 5,
      calories: 280,
      protein_g: 53,
      carbs_g: 0,
      fat_g: 6,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 140,
      potassium_mg: 570,
      calcium_mg: 20,
      iron_mg: 1.2,
      ocrText: null,
      aiModel: null,
      capturedAt: new Date(),
    },
    {
      id: "2",
      userId: "user1",
      name: "Oatmeal",
      source: "manual",
      servingSize: "1 cup",
      servings: 2,
      price_usd: 2.5,
      calories: 310,
      protein_g: 11,
      carbs_g: 54,
      fat_g: 6,
      fiber_g: 8,
      sugar_g: 12,
      sodium_mg: 130,
      potassium_mg: 350,
      calcium_mg: 200,
      iron_mg: 3.5,
      ocrText: null,
      aiModel: null,
      capturedAt: new Date(),
    },
  ];

  const mockGoals: Goal = {
    id: "goal1",
    userId: "user1",
    calories: 2500,
    protein_g: 130,
    carbs_g: 250,
    fat_g: 70,
    fiber_g: 30,
    sugar_g: 50,
    sodium_mg: 2300,
    potassium_mg: 3500,
    calcium_mg: 1000,
    iron_mg: 18,
    budget_usd: 20,
    updatedAt: new Date(),
  };

  describe("calculateTotals", () => {
    it("should calculate total nutrients including servings multiplier", () => {
      const totals = calculateTotals(mockEntries);

      // Chicken (1 serving) + Oatmeal (2 servings)
      expect(totals.calories).toBe(280 + 310 * 2);
      expect(totals.protein_g).toBe(53 + 11 * 2);
      expect(totals.carbs_g).toBe(0 + 54 * 2);
      expect(totals.cost).toBe(5 + 2.5 * 2);
    });

    it("should handle empty entries", () => {
      const totals = calculateTotals([]);
      expect(totals.calories).toBe(0);
      expect(totals.protein_g).toBe(0);
    });
  });

  describe("calculateDeficits", () => {
    it("should calculate nutrient deficits", () => {
      const totals = calculateTotals(mockEntries);
      const deficits = calculateDeficits(totals, mockGoals);

      const calorieDeficit = deficits.find((d) => d.nutrient === "Calories");
      expect(calorieDeficit).toBeDefined();
      expect(calorieDeficit?.isExcess).toBe(false);
    });

    it("should identify excesses", () => {
      const highSodiumEntry: FoodEntry = {
        ...mockEntries[0],
        sodium_mg: 3000,
      };

      const totals = calculateTotals([highSodiumEntry]);
      const deficits = calculateDeficits(totals, mockGoals);

      const sodiumExcess = deficits.find((d) => d.nutrient === "Sodium");
      expect(sodiumExcess?.isExcess).toBe(true);
    });

    it("should return empty array when no goals set", () => {
      const totals = calculateTotals(mockEntries);
      const deficits = calculateDeficits(totals, null);

      expect(deficits).toEqual([]);
    });
  });

  describe("generateBasicRecommendations", () => {
    it("should recommend protein-rich foods when protein deficit exists", () => {
      const lowProteinEntries = mockEntries.filter((e) => e.name === "Oatmeal");
      const totals = calculateTotals(lowProteinEntries);
      const recommendations = generateBasicRecommendations(totals, mockGoals);

      const proteinRec = recommendations.find((r) =>
        r.rationale.toLowerCase().includes("protein")
      );
      expect(proteinRec).toBeDefined();
    });

    it("should recommend fiber-rich foods when fiber deficit exists", () => {
      const lowFiberEntries = mockEntries.filter((e) => e.name === "Chicken");
      const totals = calculateTotals(lowFiberEntries);
      const recommendations = generateBasicRecommendations(totals, mockGoals);

      const fiberRec = recommendations.find((r) =>
        r.rationale.toLowerCase().includes("fiber")
      );
      expect(fiberRec).toBeDefined();
    });

    it("should limit recommendations to 3", () => {
      const totals = calculateTotals([]);
      const recommendations = generateBasicRecommendations(totals, mockGoals);

      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it("should return empty array when no goals set", () => {
      const totals = calculateTotals(mockEntries);
      const recommendations = generateBasicRecommendations(totals, null);

      expect(recommendations).toEqual([]);
    });
  });
});

