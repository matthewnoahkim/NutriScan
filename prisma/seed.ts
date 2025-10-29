import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@nutriscan.app" },
    update: {},
    create: {
      email: "demo@nutriscan.app",
      name: "Demo User",
    },
  });

  console.log("Created demo user:", user.email);

  // Create default goals
  await prisma.goal.upsert({
    where: { userId: user.id },
    update: {
      calories: 2500,
      protein_g: 130,
      carbs_g: 250,
      fat_g: 70,
      fiber_g: 30,
      sugar_g: 50,
      sodium_mg: 2300,
      potassium_mg: 3500,
      calcium_mg: 1000,
      iron_mg: 18,
      budget_usd: 20,
    },
    create: {
      userId: user.id,
      calories: 2500,
      protein_g: 130,
      carbs_g: 250,
      fat_g: 70,
      fiber_g: 30,
      sugar_g: 50,
      sodium_mg: 2300,
      potassium_mg: 3500,
      calcium_mg: 1000,
      iron_mg: 18,
      budget_usd: 20,
    },
  });

  console.log("Created default goals");

  // Create seed food entries
  const entries = [
    {
      name: "Oatmeal with Berries",
      source: "manual",
      servingSize: "1 cup (234g)",
      servings: 1,
      price_usd: 2.5,
      calories: 310,
      protein_g: 11,
      carbs_g: 54,
      fat_g: 6,
      fiber_g: 8,
      sugar_g: 12,
      sodium_mg: 130,
      potassium_mg: 350,
      calcium_mg: 200,
      iron_mg: 3.5,
    },
    {
      name: "Grilled Chicken Breast",
      source: "manual",
      servingSize: "6 oz (170g)",
      servings: 1,
      price_usd: 4.5,
      calories: 280,
      protein_g: 53,
      carbs_g: 0,
      fat_g: 6,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 140,
      potassium_mg: 570,
      calcium_mg: 20,
      iron_mg: 1.2,
    },
    {
      name: "Mixed Green Salad with Dressing",
      source: "manual",
      servingSize: "2 cups (140g)",
      servings: 1,
      price_usd: 3.0,
      calories: 150,
      protein_g: 3,
      carbs_g: 12,
      fat_g: 11,
      fiber_g: 4,
      sugar_g: 5,
      sodium_mg: 380,
      potassium_mg: 420,
      calcium_mg: 80,
      iron_mg: 2.1,
    },
    {
      name: "Greek Yogurt",
      source: "manual",
      servingSize: "1 container (170g)",
      servings: 1,
      price_usd: 1.5,
      calories: 130,
      protein_g: 17,
      carbs_g: 9,
      fat_g: 3,
      fiber_g: 0,
      sugar_g: 7,
      sodium_mg: 70,
      potassium_mg: 240,
      calcium_mg: 180,
      iron_mg: 0.1,
    },
    {
      name: "Potato Chips",
      source: "scan",
      servingSize: "1 oz (28g)",
      servings: 1.5,
      price_usd: 1.2,
      calories: 160,
      protein_g: 2,
      carbs_g: 15,
      fat_g: 10,
      fiber_g: 1,
      sugar_g: 1,
      sodium_mg: 180,
      potassium_mg: 380,
      calcium_mg: 10,
      iron_mg: 0.5,
      ocrText: "Nutrition Facts\nServing Size 1 oz (28g)\nCalories 160\nTotal Fat 10g\nSodium 180mg\nTotal Carbohydrate 15g\nProtein 2g",
    },
  ];

  for (const entry of entries) {
    await prisma.foodEntry.create({
      data: {
        ...entry,
        userId: user.id,
        capturedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      },
    });
  }

  console.log(`Created ${entries.length} seed food entries`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

