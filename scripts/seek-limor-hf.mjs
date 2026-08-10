#!/usr/bin/env node
// Screenshots the HyperFrames arm at arbitrary timeline positions WITHOUT rendering.
//
// A full 105s render is ~6.5 minutes, which is far too slow a loop for checking whether
// a layout fix worked. Seeking the paused GSAP timeline is the same mechanism the
// HyperFrames renderer drives, so what this captures is what the render will produce.
//
// Usage: node scripts/seek-limor-hf.mjs 62.0 2.0 102.0

import { chromium } from 'playwright-core';
import { join, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const times = process.argv.slice(2).map(Number);
if (!times.length) {
  console.error('usage: node scripts/seek-limor-hf.mjs <seconds...>');
  process.exit(1);
}

const chrome =
  process.env.CHROME_PATH ||
  globSync(`${process.env.HOME}/.cache/ms-playwright/chromium-*/chrome-linux64/chrome`).sort().pop();

const outDir = join(root, 'out/limor-seek');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: chrome });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
// The <audio> cues abort under file://, which leaves the page's load event pending and
// makes waitForFunction's rAF polling unreliable here. A plain evaluate poll does not
// care about load state and is what actually works.
await page.goto(`file://${join(root, 'hf/limor/index.html')}`, { waitUntil: 'domcontentloaded' });

let ready = false;
for (let i = 0; i < 60 && !ready; i++) {
  ready = await page.evaluate(() => Boolean(window.gsap && window.__timelines?.main));
  if (!ready) await page.waitForTimeout(500);
}
if (!ready) {
  console.error('FAIL - gsap/timeline never initialised');
  await browser.close();
  process.exit(1);
}
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

for (const t of times) {
  await page.evaluate((tt) => window.__timelines.main.time(tt), t);
  await page.waitForTimeout(220);
  const file = join(outDir, `t${String(t).replace('.', '_')}.png`);
  await page.screenshot({ path: file });
  console.log(`  ${t}s -> ${file.replace(root + '/', '')}`);
}

await browser.close();
