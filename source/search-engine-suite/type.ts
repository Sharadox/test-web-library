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
  /** The `@type` of each node in the JSON-LD `@graph`, in order. */
  structuredDataTypes: readonly string[];
  /** Routes that must answer 200 (share images, sitemap, robots, manifest…). */
  routes?: readonly string[];
}
