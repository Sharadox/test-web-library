import { expect, test as base } from "@playwright/test";
import { skipWebGlDrawing } from "@sharadox/test-web-library/web-gl-drawing";

/**
 * Playwright's `test` for Sharadox sites: each test's page runs its WebGL scenes without drawing them
 * (`skipWebGlDrawing`), since no browser test compares a scene's pixels and drawing them in software on a runner without
 * a GPU took most of the time. A test about a scene's pixels opts back in with `test.use({ drawWebGl: true })`.
 *
 * @example
 * import { expect, test } from "@sharadox/test-web-library/end-to-end-test";
 */
export const test = base.extend<{ drawWebGl: boolean }>({
  drawWebGl: [false, { option: true }],
  page: async ({ page, drawWebGl }, use) => {
    if (!drawWebGl) await page.addInitScript(skipWebGlDrawing);
    await use(page);
  },
});

export { expect };
