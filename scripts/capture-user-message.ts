import { chromium } from "playwright";

/**
 * Captures user message screenshots with proper dark mode styling
 * Matches the style of existing mobile-chat screenshots
 */
async function captureUserMessage() {
  console.log("📱 Capturing user message states (DARK MODE)...\n");

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

  // Dark mode CSS - same as capture-mobile-chat-dark.ts
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

  try {
    // Navigate to login page first
    console.log("Step 1: Navigating to login...");
    await page.goto("http://localhost:8080/login.html", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Set auth token
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

    // Navigate to chat page
    console.log("Step 3: Navigating to chat...");
    await page.goto("http://localhost:8080/dashboard/limor-chat.html", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // Apply dark mode CSS injection
    console.log("Step 4: Applying DARK MODE CSS...");
    await page.evaluate((styles) => {
      const styleEl = document.createElement("style");
      styleEl.id = "dark-mode-capture";
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);

      // Also hide by direct element selection
      document.querySelectorAll('[class*="developer"], [class*="dev-"]').forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    }, darkStyles);

    await page.waitForTimeout(500);

    // Set up route to DELAY AI requests
    console.log("Step 5: Setting up API delay...");
    await page.route('**/api/true-ai/**', async (route) => {
      console.log("⏳ Delaying AI request...");
      await new Promise(resolve => setTimeout(resolve, 15000));
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type":"done"}\n\n'
      });
    });

    // Type question
    console.log("Step 6: Typing question...");
    const input = page.locator('#messageInput, textarea').first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill('כמה הכנסות היו השבוע?');
    await page.waitForTimeout(300);

    // Click send
    console.log("Step 7: Clicking send...");
    const sendBtn = page.locator('#actionButton, button:has-text("שלח")').first();
    await sendBtn.click();

    // Wait for user message to appear
    console.log("Step 8: Waiting for user message...");
    await page.waitForSelector('.message.user', { timeout: 5000 });
    await page.waitForTimeout(100);

    // Capture with thinking bubble (for reference)
    console.log("📸 Capturing with thinking bubble...");
    await page.screenshot({
      path: `${outputDir}/mobile-chat-thinking.png`,
      type: 'png'
    });
    console.log("✅ Saved: mobile-chat-thinking.png");

    // Hide the thinking indicator for clean user message only
    console.log("Step 9: Hiding ALL thinking/loading indicators...");
    await page.evaluate(() => {
      // Hide all possible thinking indicators
      const thinkingElements = document.querySelectorAll(
        '.thinking-message, .thinking-dots, .message.ai.thinking, ' +
        '.message:not(.user), [class*="thinking"], [class*="loading"]'
      );
      thinkingElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      // Also hide any AI messages
      document.querySelectorAll('.message.ai, .ai-message').forEach(el => {
        (el as HTMLElement).style.display = 'none';
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
          if (content === '' || content === '...' || content.length < 10) {
            (el as HTMLElement).style.display = 'none';
          }
        }
      });
    });

    await page.waitForTimeout(50);

    // Capture user message only (for Scene 5)
    console.log("📸 Capturing user message only...");
    await page.screenshot({
      path: `${outputDir}/mobile-chat-user-message.png`,
      type: 'png'
    });
    console.log("✅ Saved: mobile-chat-user-message.png");

  } catch (error) {
    console.error("❌ Error:", error);
    console.log("Current URL:", page.url());
    await page.screenshot({ path: `${outputDir}/debug-capture-error.png` });
  } finally {
    await browser.close();
  }
}

captureUserMessage();
