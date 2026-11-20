import { createElement, type ReactNode } from "react";
import { vi } from "vitest";

/**
 * A stand-in for @react-three/fiber in unit tests (WebGL doesn't run there): `Canvas` renders its children in a plain
 * `<div data-testid="canvas">`, `useFrame` collects frame callbacks in `frames` so a test runs them by hand, and
 * `useThree` gives a renderer with a pixel ratio of 2 (or what a selector picks from it).
 *
 * @example
 * vi.mock("@react-three/fiber", () => import("@sharadox/test-web-library/three-fiber"));
 * const { frames } = await import("@sharadox/test-web-library/three-fiber");
 * frames[0]!({}, 1 / 60);
 */
export const frames: ((state: unknown, deltaSeconds: number) => void)[] = [];

export const useFrame = (callback: (state: unknown, deltaSeconds: number) => void) => {
  frames.push(callback);
};

const state = { gl: { getPixelRatio: () => 2 } };

export const useThree = (selector?: (current: typeof state) => unknown) => (selector ? selector(state) : state);

export const Canvas = vi.fn(({ children }: { children: ReactNode }) =>
  createElement("div", { "data-testid": "canvas" }, children),
);
