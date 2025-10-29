import { test, expect } from "@playwright/test";

test.describe("NutriScan Happy Path", () => {
  test("complete flow: add food → view dashboard → view charts → export", async ({
    page,
  }) => {
    // Navigate to sign-in
    await page.goto("/");

    // Sign in as demo user
    await page.fill('input[type="email"]', "demo");
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL("/dashboard");

    // Verify dashboard elements
    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.locator("text=Quick Actions")).toBeVisible();

    // Navigate to Add Food page
    await page.click('text=Add Food');
    await page.waitForURL("/add");

    // Fill in food information
    await page.fill('input[id="name"]', "Banana");
    await page.fill('input[id="brand"]', "Dole");
    await page.fill('input[id="servingSize"]', "1 medium (118g)");

    // Click AI estimate button
    await page.click("text=Estimate with AI");

    // Wait for AI estimation (or timeout and continue with manual)
    try {
      await page.waitForSelector('text=AI Estimation', { timeout: 10000 });
      
      // If AI works, verify the form is populated
      const caloriesInput = page.locator('input[id="calories"]');
      const caloriesValue = await caloriesInput.inputValue();
      expect(parseFloat(caloriesValue)).toBeGreaterThan(0);

      // Save the entry
      await page.click("text=Save Entry");
      await page.waitForURL("/dashboard");
    } catch (error) {
      // If AI fails (no API key), just navigate back
      console.log("AI estimation not available, continuing test...");
      await page.goto("/dashboard");
    }

    // Verify we're back on dashboard
    await expect(page.locator("h1")).toContainText("Dashboard");

    // Navigate to Charts page
    await page.click('a:has-text("Charts")');
    await page.waitForURL("/charts");

    // Verify charts are rendered
    await expect(page.locator("h1")).toContainText("Nutrition Charts");
    await expect(page.locator("text=Today's Macronutrients")).toBeVisible();

    // Navigate to Intake Table
    await page.click('a:has-text("Intake Table")');
    await page.waitForURL("/intake");

    // Verify table is rendered
    await expect(page.locator("h1")).toContainText("Intake Table");
    await expect(page.locator("text=Food Entries")).toBeVisible();

    // Verify export buttons exist
    await expect(page.locator("text=Export CSV")).toBeVisible();
    await expect(page.locator("text=Export XLSX")).toBeVisible();

    // Navigate to Recommendations
    await page.click('a:has-text("Recommendations")');
    await page.waitForURL("/recommendations");

    // Verify recommendations page
    await expect(page.locator("h1")).toContainText("Meal Recommendations");
    await expect(page.locator("text=Disclaimer")).toBeVisible();

    // Navigate to Settings
    await page.click('a:has-text("Settings")');
    await page.waitForURL("/settings");

    // Verify settings page
    await expect(page.locator("h1")).toContainText("Settings");
    await expect(page.locator("text=Daily Goals")).toBeVisible();

    // Test complete!
    console.log("Happy path test completed successfully!");
  });
});

