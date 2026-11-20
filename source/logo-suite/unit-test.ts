import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { assertions, fake, registered } from "@sharadox/test-web-library/test-fixture/playwright";

vi.mock("@playwright/test", () => import("@sharadox/test-web-library/test-fixture/playwright"));
const { describeLogoBackToTop } = await import("@sharadox/test-web-library/logo-suite");

beforeEach(() => {
  registered.length = 0;
  assertions.length = 0;
  // The page's own code runs here: at the top, in a window of its own.
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal("window", {});
});
afterEach(() => {
  vi.unstubAllGlobals();
});

/** Runs what the suite evaluates in the page, as the browser would. */
const evaluate = vi.fn(async (code: () => unknown) => code());

test("scrolls down, clicks the bar's first link, and expects the top of the same document", async () => {
  const prepare = vi.fn(async () => {});
  describeLogoBackToTop({ path: "/en", prepare });
  const click = vi.fn(async () => {});
  const goto = vi.fn(async () => {});
  const link = { first: () => ({ click }) };
  const page = fake({
    goto,
    evaluate,
    mouse: { wheel: vi.fn(async () => {}) },
    getByRole: () => ({ getByRole: () => link }),
  });
  await registered[0]!.body({ page });
  expect(goto).toHaveBeenCalledWith("/en");
  expect((prepare.mock.calls as unknown[][])[0]![0]).toBe(page);
  expect(click).toHaveBeenCalled();
  expect(assertions.map(({ matcher }) => matcher)).toEqual(["poll.toBeGreaterThan", "poll.toBeLessThan", "toBe"]);
  // The marker set before the click is still there: the same document.
  expect(assertions.at(-1)).toMatchObject({ value: true, expected: [true] });
});

test("needs no preparation", async () => {
  describeLogoBackToTop({ path: "/pt" });
  const page = fake({
    goto: vi.fn(async () => {}),
    evaluate,
    mouse: { wheel: vi.fn(async () => {}) },
    getByRole: () => ({ getByRole: () => ({ first: () => ({ click: vi.fn(async () => {}) }) }) }),
  });
  await registered[0]!.body({ page });
  expect(assertions).toHaveLength(3);
});
