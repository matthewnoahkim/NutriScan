"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MealRecommendation } from "@/lib/recommendations";
import { createPlannedMeal } from "@/app/actions/plannedMeals";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, CalendarPlus, Loader2 } from "lucide-react";
import { getAIRecommendations } from "@/app/actions/recommendations";

interface RecommendationsListProps {
  initialRecommendations: MealRecommendation[];
}

export function RecommendationsList({
  initialRecommendations,
}: RecommendationsListProps) {
  const [recommendations, setRecommendations] = useState(
    initialRecommendations
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const router = useRouter();

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleGetAIRecommendations = async () => {
    setIsLoadingAI(true);
    try {
      const aiRecs = await getAIRecommendations();
      setRecommendations(aiRecs);
      toast({
        title: "AI recommendations loaded",
        description: "Generated personalized meal suggestions using AI.",
      });
    } catch (error) {
      toast({
        title: "Failed to load AI recommendations",
        description: "Using basic recommendations instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAddToPlanner = async (rec: MealRecommendation, index: number) => {
    setAddingId(rec.name);
    try {
      const dateStr = selectedDates[rec.name] || getTomorrowDate();
      const plannedDate = new Date(dateStr);
      plannedDate.setHours(12, 0, 0, 0); // Set to noon

      await createPlannedMeal({
        name: rec.name,
        description: rec.description,
        plannedFor: plannedDate,
        servingSize: "1 serving",
        servings: 1,
        estimatedCost: rec.estimatedCost,
        calories: rec.estimatedCalories,
        protein_g: rec.estimatedProtein,
        fiber_g: rec.estimatedFiber,
      });

      toast({
        title: "Added to meal planner",
        description: `${rec.name} scheduled for ${new Date(dateStr).toLocaleDateString()}.`,
      });

      router.push("/planner");
    } catch (error) {
      toast({
        title: "Failed to add meal",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {recommendations.length} recommendations
        </p>
        <Button
          variant="outline"
          onClick={handleGetAIRecommendations}
          disabled={isLoadingAI}
        >
          {isLoadingAI ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Recommendations
            </>
          )}
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations available.</p>
            <p className="text-sm mt-2">
              Set your goals in Settings to get personalized recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recommendations.map((rec, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{rec.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {rec.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Calories</p>
                    <p className="text-muted-foreground">
                      {rec.estimatedCalories} kcal
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Protein</p>
                    <p className="text-muted-foreground">
                      {rec.estimatedProtein}g
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Fiber</p>
                    <p className="text-muted-foreground">
                      {rec.estimatedFiber}g
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Cost</p>
                    <p className="text-muted-foreground">
                      ${rec.estimatedCost.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-semibold">Why:</span> {rec.rationale}
                  </p>
                </div>
                
                {/* Add to Planner Section */}
                <div className="pt-2 border-t space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                      <Label htmlFor={`date-${index}`} className="text-sm">
                        Plan for:
                      </Label>
                      <input
                        id={`date-${index}`}
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={selectedDates[rec.name] || getTomorrowDate()}
                        onChange={(e) =>
                          setSelectedDates({
                            ...selectedDates,
                            [rec.name]: e.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <Button
                      onClick={() => handleAddToPlanner(rec, index)}
                      disabled={addingId === rec.name}
                      className="w-full"
                    >
                      {addingId === rec.name ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          Add to Planner
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

