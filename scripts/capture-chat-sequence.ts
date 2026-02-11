import { chromium } from "playwright";
import * as fs from "fs";

/**
 * Captures AI Chat sequence for video demo:
 * 1. Empty chat
 * 2. Partial typing
 * 3. Full message ready
 * 4. Loading/thinking state
 * 5. AI response
 */
async function captureChatSequence() {
  console.log("🎬 Starting AI Chat sequence capture...\n");

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  const question = "כמה עובדים עבדו אתמול בסניף ויצמן?";
  const outputDir = "video-assets";
  const publicDir = "public";

  try {
    // Use staging since localhost account is locked
    const baseUrl = "https://limor-staging-4vonhahbua-uc.a.run.app";

    // Step 1: Go to login page
    console.log("Step 1: Navigating to login page (staging)...");
    await page.goto(`${baseUrl}/login.html`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Step 2: Fill in credentials and login
    console.log("Step 2: Logging in with credentials...");
    await page.fill("#username", "admin");
    await page.fill("#password", "Test@1234");

    // Click login button and wait for navigation
    console.log("Clicking login button...");
    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle", timeout: 15000 })
        .catch(() => {}),
      page.click("#loginBtn"),
    ]);

    // Extra wait for any redirects
    await page.waitForTimeout(3000);
    console.log(`Current URL after login: ${page.url()}`);

    // Step 3: Navigate to AI CHAT page (not settings)
    console.log("Step 3: Navigating to AI chat page...");
    await page.goto(`${baseUrl}/dashboard/limor-chat.html`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    // Force dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0a0a15";
    });

    await page.waitForTimeout(1000);

    // Find the input field - try common selectors (prioritize visible ones)
    const inputSelectors = [
      '[placeholder*="הקלד את השאלה"]', // Exact Hebrew placeholder from screenshot
      '[placeholder*="הקלד"]',
      "textarea",
      ".chat-input",
      "#chat-input",
      'input[name="query"]',
      ".ai-input",
      "#userQuery",
      '[placeholder*="שאל"]',
      'input[type="text"]:visible',
      'input[type="text"]',
    ];

    let inputElement = null;
    for (const selector of inputSelectors) {
      try {
        // Use locator to find visible element
        const locator = page.locator(selector).first();
        if (await locator.isVisible({ timeout: 2000 })) {
          inputElement = await locator.elementHandle();
          console.log(`Found VISIBLE input with selector: ${selector}`);
          break;
        }
      } catch {
        // Try next selector
        continue;
      }
    }

    // Fallback to any input
    if (!inputElement) {
      console.log("Trying fallback: any visible input/textarea...");
      const fallback = page.locator("input:visible, textarea:visible").first();
      if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
        inputElement = await fallback.elementHandle();
        console.log("Found input via fallback");
      }
    }

    // Screenshot 1: Empty chat
    console.log("📸 Capturing: 1. Empty chat state...");
    await page.screenshot({
      path: `${outputDir}/chat-1-empty.png`,
    });
    console.log("   ✅ chat-1-empty.png");

    if (inputElement) {
      // Click on input to focus
      await inputElement.click();
      await page.waitForTimeout(500);

      // Screenshot 2: Partial typing (first few characters)
      const partialText = question.slice(0, 8); // "כמה עוב"
      console.log(`📸 Capturing: 2. Partial typing ("${partialText}")...`);
      await inputElement.fill(partialText);
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${outputDir}/chat-2-typing.png`,
      });
      console.log("   ✅ chat-2-typing.png");

      // Screenshot 3: Full message typed
      console.log(`📸 Capturing: 3. Full message ("${question}")...`);
      await inputElement.fill(question);
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${outputDir}/chat-3-ready.png`,
      });
      console.log("   ✅ chat-3-ready.png");

      // Find and click send button - use locator for visibility check
      const sendSelectors = [
        'button:has-text("שלח")', // Hebrew "Send" - visible in screenshot
        'button:text("שלח")',
        ".send-button",
        "#send-button",
        'button[type="submit"]',
        'button:has-text("Send")',
        '[aria-label="send"]',
        ".chat-send",
        "button.primary",
      ];

      let sendButton = null;
      for (const selector of sendSelectors) {
        try {
          const locator = page.locator(selector).first();
          if (await locator.isVisible({ timeout: 2000 })) {
            sendButton = await locator.elementHandle();
            console.log(`Found VISIBLE send button with selector: ${selector}`);
            break;
          }
        } catch {
          continue;
        }
      }

      if (sendButton) {
        // Click send
        await sendButton.click();

        // Screenshot 4: Loading state (capture quickly)
        console.log("📸 Capturing: 4. Loading/thinking state...");
        await page.waitForTimeout(500);
        await page.screenshot({
          path: `${outputDir}/chat-4-loading.png`,
        });
        console.log("   ✅ chat-4-loading.png");

        // Wait for response
        console.log("⏳ Waiting for AI response (up to 30s)...");
        try {
          // Wait for response element or significant page change
          await page.waitForFunction(
            () => {
              // Look for response indicators
              const responseElements = document.querySelectorAll(
                '.ai-response, .response, .message-ai, [data-role="assistant"], .chat-message',
              );
              return responseElements.length > 0;
            },
            { timeout: 30000 },
          );
        } catch {
          console.log(
            "   (Timeout waiting for response indicator, capturing current state)",
          );
        }

        await page.waitForTimeout(2000); // Extra wait for animations

        // Screenshot 5: AI response
        console.log("📸 Capturing: 5. AI response...");
        await page.screenshot({
          path: `${outputDir}/chat-5-response.png`,
        });
        console.log("   ✅ chat-5-response.png");
      } else {
        console.log(
          "⚠️ Could not find send button - capturing current state as response",
        );
        await page.screenshot({
          path: `${outputDir}/chat-4-loading.png`,
        });
        await page.screenshot({
          path: `${outputDir}/chat-5-response.png`,
        });
      }
    } else {
      console.log("⚠️ Could not find input field - capturing page states only");
      // Still try to capture something useful
      await page.screenshot({ path: `${outputDir}/chat-2-typing.png` });
      await page.screenshot({ path: `${outputDir}/chat-3-ready.png` });
      await page.screenshot({ path: `${outputDir}/chat-4-loading.png` });
      await page.screenshot({ path: `${outputDir}/chat-5-response.png` });
    }

    // Copy all to public folder
    console.log("\n📁 Copying to public folder...");
    const files = [
      "chat-1-empty.png",
      "chat-2-typing.png",
      "chat-3-ready.png",
      "chat-4-loading.png",
      "chat-5-response.png",
    ];

    for (const file of files) {
      const src = `${outputDir}/${file}`;
      const dest = `${publicDir}/${file}`;
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`   ✅ ${file}`);
      }
    }

    console.log("\n🎉 Chat sequence capture complete!");
    console.log("\nCaptured files:");
    for (const file of files) {
      const path = `${publicDir}/${file}`;
      if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
      }
    }
  } catch (error) {
    console.error("❌ Capture error:", error);

    // Take debug screenshot
    await page.screenshot({ path: `${outputDir}/debug-error.png` });
    console.log("Debug screenshot saved to debug-error.png");
  } finally {
    await browser.close();
  }
}

captureChatSequence();
