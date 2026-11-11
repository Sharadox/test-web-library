export interface BrowserEnvironmentOptions {
  /** Whether `prefers-reduced-motion: reduce` matches; false by default. */
  reducedMotion?: boolean;
  /** Whether `pointer: fine` matches (mouse or trackpad); true by default. */
  finePointer?: boolean;
  /** Whether `prefers-color-scheme: dark` matches; true by default (light matches otherwise). */
  dark?: boolean;
}

/** An IntersectionObserver created during a test, with the elements it watches. */
export interface ObserverRecord {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  elements: Element[];
}
