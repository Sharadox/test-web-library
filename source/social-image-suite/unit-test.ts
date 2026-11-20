import { beforeEach, expect, test, vi } from "vitest";
import { assertions, registered } from "@sharadox/test-web-library/test-fixture/playwright";

vi.mock("@playwright/test", () => import("@sharadox/test-web-library/test-fixture/playwright"));
const { describeSocialImages } = await import("@sharadox/test-web-library/social-image-suite");

beforeEach(() => {
  registered.length = 0;
  assertions.length = 0;
});

const png = (width: number, height: number) => {
  const header = Buffer.alloc(24);
  header.writeUInt32BE(width, 16);
  header.writeUInt32BE(height, 20);
  return header;
};

test("requests every image in every language and checks its type and size, then an unknown name", async () => {
  describeSocialImages({ locales: ["en", "pt"], images: { "landscape.png": { width: 1920, height: 1080 } } });
  const get = vi.fn(async (path: string) => ({
    status: () => (path.endsWith("other.png") ? 404 : 200),
    headers: () => ({ "content-type": "image/png" }),
    body: async () => png(1920, 1080),
  }));
  await registered[0]!.body({ request: { get } });
  expect(get.mock.calls.map(([path]) => path)).toEqual([
    "/en/social/landscape.png",
    "/pt/social/landscape.png",
    "/en/social/other.png",
  ]);
  expect(assertions).toContainEqual({ value: [1920, 1080], matcher: "toEqual", expected: [[1920, 1080]] });
  expect(assertions.at(-1)).toMatchObject({ value: 404, matcher: "toBe", expected: [404] });
});
