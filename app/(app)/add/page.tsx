import { AddFoodForm } from "@/components/add/add-food-form";

export default function AddFoodPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Add Food</h1>
        <p className="text-muted-foreground">
          Use AI to estimate nutrition or enter manually
        </p>
      </div>

      <AddFoodForm />
    </div>
  );
}

