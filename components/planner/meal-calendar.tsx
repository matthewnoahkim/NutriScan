"use client";

import { useState } from "react";
import { PlannedMeal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { completePlannedMeal, deletePlannedMeal } from "@/app/actions/plannedMeals";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

interface MealCalendarProps {
  initialPlannedMeals: PlannedMeal[];
}

export function MealCalendar({ initialPlannedMeals }: MealCalendarProps) {
  const [meals, setMeals] = useState(initialPlannedMeals);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Group meals by date
  const mealsByDate = meals.reduce((acc, meal) => {
    const dateKey = new Date(meal.plannedFor).toLocaleDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(meal);
    return acc;
  }, {} as Record<string, PlannedMeal[]>);

  // Get next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await completePlannedMeal(id);
      setMeals(meals.filter((m) => m.id !== id));
      toast({
        title: "Meal completed",
        description: "Added to your intake log.",
      });
    } catch (error) {
      toast({
        title: "Failed to complete meal",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePlannedMeal(id);
      setMeals(meals.filter((m) => m.id !== id));
      toast({
        title: "Meal removed",
        description: "Planned meal has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete meal",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getDayName = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <div className="space-y-4">
      {next7Days.map((date) => {
        const dateKey = date.toLocaleDateString();
        const dayMeals = mealsByDate[dateKey] || [];
        const incompleteMeals = dayMeals.filter((m) => !m.isCompleted);

        return (
          <Card key={dateKey}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{getDayName(date)}</span>
                  <span className="text-muted-foreground font-normal">
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {incompleteMeals.length > 0 && (
                  <Badge variant="secondary">
                    {incompleteMeals.length} meal{incompleteMeals.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incompleteMeals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 flex items-center justify-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  No meals planned for this day
                </p>
              ) : (
                <div className="space-y-3">
                  {incompleteMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{meal.name}</h3>
                        {meal.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {meal.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                          {meal.calories && (
                            <div>
                              <span className="text-muted-foreground">Calories:</span>{" "}
                              <span className="font-medium">{meal.calories}</span>
                            </div>
                          )}
                          {meal.protein_g && (
                            <div>
                              <span className="text-muted-foreground">Protein:</span>{" "}
                              <span className="font-medium">{meal.protein_g}g</span>
                            </div>
                          )}
                          {meal.fiber_g && (
                            <div>
                              <span className="text-muted-foreground">Fiber:</span>{" "}
                              <span className="font-medium">{meal.fiber_g}g</span>
                            </div>
                          )}
                          {meal.estimatedCost && (
                            <div>
                              <span className="text-muted-foreground">Cost:</span>{" "}
                              <span className="font-medium">
                                {formatCurrency(meal.estimatedCost)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleComplete(meal.id)}
                          disabled={completingId === meal.id}
                          className="whitespace-nowrap"
                        >
                          {completingId === meal.id ? (
                            "Completing..."
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(meal.id)}
                          disabled={deletingId === meal.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

