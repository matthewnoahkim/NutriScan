import {
  normalizeText,
  parseNutritionNumber,
  detectUnit,
  toStandardUnit,
} from "../nutrition/normalize";
import { NutritionData } from "../schemas";

export interface ParsedNutrition extends Partial<NutritionData> {
  confidence: number;
  hasNutritionFacts: boolean;
  rawText: string;
}

/**
 * Parse nutrition facts from OCR text
 */
export function parseNutritionFromOCR(ocrText: string): ParsedNutrition {
  const result: ParsedNutrition = {
    confidence: 0,
    hasNutritionFacts: false,
    rawText: ocrText,
  };

  const normalized = normalizeText(ocrText);
  const lines = normalized.split("\n").map((l) => l.trim());

  // Check for nutrition facts header
  const hasHeader = lines.some((line) => {
    const lower = line.toLowerCase();
    return (
      lower.includes("nutrition facts") ||
      lower.includes("nutritional information") ||
      lower.includes("valores nutricionales") ||
      lower.includes("información nutricional")
    );
  });

  result.hasNutritionFacts = hasHeader;

  let fieldsFound = 0;
  const expectedFields = 10; // We expect at least 10 key fields

  // Parse calories
  const caloriesMatch = extractNutrient(lines, [
    "calories",
    "energy",
    "energía",
    "calorías",
  ]);
  if (caloriesMatch) {
    result.calories = caloriesMatch;
    fieldsFound++;
  }

  // Parse protein
  const proteinMatch = extractNutrient(lines, [
    "protein",
    "proteína",
    "proteínas",
  ]);
  if (proteinMatch) {
    result.protein_g = proteinMatch;
    fieldsFound++;
  }

  // Parse carbohydrates
  const carbsMatch = extractNutrient(lines, [
    "total carbohydrate",
    "carbohydrate",
    "carbs",
    "carbohidratos",
  ]);
  if (carbsMatch) {
    result.carbs_g = carbsMatch;
    fieldsFound++;
  }

  // Parse fat
  const fatMatch = extractNutrient(lines, [
    "total fat",
    "fat",
    "grasa",
    "grasas",
  ]);
  if (fatMatch) {
    result.fat_g = fatMatch;
    fieldsFound++;
  }

  // Parse fiber
  const fiberMatch = extractNutrient(lines, [
    "dietary fiber",
    "fiber",
    "fibra",
  ]);
  if (fiberMatch) {
    result.fiber_g = fiberMatch;
    fieldsFound++;
  }

  // Parse sugar
  const sugarMatch = extractNutrient(lines, [
    "sugars",
    "sugar",
    "azúcares",
    "azúcar",
  ]);
  if (sugarMatch) {
    result.sugar_g = sugarMatch;
    fieldsFound++;
  }

  // Parse sodium
  const sodiumMatch = extractNutrient(lines, ["sodium", "sodio"]);
  if (sodiumMatch) {
    result.sodium_mg = sodiumMatch;
    fieldsFound++;
  }

  // Parse potassium
  const potassiumMatch = extractNutrient(lines, ["potassium", "potasio"]);
  if (potassiumMatch) {
    result.potassium_mg = potassiumMatch;
    fieldsFound++;
  }

  // Parse calcium
  const calciumMatch = extractNutrient(lines, ["calcium", "calcio"]);
  if (calciumMatch) {
    result.calcium_mg = calciumMatch;
    fieldsFound++;
  }

  // Parse iron
  const ironMatch = extractNutrient(lines, ["iron", "hierro"]);
  if (ironMatch) {
    result.iron_mg = ironMatch;
    fieldsFound++;
  }

  // Calculate confidence score
  result.confidence = hasHeader
    ? Math.min(fieldsFound / expectedFields, 1)
    : fieldsFound / expectedFields * 0.5; // Lower confidence without header

  return result;
}

/**
 * Extract a nutrient value from lines of text
 */
function extractNutrient(lines: string[], keywords: string[]): number | null {
  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Check if line contains any keyword
    const hasKeyword = keywords.some((kw) => lower.includes(kw));
    if (!hasKeyword) continue;

    // Extract number and unit
    const matches = line.match(/(\d+[.,]?\d*)\s*(mg|g|kcal|kj|cal)?/i);
    if (!matches) continue;

    const value = parseNutritionNumber(matches[1]);
    if (value === null) continue;

    const unit = matches[2] ? detectUnit(matches[2]) : null;
    
    // For sodium, potassium, calcium, iron - if unit is g, convert to mg
    const isMineralKeyword = keywords.some((kw) =>
      ["sodium", "sodio", "potassium", "potasio", "calcium", "calcio", "iron", "hierro"].includes(kw)
    );
    
    if (isMineralKeyword && unit === "g") {
      return value * 1000; // Convert to mg
    }

    return toStandardUnit(value, unit);
  }

  return null;
}

/**
 * Extract serving size from OCR text
 */
export function extractServingSize(ocrText: string): string | null {
  const normalized = normalizeText(ocrText);
  const lines = normalized.split("\n");

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes("serving size") ||
      lower.includes("tamaño de la porción") ||
      lower.includes("portion")
    ) {
      // Extract the value after the label
      const match = line.match(/[:]\s*(.+)/);
      if (match) return match[1].trim();
    }
  }

  return null;
}

