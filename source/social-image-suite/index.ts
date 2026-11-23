import { expect, test } from "@sharadox/test-web-library/end-to-end-test";
import type { SocialImageSuiteOptions } from "@sharadox/test-web-library/social-image-suite/type";

/**
 * Registers a test that every image to post on social media (`/<locale>/social/<name>`) is served in every language
 * as a PNG of its own size, and that other names are not found.
 *
 * @example
 * describeSocialImages({ locales: ["en", "pt"], images: SOCIAL_IMAGES });
 */
export function describeSocialImages({ locales, images }: SocialImageSuiteOptions): void {
  test("the images to post on social media are served in every language, each at its size", async ({ request }) => {
    for (const locale of locales)
      for (const [name, { width, height }] of Object.entries(images)) {
        const response = await request.get(`/${locale}/social/${name}`);
        expect(response.status(), name).toBe(200);
        expect(response.headers()["content-type"], name).toBe("image/png");
        // A PNG's width and height sit at bytes 16 and 20 of its header.
        const png = await response.body();
        expect([png.readUInt32BE(16), png.readUInt32BE(20)], name).toEqual([width, height]);
      }
    expect((await request.get(`/${locales[0]}/social/other.png`)).status()).toBe(404);
  });
}
