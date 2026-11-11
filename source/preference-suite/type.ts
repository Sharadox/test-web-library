export interface LocaleMemoryOptions {
  /** The browser's language, for example "pt-PT". */
  browserLocale: string;
  /** Where `/` must first go for that browser, for example "/pt". */
  automaticPath: string;
  /** Accessible name of the language switch group in that language, for example "Idioma". */
  switchName: string;
  /** The link to pick by hand, for example "EN", and where it leads, for example "/en". */
  pick: { link: string; path: string };
}

export interface StyleMemoryOptions {
  /** Path of a page with the style switch. */
  path: string;
  /** The `<html>` attribute of the style group, for example "data-style-color". */
  attribute: string;
  /** Accessible name of the switch's radio group, for example "Style". */
  switchName: string;
  /** The device's scheme during the test. */
  colorScheme: "light" | "dark";
  /** The style before any choice (the default), and a style to pick by hand. */
  initial: string;
  pick: { radio: string; style: string };
}

export interface ConsentSuiteOptions {
  path: string;
  /** Accessible name of the cookie dialog, and of its buttons. */
  dialogName: string;
  deny: string;
  customize: string;
  save: string;
  preferences: string;
  /** A category switch to turn on in the manual selection, and the storage key and expected answer. */
  category: string;
  storageKey: string;
  expectedGranted: Record<string, boolean>;
}
