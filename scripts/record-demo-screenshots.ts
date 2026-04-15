/**
 * Capture the hero demo — tall viewport, fixed crop, no DOM lookups.
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
    viewport: { width: 1280, height: 1800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Crop coordinates — tabs + prompt cards area
  // Based on 1280px wide viewport with the hero section
  // Tabs start at ~y=590, cards go to ~y=1040
  // Tabs row + prompt cards + footer. No heading above, no next section below.
  const clip = { x: 100, y: 595, width: 1080, height: 480 };

  let frameNum = 0;
  const captureFrame = async () => {
    await page.screenshot({
      path: path.join(FRAME_DIR, `frame-${String(frameNum++).padStart(4, "0")}.png`),
      clip,
    });
  };

  console.log("Loading refrase.cc...");
  await page.goto("https://refrase.cc", { waitUntil: "networkidle" });

  // Capture the animation as it happens
  // Typing: ~90 chars × 25ms = ~2.25s, then 400ms pause, 600ms, 1200ms, 800ms
  console.log("Capturing animation...");
  for (let i = 0; i < 30; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  // Transformation should be happening/complete by now
  console.log("Capturing result...");
  for (let i = 0; i < 12; i++) {
    await captureFrame();
    await page.waitForTimeout(200);
  }

  // Hold
  for (let i = 0; i < 8; i++) {
    await captureFrame();
    await page.waitForTimeout(250);
  }

  // Switch models
  console.log("Switching models...");
  // Skip Gemini — it's a no-op, shows identical input/output (terrible demo)
  for (const tabName of ["GPT-4o", "Llama 3.1", "Claude Sonnet"]) {
    const tab = page.locator(`button:has-text("${tabName}")`).first();
    try {
      await tab.click({ timeout: 3000 });
      for (let i = 0; i < 8; i++) {
        await page.waitForTimeout(180);
        await captureFrame();
      }
    } catch {
      console.log(`  Couldn't find tab: ${tabName}, skipping`);
    }
  }

  // Final hold
  for (let i = 0; i < 5; i++) {
    await captureFrame();
    await page.waitForTimeout(250);
  }

  await browser.close();
  console.log(`Captured ${frameNum} frames in ${FRAME_DIR}`);
}

main().catch(console.error);
