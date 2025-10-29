import { NextRequest, NextResponse } from "next/server";
import { estimateNutrition } from "@/lib/ai/estimateNutrition";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, brand, servingSize } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Food name is required" },
        { status: 400 }
      );
    }

    const estimate = await estimateNutrition({
      name,
      brand,
      servingSize,
    });

    return NextResponse.json(estimate);
  } catch (error: any) {
    console.error("AI estimation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to estimate nutrition" },
      { status: 500 }
    );
  }
}

