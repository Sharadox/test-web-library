import { beforeEach, expect, test, vi } from "vitest";
import { assertions, fake, registered } from "@sharadox/test-web-library/test-fixture/playwright";

vi.mock("@playwright/test", () => import("@sharadox/test-web-library/test-fixture/playwright"));
const { describeConsent, describeLocaleMemory, describeStyleMemory } =
  await import("@sharadox/test-web-library/preference-suite");

const browserWith = (page: Record<string, unknown>) => {
  const close = vi.fn();
  const newContext = vi.fn(async () => ({ newPage: async () => page, close }));
  return { browser: { newContext }, newContext, close };
};

beforeEach(() => {
  registered.length = 0;
  assertions.length = 0;
});

test("describeLocaleMemory starts fresh in the browser's language and checks the remembered pick", async () => {
  describeLocaleMemory({
    browserLocale: "pt-PT",
    automaticPath: "/pt",
    switchName: "Idioma",
    pick: { link: "EN", path: "/en" },
  });
  const goto = vi.fn();
  const { browser, newContext, close } = browserWith(fake({ goto }));
  await registered[0]!.body({ browser });
  expect(newContext).toHaveBeenCalledWith({ storageState: { cookies: [], origins: [] }, locale: "pt-PT" });
  expect(goto).toHaveBeenCalledTimes(2);
  expect(assertions.map((entry) => String(entry.expected[0]))).toEqual(["/\\/pt$/", "/\\/en$/", "/\\/en$/"]);
  expect(close).toHaveBeenCalled();
});

test("describeStyleMemory checks the default, the pick and the pick after a reload", async () => {
  describeStyleMemory({
    path: "/en",
    attribute: "data-style-color",
    switchName: "Style",
    colorScheme: "light",
    initial: "black",
    pick: { radio: "White", style: "white" },
  });
  const { browser, newContext } = browserWith(fake());
  await registered[0]!.body({ browser });
  expect(newContext).toHaveBeenCalledWith({ storageState: { cookies: [], origins: [] }, colorScheme: "light" });
  expect(assertions.map((entry) => entry.expected[1])).toEqual(["black", "white", "white"]);
});

test("describeConsent checks a refusal, a manual selection and reopening", async () => {
  describeConsent({
    path: "/en",
    dialogName: "Cookies",
    deny: "Deny",
    customize: "Customize",
    save: "Save Choices",
    preferences: "Cookie Preferences",
    category: "Analytics",
    storageKey: "consent",
    expectedGranted: { required: true, analytics: true },
  });
  const evaluate = vi.fn<(callback: (key: string) => unknown, key: string) => Promise<string>>(async () =>
    JSON.stringify({ granted: { required: true, analytics: true } }),
  );
  const { browser, close } = browserWith(fake({ evaluate }));
  await registered[0]!.body({ browser });
  expect(evaluate).toHaveBeenCalledWith(expect.any(Function), "consent");
  expect(assertions.find((entry) => entry.matcher === "toEqual")).toMatchObject({
    value: { required: true, analytics: true },
  });
  expect(close).toHaveBeenCalled();
  const storage = { getItem: vi.fn(() => "{}") };
  vi.stubGlobal("localStorage", storage);
  evaluate.mock.calls[0]![0]("consent");
  expect(storage.getItem).toHaveBeenCalledWith("consent");
  vi.unstubAllGlobals();
});

test("describeConsent copes with nothing stored", async () => {
  describeConsent({
    path: "/",
    dialogName: "C",
    deny: "D",
    customize: "C",
    save: "S",
    preferences: "P",
    category: "A",
    storageKey: "k",
    expectedGranted: {},
  });
  const { browser } = browserWith(fake({ evaluate: async () => null }));
  await registered[0]!.body({ browser });
  expect(assertions.find((entry) => entry.matcher === "toEqual")).toMatchObject({ value: undefined });
});
