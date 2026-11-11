export interface SearchEnginePage {
  /** Path of the page, for example "/en". */
  path: string;
  /** Expected `<html lang>`, for example "pt-PT". */
  language: string;
  /** Text the page's `<h1>` contains. */
  heading: string;
}

export interface SearchEngineSuiteOptions {
  /** The public origin canonical links use, for example "https://sharadox.com". */
  origin: string;
  pages: readonly SearchEnginePage[];
  /** The `@type` of each JSON-LD node in order: the `@graph` nodes, or the single node when there is no graph. */
  structuredDataTypes: readonly string[];
  /** False checks that pages ask search engines not to index them (previews and demos); true by default. */
  indexable?: boolean;
  /** Routes that must answer 200 (share images, sitemap, robots, manifest…). */
  routes?: readonly string[];
}
