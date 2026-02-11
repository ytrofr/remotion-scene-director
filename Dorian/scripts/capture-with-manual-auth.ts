import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const BASE_URL = 'https://woodmart.xtemos.com/mega-electronics/';
const OUTPUT_DIR = '$HOME/limor-video-poc/Dorian/woodmart-captures';

// Mobile viewport (iPhone 14 Pro)
const VIEWPORT = { width: 390, height: 844 };

// Helper to wait for user input
function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

// Helper to take screenshot with incremental naming
let screenshotCounter = 0;
async function capture(page: Page, flowDir: string, name: string, fullPage = false) {
  screenshotCounter++;
  const filename = `${String(screenshotCounter).padStart(2, '0')}-${name}.png`;
  const filepath = path.join(OUTPUT_DIR, flowDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage,
    scale: 'css'
  });
  console.log(`  📸 ${filename}`);
  return filepath;
}

async function captureFlow1(page: Page) {
  console.log('\n🛒 FLOW 1: Home > Product > Add to Cart > Checkout\n');
  const flowDir = 'flow1-home-product-cart-checkout';
  fs.mkdirSync(path.join(OUTPUT_DIR, flowDir), { recursive: true });

  // 1. Home page
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'home');
  await capture(page, flowDir, 'home-full', true);

  // 2. Scroll to see products
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);
  await capture(page, flowDir, 'home-scrolled');

  // 3. Click on a product
  const product = page.locator('.product-grid-item, .product, .wd-product').first();
  await product.waitFor({ state: 'visible', timeout: 10000 });
  await capture(page, flowDir, 'product-hover');
  await product.click();
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'product-page');
  await capture(page, flowDir, 'product-page-full', true);

  // 4. Add to cart
  const addToCart = page.locator('button.single_add_to_cart_button, .add_to_cart_button, [name="add-to-cart"]').first();
  await addToCart.waitFor({ state: 'visible', timeout: 10000 });
  await capture(page, flowDir, 'before-add-cart');
  await addToCart.click();
  await page.waitForTimeout(2000);
  await capture(page, flowDir, 'after-add-cart');

  // 5. Go to cart
  const cartLink = page.locator('a[href*="cart"], .cart-icon, .shopping-cart-widget-side').first();
  await cartLink.click();
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'cart-page');
  await capture(page, flowDir, 'cart-page-full', true);

  // 6. Proceed to checkout
  const checkout = page.locator('a[href*="checkout"], .checkout-button, .wc-proceed-to-checkout a').first();
  if (await checkout.isVisible()) {
    await checkout.click();
    await page.waitForLoadState('networkidle');
    await capture(page, flowDir, 'checkout-page');
    await capture(page, flowDir, 'checkout-page-full', true);
  }

  console.log(`\n✅ Flow 1 complete - ${screenshotCounter} screenshots`);
}

async function captureFlow2(page: Page) {
  console.log('\n🏷️ FLOW 2: Product Category > Product > Add to Cart\n');
  const flowDir = 'flow2-category-product-cart';
  fs.mkdirSync(path.join(OUTPUT_DIR, flowDir), { recursive: true });
  screenshotCounter = 0;

  // 1. Go to a category page
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Find and click a category
  const categoryLink = page.locator('a[href*="product-category"], .product-category a, .category-item a').first();
  await categoryLink.waitFor({ state: 'visible', timeout: 10000 });
  await categoryLink.click();
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'category-page');
  await capture(page, flowDir, 'category-page-full', true);

  // 2. Click on a product
  const product = page.locator('.product-grid-item, .product, .wd-product').first();
  await product.waitFor({ state: 'visible', timeout: 10000 });
  await product.click();
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'product-page');

  // 3. Add to cart
  const addToCart = page.locator('button.single_add_to_cart_button, .add_to_cart_button').first();
  await addToCart.waitFor({ state: 'visible', timeout: 10000 });
  await addToCart.click();
  await page.waitForTimeout(2000);
  await capture(page, flowDir, 'after-add-cart');

  console.log(`\n✅ Flow 2 complete - ${screenshotCounter} screenshots`);
}

async function captureFlow3(page: Page) {
  console.log('\n📂 FLOW 3: Home > Product Category\n');
  const flowDir = 'flow3-home-category';
  fs.mkdirSync(path.join(OUTPUT_DIR, flowDir), { recursive: true });
  screenshotCounter = 0;

  // 1. Home page
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'home');

  // 2. Click category from menu or homepage
  const menuToggle = page.locator('.mobile-nav-icon, .wd-header-mobile-nav, .burger-icon').first();
  if (await menuToggle.isVisible()) {
    await menuToggle.click();
    await page.waitForTimeout(500);
    await capture(page, flowDir, 'menu-open');
  }

  const categoryLink = page.locator('a[href*="product-category"], .product-category a').first();
  await categoryLink.waitFor({ state: 'visible', timeout: 10000 });
  await categoryLink.click();
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'category-page');
  await capture(page, flowDir, 'category-page-full', true);

  console.log(`\n✅ Flow 3 complete - ${screenshotCounter} screenshots`);
}

async function captureFlow4(page: Page) {
  console.log('\n🛍️ FLOW 4: Shop > Product\n');
  const flowDir = 'flow4-shop-product';
  fs.mkdirSync(path.join(OUTPUT_DIR, flowDir), { recursive: true });
  screenshotCounter = 0;

  // 1. Go to shop page
  await page.goto(BASE_URL + 'shop/');
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'shop-page');
  await capture(page, flowDir, 'shop-page-full', true);

  // 2. Scroll to see products
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(500);
  await capture(page, flowDir, 'shop-scrolled');

  // 3. Click on a product
  const product = page.locator('.product-grid-item, .product, .wd-product').first();
  await product.waitFor({ state: 'visible', timeout: 10000 });
  await product.click();
  await page.waitForLoadState('networkidle');
  await capture(page, flowDir, 'product-page');
  await capture(page, flowDir, 'product-page-full', true);

  console.log(`\n✅ Flow 4 complete - ${screenshotCounter} screenshots`);
}

async function main() {
  console.log('🚀 WoodMart E-commerce Flow Capture');
  console.log('=====================================\n');
  console.log('📱 Viewport: iPhone 14 Pro (390x844)');
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  // Launch browser in HEADED mode
  const browser: Browser = await chromium.launch({
    headless: false,
    args: ['--window-size=450,900']
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  // Navigate to the site
  console.log('🌐 Opening WoodMart...');
  await page.goto(BASE_URL);

  // Wait for user to solve CAPTCHA
  console.log('\n⚠️  CLOUDFLARE VERIFICATION');
  console.log('============================');
  console.log('A browser window has opened.');
  console.log('Please click the "Verify you are human" checkbox.');
  await waitForEnter('\nPress ENTER after solving the CAPTCHA...');

  // Verify we're past Cloudflare
  const title = await page.title();
  if (title.includes('Just a moment')) {
    console.log('❌ Still on Cloudflare page. Please solve the CAPTCHA and try again.');
    await browser.close();
    return;
  }

  console.log(`✅ Verified! Page title: ${title}\n`);

  // Capture all flows
  try {
    await captureFlow1(page);
    await captureFlow2(page);
    await captureFlow3(page);
    await captureFlow4(page);

    console.log('\n🎉 ALL FLOWS CAPTURED SUCCESSFULLY!');
    console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Error during capture:', error);
    await capture(page, 'errors', 'error-state');
  }

  await waitForEnter('\nPress ENTER to close the browser...');
  await browser.close();
}

main().catch(console.error);
