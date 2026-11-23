# Changelog

What changed in each version of `@sharadox/test-web-library`, newest first.

## 0.9.1

Tested with motion 14 and vitest-configuration-web-library 0.2.1 (no change to the package).

## 0.9.0

`end-to-end-test`: `test` and `expect` whose pages run WebGL scenes without drawing them (no browser test compares a scene's pixels; drawing them in software took most of the time); `test.use({ drawWebGl: true })` keeps it. Every suite here uses it. `web-gl-drawing`: the shared page-side script, also used by `prepareVisualSnapshot`.

## 0.8.0

Visual snapshots skip WebGL drawing by default (`drawWebGl` keeps it): the canvases are masked anyway, and drawing them in software on a runner without a GPU made each visual test take minutes (Luis Pires Decor's home: 5.6 minutes to 13 seconds, same screenshot).

## 0.7.0

`mail-policy-suite`: `describeMailPolicy({ root, domain, mx })`, the unit tests every MTA-STS application wrote on its own: the policy enforces TLS for the domain's mail servers for a day, and Vercel serves it as plain text and sends every other path to the domain, temporarily.

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
