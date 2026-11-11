export interface VisualSnapshotOptions {
  /** The moment the page believes it is; animations and timers only move when the test advances the clock. */
  time?: Date;
  /** Pixels per scroll step while settling. Defaults to 400. */
  step?: number;
}
