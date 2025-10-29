/*
  Warnings:

  - You are about to drop the column `price_usd` on the `PlannedMeal` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlannedMeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "plannedFor" DATETIME NOT NULL,
    "servingSize" TEXT,
    "servings" REAL NOT NULL DEFAULT 1,
    "estimatedCost" REAL,
    "calories" REAL,
    "protein_g" REAL,
    "carbs_g" REAL,
    "fat_g" REAL,
    "saturated_fat_g" REAL,
    "fiber_g" REAL,
    "sugar_g" REAL,
    "cholesterol_mg" REAL,
    "sodium_mg" REAL,
    "potassium_mg" REAL,
    "calcium_mg" REAL,
    "iron_mg" REAL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlannedMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlannedMeal" ("calcium_mg", "calories", "carbs_g", "cholesterol_mg", "completedAt", "createdAt", "description", "fat_g", "fiber_g", "id", "iron_mg", "isCompleted", "name", "plannedFor", "potassium_mg", "protein_g", "saturated_fat_g", "servingSize", "servings", "sodium_mg", "sugar_g", "userId") SELECT "calcium_mg", "calories", "carbs_g", "cholesterol_mg", "completedAt", "createdAt", "description", "fat_g", "fiber_g", "id", "iron_mg", "isCompleted", "name", "plannedFor", "potassium_mg", "protein_g", "saturated_fat_g", "servingSize", "servings", "sodium_mg", "sugar_g", "userId" FROM "PlannedMeal";
DROP TABLE "PlannedMeal";
ALTER TABLE "new_PlannedMeal" RENAME TO "PlannedMeal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
