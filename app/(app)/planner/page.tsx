import { getPlannedMeals } from "@/app/actions/plannedMeals";
import { MealCalendar } from "@/components/planner/meal-calendar";

export default async function MealPlannerPage() {
  const plannedMeals = await getPlannedMeals();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Meal Planner</h1>
        <p className="text-sm text-muted-foreground">
          Plan your meals for the week and mark them complete when consumed
        </p>
      </div>

      <MealCalendar initialPlannedMeals={plannedMeals} />
    </div>
  );
}

