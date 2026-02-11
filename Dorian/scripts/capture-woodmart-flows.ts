import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://woodmart.xtemos.com/mega-electronics/';
const OUTPUT_DIR = '$HOME/limor-video-poc/Dorian/woodmart-captures';
const COOKIES_FILE = '$HOME/limor-video-poc/Dorian/woodmart-cookies.json';

// Mobile viewport (iPhone 14 Pro)
const VIEWPORT = { width: 390, height: 844 };

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

async function waitAndCapture(page: Page, flowDir: string, name: string, options: { fullPage?: boolean, scroll?: number, wait?: number } = {}) {
  if (options.wait) {
    await page.waitForTimeout(options.wait);
  }
  if (options.scroll) {
    await page.evaluate((y) => window.scrollBy(0, y), options.scroll);
    await page.waitForTimeout(300);
  }
  await capture(page, flowDir, name, options.fullPage);
}

async function captureFlow1(page: Page) {
  console.log('\n🛒 FLOW 1: Home > Product > Add to Cart > Checkout\n');
  const flowDir = 'flow1-home-product-cart-checkout';
  fs.mkdirSync(path.join(OUTPUT_DIR, flowDir), { recursive: true });
  screenshotCounter = 0;

  // 1. Home page
  console.log('  → Navigating to home...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check if we're past Cloudflare
  const title = await page.title();
  if (title.includes('Just a moment')) {
    throw new Error('Cloudflare challenge still active - cookies may have expired');
  }

  await capture(page, flowDir, 'home-viewport');
  await capture(page, flowDir, 'home-full', true);

  // 2. Scroll to see products
  console.log('  → Scrolling to products...');
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);
  await capture(page, flowDir, 'home-products');

  // 3. Click on a product
  console.log('  → Clicking product...');
  const productSelectors = [
    '.wd-product',
    '.product-grid-item',
    '.product',
    '.products .product',
    'li.product'
  ];

  let productClicked = false;
  for (const selector of productSelectors) {
    const product = page.locator(selector).first();
    if (await product.count() > 0 && await product.isVisible()) {
      await capture(page, flowDir, 'before-product-click');
      await product.click();
      productClicked = true;
      break;
    }
  }

  if (!productClicked) {
    // Try clicking any product link
    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.count() > 0) {
      await productLink.click();
      productClicked = true;
    }
  }

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await capture(page, flowDir, 'product-page');
  await capture(page, flowDir, 'product-page-full', true);

  // Scroll to see product details
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(300);
  await capture(page, flowDir, 'product-details');

  // 4. Add to cart
  console.log('  → Adding to cart...');
  const addToCartSelectors = [
    'button.single_add_to_cart_button',
    '.single_add_to_cart_button',
    'button[name="add-to-cart"]',
    '.add_to_cart_button',
    'button:has-text("Add to cart")',
    'button:has-text("הוסף לסל")'
  ];

  for (const selector of addToCartSelectors) {
    const btn = page.locator(selector).first();
    if (await btn.count() > 0 && await btn.isVisible()) {
      await capture(page, flowDir, 'before-add-cart');
      await btn.click();
      break;
    }
  }

  await page.waitForTimeout(2000);
  await capture(page, flowDir, 'after-add-cart');

  // 5. Go to cart
  console.log('  → Going to cart...');
  const cartSelectors = [
    '.wd-cart-totals a',
    'a[href*="/cart"]',
    '.cart-icon',
    '.shopping-cart a',
    '.woocommerce-mini-cart a.button'
  ];

  for (const selector of cartSelectors) {
    const cartLink = page.locator(selector).first();
    if (await cartLink.count() > 0 && await cartLink.isVisible()) {
      await cartLink.click();
      break;
    }
  }

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await capture(page, flowDir, 'cart-page');
  await capture(page, flowDir, 'cart-page-full', true);

  // 6. Proceed to checkout
  console.log('  → Going to checkout...');
  const checkoutSelectors = [
    '.checkout-button',
    'a[href*="/checkout"]',
    '.wc-proceed-to-checkout a',
    'a:has-text("Checkout")',
    'a:has-text("Proceed to checkout")'
  ];

  for (const selector of checkoutSelectors) {
    const checkout = page.locator(selector).first();
    if (await checkout.count() > 0 && await checkout.isVisible()) {
      await checkout.click();
      break;
    }
  }

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await capture(page, flowDir, 'checkout-page');
  await capture(page, flowDir, 'checkout-page-full', true);

  console.log(`\n✅ Flow 1 complete - ${screenshotCounter} screenshots`);
}

