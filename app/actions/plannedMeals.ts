"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPlannedMeals(startDate?: Date, endDate?: Date) {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return [];

  const start = startDate || new Date();
  start.setHours(0, 0, 0, 0);

  const end = endDate || new Date();
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  const meals = await prisma.plannedMeal.findMany({
    where: {
      userId: user.id,
      plannedFor: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      plannedFor: "asc",
    },
  });

  return meals;
}

export async function createPlannedMeal(data: {
  name: string;
  description?: string;
  plannedFor: Date;
  servingSize?: string;
  servings?: number;
  estimatedCost?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  saturated_fat_g?: number;
  cholesterol_mg?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  potassium_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
}) {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const meal = await prisma.plannedMeal.create({
    data: {
      ...data,
      userId: user.id,
    },
  });

  revalidatePath("/planner");
  revalidatePath("/recommendations");
  return meal;
}

export async function completePlannedMeal(id: string) {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the planned meal
  const plannedMeal = await prisma.plannedMeal.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!plannedMeal) {
    throw new Error("Planned meal not found");
  }

  // Create a food entry from the planned meal
  await prisma.foodEntry.create({
    data: {
      userId: user.id,
      name: plannedMeal.name,
      source: "manual",
      servingSize: plannedMeal.servingSize,
      servings: plannedMeal.servings,
      price_usd: plannedMeal.estimatedCost,
      calories: plannedMeal.calories,
      protein_g: plannedMeal.protein_g,
      carbs_g: plannedMeal.carbs_g,
      fat_g: plannedMeal.fat_g,
      saturated_fat_g: plannedMeal.saturated_fat_g,
      cholesterol_mg: plannedMeal.cholesterol_mg,
      fiber_g: plannedMeal.fiber_g,
      sugar_g: plannedMeal.sugar_g,
      sodium_mg: plannedMeal.sodium_mg,
      potassium_mg: plannedMeal.potassium_mg,
      calcium_mg: plannedMeal.calcium_mg,
      iron_mg: plannedMeal.iron_mg,
      capturedAt: new Date(),
    },
  });

  // Mark the meal as completed
  await prisma.plannedMeal.update({
    where: { id },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  revalidatePath("/planner");
  revalidatePath("/dashboard");
  revalidatePath("/intake");
}

export async function deletePlannedMeal(id: string) {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.plannedMeal.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/planner");
  revalidatePath("/recommendations");
}
