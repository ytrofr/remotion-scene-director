import { chromium } from "playwright";
import * as fs from "fs";

/**
 * Captures screenshots for Video 2 - Worker Hours Question
 *
 * Flow:
 * 1. Send first question (revenue) and wait for response
 * 2. Capture typing stages for second question (worker hours)
 * 3. Capture user message only state
 * 4. Capture final response
 *
 * Output files:
 * - v2-chat-with-response.png (starting state with first Q&A)
 * - v2-type-01.png ... v2-type-XX.png (typing stages)
 * - v2-ready-to-send.png (fully typed, ready to send)
 * - v2-user-message.png (second question sent, no AI response)
 * - v2-thinking.png (with thinking indicator)
 * - v2-response.png (full conversation with both Q&As)
 */
async function captureVideo2() {
  console.log("📱 Capturing Video 2 - Worker Hours Question...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  });

  const page = await context.newPage();
  const outputDir = "public/mobile";

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Dark mode CSS - same as other capture scripts
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
    .send-button, button[type="submit"], #actionButton {
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

    /* User message styling - keep native styling, only force white text */
    .message.user *, .user-message *,
    [class*="user-message"] * {
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

    /* Feedback buttons - make SVGs visible (cyan color) */
    .feedback-btn, .feedback-buttons button,
    [class*="feedback"] button {
      background-color: transparent !important;
      border: 1px solid #3a3a5e !important;
    }

    .feedback-btn svg, .feedback-buttons svg,
    [class*="feedback"] svg {
      fill: #00d9ff !important;
      stroke: #00d9ff !important;
      color: #00d9ff !important;
    }

    .feedback-btn path, .feedback-buttons path,
    [class*="feedback"] path {
      fill: #00d9ff !important;
      stroke: #00d9ff !important;
    }

    /* Hide native thinking/loading indicators */
    .thinking-message, .thinking-dots, .thinking-indicator,
    .loading-indicator, .typing-indicator,
    [class*="thinking"], [class*="loading-dots"],
    .message.ai.thinking, .ai-thinking {
      display: none !important;
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

  const secondQuestion = "כמה שעות עבדו העובדים השבוע?";

  try {
    // Step 1: Navigate to login page first
    console.log("Step 1: Navigating to login...");
    await page.goto("http://localhost:8080/login.html", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Step 2: Set auth token
    console.log("Step 2: Setting auth token...");
    await page.evaluate(() => {
      const auth = {
        token: 'demo-capture-token-' + Date.now(),
        user: { name: 'Demo', role: 'user', id: 'demo123' },
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };
      localStorage.setItem('limorAuth', JSON.stringify(auth));
    });

    // Step 3: Navigate to chat page
    console.log("Step 3: Navigating to chat...");
    await page.goto("http://localhost:8080/dashboard/limor-chat.html", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // Step 4: Apply dark mode CSS
    console.log("Step 4: Applying dark mode CSS...");
    await page.evaluate((styles) => {
      const styleEl = document.createElement("style");
      styleEl.id = "dark-mode-capture";
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);

      document.querySelectorAll('[class*="developer"], [class*="dev-"]').forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    }, darkStyles);

    await page.waitForTimeout(500);

    // Step 5: Send first question and wait for real response
    console.log("Step 5: Sending first question (revenue)...");
    const input = page.locator('textarea#messageInput').first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill('כמה הכנסות היו השבוע?');
    await page.waitForTimeout(300);

    const sendBtn = page.locator('#actionButton').first();
    await sendBtn.click();

    // Wait for AI response to complete
    console.log("Step 6: Waiting for AI response...");
    await page.waitForSelector('.message.ai', { timeout: 60000 });

    // Wait for response to finish streaming (wait for thinking to disappear)
    await page.waitForTimeout(2000);
    let thinkingVisible = true;
    let attempts = 0;
    while (thinkingVisible && attempts < 30) {
      thinkingVisible = await page.evaluate(() => {
        const thinking = document.querySelector('.thinking-message, .thinking-dots');
        return thinking !== null && (thinking as HTMLElement).offsetParent !== null;
      });
      if (thinkingVisible) {
        await page.waitForTimeout(1000);
        attempts++;
      }
    }

    await page.waitForTimeout(1000);

    // Capture starting state (chat with first Q&A)
    console.log("📸 Capturing chat with first response...");
    await page.screenshot({
      path: `${outputDir}/v2-chat-with-response.png`,
      type: 'png'
    });
    console.log("✅ Saved: v2-chat-with-response.png");

    // Step 7: Type second question letter by letter
    console.log("Step 7: Typing second question letter by letter...");

    // Use specific selector for main chat input (not feedback textarea)
    const chatInput = page.locator('textarea#messageInput');
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });
    await chatInput.click();
    await page.waitForTimeout(200);

    // Clear any existing text
    await chatInput.fill('');
    await page.waitForTimeout(100);

    // Type letter by letter and capture each stage
    for (let i = 1; i <= secondQuestion.length; i++) {
      const partialText = secondQuestion.substring(0, i);
      await chatInput.fill(partialText);
      await page.waitForTimeout(50);

      const stageNum = i.toString().padStart(2, '0');
      await page.screenshot({
        path: `${outputDir}/v2-type-${stageNum}.png`,
        type: 'png'
      });
      console.log(`✅ Saved: v2-type-${stageNum}.png`);
    }

    // Capture ready-to-send state
    console.log("📸 Capturing ready-to-send state...");
    await page.screenshot({
      path: `${outputDir}/v2-ready-to-send.png`,
      type: 'png'
    });
    console.log("✅ Saved: v2-ready-to-send.png");

    // Step 8: Set up route to delay AI for second question
    console.log("Step 8: Setting up API delay for user message capture...");
    let routeActive = true;
    await page.route('**/api/true-ai/**', async (route) => {
      console.log("⏳ Delaying AI request...");
      await new Promise(resolve => setTimeout(resolve, 15000));
      // Only fulfill if route is still active (not unrouted)
      if (routeActive) {
        try {
          await route.fulfill({
            status: 200,
            contentType: 'text/event-stream',
            body: 'data: {"type":"done"}\n\n'
          });
        } catch (e) {
          // Route already handled, ignore
        }
      }
    });

    // Click send
    console.log("Step 9: Clicking send...");
    await sendBtn.click();

    // Wait for user message to appear
    console.log("Step 10: Waiting for user message...");
    await page.waitForSelector('.message.user:nth-of-type(2)', { timeout: 5000 }).catch(() => {
      // Fallback - just wait and check
      console.log("Fallback: waiting for any new user message...");
    });
    await page.waitForTimeout(500);

    // Capture with thinking bubble
    console.log("📸 Capturing with thinking bubble...");
    await page.screenshot({
      path: `${outputDir}/v2-thinking.png`,
      type: 'png'
    });
    console.log("✅ Saved: v2-thinking.png");

    // Hide thinking indicator for clean user message
    console.log("Step 11: Hiding ALL thinking/loading indicators...");
    await page.evaluate(() => {
      // Hide by class selectors
      const thinkingElements = document.querySelectorAll(
        '.thinking-message, .thinking-dots, .message.ai.thinking, ' +
        '.thinking-indicator, .typing-indicator, .loading-indicator, ' +
        '[class*="thinking"], [class*="loading"], [class*="typing-dots"], ' +
        '.ai-thinking, .message-thinking, .chat-thinking'
      );
      thinkingElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      // Hide any AI message that doesn't have real content (thinking placeholders)
      document.querySelectorAll('.message.ai').forEach(msg => {
        const content = msg.querySelector('.message-content, .message-text');
        const text = content?.textContent?.trim() || '';
        // If AI message has no real content or just dots, hide it
        if (text === '' || text === '...' || text.length < 5) {
          (msg as HTMLElement).style.display = 'none';
        }
      });

      // Hide any element that looks like a small thinking bubble (around x:43, y:510)
      document.querySelectorAll('*').forEach(el => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        // Target small elements on the left side in the chat area
        if (rect.width > 20 && rect.width < 120 &&
            rect.height > 20 && rect.height < 80 &&
            rect.left < 80 &&
            rect.top > 400 && rect.top < 600) {
          const content = el.textContent?.trim() || '';
          // If it's empty or has minimal content, it's likely a thinking indicator
          if (content === '' || content === '...' || content.length < 10) {
            (el as HTMLElement).style.display = 'none';
          }
        }
      });
    });

    await page.waitForTimeout(50);

    // Capture user message only
    console.log("📸 Capturing user message only...");
    await page.screenshot({
      path: `${outputDir}/v2-user-message.png`,
      type: 'png'
    });
    console.log("✅ Saved: v2-user-message.png");

    // Step 12: Reload and get REAL response for final screenshot
    // We need to redo the whole flow without API interception
    console.log("Step 12: Reloading for real AI response capture...");
    routeActive = false; // Prevent delayed handler from trying to fulfill
    await page.unroute('**/api/true-ai/**');

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Re-apply dark mode
    await page.evaluate((styles) => {
      const styleEl = document.createElement("style");
      styleEl.id = "dark-mode-capture";
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
      document.querySelectorAll('[class*="developer"], [class*="dev-"]').forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    }, darkStyles);

    await page.waitForTimeout(500);

    // Send first question
    console.log("Step 13: Sending first question...");
    const chatInput2 = page.locator('textarea#messageInput');
    await chatInput2.waitFor({ state: 'visible', timeout: 10000 });
    await chatInput2.fill('כמה הכנסות היו השבוע?');
    await page.waitForTimeout(200);
    await sendBtn.click();

    // Wait for first response
    console.log("  Waiting for first AI response...");
    await page.waitForSelector('.message.ai', { timeout: 90000 });

    // Wait for response to finish (no more thinking)
    let responseComplete = false;
    attempts = 0;
    while (!responseComplete && attempts < 60) {
      const hasThinking = await page.evaluate(() => {
        const thinking = document.querySelector('.thinking-message, .thinking-dots');
        return thinking !== null && (thinking as HTMLElement).offsetParent !== null;
      });
      if (!hasThinking) {
        responseComplete = true;
      } else {
        await page.waitForTimeout(1000);
        attempts++;
      }
    }
    console.log("  First response complete!");
    await page.waitForTimeout(1000);

    // Send second question
    console.log("Step 14: Sending second question...");
    await chatInput2.fill(secondQuestion);
    await page.waitForTimeout(200);
    await sendBtn.click();

    // Wait for second AI response (need 2 AI messages)
    console.log("Step 15: Waiting for second AI response...");
    let secondComplete = false;
    attempts = 0;
    while (!secondComplete && attempts < 90) {
      const aiCount = await page.evaluate(() => document.querySelectorAll('.message.ai').length);
      const hasThinking = await page.evaluate(() => {
        const t = document.querySelector('.thinking-message, .thinking-dots');
        return t !== null && (t as HTMLElement).offsetParent !== null;
      });

      if (aiCount >= 2 && !hasThinking) {
        // Verify second message has content
        const secondMessageContent = await page.evaluate(() => {
          const messages = document.querySelectorAll('.message.ai');
          if (messages.length >= 2) {
            const secondMsg = messages[1];
            const content = secondMsg.querySelector('.message-content, .message-text');
            return content ? content.textContent?.trim().substring(0, 50) : 'NO CONTENT';
          }
          return 'NOT FOUND';
        });
        console.log(`  Second AI message content preview: "${secondMessageContent}"`);

        if (secondMessageContent && secondMessageContent !== 'NO CONTENT' && secondMessageContent !== 'NOT FOUND' && secondMessageContent.length > 5) {
          secondComplete = true;
          console.log(`  Second response complete! ${aiCount} AI messages`);
        } else {
          // Content not ready yet, keep waiting
          await page.waitForTimeout(1000);
          attempts++;
        }
      } else {
        await page.waitForTimeout(1000);
        attempts++;
        if (attempts % 5 === 0) {
          console.log(`  Still waiting: ${aiCount} AI messages, thinking: ${hasThinking} (${attempts}s)`);
        }
      }
    }

    // Wait a bit more for any animations
    await page.waitForTimeout(2000);

    // Scroll chat to show all messages
    await page.evaluate(() => {
      const chat = document.querySelector('#chatMessages, .chat-messages, .messages-container');
      if (chat) {
        chat.scrollTop = chat.scrollHeight;
      }
    });
    await page.waitForTimeout(500);

    // Capture final state
    console.log("📸 Capturing final response with both conversations...");
    await page.screenshot({
      path: `${outputDir}/v2-response.png`,
      type: 'png'
    });
    console.log("✅ Saved: v2-response.png");

    console.log("\n✨ Video 2 capture complete!");
    console.log("Screenshots saved to:", outputDir);

  } catch (error) {
    console.error("❌ Error:", error);
    console.log("Current URL:", page.url());
    await page.screenshot({ path: `${outputDir}/v2-debug-error.png` });
  } finally {
    await browser.close();
  }
}

captureVideo2();
