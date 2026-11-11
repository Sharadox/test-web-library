import { expect, test } from "@playwright/test";
import type { SearchEngineSuiteOptions } from "@sharadox/test-web-library/search-engine-suite/type";

/** The routes every Sharadox site serves for search engines, share cards and installation. */
export const STANDARD_ROUTES = ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest"] as const;

/**
 * Registers end-to-end tests that every page has its language, heading, canonical address, hreflang default, share
 * image, large Twitter card and JSON-LD graph, and that the search-engine routes answer.
 *
 * @example
 * // src/app/[locale]/search-engine-end-to-end-test.ts
 * describeSearchEngine({ origin: "https://sharadox.com", structuredDataTypes: ["Organization", "WebSite"],
 *   pages: [{ path: "/en", language: "en", heading: "Technologies" }], routes: ["/en/opengraph-image"] });
 */
export function describeSearchEngine({
  origin,
  pages,
  structuredDataTypes,
  indexable = true,
  routes = [],
}: SearchEngineSuiteOptions): void {
  test("every page has complete search engine metadata", async ({ page }) => {
    for (const { path, language, heading } of pages) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${origin}${path}`);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
      const data = JSON.parse(
        (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}",
      ) as {
        "@type"?: string;
        "@graph"?: { "@type": string }[];
      };
      const nodes = data["@graph"] ?? (data["@type"] ? [{ "@type": data["@type"] }] : []);
      expect(nodes.map((node) => node["@type"])).toEqual(structuredDataTypes);
      const robots = page.locator('meta[name="robots"]');
      if (indexable) await expect(robots).not.toHaveAttribute("content", /noindex/);
      else await expect(robots).toHaveAttribute("content", /noindex/);
    }
  });

  test("search engine, share and install routes are served", async ({ request }) => {
    for (const path of [...STANDARD_ROUTES, ...routes]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });
}
