/**
 * Capture the hero demo area (model tabs + prompt cards only) as screenshots.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const FRAME_DIR = "/tmp/refrase-frames";

async function main() {
  if (fs.existsSync(FRAME_DIR)) fs.rmSync(FRAME_DIR, { recursive: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log("Loading refrase.cc...");
  await page.goto("https://refrase.cc", { waitUntil: "networkidle" });

  // Scroll down so the demo cards area is centered
  // The demo is in the lower portion of the hero section
  await page.evaluate(() => window.scrollTo(0, 340));
  await page.waitForTimeout(300);

  let frameNum = 0;

  const captureFrame = async () => {
    // Screenshot the visible viewport — we've scrolled to center on the demo
    await page.screenshot({
      path: path.join(FRAME_DIR, `frame-${String(frameNum++).padStart(4, "0")}.png`),
      clip: { x: 80, y: 0, width: 1120, height: 700 },
    });
  };

  // Phase 1: Typing animation (~3.5s at 25ms/char for ~90 chars)
  console.log("Capturing typing...");
  for (let i = 0; i < 20; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  // Phase 2: Transformation
  console.log("Capturing transformation...");
  for (let i = 0; i < 15; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  // Phase 3: Hold result
  console.log("Holding result...");
  for (let i = 0; i < 10; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  // Phase 4: Switch models
  console.log("Switching models...");
  const tabs = ["GPT-4o", "Gemini Pro", "Llama 3.1", "Claude Sonnet"];
  for (const tabName of tabs) {
    const tab = page.locator(`button:has-text("${tabName}")`).first();
    if (await tab.isVisible()) {
      await tab.click();
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(150);
        await captureFrame();
      }
    }
  }

  // Final hold
  for (let i = 0; i < 8; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  await browser.close();
  console.log(`Captured ${frameNum} frames`);
}

main().catch(console.error);
