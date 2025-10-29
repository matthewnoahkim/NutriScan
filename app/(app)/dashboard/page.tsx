import { getTodayEntries } from "@/app/actions/entries";
import { getGoals } from "@/app/actions/goals";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DeficitBadges } from "@/components/dashboard/deficit-badges";

export default async function DashboardPage() {
  const [entries, goals] = await Promise.all([getTodayEntries(), getGoals()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your daily nutrition and reach your goals
        </p>
      </div>

      <QuickActions />

      <DashboardStats entries={entries} goals={goals} />

      <DeficitBadges entries={entries} goals={goals} />
    </div>
  );
}