async function captureFlow2(page: Page) {
  console.log('\n🏷️ FLOW 2: Product Category > Product > Add to Cart\n');
  const flowDir = 'flow2-category-product-cart';
  fs.mkdirSync(path.join(OUTPUT_DIR, flowDir), { recursive: true });
  screenshotCounter = 0;

  // 1. Go to home first
  console.log('  → Navigating to home...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await capture(page, flowDir, 'home');

  // 2. Open mobile menu and find category
  console.log('  → Opening menu...');
  const menuToggle = page.locator('.wd-header-mobile-nav, .mobile-nav-icon, .burger-icon, .wd-burger-icon').first();
  if (await menuToggle.count() > 0 && await menuToggle.isVisible()) {
    await menuToggle.click();
    await page.waitForTimeout(500);
    await capture(page, flowDir, 'menu-open');
  }

  // 3. Click on a category
  console.log('  → Clicking category...');
  const categorySelectors = [
    'a[href*="product-category"]',
    '.product-category a',
    '.menu-item a[href*="category"]',
    '.wd-nav a[href*="category"]'
  ];

  for (const selector of categorySelectors) {
    const category = page.locator(selector).first();
    if (await category.count() > 0 && await category.isVisible()) {
      await category.click();
      break;
    }
  }

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await capture(page, flowDir, 'category-page');
  await capture(page, flowDir, 'category-page-full', true);

  // 4. Click on a product
  console.log('  → Clicking product...');
  const product = page.locator('.wd-product, .product, li.product').first();
  if (await product.count() > 0) {
    await product.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await capture(page, flowDir, 'product-page');
  }

  // 5. Add to cart
  console.log('  → Adding to cart...');
  const addToCart = page.locator('button.single_add_to_cart_button, .add_to_cart_button').first();
  if (await addToCart.count() > 0 && await addToCart.isVisible()) {
    await addToCart.click();
    await page.waitForTimeout(2000);
    await capture(page, flowDir, 'after-add-cart');
  }

  console.log(`\n✅ Flow 2 complete - ${screenshotCounter} screenshots`);
}

async function captureFlow3(page: Page) {
  console.log('\n📂 FLOW 3: Home > Product Category\n');
  const flowDir = 'flow3-home-category';
  fs.mkdirSync(path.join(OUTPUT_DIR, flowDir), { recursive: true });
  screenshotCounter = 0;

  // 1. Home page
  console.log('  → Navigating to home...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await capture(page, flowDir, 'home');

  // 2. Scroll to categories section
  console.log('  → Finding categories...');
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await capture(page, flowDir, 'home-categories');

  // 3. Open menu for categories
  const menuToggle = page.locator('.wd-header-mobile-nav, .mobile-nav-icon, .burger-icon').first();
  if (await menuToggle.count() > 0 && await menuToggle.isVisible()) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await menuToggle.click();
    await page.waitForTimeout(500);
    await capture(page, flowDir, 'menu-open');
  }

  // 4. Click category
  console.log('  → Clicking category...');
  const category = page.locator('a[href*="product-category"]').first();
  if (await category.count() > 0 && await category.isVisible()) {
    await category.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await capture(page, flowDir, 'category-page');
    await capture(page, flowDir, 'category-page-full', true);
  }

  console.log(`\n✅ Flow 3 complete - ${screenshotCounter} screenshots`);
}

async function captureFlow4(page: Page) {
  console.log('\n🛍️ FLOW 4: Shop > Product\n');
  const flowDir = 'flow4-shop-product';
  fs.mkdirSync(path.join(OUTPUT_DIR, flowDir), { recursive: true });
  screenshotCounter = 0;

  // 1. Go to shop page
  console.log('  → Navigating to shop...');
  await page.goto(BASE_URL + 'shop/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await capture(page, flowDir, 'shop-page');
  await capture(page, flowDir, 'shop-page-full', true);

  // 2. Scroll to see products
  console.log('  → Scrolling...');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);
  await capture(page, flowDir, 'shop-products');

  // 3. Click on a product
  console.log('  → Clicking product...');
  const product = page.locator('.wd-product, .product, li.product').first();
  if (await product.count() > 0) {
    await product.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await capture(page, flowDir, 'product-page');
    await capture(page, flowDir, 'product-page-full', true);

    // Scroll to see details
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(300);
    await capture(page, flowDir, 'product-details');
  }

  console.log(`\n✅ Flow 4 complete - ${screenshotCounter} screenshots`);
}

async function main() {
  console.log('🚀 WoodMart E-commerce Flow Capture');
  console.log('=====================================\n');
  console.log('📱 Viewport: iPhone 14 Pro (390x844)');
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
  console.log(`🍪 Loaded ${cookies.length} cookies\n`);

  // Launch browser (headless)
  const browser: Browser = await chromium.launch({
    headless: true
  });

  const context: BrowserContext = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  // Add cookies
  await context.addCookies(cookies);

  const page = await context.newPage();

  try {
    await captureFlow1(page);
    await captureFlow2(page);
    await captureFlow3(page);
    await captureFlow4(page);

    console.log('\n🎉 ALL FLOWS CAPTURED SUCCESSFULLY!');
    console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('\n❌ Error during capture:', error);

    // Capture error state
    const errorDir = path.join(OUTPUT_DIR, 'errors');
    fs.mkdirSync(errorDir, { recursive: true });
    await page.screenshot({ path: path.join(errorDir, 'error-state.png') });
    console.log('  📸 Error state captured');
  }

  await browser.close();
}

main().catch(console.error);
