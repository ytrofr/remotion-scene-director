import { chromium } from "playwright";
import * as fs from "fs";

/**
 * Captures Labor Cost V3 with smaller viewport to force scrollable content
 * Then captures two views: top and scrolled
 */
async function captureLaborV3Scroll() {
  console.log("Starting Labor V3 scroll captures...");

  const browser = await chromium.launch({
    headless: true,
  });

  // Use smaller viewport height to force scroll
  const context = await browser.newContext({
    viewport: { width: 1920, height: 700 }, // Smaller height forces scroll
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
    console.log("Navigating to Labor Cost V3...");
    await page.goto("http://localhost:8080/dashboard/labor-cost-v3.html", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    // Force dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0a0a15";
    });

    await page.waitForTimeout(1000);

    // Get page dimensions
    const pageInfo = await page.evaluate(() => ({
      scrollHeight: document.body.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollTop: window.scrollY,
    }));
    console.log(`Page info:`, pageInfo);

    // Section 1: Top view (resize to 1080 height for clean screenshot)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    console.log("Capturing Section 1 (top)...");
    await page.screenshot({
      path: "video-assets/06-labor-cost-v3.png",
    });

    // Get new page height after resize
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Full page height at 1080 viewport: ${newHeight}px`);

    // Scroll to bottom half
    const scrollTo = Math.max(0, newHeight - 1080);
    if (scrollTo > 0) {
      console.log(`Scrolling to ${scrollTo}px for Section 2...`);
      await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
      await page.waitForTimeout(500);

      console.log("Capturing Section 2 (scrolled)...");
      await page.screenshot({
        path: "video-assets/06-labor-cost-v3-section2.png",
      });
    } else {
      console.log("Page fits in viewport - no scroll content available");
      console.log("Taking full page screenshot instead...");

      // Take full page screenshot at higher resolution
      await page.screenshot({
        path: "video-assets/06-labor-cost-v3-full.png",
        fullPage: true,
      });

      // Check if full page is taller
      const fullPagePath = "video-assets/06-labor-cost-v3-full.png";
      const stats = fs.statSync(fullPagePath);
      console.log(`Full page screenshot size: ${stats.size} bytes`);
    }

    // Copy to public
    fs.copyFileSync(
      "video-assets/06-labor-cost-v3.png",
      "public/06-labor-cost-v3.png",
    );

    if (fs.existsSync("video-assets/06-labor-cost-v3-section2.png")) {
      fs.copyFileSync(
        "video-assets/06-labor-cost-v3-section2.png",
        "public/06-labor-cost-v3-section2.png",
      );
    }

    console.log("\nCaptures complete!");
  } catch (error) {
    console.error("Capture error:", error);
  } finally {
    await browser.close();
  }
}

captureLaborV3Scroll();
