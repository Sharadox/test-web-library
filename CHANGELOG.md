# Changelog

What changed in each version of `@sharadox/test-web-library`, newest first.

## 0.6.0

- `logo-suite`: `describeLogoBackToTop({ path, prepare? })`, that the home page's logo glides back to the top without reloading.
- `consumer-notice-suite`: `describeConsumerNotices(path)`, that the footer carries the complaints book and the dispute resolution center.
- The Playwright stand-in supports `expect.poll`.

## 0.5.0

- `social-image-suite`: `describeSocialImages({ locales, images })`, the end-to-end check every site ran on its own: each social image served in every language as a PNG of its size, other names not found.
- The Playwright stand-in's `expect(value, message)` ignores the message, as Playwright only uses it to label a failure (it used to be read as part of the matcher's name).

## 0.4.0

three-fiber: the @react-three/fiber stand-in globe-web-library and luis-pires-decor-web-library each kept as a test fixture; react is an optional peer

## 0.3.2

DescribeLocaleMemory waits for each page to load, with 15 seconds per step, so a busy machine (CI) no longer fails it now and then
