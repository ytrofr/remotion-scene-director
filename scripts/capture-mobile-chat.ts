import { chromium } from "playwright";
import * as fs from "fs";

/**
 * Captures AI Chat sequence for MOBILE video demo:
 * - iPhone 14 Pro dimensions (390x844)
 * - 2x deviceScaleFactor for Retina quality
 * - Revenue question: "כמה הכנסות היו השבוע?"
 *
 * Output: 5 mobile screenshots
 * 1. Empty chat (mobile layout)
 * 2. Partial typing
 * 3. Full question ready
 * 4. AI thinking/loading
 * 5. AI response
 */
async function captureMobileChat() {
  console.log("📱 Starting MOBILE AI Chat capture...\n");
  console.log("   Viewport: 390x844 (iPhone 14 Pro)");
  console.log("   Scale: 2x (Retina)");
  console.log("   Output: 780x1688 screenshots\n");

  const browser = await chromium.launch({
    headless: true,
  });

  // Mobile viewport with Retina scale
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, // Retina quality
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

  const page = await context.newPage();

  // Revenue question for the demo
  const question = "כמה הכנסות היו השבוע?";
  const outputDir = "public/mobile";

  try {
    // Use staging since localhost may not be running
    // Set CAPTURE_BASE_URL to your running dashboard; defaults to local dev server.
    const baseUrl = process.env.CAPTURE_BASE_URL ?? "http://localhost:8080";

    // Step 1: Navigate to login
    console.log("Step 1: Navigating to login page (staging)...");
    await page.goto(`${baseUrl}/login.html`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Step 2: Login
    console.log("Step 2: Logging in...");
    await page.fill("#username", "admin");
    await page.fill("#password", "Test@1234");

    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle", timeout: 15000 })
        .catch(() => {}),
      page.click("#loginBtn"),
    ]);

    await page.waitForTimeout(3000);
    console.log(`   Current URL: ${page.url()}`);

    // Step 3: Navigate to AI Chat
    console.log("Step 3: Navigating to AI chat...");
    await page.goto(`${baseUrl}/dashboard/limor-chat.html`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    // Force dark mode and hide developer UI elements
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0a0a15";

      // Hide developer floating button and any dev mode UI
      const devElements = document.querySelectorAll(
        ".dev-button, .developer-button, .dev-mode, .floating-dev, " +
          '[class*="dev-"], [class*="developer"], [id*="dev-mode"], ' +
          '.debug-panel, .dev-tools, button[title*="Developer"], ' +
          ".floating-action-button, .fab-button",
      );
      devElements.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      // Also hide by common patterns
      const allButtons = document.querySelectorAll("button, .btn");
      allButtons.forEach((btn) => {
        const text = btn.textContent?.toLowerCase() || "";
        if (text.includes("dev") || text.includes("debug")) {
          (btn as HTMLElement).style.display = "none";
        }
      });
    });

    await page.waitForTimeout(1000);

    // Find input field
    const inputSelectors = [
      '[placeholder*="הקלד את השאלה"]',
      '[placeholder*="הקלד"]',
      "textarea",
      ".chat-input",
      "#chat-input",
      'input[name="query"]',
      "#userQuery",
    ];

    let inputElement = null;
    for (const selector of inputSelectors) {
      try {
        const locator = page.locator(selector).first();
        if (await locator.isVisible({ timeout: 2000 })) {
          inputElement = await locator.elementHandle();
          console.log(`   Found input: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }

    // Screenshot 1: Empty chat (mobile)
    console.log("\n📸 1. Empty chat (mobile)...");
    await page.screenshot({
      path: `${outputDir}/mobile-chat-1-empty.png`,
    });
    console.log("   ✅ mobile-chat-1-empty.png");

    if (inputElement) {
      // Tap on input (simulate mobile touch)
      await inputElement.tap();
      await page.waitForTimeout(500);

      // Letter-by-letter typing - capture EVERY character
      // Question: "כמה הכנסות היו השבוע?" (20 chars)
      const typingStages: string[] = [];
      for (let i = 1; i <= question.length; i++) {
        typingStages.push(question.slice(0, i));
      }

      console.log(`   Capturing ${typingStages.length} typing stages...`);

      for (let i = 0; i < typingStages.length; i++) {
        const text = typingStages[i];
        console.log(`📸 Typing ${i + 1}/${typingStages.length}: "${text}"`);
        await inputElement.fill(text);
        await page.waitForTimeout(100);
        await page.screenshot({
          path: `${outputDir}/mobile-chat-type-${String(i + 1).padStart(2, "0")}.png`,
        });
      }
      console.log(
        `   ✅ All ${typingStages.length} typing screenshots captured`,
      );

      // Store count for reference
      console.log(`   TYPING_STAGES=${typingStages.length}`);

      // Screenshot for ready state (same as last typing stage)
      console.log(`📸 3. Full question ready...`);
      await page.screenshot({
        path: `${outputDir}/mobile-chat-3-ready.png`,
      });
      console.log("   ✅ mobile-chat-3-ready.png");

      // Find send button
      const sendSelectors = [
        'button:has-text("שלח")',
        'button:text("שלח")',
        ".send-button",
        "#send-button",
        'button[type="submit"]',
      ];

      let sendButton = null;
      for (const selector of sendSelectors) {
        try {
          const locator = page.locator(selector).first();
          if (await locator.isVisible({ timeout: 2000 })) {
            sendButton = await locator.elementHandle();
            console.log(`   Found send button: ${selector}`);
            break;
          }
        } catch {
          continue;
        }
      }

      if (sendButton) {
        // Tap send (mobile)
        await sendButton.tap();

        // Screenshot 4: Loading state
        console.log("📸 4. AI thinking/loading...");
        await page.waitForTimeout(500);
        await page.screenshot({
          path: `${outputDir}/mobile-chat-4-loading.png`,
        });
        console.log("   ✅ mobile-chat-4-loading.png");

        // Wait for response
        console.log("⏳ Waiting for AI response (up to 30s)...");
        try {
          await page.waitForFunction(
            () => {
              const responses = document.querySelectorAll(
                '.ai-response, .response, .message-ai, [data-role="assistant"], .chat-message',
              );
              return responses.length > 0;
            },
            { timeout: 30000 },
          );
        } catch {
          console.log("   (Timeout - capturing current state)");
        }

        await page.waitForTimeout(2000);

        // Screenshot 5: AI response
        console.log("📸 5. AI response...");
        await page.screenshot({
          path: `${outputDir}/mobile-chat-5-response.png`,
        });
        console.log("   ✅ mobile-chat-5-response.png");
      } else {
        console.log("⚠️ Send button not found - capturing placeholder states");
        await page.screenshot({
          path: `${outputDir}/mobile-chat-4-loading.png`,
        });
        await page.screenshot({
          path: `${outputDir}/mobile-chat-5-response.png`,
        });
      }
    } else {
      console.log("⚠️ Input field not found - capturing page states only");
      await page.screenshot({ path: `${outputDir}/mobile-chat-2-typing.png` });
      await page.screenshot({ path: `${outputDir}/mobile-chat-3-ready.png` });
      await page.screenshot({ path: `${outputDir}/mobile-chat-4-loading.png` });
      await page.screenshot({
        path: `${outputDir}/mobile-chat-5-response.png`,
      });
    }

    // Summary
    console.log("\n🎉 Mobile capture complete!\n");
    console.log("Output files:");
    const files = [
      "mobile-chat-1-empty.png",
      "mobile-chat-2-typing.png",
      "mobile-chat-3-ready.png",
      "mobile-chat-4-loading.png",
      "mobile-chat-5-response.png",
    ];

    for (const file of files) {
      const path = `${outputDir}/${file}`;
      if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
      } else {
        console.log(`   ${file} (missing)`);
      }
    }

    console.log(`\nScreenshot dimensions: 780x1688 (2x Retina of 390x844)`);
  } catch (error) {
    console.error("❌ Capture error:", error);
    await page.screenshot({ path: `${outputDir}/debug-mobile-error.png` });
    console.log("Debug screenshot saved");
  } finally {
    await browser.close();
  }
}

captureMobileChat();
