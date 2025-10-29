/**
 * Nutrition unit normalization utilities
 */

// Convert kilojoules to kilocalories
export function kjToKcal(kj: number): number {
  return kj / 4.184;
}

// Convert milligrams to grams
export function mgToG(mg: number): number {
  return mg / 1000;
}

// Convert grams to milligrams
export function gToMg(g: number): number {
  return g * 1000;
}

// Normalize text by removing extra spaces (but preserving newlines) and standardizing separators
export function normalizeText(text: string): string {
  return text
    .replace(/,/g, ".") // Replace commas with periods for decimal numbers
    .replace(/[ \t]+/g, " ") // Replace multiple spaces/tabs with single space
    .replace(/\n\s*\n/g, "\n") // Remove empty lines
    .trim();
}

// Parse a number from text, handling various formats
export function parseNutritionNumber(text: string): number | null {
  const normalized = normalizeText(text)
    .replace(/[^\d.,\-]/g, "")
    .replace(/,/g, ".");
  
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

// Detect unit in text
export function detectUnit(text: string): "g" | "mg" | "kcal" | "kj" | null {
  const lower = text.toLowerCase();
  if (lower.includes("kcal") || lower.includes("cal")) return "kcal";
  if (lower.includes("kj")) return "kj";
  if (lower.includes("mg")) return "mg";
  if (lower.includes("g") && !lower.includes("mg")) return "g";
  return null;
}

// Convert value to standard unit (grams for mass, kcal for energy)
export function toStandardUnit(value: number, unit: string | null): number {
  if (!unit) return value;
  
  const lower = unit.toLowerCase();
  if (lower === "mg") return mgToG(value);
  if (lower === "kj") return kjToKcal(value);
  return value;
}

