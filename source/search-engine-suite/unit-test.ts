import { beforeEach, describe, expect, test, vi } from "vitest";
import { assertions, fake, registered } from "@sharadox/test-web-library/test-fixture/playwright";

vi.mock("@playwright/test", () => import("@sharadox/test-web-library/test-fixture/playwright"));
const { describeSearchEngine, STANDARD_ROUTES } = await import("@sharadox/test-web-library/search-engine-suite");

beforeEach(() => {
  registered.length = 0;
  assertions.length = 0;
});

describe("describeSearchEngine", () => {
  test("checks every page's metadata and graph", async () => {
    describeSearchEngine({
      origin: "https://sharadox.com",
      structuredDataTypes: ["Organization", "WebSite"],
      pages: [{ path: "/pt", language: "pt-PT", heading: "Tecnologias" }],
    });
    expect(registered.map((entry) => entry.name)).toEqual([
      "every page has complete search engine metadata",
      "search engine, share and install routes are served",
    ]);
    const goto = vi.fn();
    const graph = JSON.stringify({ "@graph": [{ "@type": "Organization" }, { "@type": "WebSite" }] });
    const page = fake({ goto, locator: () => fake({ first: () => fake({ textContent: async () => graph }) }) });
    await registered[0]!.body({ page });
    expect(goto).toHaveBeenCalledWith("/pt");
    expect(assertions.at(-1)).toMatchObject({
      value: ["Organization", "WebSite"],
      matcher: "toEqual",
      expected: [["Organization", "WebSite"]],
    });
    expect(
      assertions.some(
        (entry) => entry.matcher === "toHaveAttribute" && entry.expected[1] === "https://sharadox.com/pt",
      ),
    ).toBe(true);
  });

  test("treats a page without JSON-LD as an empty graph", async () => {
    describeSearchEngine({
      origin: "https://a.pt",
      structuredDataTypes: [],
      pages: [{ path: "/", language: "pt", heading: "A" }],
    });
    const page = fake({ locator: () => fake({ first: () => fake({ textContent: async () => null }) }) });
    await registered[0]!.body({ page });
    expect(assertions.at(-1)).toMatchObject({ value: [], matcher: "toEqual" });
  });

  test("requests the standard routes and the site's own", async () => {
    describeSearchEngine({
      origin: "https://a.pt",
      structuredDataTypes: [],
      pages: [],
      routes: ["/en/opengraph-image"],
    });
    const get = vi.fn<(path: string) => Promise<{ status: () => number }>>(async () => ({ status: () => 200 }));
    await registered[1]!.body({ request: { get } });
    expect(get.mock.calls.map(([path]) => path)).toEqual([...STANDARD_ROUTES, "/en/opengraph-image"]);
    expect(assertions.every((entry) => entry.expected[0] === 200)).toBe(true);
  });

  test("checks only the standard routes by default", async () => {
    describeSearchEngine({ origin: "https://a.pt", structuredDataTypes: [], pages: [] });
    const get = vi.fn(async () => ({ status: () => 200 }));
    await registered[1]!.body({ request: { get } });
    expect(get).toHaveBeenCalledTimes(STANDARD_ROUTES.length);
  });
});
