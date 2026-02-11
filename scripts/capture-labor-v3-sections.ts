import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

/**
 * Captures Labor Cost V3 dashboard in multiple sections (scrolled views)
 * Section 1: Top of page (viewport 0-1080)
 * Section 2: Scrolled down (viewport ~900-1980, showing content below fold)
 */
async function captureLaborV3Sections() {
  console.log("Starting Labor V3 section captures...");

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Inject auth token to bypass login
  await page.addInitScript(() => {
    localStorage.setItem(
      "authToken",
      JSON.stringify({
        token: "dev-bypass-token",
        user: { name: "Demo User", role: "admin" },
        timestamp: Date.now(),
      }),
    );
  });

  try {
    // Navigate to labor cost v3
    console.log("Navigating to Labor Cost V3...");
    await page.goto("http://localhost:8080/dashboard/labor-cost-v3.html", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for page to render
    await page.waitForTimeout(3000);

    // Force dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0a0a15";
    });

    await page.waitForTimeout(1000);

    // Get page height
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Page height: ${pageHeight}px`);

    // Section 1: Top of page (no scroll)
    console.log("Capturing Section 1 (top of page)...");
    await page.screenshot({
      path: "video-assets/06-labor-cost-v3.png",
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
    console.log("Section 1 captured!");

    // Section 2: Scroll down to show content below the fold
    // Scroll by ~900px so there's some overlap for context
    const scrollAmount = 900;
    console.log(`Scrolling down ${scrollAmount}px for Section 2...`);

    await page.evaluate((scroll) => {
      window.scrollTo({ top: scroll, behavior: "instant" });
    }, scrollAmount);

    await page.waitForTimeout(500); // Wait for scroll to complete

    // Capture section 2
    console.log("Capturing Section 2 (scrolled view)...");
    await page.screenshot({
      path: "video-assets/06-labor-cost-v3-section2.png",
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
    console.log("Section 2 captured!");

    // Copy to public folder for Remotion
    const publicDir = path.join(__dirname, "..", "public");
    fs.copyFileSync(
      "video-assets/06-labor-cost-v3.png",
      path.join(publicDir, "06-labor-cost-v3.png"),
    );
    fs.copyFileSync(
      "video-assets/06-labor-cost-v3-section2.png",
      path.join(publicDir, "06-labor-cost-v3-section2.png"),
    );

    console.log("\nBoth sections captured and copied to public/");
    console.log("- 06-labor-cost-v3.png (top)");
    console.log("- 06-labor-cost-v3-section2.png (scrolled down)");
  } catch (error) {
    console.error("Capture error:", error);
  } finally {
    await browser.close();
  }
}

captureLaborV3Sections();
