import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";
import { parseNutritionFromOCR, extractServingSize } from "@/lib/ocr/parseNutrition";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert image to buffer
    const imageBuffer = await image.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);

    // Perform OCR
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(imageData);
    await worker.terminate();

    const ocrText = data.text;

    // Parse nutrition facts
    const parsed = parseNutritionFromOCR(ocrText);
    const servingSize = extractServingSize(ocrText);

    return NextResponse.json({
      ...parsed,
      servingSize: servingSize || parsed.servingSize,
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}

