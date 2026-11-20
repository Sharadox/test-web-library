import type { Page } from "@playwright/test";

export interface LogoSuiteOptions {
  /** The home page, for example "/en". */
  path: string;
  /** Runs once the page is open, before scrolling (answering a cookie panel that covers the page, for example). */
  prepare?: (page: Page) => Promise<void>;
}
