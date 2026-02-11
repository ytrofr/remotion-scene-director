import { chromium } from "playwright";
import * as fs from "fs";

/**
 * Captures Labor Cost V3 dashboard in mobile viewport as full-page screenshot
 * For the Dashmor scrolling demo video
 *
 * Output: public/dashmor/labor-v3-fullpage-mobile.png
 */
async function captureDashmorMobile() {
  console.log("📱 Capturing Dashmor (Labor Cost V3) - Mobile Full Page...\n");

  const browser = await chromium.launch({ headless: true });

  // Mobile viewport (iPhone 14 Pro dimensions)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, // Retina
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  });

  const page = await context.newPage();

  // Ensure output directory exists
  const outputDir = "public/dashmor";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Dark mode CSS for consistent styling
  const darkStyles = `
    html, body {
      background-color: #0a0a15 !important;
    }

    /* Force dark header */
    header, nav, .navbar, .top-nav,
    [class*="header"], [class*="navbar"] {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
      border-bottom: 1px solid #2a2a4e !important;
    }

    /* Force dark background for main content */
    main, .main-content, .main-layout, .dashboard-container {
      background-color: #0a0a15 !important;
    }

    /* Cards and panels */
    .card, .panel, [class*="card"], [class*="panel"] {
      background: linear-gradient(135deg, #1a1a2e 0%, #1e1e4a 100%) !important;
      border: 1px solid #2a2a4e !important;
    }

    /* Text colors */
    body, p, span, div, h1, h2, h3, h4, h5, h6, label {
      color: #ffffff !important;
    }

    /* Tables */
    table, th, td {
      border-color: #2a2a4e !important;
    }

    th {
      background-color: #1a1a2e !important;
    }

    tr:nth-child(even) {
      background-color: rgba(26, 26, 46, 0.5) !important;
    }

    /* Charts - keep original colors */
    canvas {
      /* Don't modify charts */
    }

    /* Hide unnecessary elements */
    [class*="developer"], [class*="dev-mode"],
    .sidebar, #limor-sidebar, #history-sidebar {
      display: none !important;
    }

    /* Ensure scrollbar is hidden for clean screenshot */
    ::-webkit-scrollbar {
      display: none !important;
    }
  `;

  try {
    // Step 1: Navigate to login first
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
        user: { name: 'Demo', role: 'admin', id: 'demo123' },
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };
      localStorage.setItem('limorAuth', JSON.stringify(auth));
    });

    // Step 3: Navigate to labor-cost-v3
    console.log("Step 3: Navigating to Labor Cost V3...");
    await page.goto("http://localhost:8080/dashboard/labor-cost-v3.html", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // Wait for initial page render
    console.log("Step 3b: Waiting for dashboard cards to load (AI/API data)...");
    await page.waitForTimeout(3000);

    // Wait for cards to have actual content (not loading state)
    // Check for common indicators that data has loaded
    let dataLoaded = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait

    while (!dataLoaded && attempts < maxAttempts) {
      const loadingState = await page.evaluate(() => {
        // Check for loading indicators
        const loadingElements = document.querySelectorAll(
          '.loading, .skeleton, [class*="loading"], [class*="skeleton"], .spinner'
        );
        const visibleLoading = Array.from(loadingElements).filter(el => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        // Check for cards with actual numeric content
        const cards = document.querySelectorAll('.card, .panel, [class*="card"], .section-card, .v3-section');
        const cardsWithData = Array.from(cards).filter(card => {
          const text = card.textContent || '';
          // Look for numbers, currency symbols, or percentages indicating real data
          return /[\d₪%]/.test(text) && text.length > 20;
        });

        // Check for tables with data
        const tables = document.querySelectorAll('table tbody tr');

        return {
          loadingCount: visibleLoading.length,
          cardsWithData: cardsWithData.length,
          tableRows: tables.length,
          pageHeight: document.body.scrollHeight,
        };
      });

      console.log(`  Attempt ${attempts + 1}: Loading=${loadingState.loadingCount}, Cards with data=${loadingState.cardsWithData}, Table rows=${loadingState.tableRows}, Height=${loadingState.pageHeight}px`);

      // Consider loaded if: no loading indicators AND (cards have data OR table has rows)
      if (loadingState.loadingCount === 0 && (loadingState.cardsWithData >= 3 || loadingState.tableRows >= 5)) {
        dataLoaded = true;
        console.log("  ✓ Dashboard data appears loaded!");
      } else {
        await page.waitForTimeout(1000);
        attempts++;
      }
    }

    if (!dataLoaded) {
      console.log("  ⚠ Warning: Data may not be fully loaded, continuing anyway...");
    }

    // Step 3d: Scroll through entire page to trigger lazy loading
    console.log("Step 3d: Scrolling through page to trigger lazy loading...");
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const scrollStep = 800;

    for (let scrollY = 0; scrollY <= scrollHeight; scrollY += scrollStep) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(500); // Wait for lazy sections to load
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Step 3e: Wait for lazy sections to finish loading after scroll
    console.log("Step 3e: Waiting for lazy sections to finish loading...");
    await page.waitForTimeout(5000); // Give AI/API calls time to complete

    // Extra wait for any final renders/animations
    console.log("Step 3f: Extra wait for final renders...");
    await page.waitForTimeout(2000);

    // Step 4: Apply dark mode CSS
    console.log("Step 4: Applying dark mode CSS...");
    await page.evaluate((styles) => {
      const styleEl = document.createElement("style");
      styleEl.id = "dark-mode-capture";
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);

      // Also set dark theme attribute
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    }, darkStyles);

    await page.waitForTimeout(1000);

    // Step 5: Get page dimensions
    const pageInfo = await page.evaluate(() => ({
      scrollHeight: document.body.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.body.scrollWidth,
    }));
    console.log(`Page dimensions: ${pageInfo.scrollWidth}x${pageInfo.scrollHeight}`);
    console.log(`Viewport: 390x844`);

    // Step 6: Capture full page screenshot
    console.log("Step 5: Capturing full page screenshot...");
    await page.screenshot({
      path: `${outputDir}/labor-v3-fullpage-mobile.png`,
      fullPage: true,
      type: 'png',
    });
    console.log(`✅ Saved: ${outputDir}/labor-v3-fullpage-mobile.png`);

    // Step 7: Also capture individual viewport sections for reference
    console.log("\nStep 6: Capturing viewport sections...");
    const sectionCount = Math.ceil(pageInfo.scrollHeight / 800); // 800px per section with some overlap
    console.log(`Will capture ${sectionCount} sections...`);

    for (let i = 0; i < Math.min(sectionCount, 10); i++) { // Max 10 sections
      const scrollY = i * 800;
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(300);

      const sectionNum = (i + 1).toString().padStart(2, '0');
      await page.screenshot({
        path: `${outputDir}/labor-v3-section-${sectionNum}.png`,
        type: 'png',
      });
      console.log(`✅ Saved: labor-v3-section-${sectionNum}.png (scroll: ${scrollY}px)`);
    }

    // Get final page height for reference
    const finalInfo = await page.evaluate(() => ({
      scrollHeight: document.body.scrollHeight,
      sections: Array.from(document.querySelectorAll('section, .section, [class*="section"], .card, .panel')).map(el => ({
        tag: el.tagName,
        className: el.className,
        top: el.getBoundingClientRect().top + window.scrollY,
        height: el.getBoundingClientRect().height,
      })).filter(s => s.height > 100).slice(0, 10)
    }));

    console.log("\n📊 Page Structure:");
    console.log(`Total height: ${finalInfo.scrollHeight}px`);
    console.log("Major sections found:");
    finalInfo.sections.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.className.slice(0, 40)}... at y:${Math.round(s.top)} (${Math.round(s.height)}px tall)`);
    });

    console.log("\n✨ Capture complete!");

  } catch (error) {
    console.error("❌ Error:", error);
    console.log("Current URL:", page.url());
    await page.screenshot({ path: `${outputDir}/debug-error.png` });
  } finally {
    await browser.close();
  }
}

captureDashmorMobile();
