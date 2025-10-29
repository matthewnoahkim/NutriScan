import { getRecommendations, getShoppingListData } from "@/app/actions/recommendations";
import { RecommendationsList } from "@/components/recommendations/recommendations-list";
import { ShoppingList } from "@/components/recommendations/shopping-list";

export default async function MealsPage() {
  const [recommendations, shoppingData] = await Promise.all([
    getRecommendations(),
    getShoppingListData(),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Meal Recommendations</h1>
          <p className="text-sm text-muted-foreground">
            Browse personalized meal suggestions and generate budget-friendly shopping lists
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-muted/30 text-sm">
          <p className="font-medium mb-1 text-foreground">Disclaimer</p>
          <p className="text-muted-foreground leading-relaxed">
            NutriScan provides informational estimates only and does not replace
            professional medical or dietary advice. OCR and AI estimates may
            contain errors. Always verify labels and consult a healthcare
            professional for personalized guidance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <RecommendationsList initialRecommendations={recommendations} />
        </div>
        <div>
          <ShoppingList
            remainingBudget={shoppingData.remainingBudget}
            deficitNutrients={shoppingData.deficitNutrients}
            plannedMeals={shoppingData.plannedMeals}
            shoppingIngredients={shoppingData.shoppingIngredients}
          />
        </div>
      </div>
    </div>
  );
}

