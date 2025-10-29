"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createEntry(data: {
  name: string;
  source: "scan" | "ai" | "manual";
  servingSize?: string;
  servings?: number;
  price_usd?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  potassium_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  ocrText?: string;
  aiModel?: string;
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

  const entry = await prisma.foodEntry.create({
    data: {
      ...data,
      userId: user.id,
      servings: data.servings || 1,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/intake");

  return entry;
}

export async function updateEntry(
  id: string,
  data: Partial<{
    name: string;
    servingSize: string;
    servings: number;
    price_usd: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
    potassium_mg: number;
    calcium_mg: number;
    iron_mg: number;
  }>
) {
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

  const entry = await prisma.foodEntry.updateMany({
    where: { id, userId: user.id },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/intake");

  return entry;
}

export async function deleteEntry(id: string) {
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

  await prisma.foodEntry.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/intake");
}

export async function getEntries(startDate?: Date, endDate?: Date) {
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

  const where: any = { userId: user.id };

  if (startDate || endDate) {
    where.capturedAt = {};
    if (startDate) where.capturedAt.gte = startDate;
    if (endDate) where.capturedAt.lte = endDate;
  }

  return prisma.foodEntry.findMany({
    where,
    orderBy: { capturedAt: "desc" },
  });
}

export async function getTodayEntries() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getEntries(today, tomorrow);
}

