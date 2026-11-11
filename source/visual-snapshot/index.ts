import type { Page } from "@playwright/test";
import type { VisualSnapshotOptions } from "@sharadox/test-web-library/visual-snapshot/type";

/**
 * Prepares a page for a deterministic full-page screenshot: freezes the clock, opens the url, waits for fonts,
 * scrolls through so every reveal-on-scroll fires, then returns to the top and lets animations finish.
 */
export async function prepareVisualSnapshot(
  page: Page,
  url: string,
  { time = new Date("2026-11-08T12:00:00Z"), step = 400 }: VisualSnapshotOptions = {},
): Promise<void> {
  await page.clock.install({ time });
  await page.clock.pauseAt(new Date(time.getTime() + 1000));
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
    await page.clock.runFor(400);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(60);
  await page.clock.runFor(4000);
}
