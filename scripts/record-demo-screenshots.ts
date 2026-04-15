/**
 * Capture hero animation as a series of screenshots, then stitch into GIF.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const FRAME_DIR = "/tmp/refrase-frames";

async function main() {
  // Clean frame dir
  if (fs.existsSync(FRAME_DIR)) fs.rmSync(FRAME_DIR, { recursive: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log("Loading refrase.cc...");
  await page.goto("https://refrase.cc", { waitUntil: "networkidle" });

  // Capture frames during the hero animation
  let frameNum = 0;

  const captureFrame = async () => {
    const hero = page.locator("section").first();
    await hero.screenshot({
      path: path.join(FRAME_DIR, `frame-${String(frameNum++).padStart(4, "0")}.png`),
    });
  };

  // Phase 1: Typing animation (~3s, capture every 200ms)
  console.log("Capturing typing animation...");
  for (let i = 0; i < 30; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  // Phase 2: Transformation happens — capture more densely
  console.log("Capturing transformation...");
  for (let i = 0; i < 15; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  // Phase 3: Result shown — hold for a beat
  console.log("Holding result...");
  for (let i = 0; i < 8; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  // Phase 4: Click through model tabs
  console.log("Switching models...");
  const tabs = ["GPT-4o", "Gemini Pro", "Llama 3.1", "Claude Sonnet"];
  for (const tabName of tabs) {
    const tab = page.locator(`button:has-text("${tabName}")`).first();
    if (await tab.isVisible()) {
      await tab.click();
      // Hold each tab for a bit
      for (let i = 0; i < 8; i++) {
        await page.waitForTimeout(150);
        await captureFrame();
      }
    }
  }

  // Final hold
  for (let i = 0; i < 5; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  await browser.close();

  console.log(`Captured ${frameNum} frames in ${FRAME_DIR}`);
  console.log(`\nNow run the Python stitcher:\n  python3 scripts/stitch-gif.py`);
}

main().catch(console.error);
