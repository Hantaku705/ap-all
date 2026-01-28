import { chromium } from "@playwright/test";

async function checkErrors() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push("Page Error: " + error.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push("Console Error: " + msg.text());
    }
  });

  try {
    await page.goto("https://ajinomoto-dashboard.vercel.app", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for any dynamic content
    await page.waitForTimeout(3000);

    console.log("Page title:", await page.title());
    console.log("");

    if (errors.length > 0) {
      console.log("=== ERRORS FOUND ===");
      errors.forEach((e) => console.log(e));
    } else {
      console.log("=== NO ERRORS ===");
    }

    // Take a screenshot
    await page.screenshot({
      path: "tests/screenshots/dashboard-check.png",
      fullPage: false,
    });
    console.log("\nScreenshot saved to tests/screenshots/dashboard-check.png");
  } catch (e: unknown) {
    console.log("Navigation error:", (e as Error).message);
  }

  await browser.close();
}

checkErrors();
