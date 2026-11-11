# @sharadox/test-web-library

[Playwright](https://playwright.dev) helpers and shared end-to-end suites, so every site runs the same checks with one call each:

- **`prepareVisualSnapshot(page, url)`:** a frozen clock, fonts loaded, every reveal-on-scroll triggered and animations settled before a full-page screenshot.
- **`describeSearchEngine`:** every page's language, heading, canonical address, hreflang default, share image, Twitter card and JSON-LD graph, plus the sitemap, robots and manifest routes.
- **`describeInstallability(path)`:** Chromium reports no installability errors.
- **`describeLocaleMemory`:** `/` follows the browser's language until the visitor picks one, then remembers it.
- **`describeStyleMemory`:** a style group starts on its default and remembers the visitor's choice.
- **`describeConsent`:** Deny lasts for the visit, manual choices are kept, and the preferences link reopens the panel.

## Install

```sh
pnpm add -D @playwright/test @sharadox/test-web-library
```

## Use

```ts
// src/app/[locale]/search-engine-end-to-end-test.ts
import { describeSearchEngine } from "@sharadox/test-web-library/search-engine-suite";

describeSearchEngine({
  origin: "https://sharadox.com",
  structuredDataTypes: ["Organization", "WebSite"],
  pages: [
    { path: "/en", language: "en", heading: "Technologies" },
    { path: "/pt", language: "pt-PT", heading: "Tecnologias" },
  ],
  routes: ["/en/opengraph-image"],
});
```

## API

| Import                   | Export                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `…/visual-snapshot`      | `prepareVisualSnapshot(page, url, { time?, step? })`                                                                              |
| `…/search-engine-suite`  | `describeSearchEngine({ origin, pages, structuredDataTypes, routes? })`, `STANDARD_ROUTES`                                        |
| `…/installability-suite` | `describeInstallability(path)`                                                                                                    |
| `…/preference-suite`     | `describeLocaleMemory(options)`, `describeStyleMemory(options)`, `describeConsent(options)`; options in `…/preference-suite/type` |

The suites that need a clean browser open their own context with empty storage, whatever the project's starting state.

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with 100% coverage and the build. Branches follow `<feature>.development` → `development` → `index`, and releases are `v<version>` tags on `index`.

## Licence

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).
