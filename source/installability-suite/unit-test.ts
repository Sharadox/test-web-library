import { beforeEach, expect, test, vi } from "vitest";
import {
  assertions,
  fake,
  registered,
  test as playwrightTest,
} from "@sharadox/test-web-library/test-fixture/playwright";

vi.mock("@playwright/test", () => import("@sharadox/test-web-library/test-fixture/playwright"));
const { describeInstallability } = await import("@sharadox/test-web-library/installability-suite");

beforeEach(() => {
  registered.length = 0;
  assertions.length = 0;
});

test("asks Chromium for installability errors and expects none", async () => {
  describeInstallability("/en");
  const send = vi.fn(async () => ({ installabilityErrors: [{ errorId: "no-icon" }] }));
  const page = fake({ context: () => ({ newCDPSession: async () => ({ send }) }) });
  await registered[0]!.body({ page, browserName: "chromium" });
  expect(playwrightTest.skip).toHaveBeenCalledWith(false, "installability is reported by Chromium");
  expect(send).toHaveBeenCalledWith("Page.getInstallabilityErrors");
  expect(assertions.at(-1)).toMatchObject({ value: ["no-icon"], matcher: "toEqual", expected: [[]] });
});
