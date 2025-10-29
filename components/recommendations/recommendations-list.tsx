"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealRecommendation } from "@/lib/recommendations";
import { createEntry } from "@/app/actions/entries";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Plus, Loader2, RefreshCw } from "lucide-react";
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
  const { toast } = useToast();
  const router = useRouter();

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

  const handleAddToEntries = async (rec: MealRecommendation) => {
    setAddingId(rec.name);
    try {
      await createEntry({
        name: rec.name,
        source: "manual",
        servingSize: "1 serving",
        servings: 1,
        calories: rec.estimatedCalories,
        protein_g: rec.estimatedProtein,
        fiber_g: rec.estimatedFiber,
        price_usd: rec.estimatedCost,
      });

      toast({
        title: "Added to entries!",
        description: `${rec.name} has been added to your intake log.`,
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Failed to add entry",
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
                <CardTitle className="flex items-center justify-between">
                  <span>{rec.name}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToEntries(rec)}
                    disabled={addingId === rec.name}
                  >
                    {addingId === rec.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Entries
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

