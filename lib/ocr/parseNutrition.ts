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
  console.log("=== RAW OCR TEXT ===");
  console.log(ocrText);
  console.log("=== END RAW OCR TEXT ===");

  const result: ParsedNutrition = {
    confidence: 0,
    hasNutritionFacts: false,
    rawText: ocrText,
  };

  let normalized = normalizeText(ocrText);
  
  // If OCR didn't detect line breaks, try to infer them
  // Split on common patterns like: "word digit" becoming "word\ndigit"
  if (!normalized.includes("\n") || normalized.split("\n").length < 5) {
    console.log("OCR didn't detect proper line breaks, attempting to infer them...");
    normalized = normalized
      // Add newlines before nutrient keywords
      .replace(/(Calories|Total Fat|Saturated Fat|Trans Fat|Cholesterol|Sodium|Total Carbohydrate|Dietary Fiber|Total Sugars|Protein|Calcium|Iron|Potassium|Vitamin)/gi, "\n$1")
      // Add newlines after percentage values
      .replace(/(\d+%)/g, "$1\n")
      // Clean up multiple newlines
      .replace(/\n+/g, "\n");
  }
  
  const lines = normalized.split("\n").map((l) => l.trim()).filter(l => l.length > 0);
  
  console.log("=== NORMALIZED LINES ===");
  lines.forEach((line, i) => console.log(`${i}: ${line}`));
  console.log("=== END LINES ===");

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

  // Parse saturated fat
  const saturatedFatMatch = extractNutrient(lines, [
    "saturated fat",
    "grasa saturada",
  ]);
  if (saturatedFatMatch) {
    result.saturated_fat_g = saturatedFatMatch;
    fieldsFound++;
  }

  // Parse cholesterol
  const cholesterolMatch = extractNutrient(lines, [
    "cholesterol",
    "colesterol",
  ]);
  if (cholesterolMatch) {
    result.cholesterol_mg = cholesterolMatch;
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
  const isMineralKeyword = keywords.some((kw) =>
    ["sodium", "sodio", "potassium", "potasio", "calcium", "calcio", "iron", "hierro"].includes(kw)
  );

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Check if line contains any keyword - must start with keyword or have keyword after whitespace
    const matchingKeyword = keywords.find((kw) => {
      const keywordRegex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i');
      return keywordRegex.test(lower);
    });
    
    if (!matchingKeyword) continue;

    console.log(`Found keyword "${matchingKeyword}" in line: "${line}"`);

    // Create a regex that looks for the keyword followed by a number
    // This ensures we get the number RIGHT AFTER the keyword, not some random number
    const keywordPattern = new RegExp(
      `${matchingKeyword}[^\\d]*(\\d+[.,]?\\d*)\\s*(mg|g|kcal|kj|cal)?`,
      'gi'
    );
    
    const keywordMatch = keywordPattern.exec(line);
    if (keywordMatch) {
      const value = parseNutritionNumber(keywordMatch[1]);
      if (value !== null && value !== 0) {
        const unit = keywordMatch[2] ? detectUnit(keywordMatch[2]) : null;
        
        // Validation
        if (!unit) {
          if (keywords.some(k => k.includes("calor") || k === "energy")) {
            if (value < 10 || value > 2000) continue;
          } else if (isMineralKeyword) {
            if (value > 5000) continue;
          } else {
            if (value > 100) continue;
          }
        }

        console.log(`✓ Extracted value: ${value}, unit: ${unit}`);
        
        if (isMineralKeyword) {
          if (unit === "g") return value * 1000;
          return value; // Assume mg for minerals
        }

        return toStandardUnit(value, unit);
      }
    }

    // Fallback: try multiple extraction strategies if keyword match didn't work
    const extractionStrategies = [
      { pattern: /(\d+[.,]?\d*)\s*(mg|g|kcal|kj|cal)\b/gi, hasUnit: true },
      { pattern: /\b(\d{3,4})\b(?!\s*%)/g, hasUnit: false },
      { pattern: /\b(\d+[.,]?\d*)\b(?!\s*%)/g, hasUnit: false },
    ];

    for (const strategy of extractionStrategies) {
      const matches = [...line.matchAll(strategy.pattern)];
      
      for (const match of matches) {
        const value = parseNutritionNumber(match[1]);
        if (value === null || value === 0) continue;

        const unit = match[2] ? detectUnit(match[2]) : null;
        
        if (!unit) {
          if (keywords.some(k => k.includes("calor") || k === "energy")) {
            if (value < 10 || value > 2000) continue;
          } else if (isMineralKeyword) {
            if (value > 5000) continue;
          } else {
            if (value > 100) continue;
          }
        }

        console.log(`✓ Fallback extracted: ${value}, unit: ${unit}`);
        
        if (isMineralKeyword) {
          if (unit === "g") return value * 1000;
          return value;
        }

        return toStandardUnit(value, unit);
      }
    }
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
      console.log(`Found serving size line: "${line}"`);
      
      // Try to extract patterns like "1 cup (230g)" or "230g"
      const patterns = [
        /serving size[:\s]+(.+?)(?=\s*amount|$)/i,
        /[:]\s*(.+)/,
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const servingSize = match[1].trim();
          console.log(`✓ Extracted serving size: "${servingSize}"`);
          return servingSize;
        }
      }
    }
  }

  return null;
}

