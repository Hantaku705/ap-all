import { chromium } from "@playwright/test";

async function fullCheck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors: string[] = [];
  const consoleLogs: string[] = [];

  page.on("pageerror", (error) => {
    errors.push("PAGE ERROR: " + error.message);
  });

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      errors.push("CONSOLE ERROR: " + text);
    } else if (msg.type() === "warning") {
      consoleLogs.push("WARNING: " + text);
    }
  });

  console.log("=== Checking https://ajinomoto-dashboard.vercel.app ===\n");

  try {
    // Navigate to the page
    console.log("1. Navigating to page...");
    const response = await page.goto("https://ajinomoto-dashboard.vercel.app", {
      waitUntil: "load",
      timeout: 60000,
    });

    console.log("   Status:", response?.status());

    // Wait for content to load
    console.log("2. Waiting for content...");
    await page.waitForTimeout(5000);

    // Check page title
    const title = await page.title();
    console.log("3. Page title:", title);

    // Check if main content is visible
    const hasHeader = await page.locator("h1").first().isVisible();
    console.log("4. Header visible:", hasHeader);

    // Check for loading spinner (if still loading)
    const hasSpinner = await page.locator(".animate-spin").count();
    console.log("5. Loading spinners:", hasSpinner);

    // Take screenshot
    await page.screenshot({
      path: "tests/screenshots/full-check.png",
      fullPage: true,
    });
    console.log("6. Screenshot saved: tests/screenshots/full-check.png");

    // Click on Reports tab and check
    console.log("\n7. Checking Reports tab...");
    await page.click("text=Reports");
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: "tests/screenshots/reports-check.png",
      fullPage: false,
    });
    console.log("   Screenshot saved: tests/screenshots/reports-check.png");

    // Summary
    console.log("\n=== SUMMARY ===");
    if (errors.length > 0) {
      console.log("ERRORS FOUND:");
      errors.forEach((e) => console.log("  - " + e));
    } else {
      console.log("NO ERRORS DETECTED");
    }

    if (consoleLogs.length > 0) {
      console.log("\nWARNINGS:");
      consoleLogs.slice(0, 5).forEach((w) => console.log("  - " + w));
    }

  } catch (e: unknown) {
    console.log("NAVIGATION ERROR:", (e as Error).message);
    errors.push("Navigation failed: " + (e as Error).message);
  }

  await browser.close();

  // Exit with error code if errors found
  if (errors.length > 0) {
    process.exit(1);
  }
}

fullCheck();
