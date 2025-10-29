"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { goalsSchema, GoalsData } from "@/lib/schemas";
import { updateGoals } from "@/app/actions/goals";
import { useToast } from "@/components/ui/use-toast";
import { Goal } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface GoalsFormProps {
  initialGoals: Goal | null;
}

export function GoalsForm({ initialGoals }: GoalsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalsData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      calories: initialGoals?.calories || undefined,
      protein_g: initialGoals?.protein_g || undefined,
      carbs_g: initialGoals?.carbs_g || undefined,
      fat_g: initialGoals?.fat_g || undefined,
      fiber_g: initialGoals?.fiber_g || undefined,
      sugar_g: initialGoals?.sugar_g || undefined,
      sodium_mg: initialGoals?.sodium_mg || undefined,
      potassium_mg: initialGoals?.potassium_mg || undefined,
      calcium_mg: initialGoals?.calcium_mg || undefined,
      iron_mg: initialGoals?.iron_mg || undefined,
      budget_usd: initialGoals?.budget_usd || undefined,
    },
  });

  const onSubmit = async (data: GoalsData) => {
    setIsSaving(true);
    try {
      await updateGoals(data);
      toast({
        title: "Goals updated!",
        description: "Your nutritional goals have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to save your goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calories">Calories (kcal)</Label>
              <Input
                id="calories"
                type="number"
                {...register("calories", { valueAsNumber: true })}
              />
              {errors.calories && (
                <p className="text-sm text-destructive">
                  {errors.calories.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="budget_usd">Daily Budget (USD)</Label>
              <Input
                id="budget_usd"
                type="number"
                step="0.01"
                {...register("budget_usd", { valueAsNumber: true })}
              />
              {errors.budget_usd && (
                <p className="text-sm text-destructive">
                  {errors.budget_usd.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="protein_g">Protein (g)</Label>
              <Input
                id="protein_g"
                type="number"
                step="0.1"
                {...register("protein_g", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="carbs_g">Carbs (g)</Label>
              <Input
                id="carbs_g"
                type="number"
                step="0.1"
                {...register("carbs_g", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="fat_g">Fat (g)</Label>
              <Input
                id="fat_g"
                type="number"
                step="0.1"
                {...register("fat_g", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="fiber_g">Fiber (g)</Label>
              <Input
                id="fiber_g"
                type="number"
                step="0.1"
                {...register("fiber_g", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="sugar_g">Sugar (g)</Label>
              <Input
                id="sugar_g"
                type="number"
                step="0.1"
                {...register("sugar_g", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="sodium_mg">Sodium (mg)</Label>
              <Input
                id="sodium_mg"
                type="number"
                step="0.1"
                {...register("sodium_mg", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="potassium_mg">Potassium (mg)</Label>
              <Input
                id="potassium_mg"
                type="number"
                step="0.1"
                {...register("potassium_mg", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="calcium_mg">Calcium (mg)</Label>
              <Input
                id="calcium_mg"
                type="number"
                step="0.1"
                {...register("calcium_mg", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="iron_mg">Iron (mg)</Label>
              <Input
                id="iron_mg"
                type="number"
                step="0.1"
                {...register("iron_mg", { valueAsNumber: true })}
              />
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="w-full" size="lg">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Goals"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

