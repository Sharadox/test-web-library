import { expect, test, vi } from "vitest";
import { extensions } from "@sharadox/test-web-library/test-fixture/playwright";
import { skipWebGlDrawing } from "@sharadox/test-web-library/web-gl-drawing";

vi.mock("@playwright/test", () => import("@sharadox/test-web-library/test-fixture/playwright"));
const module = await import("@sharadox/test-web-library/end-to-end-test");

type PageFixture = (
  fixtures: { page: unknown; drawWebGl: boolean },
  use: (page: unknown) => Promise<void>,
) => Promise<void>;

test("gives every test a page whose WebGL scenes run without drawing, unless a test asks for drawWebGl", async () => {
  const fixtures = extensions.at(-1)! as { drawWebGl: [boolean, { option: boolean }]; page: PageFixture };
  expect(fixtures.drawWebGl).toEqual([false, { option: true }]);
  const page = { addInitScript: vi.fn(async () => {}) };
  const use = vi.fn(async () => {});
  await fixtures.page({ page, drawWebGl: false }, use);
  expect(page.addInitScript).toHaveBeenCalledWith(skipWebGlDrawing);
  expect(use).toHaveBeenCalledWith(page);
  page.addInitScript.mockClear();
  await fixtures.page({ page, drawWebGl: true }, use);
  expect(page.addInitScript).not.toHaveBeenCalled();
  expect(typeof module.test).toBe("function");
  expect(typeof module.expect).toBe("function");
});
