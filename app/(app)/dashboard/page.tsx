import { getTodayEntries } from "@/app/actions/entries";
import { getGoals } from "@/app/actions/goals";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DeficitBadges } from "@/components/dashboard/deficit-badges";

export default async function DashboardPage() {
  const [entries, goals] = await Promise.all([getTodayEntries(), getGoals()]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your daily nutrition intake and monitor progress toward goals
        </p>
      </div>

      <QuickActions />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
          <DashboardStats entries={entries} goals={goals} />
        </div>

        <DeficitBadges entries={entries} goals={goals} />
      </div>
    </div>
  );
}

