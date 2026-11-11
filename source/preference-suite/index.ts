import { expect, test } from "@playwright/test";
import type {
  ConsentSuiteOptions,
  LocaleMemoryOptions,
  StyleMemoryOptions,
} from "@sharadox/test-web-library/preference-suite/type";

/** A browser context with no stored cookies or storage, whatever the project's starting state. */
const FRESH = { storageState: { cookies: [], origins: [] } };

/**
 * Registers a test that `/` follows the browser's language until the visitor picks one, and then remembers it.
 *
 * @example
 * describeLocaleMemory({ browserLocale: "pt-PT", automaticPath: "/pt", switchName: "Idioma", pick: { link: "EN", path: "/en" } });
 */
export function describeLocaleMemory({ browserLocale, automaticPath, switchName, pick }: LocaleMemoryOptions): void {
  test("the language follows the browser until the visitor picks one, then is remembered", async ({ browser }) => {
    const context = await browser.newContext({ ...FRESH, locale: browserLocale });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(new RegExp(`${automaticPath}$`));
    await page.getByRole("group", { name: switchName }).getByRole("link", { name: pick.link }).first().click();
    await expect(page).toHaveURL(new RegExp(`${pick.path}$`));
    await page.goto("/");
    await expect(page).toHaveURL(new RegExp(`${pick.path}$`));
    await context.close();
  });
}

/**
 * Registers a test that a style group starts on its default and remembers a manual choice across visits.
 *
 * @example
 * describeStyleMemory({ path: "/en", attribute: "data-style-color", switchName: "Style", colorScheme: "light",
 *   initial: "black", pick: { radio: "White", style: "white" } });
 */
export function describeStyleMemory({
  path,
  attribute,
  switchName,
  colorScheme,
  initial,
  pick,
}: StyleMemoryOptions): void {
  test("the style starts on its default and remembers the visitor's choice", async ({ browser }) => {
    const context = await browser.newContext({ ...FRESH, colorScheme });
    const page = await context.newPage();
    const html = page.locator("html");
    await page.goto(path);
    await expect(html).toHaveAttribute(attribute, initial);
    await page.getByRole("radiogroup", { name: switchName }).first().getByRole("radio", { name: pick.radio }).click();
    await expect(html).toHaveAttribute(attribute, pick.style);
    await page.reload();
    await expect(html).toHaveAttribute(attribute, pick.style);
    await context.close();
  });
}

/**
 * Registers a test of the cookie panel: Deny lasts only for the visit, a manual selection is kept for good, and
 * the preferences link reopens it.
 *
 * @example
 * describeConsent({ path: "/en", dialogName: "Cookies", deny: "Deny", customize: "Customize", save: "Save Choices",
 *   preferences: "Cookie Preferences", category: "Analytics", storageKey: "consent",
 *   expectedGranted: { required: true, analytics: true, marketing: false } });
 */
export function describeConsent(options: ConsentSuiteOptions): void {
  const { path, dialogName, deny, customize, save, preferences, category, storageKey, expectedGranted } = options;
  test("the cookie panel keeps answers, but asks again after a refusal on the next visit", async ({ browser }) => {
    const context = await browser.newContext(FRESH);
    const page = await context.newPage();
    const panel = page.getByRole("dialog", { name: dialogName });
    await page.goto(path);
    await panel.getByRole("button", { name: deny }).click();
    await expect(panel).toBeHidden();
    await page.reload();
    await expect(panel).toBeHidden();
    const nextVisit = await context.newPage();
    await nextVisit.goto(path);
    const again = nextVisit.getByRole("dialog", { name: dialogName });
    await again.getByRole("button", { name: customize }).click();
    await again.getByRole("switch", { name: new RegExp(category) }).check();
    await again.getByRole("button", { name: save }).click();
    await expect(again).toBeHidden();
    const stored = JSON.parse((await nextVisit.evaluate((key) => localStorage.getItem(key), storageKey)) ?? "{}") as {
      granted?: Record<string, boolean>;
    };
    expect(stored.granted).toEqual(expectedGranted);
    await nextVisit.reload();
    await expect(again).toBeHidden();
    await nextVisit.getByRole("button", { name: preferences }).click();
    await expect(again).toBeVisible();
    await context.close();
  });
}
