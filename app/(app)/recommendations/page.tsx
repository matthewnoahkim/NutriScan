import { getRecommendations } from "@/app/actions/recommendations";
import { RecommendationsList } from "@/components/recommendations/recommendations-list";

export default async function RecommendationsPage() {
  const recommendations = await getRecommendations();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Meal Recommendations</h1>
        <p className="text-muted-foreground">
          Get personalized meal suggestions based on your nutritional goals and
          budget
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
          <p className="font-semibold mb-1">⚠️ Disclaimer</p>
          <p>
            NutriScan provides informational estimates only and does not replace
            professional medical or dietary advice. OCR and AI estimates may
            contain errors. Always verify labels and consult a healthcare
            professional for personalized guidance.
          </p>
        </div>
      </div>

      <RecommendationsList initialRecommendations={recommendations} />
    </div>
  );
}

