import { describe, it, expect } from "vitest";
import {
  kjToKcal,
  mgToG,
  gToMg,
  normalizeText,
  parseNutritionNumber,
  detectUnit,
  toStandardUnit,
} from "@/lib/nutrition/normalize";

describe("Nutrition Normalization", () => {
  describe("kjToKcal", () => {
    it("should convert kilojoules to kilocalories", () => {
      expect(kjToKcal(4.184)).toBeCloseTo(1, 2);
      expect(kjToKcal(100)).toBeCloseTo(23.9, 1);
    });
  });

  describe("mgToG", () => {
    it("should convert milligrams to grams", () => {
      expect(mgToG(1000)).toBe(1);
      expect(mgToG(500)).toBe(0.5);
    });
  });

  describe("gToMg", () => {
    it("should convert grams to milligrams", () => {
      expect(gToMg(1)).toBe(1000);
      expect(gToMg(0.5)).toBe(500);
    });
  });

  describe("normalizeText", () => {
    it("should remove extra spaces", () => {
      expect(normalizeText("hello  world")).toBe("hello world");
    });

    it("should replace commas with periods", () => {
      expect(normalizeText("12,5")).toBe("12.5");
    });

    it("should trim whitespace", () => {
      expect(normalizeText("  hello  ")).toBe("hello");
    });
  });

  describe("parseNutritionNumber", () => {
    it("should parse valid numbers", () => {
      expect(parseNutritionNumber("123")).toBe(123);
      expect(parseNutritionNumber("12.5")).toBe(12.5);
      expect(parseNutritionNumber("12,5")).toBe(12.5);
    });

    it("should handle numbers with units", () => {
      expect(parseNutritionNumber("123g")).toBe(123);
      expect(parseNutritionNumber("45mg")).toBe(45);
    });

    it("should return null for invalid numbers", () => {
      expect(parseNutritionNumber("abc")).toBe(null);
      expect(parseNutritionNumber("")).toBe(null);
    });
  });

  describe("detectUnit", () => {
    it("should detect kilocalories", () => {
      expect(detectUnit("123 kcal")).toBe("kcal");
      expect(detectUnit("45 cal")).toBe("kcal");
    });

    it("should detect kilojoules", () => {
      expect(detectUnit("500 kj")).toBe("kj");
    });

    it("should detect milligrams", () => {
      expect(detectUnit("100mg")).toBe("mg");
    });

    it("should detect grams", () => {
      expect(detectUnit("50g")).toBe("g");
    });

    it("should return null for unknown units", () => {
      expect(detectUnit("123")).toBe(null);
    });
  });

  describe("toStandardUnit", () => {
    it("should convert mg to g", () => {
      expect(toStandardUnit(1000, "mg")).toBe(1);
    });

    it("should convert kj to kcal", () => {
      expect(toStandardUnit(100, "kj")).toBeCloseTo(23.9, 1);
    });

    it("should leave g unchanged", () => {
      expect(toStandardUnit(50, "g")).toBe(50);
    });

    it("should leave value unchanged if no unit", () => {
      expect(toStandardUnit(100, null)).toBe(100);
    });
  });
});

