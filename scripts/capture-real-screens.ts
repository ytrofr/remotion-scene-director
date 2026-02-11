/**
 * Capture Real LIMOR Screens for Professional Demo Video
 *
 * Prerequisites:
 * - LIMOR server running on localhost:8080
 * - Playwright installed
 *
 * Usage: npx ts-node scripts/capture-real-screens.ts
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

async function captureScreenshots(): Promise<void> {
  console.log("🎬 Starting LIMOR screenshot capture...\n");

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
    // First, inject mock auth token and enable dark mode
    console.log("🔐 Injecting auth token + enabling dark mode...");
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    // Inject auth data and dark theme into localStorage
    await page.evaluate(() => {
      // Auth token
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

      // Enable dark mode
      localStorage.setItem("limor-theme", "dark");
      document.documentElement.setAttribute("data-theme", "dark");

      console.log("Auth + dark mode set");
    });
    console.log("   ✅ Auth token + dark mode enabled\n");

    // Helper to ensure dark mode is applied after navigation
    const ensureDarkMode = async () => {
      await page.evaluate(() => {
        localStorage.setItem("limor-theme", "dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.body.classList.add("dark");
      });
    };

    // 1. Capture Labor Cost Dashboard
    console.log("📊 Capturing Labor Cost Dashboard...");
    await page.goto(`${BASE_URL}/dashboard/labor-cost.html`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await ensureDarkMode();
    await delay(2000); // Wait for charts to render
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "01-dashboard-full.png"),
      fullPage: false,
    });
    console.log("   ✅ 01-dashboard-full.png saved\n");

    // 2. Capture AI Chat - Empty State
    console.log("💬 Capturing AI Chat (empty state)...");
    await page.goto(`${BASE_URL}/dashboard/limor-chat.html`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await ensureDarkMode();
    await delay(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "02-chat-empty.png"),
    });
    console.log("   ✅ 02-chat-empty.png saved\n");

    // 3. Capture AI Chat - With Question Typed
    console.log("⌨️  Typing question in chat...");
    const question = "כמה עובדים עבדו אתמול בסניף ויצמן?";

    // Wait for the chat interface to fully load
    await delay(2000);

    // Find the textarea input field
    const inputSelector = "textarea.chat-input";
    try {
      await page.waitForSelector(inputSelector, {
        timeout: 10000,
        state: "visible",
      });
      await page.fill(inputSelector, question);
      console.log(`   Found input with selector: ${inputSelector}`);
    } catch (e) {
      console.log("   ⚠️  Could not find chat input, trying alternative...");
      // Try clicking into the textarea first
      const textarea = await page.$("textarea");
      if (textarea) {
        await textarea.click();
        await page.keyboard.type(question, { delay: 30 });
        console.log("   Used keyboard typing as fallback");
      }
    }

    await delay(500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "03-chat-question.png"),
    });
    console.log("   ✅ 03-chat-question.png saved\n");

    // 4. Capture AI Chat - With Response (send the question)
    console.log("🤖 Sending question and waiting for AI response...");

    // Try to find and click send button
    const sendButtonSelector =
      'button[type="submit"], .send-button, .btn-send, button.submit-btn';
    try {
      const sendButton = await page.$(sendButtonSelector);
      if (sendButton) {
        await sendButton.click();
        console.log("   Clicked send button");
      } else {
        // Use keyboard shortcut as fallback
        await page.keyboard.press("Enter");
        console.log("   Pressed Enter to send");
      }
    } catch (e) {
      await page.keyboard.press("Enter");
      console.log("   Pressed Enter to send (fallback)");
    }

    // Wait for AI response
    console.log("   Waiting for AI response (up to 20s)...");
    await delay(20000); // Give AI time to respond

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "04-chat-response.png"),
    });
    console.log("   ✅ 04-chat-response.png saved\n");

    // 5. Capture with highlight effect (add visual emphasis)
    console.log("✨ Adding highlight effect...");
    await page.evaluate(() => {
      // Try to highlight the last message/response area
      const responseSelectors = [
        ".message:last-child",
        ".ai-message:last-child",
        ".assistant-message:last-child",
        ".chat-message:last-child",
      ];
      for (const sel of responseSelectors) {
        const el = document.querySelector(sel) as HTMLElement;
        if (el) {
          el.style.boxShadow = "0 0 30px 10px rgba(0, 217, 255, 0.4)";
          el.style.borderRadius = "12px";
          el.style.border = "2px solid rgba(0, 217, 255, 0.6)";
          break;
        }
      }
    });

    await delay(500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "05-chat-highlighted.png"),
    });
    console.log("   ✅ 05-chat-highlighted.png saved\n");

    console.log("🎉 All screenshots captured successfully!");
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error("❌ Error during capture:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the capture
captureScreenshots()
  .then(() => {
    console.log("\n✅ Screenshot capture complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Screenshot capture failed:", error);
    process.exit(1);
  });
