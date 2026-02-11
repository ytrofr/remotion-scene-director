import { chromium } from "playwright";
import * as fs from "fs";

/**
 * Captures dashboard with internal scrollable container
 * Finds the main content area and scrolls IT (not the page)
 */
async function captureDashboardScroll() {
  console.log("Starting dashboard scroll capture...");

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

    await page.waitForTimeout(5000);

    // Force dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0a0a15";
    });

    // Find the scrollable container - try common patterns
    const scrollInfo = await page.evaluate(() => {
      // Common dashboard scrollable container selectors
      const selectors = [
        "main",
        ".main-content",
        ".content",
        ".dashboard-content",
        "[data-content]",
        ".overflow-y-auto",
        ".overflow-auto",
        "#main",
        "#content",
      ];

      const results: Array<{
        selector: string;
        scrollHeight: number;
        clientHeight: number;
        isScrollable: boolean;
      }> = [];

      // Check body first
      results.push({
        selector: "body",
        scrollHeight: document.body.scrollHeight,
        clientHeight: document.body.clientHeight,
        isScrollable: document.body.scrollHeight > document.body.clientHeight,
      });

      // Check html
      results.push({
        selector: "html",
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        isScrollable:
          document.documentElement.scrollHeight >
          document.documentElement.clientHeight,
      });

      // Check all elements with overflow
      const allElements = document.querySelectorAll("*");
      for (const el of Array.from(allElements)) {
        const style = getComputedStyle(el);
        if (
          style.overflowY === "auto" ||
          style.overflowY === "scroll" ||
          style.overflow === "auto" ||
          style.overflow === "scroll"
        ) {
          const htmlEl = el as HTMLElement;
          if (htmlEl.scrollHeight > htmlEl.clientHeight + 100) {
            // Has significant scroll
            results.push({
              selector:
                el.tagName +
                (el.className ? "." + el.className.split(" ")[0] : ""),
              scrollHeight: htmlEl.scrollHeight,
              clientHeight: htmlEl.clientHeight,
              isScrollable: true,
            });
          }
        }
      }

      return results;
    });

    console.log("Scroll analysis:", JSON.stringify(scrollInfo, null, 2));

    // Find the best scrollable container
    const scrollable = scrollInfo.find(
      (s) => s.isScrollable && s.scrollHeight > 1200,
    );

    if (scrollable) {
      console.log(
        `Found scrollable container: ${scrollable.selector} (${scrollable.scrollHeight}px)`,
      );

      // Take screenshots at different scroll positions within that container
      const numSections = Math.ceil(scrollable.scrollHeight / 1080);
      console.log(`Will capture ${numSections} sections`);

      for (let i = 0; i < numSections; i++) {
        const scrollY = i * 900; // Overlap of 180px between sections
        console.log(`Section ${i + 1}: scrolling to ${scrollY}...`);

        await page.evaluate(
          ({ selector, scrollY }) => {
            if (selector === "body") {
              window.scrollTo(0, scrollY);
            } else {
              const el = document.querySelector(selector);
              if (el) (el as HTMLElement).scrollTop = scrollY;
            }
          },
          { selector: scrollable.selector, scrollY },
        );

        await page.waitForTimeout(500);
        await page.screenshot({
          path: `video-assets/labor-v3-section-${i + 1}.png`,
        });
        console.log(`Captured section ${i + 1}`);
      }
    } else {
      console.log("No scrollable container found - taking single screenshot");
      await page.screenshot({
        path: "video-assets/labor-v3-section-1.png",
      });
    }

    // Copy to public
    const files = fs
      .readdirSync("video-assets")
      .filter((f) => f.startsWith("labor-v3-section"));
    for (const file of files) {
      fs.copyFileSync(`video-assets/${file}`, `public/${file}`);
    }

    console.log(`\nCaptured ${files.length} section(s)`);
    console.log("Files copied to public/");

    // Keep browser open for a moment to see result
    await page.waitForTimeout(3000);
  } catch (error) {
    console.error("Capture error:", error);
  } finally {
    await browser.close();
  }
}

captureDashboardScroll();
