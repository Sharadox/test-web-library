import { expect, test, vi } from "vitest";
import { prepareVisualSnapshot } from "@sharadox/test-web-library/visual-snapshot";

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
  const drawn = fakePage();
  await prepareVisualSnapshot(drawn as never, "/en", { drawWebGl: true });
  expect(drawn.addInitScript).not.toHaveBeenCalled();
});

test("the page-side script makes every WebGL drawing call do nothing, leaving the rest of WebGL alone", async () => {
  const page = fakePage();
  await prepareVisualSnapshot(page as never, "/");
  const drawn: string[] = [];
  const context = () =>
    class {
      drawArrays() {
        drawn.push("drawArrays");
      }
      drawElements() {
        drawn.push("drawElements");
      }
      clear() {
        drawn.push("clear");
      }
      compileShader() {
        drawn.push("compileShader");
      }
    };
  const first = context();
  const second = context();
  vi.stubGlobal("WebGLRenderingContext", first);
  vi.stubGlobal("WebGL2RenderingContext", second);
  (page.addInitScript.mock.calls[0] as unknown as [() => void])[0]();
  for (const Context of [first, second]) {
    const gl = new Context();
    gl.drawArrays();
    gl.drawElements();
    gl.clear();
    gl.compileShader();
  }
  expect(drawn).toEqual(["compileShader", "compileShader"]);
  vi.unstubAllGlobals();
});
