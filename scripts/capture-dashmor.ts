/**
 * Capture Dashmor Screen
 * Usage: npx ts-node scripts/capture-dashmor.ts
 */

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, "..", "video-assets");
const BASE_URL = "http://localhost:8080";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureDashmor(): Promise<void> {
  console.log("🎬 Capturing Dashmor screen...\n");

  const browser: Browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page: Page = await context.newPage();

  try {
    // Inject auth and dark mode
    console.log("🔐 Injecting auth token + enabling dark mode...");
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    await page.evaluate(() => {
      const mockAuth = {
        token: "mock-video-capture-token",
        user: {
          user_id: "video-capture",
          username: "demo",
          role_id: 1,
          permissions: ["dashboard:view", "ai:use", "settings:view"],
        },
        timestamp: Date.now(),
      };
      localStorage.setItem("limorAuth", JSON.stringify(mockAuth));
      localStorage.setItem("limor-theme", "dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });

    const ensureDarkMode = async () => {
      await page.evaluate(() => {
        localStorage.setItem("limor-theme", "dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.body.classList.add("dark");
      });
    };

    // Capture Labor Cost V3 page
    console.log("📊 Capturing Labor Cost V3 page...");
    await page.goto(`${BASE_URL}/dashboard/labor-cost-v3.html`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await ensureDarkMode();
    await delay(8000); // Wait for all charts and data to load fully
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "06-labor-cost-v3.png"),
      fullPage: false,
    });
    console.log("   ✅ 06-labor-cost-v3.png saved\n");

    console.log("🎉 Labor Cost V3 screenshot captured!");
    console.log(`📁 Output: ${OUTPUT_DIR}/06-labor-cost-v3.png`);
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureDashmor()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
