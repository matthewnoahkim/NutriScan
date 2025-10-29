import { getGoals } from "@/app/actions/goals";
import { GoalsForm } from "@/components/settings/goals-form";

export default async function SettingsPage() {
  const goals = await getGoals();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Set your daily nutritional goals and budget
        </p>
      </div>

      <GoalsForm initialGoals={goals} />
    </div>
  );
}

