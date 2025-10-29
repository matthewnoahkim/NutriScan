"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ShoppingCart, DollarSign, TrendingDown, Calendar, Package, AlertCircle, Lightbulb } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
  nutritionHighlight: string;
  perUnitCost: number;
}

interface PlannedMeal {
  id: string;
  name: string;
  date: Date;
  ingredients: string;
}

interface ShoppingListProps {
  remainingBudget: number;
  deficitNutrients: string[];
  plannedMeals: PlannedMeal[];
  shoppingIngredients: string[];
}

// Budget-friendly items organized by nutritional benefits
const budgetItems: ShoppingItem[] = [
  // Protein sources
  {
    id: "eggs",
    name: "Eggs (dozen)",
    quantity: "12 eggs",
    price: 3.5,
    category: "Protein",
    nutritionHighlight: "13g protein per egg",
    perUnitCost: 0.29,
  },
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    quantity: "1 lb",
    price: 4.0,
    category: "Protein",
    nutritionHighlight: "31g protein per 4oz",
    perUnitCost: 1.0,
  },
  {
    id: "canned-tuna",
    name: "Canned Tuna",
    quantity: "5 oz can",
    price: 1.5,
    category: "Protein",
    nutritionHighlight: "20g protein per can",
    perUnitCost: 0.3,
  },
  {
    id: "black-beans",
    name: "Black Beans (canned)",
    quantity: "15 oz can",
    price: 1.0,
    category: "Protein",
    nutritionHighlight: "15g protein, 15g fiber per can",
    perUnitCost: 1.0,
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter",
    quantity: "16 oz jar",
    price: 3.5,
    category: "Protein",
    nutritionHighlight: "8g protein per 2 tbsp",
    perUnitCost: 0.22,
  },

  // Fiber sources
  {
    id: "oats",
    name: "Rolled Oats",
    quantity: "18 oz container",
    price: 2.5,
    category: "Fiber",
    nutritionHighlight: "4g fiber per serving",
    perUnitCost: 0.14,
  },
  {
    id: "brown-rice",
    name: "Brown Rice",
    quantity: "2 lb bag",
    price: 3.0,
    category: "Fiber",
    nutritionHighlight: "3.5g fiber per cup",
    perUnitCost: 1.5,
  },
  {
    id: "sweet-potato",
    name: "Sweet Potatoes",
    quantity: "3 lbs",
    price: 3.5,
    category: "Fiber",
    nutritionHighlight: "4g fiber per potato",
    perUnitCost: 1.17,
  },
  {
    id: "bananas",
    name: "Bananas",
    quantity: "bunch (6-8)",
    price: 2.0,
    category: "Fiber",
    nutritionHighlight: "3g fiber per banana",
    perUnitCost: 0.29,
  },
  {
    id: "carrots",
    name: "Carrots",
    quantity: "2 lb bag",
    price: 2.0,
    category: "Fiber",
    nutritionHighlight: "2g fiber per carrot",
    perUnitCost: 1.0,
  },

  // Calcium sources
  {
    id: "milk",
    name: "Milk",
    quantity: "1 gallon",
    price: 4.0,
    category: "Calcium",
    nutritionHighlight: "300mg calcium per cup",
    perUnitCost: 0.25,
  },
  {
    id: "yogurt",
    name: "Plain Yogurt",
    quantity: "32 oz",
    price: 3.5,
    category: "Calcium",
    nutritionHighlight: "300mg calcium per cup",
    perUnitCost: 0.44,
  },
  {
    id: "cheese",
    name: "Cheddar Cheese",
    quantity: "8 oz block",
    price: 3.0,
    category: "Calcium",
    nutritionHighlight: "200mg calcium per oz",
    perUnitCost: 0.38,
  },

  // Iron sources
  {
    id: "spinach",
    name: "Spinach (frozen)",
    quantity: "10 oz bag",
    price: 2.0,
    category: "Iron",
    nutritionHighlight: "3mg iron per cup",
    perUnitCost: 0.2,
  },
  {
    id: "lentils",
    name: "Lentils (dried)",
    quantity: "1 lb bag",
    price: 2.0,
    category: "Iron",
    nutritionHighlight: "6.6mg iron per cup cooked",
    perUnitCost: 2.0,
  },

  // Potassium sources
  {
    id: "potatoes",
    name: "Potatoes",
    quantity: "5 lb bag",
    price: 3.5,
    category: "Potassium",
    nutritionHighlight: "900mg potassium per potato",
    perUnitCost: 0.7,
  },
];

