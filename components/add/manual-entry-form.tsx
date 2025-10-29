"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nutritionSchema, NutritionData } from "@/lib/schemas";
import { createEntry } from "@/app/actions/entries";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

interface ManualEntryFormProps {
  onSaveSuccess: () => void;
}

export function ManualEntryForm({ onSaveSuccess }: ManualEntryFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NutritionData>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      name: "",
      servingSize: "1 serving",
      servings: 1,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      saturated_fat_g: 0,
      cholesterol_mg: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
      potassium_mg: 0,
      calcium_mg: 0,
      iron_mg: 0,
    },
  });

  const servings = watch("servings") || 1;
  const servingSize = watch("servingSize") || "1 serving";

  const onSubmit = async (data: NutritionData) => {
    setIsSaving(true);
    try {
      await createEntry({
        ...data,
        source: "manual",
      });
      onSaveSuccess();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Manual Nutrition Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Serving Size Reminder */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground mb-4">
                {servingSize} contains the nutrition values shown below
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servings">How many servings did you consume? *</Label>
                  <Input
                    id="servings"
                    type="number"
                    step="0.1"
                    min="0.1"
                    {...register("servings", { valueAsNumber: true })}
                  />
                  {errors.servings && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.servings.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Total nutrition will be multiplied by this number
                  </p>
                </div>

                <div>
                  <Label htmlFor="servingSize">Serving Size *</Label>
                  <Input
                    id="servingSize"
                    {...register("servingSize")}
                    placeholder="e.g., 1 cup (230g)"
                  />
                  {errors.servingSize && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.servingSize.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Food Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Grilled Chicken Breast"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="price_usd">Price (USD)</Label>
                <Input
                  id="price_usd"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("price_usd", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Nutrition Values */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Nutrition per Serving
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Calories *</Label>
                <Input
                  id="calories"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("calories", { valueAsNumber: true })}
                />
                {errors.calories && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.calories.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="protein_g">Protein (g)</Label>
                <Input
                  id="protein_g"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("protein_g", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="carbs_g">Carbs (g)</Label>
                <Input
                  id="carbs_g"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("carbs_g", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="fat_g">Total Fat (g)</Label>
                <Input
                  id="fat_g"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("fat_g", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="saturated_fat_g">Saturated Fat (g)</Label>
                <Input
                  id="saturated_fat_g"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("saturated_fat_g", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="cholesterol_mg">Cholesterol (mg)</Label>
                <Input
                  id="cholesterol_mg"
                  type="number"
                  step="1"
                  placeholder="0"
                  {...register("cholesterol_mg", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="fiber_g">Dietary Fiber (g)</Label>
                <Input
                  id="fiber_g"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("fiber_g", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="sugar_g">Added Sugars (g)</Label>
                <Input
                  id="sugar_g"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("sugar_g", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="sodium_mg">Sodium (mg)</Label>
                <Input
                  id="sodium_mg"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("sodium_mg", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="potassium_mg">Potassium (mg)</Label>
                <Input
                  id="potassium_mg"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("potassium_mg", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="calcium_mg">Calcium (mg)</Label>
                <Input
                  id="calcium_mg"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("calcium_mg", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="iron_mg">Iron (mg)</Label>
                <Input
                  id="iron_mg"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("iron_mg", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              `Save Entry (${servings} ${servings === 1 ? "serving" : "servings"})`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

