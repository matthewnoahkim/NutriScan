"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nutritionSchema, NutritionData, AIEstimation } from "@/lib/schemas";
import { createEntry } from "@/app/actions/entries";
import { Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AiPreviewProps {
  estimation: AIEstimation;
  initialName: string;
  onSaveSuccess: () => void;
}

export function AiPreview({
  estimation,
  initialName,
  onSaveSuccess,
}: AiPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NutritionData>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      name: initialName || estimation.name,
      servingSize: estimation.servingSize,
      servings: 1,
      calories: estimation.calories,
      protein_g: estimation.protein_g,
      carbs_g: estimation.carbs_g,
      fat_g: estimation.fat_g,
      fiber_g: estimation.fiber_g,
      sugar_g: estimation.sugar_g,
      sodium_mg: estimation.sodium_mg,
      potassium_mg: estimation.potassium_mg,
      calcium_mg: estimation.calcium_mg,
      iron_mg: estimation.iron_mg,
    },
  });

  const onSubmit = async (data: NutritionData) => {
    setIsSaving(true);
    try {
      await createEntry({
        ...data,
        source: "ai",
        aiModel: "gpt-4o-mini",
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
        <CardTitle className="flex items-center justify-between">
          AI Estimation
          <Badge
            variant={estimation.confidence > 0.7 ? "default" : "secondary"}
          >
            {(estimation.confidence * 100).toFixed(0)}% confidence
          </Badge>
        </CardTitle>
        {estimation.confidence < 0.6 && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            Low confidence - please review and edit carefully
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Food Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="servingSize">Serving Size</Label>
              <Input id="servingSize" {...register("servingSize")} />
            </div>

            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                step="0.1"
                {...register("servings", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="price_usd">Price (USD)</Label>
              <Input
                id="price_usd"
                type="number"
                step="0.01"
                {...register("price_usd", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                {...register("calories", { valueAsNumber: true })}
              />
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
              "Save Entry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

