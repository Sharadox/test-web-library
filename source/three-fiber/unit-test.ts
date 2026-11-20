import { isValidElement } from "react";
import { expect, test, vi } from "vitest";
import { Canvas, frames, useFrame, useThree } from "@sharadox/test-web-library/three-fiber";

test("stands in for the 3D renderer: a plain canvas, frames run by hand, a renderer to ask", () => {
  const callback = vi.fn();
  useFrame(callback);
  frames.at(-1)!({}, 0.016);
  expect(callback).toHaveBeenCalledWith({}, 0.016);
  expect((useThree() as { gl: { getPixelRatio(): number } }).gl.getPixelRatio()).toBe(2);
  expect(useThree((current) => current.gl.getPixelRatio())).toBe(2);
  const canvas = Canvas({ children: "scene" });
  expect(isValidElement(canvas)).toBe(true);
  expect((canvas as { props: Record<string, unknown> }).props).toMatchObject({
    "data-testid": "canvas",
    children: "scene",
  });
});
