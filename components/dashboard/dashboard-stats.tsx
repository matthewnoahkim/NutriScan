"use client";

import { FoodEntry, Goal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateTotals } from "@/lib/recommendations";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Flame, Beef, Wheat, Droplet, Apple, DollarSign, LucideIcon } from "lucide-react";

interface DashboardStatsProps {
  entries: FoodEntry[];
  goals: Goal | null;
}

export function DashboardStats({ entries, goals }: DashboardStatsProps) {
  const totals = calculateTotals(entries);

  const stats: Array<{
    label: string;
    value: string;
    goal: number;
    unit: string;
    isCurrency?: boolean;
    icon: LucideIcon;
  }> = [
    {
      label: "Calories",
      value: formatNumber(totals.calories, 0),
      goal: goals?.calories || 0,
      unit: "kcal",
      icon: Flame,
    },
    {
      label: "Protein",
      value: formatNumber(totals.protein_g, 1),
      goal: goals?.protein_g || 0,
      unit: "g",
      icon: Beef,
    },
    {
      label: "Carbs",
      value: formatNumber(totals.carbs_g, 1),
      goal: goals?.carbs_g || 0,
      unit: "g",
      icon: Wheat,
    },
    {
      label: "Fat",
      value: formatNumber(totals.fat_g, 1),
      goal: goals?.fat_g || 0,
      unit: "g",
      icon: Droplet,
    },
    {
      label: "Fiber",
      value: formatNumber(totals.fiber_g, 1),
      goal: goals?.fiber_g || 0,
      unit: "g",
      icon: Apple,
    },
    {
      label: "Cost",
      value: formatCurrency(totals.cost),
      goal: goals?.budget_usd || 0,
      unit: "",
      isCurrency: true,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const current = stat.isCurrency ? totals.cost : parseFloat(stat.value);
        const percentage = stat.goal > 0 ? (current / stat.goal) * 100 : 0;

        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
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

