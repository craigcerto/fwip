/**
 * Record the hero animation from refrase.cc as a video.
 * Run: npx playwright test scripts/record-demo.ts
 * Or: npx tsx scripts/record-demo.ts
 *
 * Requires: playwright, ffmpeg (for GIF conversion)
 */
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: "assets/",
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // Navigate to the live site
  console.log("Loading refrase.cc...");
  await page.goto("https://refrase.cc", { waitUntil: "networkidle" });

  // Wait for the hero animation to complete (typing + transform)
  console.log("Waiting for hero animation...");
  await page.waitForTimeout(6000);

  // Now click through the model tabs to show different adaptations
  console.log("Clicking model tabs...");

  // Click GPT-4o tab
  const gptTab = page.locator('button:has-text("GPT-4o")').first();
  if (await gptTab.isVisible()) {
    await gptTab.click();
    await page.waitForTimeout(1500);
  }

  // Click Gemini Pro tab
  const geminiTab = page.locator('button:has-text("Gemini Pro")').first();
  if (await geminiTab.isVisible()) {
    await geminiTab.click();
    await page.waitForTimeout(1500);
  }

  // Click back to Claude Sonnet
  const claudeTab = page.locator('button:has-text("Claude Sonnet")').first();
  if (await claudeTab.isVisible()) {
    await claudeTab.click();
    await page.waitForTimeout(1500);
  }

  console.log("Recording complete. Saving video...");
  await page.close();

  // Get the video path
  const video = page.video();
  if (video) {
    const videoPath = await video.path();
    console.log(`Video saved to: ${videoPath}`);
    console.log(`\nConvert to GIF with:\n  ffmpeg -i "${videoPath}" -vf "fps=12,scale=700:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 assets/demo.gif`);
  }

  await context.close();
  await browser.close();
}

main().catch(console.error);
