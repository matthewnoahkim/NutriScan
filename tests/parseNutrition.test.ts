import { describe, it, expect } from "vitest";
import {
  parseNutritionFromOCR,
  extractServingSize,
} from "@/lib/ocr/parseNutrition";

describe("OCR Nutrition Parser", () => {
  describe("parseNutritionFromOCR", () => {
    it("should detect nutrition facts header", () => {
      const ocrText = `
        Nutrition Facts
        Serving Size 1 cup (228g)
        Calories 200
        Protein 10g
      `;

      const result = parseNutritionFromOCR(ocrText);
      expect(result.hasNutritionFacts).toBe(true);
    });

    it("should parse calories", () => {
      const ocrText = `
        Nutrition Facts
        Calories 250
      `;

      const result = parseNutritionFromOCR(ocrText);
      expect(result.calories).toBe(250);
    });

    it("should parse protein in grams", () => {
      const ocrText = `
        Nutrition Facts
        Protein 15g
      `;

      const result = parseNutritionFromOCR(ocrText);
      expect(result.protein_g).toBe(15);
    });

    it("should parse carbohydrates", () => {
      const ocrText = `
        Nutrition Facts
        Total Carbohydrate 30g
      `;

      const result = parseNutritionFromOCR(ocrText);
      expect(result.carbs_g).toBe(30);
    });

    it("should parse fat", () => {
      const ocrText = `
        Nutrition Facts
        Total Fat 8g
      `;

      const result = parseNutritionFromOCR(ocrText);
      expect(result.fat_g).toBe(8);
    });

    it("should parse sodium in milligrams", () => {
      const ocrText = `
        Nutrition Facts
        Sodium 500mg
      `;

      const result = parseNutritionFromOCR(ocrText);
      expect(result.sodium_mg).toBe(500);
    });

    it("should calculate confidence based on fields found", () => {
      const completeLabel = `
        Nutrition Facts
        Calories 200
        Protein 10g
        Total Carbohydrate 25g
        Total Fat 5g
        Fiber 3g
        Sugars 8g
        Sodium 300mg
        Potassium 400mg
        Calcium 150mg
        Iron 2mg
      `;

      const result = parseNutritionFromOCR(completeLabel);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("should have lower confidence without header", () => {
      const noHeader = `
        Calories 200
        Protein 10g
      `;

      const result = parseNutritionFromOCR(noHeader);
      expect(result.hasNutritionFacts).toBe(false);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe("extractServingSize", () => {
    it("should extract serving size from text", () => {
      const ocrText = `
        Nutrition Facts
        Serving Size: 1 cup (228g)
      `;

      const result = extractServingSize(ocrText);
      expect(result).toBe("1 cup (228g)");
    });

    it("should return null if serving size not found", () => {
      const ocrText = `
        Nutrition Facts
        Calories 200
      `;

      const result = extractServingSize(ocrText);
      expect(result).toBe(null);
    });
  });
});