export function ShoppingList({
  remainingBudget,
  deficitNutrients,
  plannedMeals,
  shoppingIngredients,
}: ShoppingListProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedMealIngredients, setSelectedMealIngredients] = useState<Set<string>>(new Set());

  // Filter and prioritize items based on deficits
  const prioritizedItems = budgetItems.filter((item) =>
    deficitNutrients.some((nutrient) =>
      item.category.toLowerCase().includes(nutrient.toLowerCase())
    )
  );

  // Show all items if no specific deficits, otherwise show prioritized + some others
  const displayItems =
    prioritizedItems.length > 0
      ? [
          ...prioritizedItems,
          ...budgetItems
            .filter((item) => !prioritizedItems.includes(item))
            .slice(0, 5),
        ]
      : budgetItems;

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const totalCost = displayItems
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const totalSelectedCount = selectedItems.size + selectedMealIngredients.size;
  const isOverBudget = totalCost > remainingBudget;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Budget-Friendly Shopping List
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Remaining Budget</p>
            <p className="text-lg font-bold">
              {formatCurrency(remainingBudget)}
            </p>
          </div>
        </div>
        {deficitNutrients.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Items prioritized for: {deficitNutrients.join(", ")}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Planned Meals Section */}
        {plannedMeals.length > 0 && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Planned Meals ({plannedMeals.length})
            </h3>
            <div className="space-y-2">
              {plannedMeals.slice(0, 3).map((meal) => (
                <div key={meal.id} className="text-sm">
                  <span className="font-medium">{meal.name}</span>
                  <span className="text-muted-foreground ml-2">
                    - {new Date(meal.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {meal.ingredients && (
                    <p className="text-xs text-muted-foreground ml-4">
                      {meal.ingredients}
                    </p>
                  )}
                </div>
              ))}
              {plannedMeals.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  + {plannedMeals.length - 3} more meals
                </p>
              )}
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Selected Items</p>
            <p className="text-2xl font-bold">{totalSelectedCount}</p>
            {selectedMealIngredients.size > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedItems.size} priced + {selectedMealIngredients.size} from meals
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p
              className={`text-2xl font-bold ${
                isOverBudget ? "text-destructive" : ""
              }`}
            >
              {formatCurrency(totalCost)}
            </p>
            {selectedMealIngredients.size > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Meal ingredients not priced
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">After Shopping</p>
            <p
              className={`text-2xl font-bold ${
                isOverBudget ? "text-destructive" : "text-green-600"
              }`}
            >
              {formatCurrency(remainingBudget - totalCost)}
            </p>
          </div>
        </div>

        {isOverBudget && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Warning: Selected items exceed your remaining budget by{" "}
              {formatCurrency(totalCost - remainingBudget)}
            </p>
          </div>
        )}

        {/* Ingredients from Planned Meals */}
        {shoppingIngredients.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ingredients for Your Planned Meals
            </h3>
            <div className="space-y-2 mb-6">
              {shoppingIngredients.map((ingredient) => {
                const isSelected = selectedMealIngredients.has(ingredient);
                
                return (
                  <div
                    key={ingredient}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-primary/5 border-primary/20"
                        : "hover:bg-muted/50"
                    } border-l-4 border-l-primary/50`}
                  >
                    <Checkbox
                      id={ingredient}
                      checked={isSelected}
                      onCheckedChange={() => {
                        const newSelected = new Set(selectedMealIngredients);
                        if (newSelected.has(ingredient)) {
                          newSelected.delete(ingredient);
                        } else {
                          newSelected.add(ingredient);
                        }
                        setSelectedMealIngredients(newSelected);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={ingredient}
                        className="font-medium cursor-pointer flex items-center gap-2"
                      >
                        {ingredient}
                        <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border">
                          From Meal Plan
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shopping Items */}
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget-Friendly Suggestions
          </h3>
          <div className="space-y-2">
            {displayItems.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const isPriority = prioritizedItems.includes(item);

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-primary/5 border-primary/20"
                      : "hover:bg-muted/50"
                  } ${isPriority ? "border-l-4 border-l-primary" : ""}`}
                >
                  <Checkbox
                    id={item.id}
                    checked={isSelected}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <label
                          htmlFor={item.id}
                          className="font-medium cursor-pointer flex items-center gap-2"
                        >
                          {item.name}
                          {isPriority && (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              <TrendingDown className="h-3 w-3" />
                              Priority
                            </span>
                          )}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.nutritionHighlight}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold">
                          {formatCurrency(item.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.perUnitCost)}/serving
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Shopping Tips
          </p>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Buy frozen vegetables for same nutrition at lower cost</li>
            <li>• Choose store brands to save 20-30%</li>
            <li>• Buy in bulk for frequently used items</li>
            <li>• Compare unit prices for best value</li>
            <li>• Plan meals around sale items</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

