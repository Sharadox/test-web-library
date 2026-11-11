import { expect, test } from "@playwright/test";

/**
 * Registers a test that Chromium considers the page installable (a valid manifest, icons and HTTPS-equivalent
 * localhost), using the DevTools protocol. Chromium projects only.
 *
 * @example
 * describeInstallability("/en");
 */
export function describeInstallability(path: string): void {
  test("the site can be installed", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "installability is reported by Chromium");
    await page.goto(path);
    const session = await page.context().newCDPSession(page);
    const { installabilityErrors } = (await session.send("Page.getInstallabilityErrors")) as {
      installabilityErrors: { errorId: string }[];
    };
    expect(installabilityErrors.map((error) => error.errorId)).toEqual([]);
  });
}
