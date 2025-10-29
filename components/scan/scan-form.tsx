"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
// @ts-expect-error - scan-preview might not have type declarations
import { ScanPreview } from "./scan-preview";
import { Loader2, Upload } from "lucide-react";
import type { ParsedNutrition } from "@/lib/ocr/parseNutrition";
import { parseNutritionFromOCR, extractServingSize } from "@/lib/ocr/parseNutrition";
import { createWorker } from "tesseract.js";

export function ScanForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [parsed, setParsed] = useState<ParsedNutrition | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsed(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    let worker = null;

    try {
      console.log("Starting client-side OCR processing...");

      // Create Tesseract worker on the client side
      worker = await createWorker("eng", 1, {
        logger: (m) => console.log(m), // Log progress to console
      });

      console.log("Worker created, performing recognition...");

      // Perform OCR on the image
      const { data } = await worker.recognize(file);
      
      console.log("Recognition complete, OCR text length:", data.text.length);

      const ocrText = data.text;

      // Parse nutrition facts from OCR text
      const parsed = parseNutritionFromOCR(ocrText);
      const servingSize = extractServingSize(ocrText);

      const result = {
        ...parsed,
        servingSize: servingSize || parsed.servingSize,
      };

      console.log("Parsed nutrition data:", result);
      setParsed(result);

      if (!result.hasNutritionFacts || result.confidence < 0.3) {
        toast({
          title: "Nutrition facts not detected",
          description:
            "Please retake the photo in bright light, fill the frame, and avoid glare.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scan successful!",
          description: "Please review and edit the parsed nutrition information.",
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Always terminate worker to prevent memory leaks
      if (worker) {
        try {
          await worker.terminate();
          console.log("Worker terminated successfully");
        } catch (e) {
          console.error("Error terminating worker:", e);
        }
      }
      setIsScanning(false);
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
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image">Nutrition Label Photo</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="mt-2"
            />
          </div>

          {preview && (
            <div className="relative w-full max-w-md mx-auto">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto rounded-lg border"
              />
            </div>
          )}

          <Button
            onClick={handleScan}
            disabled={!file || isScanning}
            className="w-full"
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Scan Label
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {parsed && (
        <ScanPreview
          parsed={parsed}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}

