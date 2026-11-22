export interface VisualSnapshotOptions {
  /** The moment the page believes it is; animations and timers only move when the test advances the clock. */
  time?: Date;
  /** Pixels per scroll step while settling. Defaults to 400. */
  step?: number;
  /**
   * Whether WebGL scenes draw. Off by default: snapshots mask their canvases, and drawing them in software on a
   * runner without a GPU is what made visual tests take minutes. Turn it on to compare a scene's own pixels.
   */
  drawWebGl?: boolean;
}
