"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nutritionSchema, NutritionData } from "@/lib/schemas";
import { ParsedNutrition } from "@/lib/ocr/parseNutrition";
import { createEntry } from "@/app/actions/entries";
import { Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScanPreviewProps {
  parsed: ParsedNutrition;
  onSaveSuccess: () => void;
}

export function ScanPreview({ parsed, onSaveSuccess }: ScanPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NutritionData>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      name: "",
      servingSize: parsed.servingSize || "",
      servings: 1,
      calories: parsed.calories,
      protein_g: parsed.protein_g,
      carbs_g: parsed.carbs_g,
      fat_g: parsed.fat_g,
      saturated_fat_g: parsed.saturated_fat_g,
      fiber_g: parsed.fiber_g,
      sugar_g: parsed.sugar_g,
      cholesterol_mg: parsed.cholesterol_mg,
      sodium_mg: parsed.sodium_mg,
      potassium_mg: parsed.potassium_mg,
      calcium_mg: parsed.calcium_mg,
      iron_mg: parsed.iron_mg,
    },
  });

  const servings = watch("servings") || 1;

  const onSubmit = async (data: NutritionData) => {
    setIsSaving(true);
    try {
      await createEntry({
        ...data,
        source: "scan",
        ocrText: parsed.rawText,
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
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          Review Scanned Data
          <Badge variant={parsed.confidence > 0.7 ? "default" : "secondary"}>
            {(parsed.confidence * 100).toFixed(0)}% confidence
          </Badge>
        </CardTitle>
        {(!parsed.hasNutritionFacts || parsed.confidence < 0.3) && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            Low confidence - verify values before saving
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Serving Information Section */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide">
              Serving Information
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {parsed.servingSize || "1 serving"} contains the nutrition values shown below
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="servings">
                  How many servings did you consume? *
                </Label>
                <Input
                  id="servings"
                  type="number"
                  step="0.1"
                  min="0.1"
                  {...register("servings", { valueAsNumber: true })}
                  className="font-semibold text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total nutrition will be multiplied by this number
                </p>
              </div>
              <div>
                <Label htmlFor="servingSize">Serving Size</Label>
                <Input id="servingSize" {...register("servingSize")} />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Food Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
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
          </div>

          {/* Nutrition Values Per Serving */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              Nutrition Per Serving
              {servings > 1 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (× {servings} = total consumed)
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  step="1"
                  {...register("calories", { valueAsNumber: true })}
                />
                {servings > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Total: {Math.round((parsed.calories || 0) * servings)} cal
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
                {servings > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Total: {((parsed.protein_g || 0) * servings).toFixed(1)}g
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="carbs_g">Carbs (g)</Label>
                <Input
                  id="carbs_g"
                  type="number"
                  step="0.1"
                  {...register("carbs_g", { valueAsNumber: true })}
                />
                {servings > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Total: {((parsed.carbs_g || 0) * servings).toFixed(1)}g
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fat_g">Total Fat (g)</Label>
                <Input
                  id="fat_g"
                  type="number"
                  step="0.1"
                  {...register("fat_g", { valueAsNumber: true })}
                />
                {servings > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Total: {((parsed.fat_g || 0) * servings).toFixed(1)}g
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="saturated_fat_g">Saturated Fat (g)</Label>
                <Input
                  id="saturated_fat_g"
                  type="number"
                  step="0.1"
                  {...register("saturated_fat_g", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="cholesterol_mg">Cholesterol (mg)</Label>
                <Input
                  id="cholesterol_mg"
                  type="number"
                  step="1"
                  {...register("cholesterol_mg", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="fiber_g">Dietary Fiber (g)</Label>
                <Input
                  id="fiber_g"
                  type="number"
                  step="0.1"
                  {...register("fiber_g", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="sugar_g">Added Sugars (g)</Label>
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
                  step="1"
                  {...register("sodium_mg", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="potassium_mg">Potassium (mg)</Label>
                <Input
                  id="potassium_mg"
                  type="number"
                  step="1"
                  {...register("potassium_mg", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="calcium_mg">Calcium (mg)</Label>
                <Input
                  id="calcium_mg"
                  type="number"
                  step="1"
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
          </div>

          <Button type="submit" disabled={isSaving} className="w-full" size="lg">
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

