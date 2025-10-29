import { getEntries } from "@/app/actions/entries";
import { getGoals } from "@/app/actions/goals";
import { NutritionCharts } from "@/components/charts/nutrition-charts";

export default async function ChartsPage() {
  const [entries, goals] = await Promise.all([getEntries(), getGoals()]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Nutrition Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Visualize nutrient intake patterns and compare against your goals
        </p>
      </div>

      <NutritionCharts entries={entries} goals={goals} />
    </div>
  );
}

