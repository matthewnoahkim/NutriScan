import { getGoals } from "@/app/actions/goals";
import { GoalsForm } from "@/components/settings/goals-form";

export default async function SettingsPage() {
  const goals = await getGoals();

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Goals & Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your daily nutrition targets and budget preferences
        </p>
      </div>

      <GoalsForm initialGoals={goals} />
    </div>
  );
}

