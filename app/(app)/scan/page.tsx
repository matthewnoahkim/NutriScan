import { ScanForm } from "@/components/scan/scan-form";

export default function ScanPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Scan Nutrition Label</h1>
        <p className="text-muted-foreground">
          Take a photo of a nutrition facts label to automatically extract
          nutritional information
        </p>
      </div>

      <ScanForm />
    </div>
  );
}

