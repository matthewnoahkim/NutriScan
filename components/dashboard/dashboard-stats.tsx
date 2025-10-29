"use client";

import { FoodEntry, Goal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateTotals } from "@/lib/recommendations";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  entries: FoodEntry[];
  goals: Goal | null;
}

export function DashboardStats({ entries, goals }: DashboardStatsProps) {
  const totals = calculateTotals(entries);

  const stats = [
    {
      label: "Calories",
      value: formatNumber(totals.calories, 0),
      goal: goals?.calories || 0,
      unit: "kcal",
    },
    {
      label: "Protein",
      value: formatNumber(totals.protein_g, 1),
      goal: goals?.protein_g || 0,
      unit: "g",
    },
    {
      label: "Carbs",
      value: formatNumber(totals.carbs_g, 1),
      goal: goals?.carbs_g || 0,
      unit: "g",
    },
    {
      label: "Fat",
      value: formatNumber(totals.fat_g, 1),
      goal: goals?.fat_g || 0,
      unit: "g",
    },
    {
      label: "Fiber",
      value: formatNumber(totals.fiber_g, 1),
      goal: goals?.fiber_g || 0,
      unit: "g",
    },
    {
      label: "Cost",
      value: formatCurrency(totals.cost),
      goal: goals?.budget_usd || 0,
      unit: "",
      isCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const current = stat.isCurrency ? totals.cost : parseFloat(stat.value);
        const percentage = stat.goal > 0 ? (current / stat.goal) * 100 : 0;

        return (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {stat.isCurrency ? formatCurrency(stat.goal) : stat.goal}
                  {!stat.isCurrency && stat.unit}
                </span>
              </div>
              <Progress
                value={Math.min(percentage, 100)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {percentage.toFixed(0)}% of daily goal
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

