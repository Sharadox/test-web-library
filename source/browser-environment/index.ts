import { MotionGlobalConfig } from "motion";
import { vi } from "vitest";
import type { BrowserEnvironmentOptions, ObserverRecord } from "@sharadox/test-web-library/browser-environment/type";

/** Every IntersectionObserver created since `installBrowserEnvironment`, so tests can report elements as visible. */
export const observers: ObserverRecord[] = [];

/**
 * Gives a Vitest happy-dom environment the browser features components use and the DOM lacks: intersection and
 * resize observers, media queries (reduced motion, fine pointer, colour scheme), `scrollTo`, and Motion animations
 * that finish at once (so unmounting never cancels one mid-way). Call it in `beforeEach`, and restore with
 * `vi.restoreAllMocks()` and `vi.unstubAllGlobals()`.
 *
 * @example
 * beforeEach(() => installBrowserEnvironment({ reducedMotion: true }));
 */
export function installBrowserEnvironment({
  reducedMotion = false,
  finePointer = true,
  dark = true,
}: BrowserEnvironmentOptions = {}): void {
  MotionGlobalConfig.skipAnimations = true;
  observers.length = 0;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      record: ObserverRecord;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.record = { callback, options, elements: [] };
        observers.push(this.record);
      }
      observe(element: Element) {
        this.record.elements.push(element);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const matches = (query: string) =>
    (query.includes("reduce") && reducedMotion) ||
    (query.includes("pointer: fine") && finePointer) ||
    (query.includes("dark") && dark) ||
    (query.includes("light") && !dark);
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matches(query),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
      }) as unknown as MediaQueryList,
  );
  vi.stubGlobal("scrollTo", vi.fn());
}

/**
 * Reports elements as visible (or not) to every observer created so far: all watched elements by default, or only
 * those matching `filter`.
 *
 * @example
 * act(() => reportIntersection());
 */
export function reportIntersection(isIntersecting = true, filter: (element: Element) => boolean = () => true): void {
  for (const observer of observers) {
    const entries = observer.elements.filter(filter).map(
      (target) =>
        ({
          isIntersecting,
          target,
          intersectionRatio: isIntersecting ? 1 : 0,
        }) as unknown as IntersectionObserverEntry,
    );
    observer.callback(entries, {} as IntersectionObserver);
  }
}
