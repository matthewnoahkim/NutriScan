"use client";

import { FoodEntry, Goal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateTotals, calculateDeficits } from "@/lib/recommendations";
import { TrendingDown, TrendingUp } from "lucide-react";

interface DeficitBadgesProps {
  entries: FoodEntry[];
  goals: Goal | null;
}

export function DeficitBadges({ entries, goals }: DeficitBadgesProps) {
  const totals = calculateTotals(entries);
  const deficits = calculateDeficits(totals, goals);

  if (deficits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutritional Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {goals
              ? "Great job! You're on track with your goals."
              : "Set goals in settings to track your progress."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deficits & Excesses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {deficits.map((deficit) => (
            <Badge
              key={deficit.nutrient}
              variant={deficit.isExcess ? "destructive" : "secondary"}
              className="text-sm py-2 px-3"
            >
              {deficit.isExcess ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {deficit.nutrient}{" "}
              {deficit.isExcess ? "+" : "−"}
              {deficit.deficit.toFixed(1)}
              {deficit.unit}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

