import { expect, test, vi } from "vitest";
import { prepareVisualSnapshot } from "@sharadox/test-web-library/visual-snapshot";
import { skipWebGlDrawing } from "@sharadox/test-web-library/web-gl-drawing";

const fakePage = () => {
  const clock = { install: vi.fn(), pauseAt: vi.fn(), runFor: vi.fn() };
  const evaluate = vi.fn(async (_: unknown, argument?: number) => (argument === undefined ? 900 : undefined));
  const order: string[] = [];
  return {
    clock,
    evaluate,
    order,
    goto: vi.fn(async () => order.push("goto")),
    waitForTimeout: vi.fn(),
    addInitScript: vi.fn(async () => order.push("addInitScript")),
  };
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

test("skips WebGL drawing, which the snapshot masks, from before the page loads; drawWebGl keeps it", async () => {
  const page = fakePage();
  await prepareVisualSnapshot(page as never, "/en");
  expect(page.order).toEqual(["addInitScript", "goto"]);
  expect(page.addInitScript).toHaveBeenCalledWith(skipWebGlDrawing);
  const drawn = fakePage();
  await prepareVisualSnapshot(drawn as never, "/en", { drawWebGl: true });
  expect(drawn.addInitScript).not.toHaveBeenCalled();
});
