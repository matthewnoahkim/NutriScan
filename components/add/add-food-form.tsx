"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AIEstimation } from "@/lib/schemas";
import { AiPreview } from "./ai-preview";
import { Loader2, Sparkles, Edit } from "lucide-react";

export function AddFoodForm() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<AIEstimation | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleEstimate = async () => {
    if (!name) {
      toast({
        title: "Food name required",
        description: "Please enter a food name to estimate nutrition.",
        variant: "destructive",
      });
      return;
    }

    setIsEstimating(true);

    try {
      const response = await fetch("/api/ai/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brand, servingSize }),
      });

      if (!response.ok) {
        throw new Error("Failed to estimate nutrition");
      }

      const data = await response.json();
      setEstimation(data);

      if (data.confidence < 0.6) {
        toast({
          title: "Low confidence estimate",
          description:
            "AI estimate has low confidence. Please review and adjust values.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Estimation complete!",
          description: "Review the nutrition information and save.",
        });
      }
    } catch (error: any) {
      console.error("Estimation error:", error);
      const errorMessage = error.message || "";
      if (errorMessage.includes("OPENAI_API_KEY")) {
        toast({
          title: "OpenAI API Key Required",
          description: "Please add your OpenAI API key to .env file or enter nutrition values manually below.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Estimation failed",
          description: error.message || "Failed to estimate nutrition. Please enter values manually below.",
          variant: "destructive",
        });
      }
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSaveSuccess = () => {
    toast({
      title: "Entry saved!",
      description: "Your food entry has been added to your intake log.",
    });
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Food Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Food Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grilled chicken breast"
            />
          </div>

          <div>
            <Label htmlFor="brand">Brand (optional)</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Tyson"
            />
          </div>

          <div>
            <Label htmlFor="servingSize">Serving Size (optional)</Label>
            <Input
              id="servingSize"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              placeholder="e.g., 6 oz (170g)"
            />
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleEstimate}
              disabled={!name || isEstimating}
              className="w-full"
              size="lg"
            >
              {isEstimating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Estimating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Estimate with AI
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setShowManualEntry(true);
                setEstimation({
                  name: name,
                  servingSize: servingSize || "1 serving",
                  calories: 0,
                  protein_g: 0,
                  carbs_g: 0,
                  fat_g: 0,
                  confidence: 1,
                });
              }}
              disabled={!name}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Edit className="mr-2 h-5 w-5" />
              Enter Manually
            </Button>
          </div>
        </CardContent>
      </Card>

      {estimation && (
        <AiPreview
          estimation={estimation}
          initialName={name}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}

