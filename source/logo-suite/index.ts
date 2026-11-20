import { expect, test } from "@playwright/test";
import type { LogoSuiteOptions } from "@sharadox/test-web-library/logo-suite/type";

/**
 * Registers a test that, on the home page, the logo (the bar's first link) glides back to the top instead of loading
 * the page again.
 *
 * @example
 * describeLogoBackToTop({ path: "/en" });
 */
export function describeLogoBackToTop({ path, prepare }: LogoSuiteOptions): void {
  test("on the home page the logo glides back to the top instead of reloading", async ({ page }) => {
    await page.goto(path);
    await prepare?.(page);
    await page.mouse.wheel(0, 2500);
    // Smooth scrolling eases there over a moment; a busy machine takes longer.
    await expect.poll(() => page.evaluate(() => scrollY), { timeout: 15_000 }).toBeGreaterThan(1000);
    await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
    await page.getByRole("banner").getByRole("link").first().click();
    await expect.poll(() => page.evaluate(() => scrollY), { timeout: 15_000 }).toBeLessThan(5);
    // The same document: nothing reloaded.
    expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
  });
}
