import { expect, test, vi } from "vitest";
import { prepareVisualSnapshot } from "@sharadox/test-web-library/visual-snapshot";

const fakePage = () => {
  const clock = { install: vi.fn(), pauseAt: vi.fn(), runFor: vi.fn() };
  const evaluate = vi.fn(async (_: unknown, argument?: number) => (argument === undefined ? 900 : undefined));
  return { clock, evaluate, goto: vi.fn(), waitForTimeout: vi.fn() };
};

test("freezes the clock, scrolls through the page and lets animations settle", async () => {
  const page = fakePage();
  await prepareVisualSnapshot(page as never, "/en", { time: new Date("2026-01-01T00:00:00Z"), step: 400 });
  expect(page.clock.install).toHaveBeenCalledWith({ time: new Date("2026-01-01T00:00:00Z") });
  expect(page.goto).toHaveBeenCalledWith("/en");
  const scrolls = page.evaluate.mock.calls.filter(([, top]) => typeof top === "number").map(([, top]) => top);
  expect(scrolls).toEqual([0, 400, 800]);
  expect(page.clock.runFor).toHaveBeenLastCalledWith(4000);
});

test("runs the page-side callbacks", async () => {
  const page = fakePage();
  await prepareVisualSnapshot(page as never, "/");
  vi.stubGlobal("document", { fonts: { ready: Promise.resolve() }, documentElement: { scrollHeight: 10 } });
  const scrollTo = vi.fn();
  vi.stubGlobal("scrollTo", scrollTo);
  vi.stubGlobal("window", { scrollTo });
  for (const [callback, argument] of page.evaluate.mock.calls)
    await (callback as (value?: unknown) => unknown)(argument);
  expect(scrollTo).toHaveBeenCalled();
  vi.unstubAllGlobals();
});
