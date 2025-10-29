import { getEntries } from "@/app/actions/entries";
import { getGoals } from "@/app/actions/goals";
import { NutritionCharts } from "@/components/charts/nutrition-charts";

export default async function ChartsPage() {
  const [entries, goals] = await Promise.all([getEntries(), getGoals()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Nutrition Charts</h1>
        <p className="text-muted-foreground">
          Visualize your nutrient intake and track progress over time
        </p>
      </div>

      <NutritionCharts entries={entries} goals={goals} />
    </div>
  );
}

