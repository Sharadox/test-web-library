// @vitest-environment happy-dom
import { MotionGlobalConfig } from "motion";
import { afterEach, expect, test, vi } from "vitest";
import {
  installBrowserEnvironment,
  observers,
  reportIntersection,
} from "@sharadox/test-web-library/browser-environment";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("adds observers, media queries, scrolling and instant animations", () => {
  installBrowserEnvironment();
  expect(MotionGlobalConfig.skipAnimations).toBe(true);
  expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(false);
  expect(matchMedia("(pointer: fine)").matches).toBe(true);
  expect(matchMedia("(prefers-color-scheme: dark)").matches).toBe(true);
  expect(matchMedia("(prefers-color-scheme: light)").matches).toBe(false);
  const media = matchMedia("(min-width: 1px)");
  media.addEventListener("change", () => {});
  media.removeEventListener("change", () => {});
  media.addListener(() => {});
  media.removeListener(() => {});
  scrollTo(0, 10);
  expect(scrollTo).toHaveBeenCalledWith(0, 10);
  const resize = new ResizeObserver(() => {});
  resize.observe(document.body);
  resize.unobserve(document.body);
  resize.disconnect();
});

test("takes reduced motion, a coarse pointer and a light scheme", () => {
  installBrowserEnvironment({ reducedMotion: true, finePointer: false, dark: false });
  expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  expect(matchMedia("(pointer: fine)").matches).toBe(false);
  expect(matchMedia("(prefers-color-scheme: light)").matches).toBe(true);
});

test("reports watched elements as visible, all or filtered", () => {
  installBrowserEnvironment();
  const callback = vi.fn();
  const observer = new IntersectionObserver(callback, { threshold: 0.5 });
  const first = document.createElement("div");
  const second = document.createElement("p");
  observer.observe(first);
  observer.observe(second);
  observer.unobserve(first);
  expect(observer.takeRecords()).toEqual([]);
  observer.disconnect();
  expect(observers[0]!.options).toEqual({ threshold: 0.5 });
  reportIntersection();
  expect(callback.mock.calls[0]![0]).toHaveLength(2);
  reportIntersection(false, (element) => element.tagName === "P");
  expect(callback.mock.calls[1]![0]).toEqual([{ isIntersecting: false, target: second, intersectionRatio: 0 }]);
});
