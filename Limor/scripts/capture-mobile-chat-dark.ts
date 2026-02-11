import { chromium } from "playwright";
import * as fs from "fs";

/**
 * Captures AI Chat sequence for MOBILE video demo with DARK MODE
 * Auth is disabled on localhost - no login needed
 */
async function captureMobileChatDark() {
  console.log("📱 Starting MOBILE AI Chat capture (DARK MODE)...\n");
  console.log("   Viewport: 390x844 (iPhone 14 Pro)");
  console.log("   Scale: 2x (Retina)");
  console.log("   Output: 780x1688 screenshots\n");

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  });

  const page = await context.newPage();
  const question = "כמה הכנסות היו השבוע?";
  const outputDir = "public/mobile";

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Navigate directly to chat (auth is disabled on localhost)
    console.log("Step 1: Navigating to chat page...");
    await page.goto("http://localhost:8080/dashboard/limor-chat.html", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // Apply dark mode styling
    console.log("Step 2: Applying DARK MODE...");
    await page.evaluate(() => {
      const darkStyles = `
        /* === CRITICAL: Remove ALL white/light backgrounds === */
        html, body {
          background-color: #0a0a15 !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh !important;
          width: 100% !important;
          overflow-x: hidden !important;
        }

        /* Force ALL elements to dark backgrounds */
        *, *::before, *::after {
          box-sizing: border-box !important;
        }

        /* Force dark header/navbar */
        header, nav, .navbar, .top-nav,
        [class*="header"], [class*="navbar"], [class*="nav-bar"] {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
          border-bottom: 1px solid #2a2a4e !important;
        }

        /* Nav text white - INCLUDING all children */
        header *, nav *, .navbar *, .top-nav *,
        .chat-header *, .chat-header-title *, .chat-title-text {
          color: #ffffff !important;
        }

        /* Dark background for page */
        body, html, main, .main-content, .main-layout, .main-layout__container {
          background-color: #0a0a15 !important;
        }

        /* Chat area dark */
        .chat-container, .chat-area, .chat-messages,
        [class*="chat-"] {
          background-color: #0f0f1a !important;
        }

        /* Chat header specific */
        .chat-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
          border-bottom: 1px solid #2a2a4e !important;
        }

        .chat-header-title, .chat-title-text {
          color: #ffffff !important;
        }

        /* Conversation action buttons */
        .conversation-actions button, .conv-action-btn {
          background-color: transparent !important;
          color: #a0a0c0 !important;
          border: 1px solid #3a3a5e !important;
        }

        .conv-action-btn .btn-label {
          color: #a0a0c0 !important;
        }

        /* Input area */
        .chat-input-area, .input-wrapper, .chat-input-container, .input-container {
          background-color: #0f0f1a !important;
          border-color: #3a3a5e !important;
        }

        input, textarea, .chat-input {
          background-color: #1a1a2e !important;
          border-color: #3a3a5e !important;
          color: #ffffff !important;
        }

        /* Input placeholder */
        ::placeholder {
          color: #6a6a8a !important;
          opacity: 1 !important;
        }

        /* Send button - keep the gradient style */
        .send-button, button[type="submit"] {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
          color: #ffffff !important;
        }

        /* Hide developer mode button */
        [class*="developer"], [class*="dev-mode"],
        button[title*="Developer"], .fab-button,
        [style*="position: fixed"][style*="bottom"] {
          display: none !important;
        }

        /* Hide sidebar for cleaner capture */
        .sidebar, aside, [class*="sidebar"], #limor-sidebar {
          display: none !important;
        }

        /* Hide history sidebar */
        #history-sidebar {
          display: none !important;
        }

        /* Message bubbles - ALL text must be white */
        .message, .chat-message,
        .message *, .chat-message *,
        .message-content, .message-content *,
        .message-text, .message-text *,
        .message-bubble, .message-bubble * {
          color: #ffffff !important;
        }

        /* User message styling */
        .user-message, .user-message *,
        [class*="user-message"], [class*="user-message"] * {
          background: linear-gradient(135deg, #3730a3 0%, #4f46e5 100%) !important;
          color: #ffffff !important;
        }

        /* AI response styling - FORCE all text white */
        .ai-response, .ai-response *,
        .assistant-message, .assistant-message *,
        .ai-message, .ai-message *,
        [class*="ai-"], [class*="ai-"] *,
        [class*="assistant"], [class*="assistant"] *,
        [class*="response"], [class*="response"] *,
        .limor-response, .limor-response * {
          color: #ffffff !important;
        }

        /* AI message bubble background */
        .ai-response, .assistant-message, .ai-message,
        [class*="ai-message"], [class*="assistant-message"] {
          background: linear-gradient(135deg, #1a1a3e 0%, #1e1e4a 100%) !important;
          border-left: 3px solid #00d9ff !important;
        }

        /* Force ALL paragraph and span text in chat to be white */
        .chat-messages p, .chat-messages span,
        .chat-messages div, .chat-messages pre,
        .chat-messages code, .chat-messages strong,
        .chat-messages em, .chat-messages li {
          color: #ffffff !important;
        }

        /* Markdown rendered content */
        .markdown-content, .markdown-content *,
        [class*="markdown"], [class*="markdown"] * {
          color: #ffffff !important;
        }

        /* Limor orb styling */
        .limor-orb {
          background: transparent !important;
        }

        /* Remove any white borders or margins from main containers */
        .main-layout, .main-layout__container, main {
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
          max-width: 100% !important;
        }

        /* Ensure full width coverage */
        .chat-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `;

      const styleEl = document.createElement("style");
      styleEl.id = "dark-mode-capture";
      styleEl.textContent = darkStyles;
      document.head.appendChild(styleEl);

      // Also hide by direct element selection
      document.querySelectorAll('[class*="developer"], [class*="dev-"]').forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    });

    await page.waitForTimeout(500);

    // Find input field
    const inputSelectors = [
      'textbox[name*="שאלה"]',
      '[placeholder*="הקלד"]',
      'textarea',
      '.chat-input',
      '#chat-input',
      'input[type="text"]',
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
      } catch { continue; }
    }

    // Screenshot 1: Empty chat
    console.log("\n📸 1. Empty chat (dark mode)...");
    await page.screenshot({ path: `${outputDir}/mobile-chat-1-empty.png` });
    console.log("   ✅ mobile-chat-1-empty.png");

    if (inputElement) {
      await inputElement.tap();
      await page.waitForTimeout(500);

      // Letter-by-letter typing
      const typingStages: string[] = [];
      for (let i = 1; i <= question.length; i++) {
        typingStages.push(question.slice(0, i));
      }

      console.log(`   Capturing ${typingStages.length} typing stages...`);

      for (let i = 0; i < typingStages.length; i++) {
        const text = typingStages[i];
        await inputElement.fill(text);
        await page.waitForTimeout(80);
        await page.screenshot({
          path: `${outputDir}/mobile-chat-type-${String(i + 1).padStart(2, "0")}.png`,
        });
        if ((i + 1) % 5 === 0) console.log(`📸 Typing ${i + 1}/${typingStages.length}`);
      }
      console.log(`   ✅ All ${typingStages.length} typing screenshots captured`);

      // Screenshot: Ready state
      console.log(`📸 3. Full question ready...`);
      await page.screenshot({ path: `${outputDir}/mobile-chat-3-ready.png` });

      // Find and click send button
      const sendSelectors = [
        'button:has-text("שלח")',
        '.send-button',
        '#send-button',
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
        } catch { continue; }
      }

      if (sendButton) {
        await sendButton.tap();

        // RAPID CAPTURE - try to catch user message before AI responds
        console.log("📸 4. Rapid capture after send...");

        // Capture immediately (0ms)
        await page.screenshot({ path: `${outputDir}/mobile-chat-4a-instant.png` });

        // Capture at 50ms
        await page.waitForTimeout(50);
        await page.screenshot({ path: `${outputDir}/mobile-chat-4b-50ms.png` });

        // Capture at 150ms
        await page.waitForTimeout(100);
        await page.screenshot({ path: `${outputDir}/mobile-chat-4c-150ms.png` });

        // Capture at 300ms
        await page.waitForTimeout(150);
        await page.screenshot({ path: `${outputDir}/mobile-chat-4d-300ms.png` });

        // Capture at 500ms
        await page.waitForTimeout(200);
        await page.screenshot({ path: `${outputDir}/mobile-chat-4e-500ms.png` });

        console.log("   ✅ Captured 5 rapid screenshots after send");

        // Wait for response
        console.log("⏳ Waiting for AI response (up to 45s)...");
        try {
          await page.waitForSelector('.ai-response, .assistant-message, .chat-message', {
            timeout: 45000,
          });
        } catch {
          console.log("   (Timeout - capturing current state)");
        }

        await page.waitForTimeout(2000);

        // Screenshot 5: Response
        console.log("📸 5. AI response...");
        await page.screenshot({ path: `${outputDir}/mobile-chat-5-response.png` });
        console.log("   ✅ mobile-chat-5-response.png");
      } else {
        console.log("⚠️ Send button not found");
      }
    } else {
      console.log("⚠️ Input field not found");
      await page.screenshot({ path: `${outputDir}/debug-no-input.png` });
    }

    // Summary
    console.log("\n🎉 Mobile DARK MODE capture complete!\n");
    const files = fs.readdirSync(outputDir).filter(f => f.startsWith("mobile-chat"));
    console.log(`Output: ${files.length} files in ${outputDir}/`);

  } catch (error) {
    console.error("❌ Capture error:", error);
    await page.screenshot({ path: `${outputDir}/debug-error.png` });
  } finally {
    await browser.close();
  }
}

captureMobileChatDark();
