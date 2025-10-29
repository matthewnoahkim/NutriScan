"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function getGoals() {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { goals: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.goals;
}

export async function updateGoals(data: {
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
  budget_usd?: number;
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

  const goals = await prisma.goal.upsert({
    where: { userId: user.id },
    update: data,
    create: {
      ...data,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return goals;
}

