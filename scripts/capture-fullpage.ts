import { chromium } from "playwright";
import * as fs from "fs";

/**
 * Captures Labor Cost V3 as a FULL PAGE screenshot (entire scrollable content)
 * Also captures multiple viewport-sized sections for coordinate picking
 */
async function captureFullPage() {
  console.log("Starting full page capture...");

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Inject auth token
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
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // Wait for content to load
    await page.waitForTimeout(5000);

    // Force dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0a0a15";
    });

    // Scroll to bottom and back to trigger lazy loading
    console.log("Triggering lazy load by scrolling...");
    await page.evaluate(async () => {
      const scrollStep = 500;
      const delay = 100;
      const maxScroll = document.body.scrollHeight;

      // Scroll down
      for (let y = 0; y < maxScroll; y += scrollStep) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, delay));
      }
      // Scroll back to top
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(2000);

    // Get actual page height after all content loaded
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Full page height: ${pageHeight}px`);

    // Capture FULL PAGE screenshot
    console.log("Capturing full page screenshot...");
    await page.screenshot({
      path: "video-assets/labor-cost-v3-FULLPAGE.png",
      fullPage: true,
    });

    // Get full page dimensions
    const fullPageInfo = await page.evaluate(() => ({
      width: document.body.scrollWidth,
      height: document.body.scrollHeight,
    }));
    console.log(
      `Full page dimensions: ${fullPageInfo.width}x${fullPageInfo.height}`,
    );

    // Calculate how many sections we need (each 1080px)
    const numSections = Math.ceil(pageHeight / 1080);
    console.log(`Page requires ${numSections} sections to cover fully`);

    // Capture each section (viewport-sized screenshots)
    for (let i = 0; i < numSections; i++) {
      const scrollY = i * 1080;
      console.log(
        `Capturing section ${i + 1}/${numSections} (scroll: ${scrollY}px)...`,
      );

      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(300);

      await page.screenshot({
        path: `video-assets/labor-v3-section-${i + 1}.png`,
      });
    }

    // Copy files to public folder
    console.log("\nCopying to public folder...");
    fs.copyFileSync(
      "video-assets/labor-cost-v3-FULLPAGE.png",
      "public/labor-cost-v3-FULLPAGE.png",
    );

    for (let i = 0; i < numSections; i++) {
      fs.copyFileSync(
        `video-assets/labor-v3-section-${i + 1}.png`,
        `public/labor-v3-section-${i + 1}.png`,
      );
    }

    console.log("\n=== CAPTURE COMPLETE ===");
    console.log(
      `Full page: labor-cost-v3-FULLPAGE.png (${fullPageInfo.width}x${fullPageInfo.height})`,
    );
    console.log(
      `Sections: ${numSections} files (labor-v3-section-1.png through labor-v3-section-${numSections}.png)`,
    );
    console.log(
      `\nEach section is 1920x1080 - you can use Fit-LaborV3-Section-X to pick coordinates!`,
    );
  } catch (error) {
    console.error("Capture error:", error);
  } finally {
    await browser.close();
  }
}

captureFullPage();
